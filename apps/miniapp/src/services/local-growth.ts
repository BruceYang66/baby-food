import type {
  BabyGender,
  GrowthChartDataset,
  GrowthChartPoint,
  GrowthMetricSnapshot,
  GrowthMetricType,
  GrowthRangeKey,
  GrowthRecord,
  GrowthRecordListItem,
  GrowthRecordPayload,
  GrowthReferenceBandPoint,
  GrowthStandardKey,
  GrowthStatusTone
} from '@baby-food/shared-types'
import { formatAgeLabel as formatSharedAgeLabel } from '@/utils/age'
import {
  growthMetricMeta,
  growthReferenceTemplates,
  growthStandardOptions,
  growthStandardScales
} from '@/data/growth'
import { nhc2025SdTables, type Nhc2025SdBandPoint } from '@/data/growth-nhc-2025'

const STORAGE_KEY = 'miniapp-growth-records-v1'
const DEFAULT_BIRTH_DATE = '2024-09-05'
const DAY_MS = 24 * 60 * 60 * 1000
const MONTH_DAYS = 30.4375
const P3_Z = -1.8807936081512509
const P97_Z = 1.8807936081512509
let inMemoryRecords: GrowthRecord[] | null = []

type GrowthBand = {
  p3: number
  p50: number
  p97: number
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function formatYmd(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

function getBirthDate(birthDate?: string) {
  return birthDate || DEFAULT_BIRTH_DATE
}

function getDiffDays(start: string, end: string) {
  return Math.max(0, Math.round((toDate(end).getTime() - toDate(start).getTime()) / DAY_MS))
}

export function getGrowthAgeMonths(birthDate: string, measuredAt: string) {
  return getDiffDays(birthDate, measuredAt) / MONTH_DAYS
}

function formatAgeLabel(birthDate: string, measuredAt: string) {
  return formatSharedAgeLabel(birthDate, measuredAt)
}

function getStoredRecords() {
  if (inMemoryRecords) {
    return inMemoryRecords.slice()
  }

  const value = uni.getStorageSync(STORAGE_KEY)
  return Array.isArray(value) ? value.filter((item): item is GrowthRecord => typeof item?.id === 'string') : []
}

function writeRecords(records: GrowthRecord[]) {
  const next = records.slice()
  inMemoryRecords = next
  uni.setStorageSync(STORAGE_KEY, next)
}

function isOfficialNhc2025Metric(metric: GrowthMetricType, standardKey: GrowthStandardKey) {
  return standardKey === 'nhc-2025' && (metric === 'height' || metric === 'weight')
}

function interpolateLegacyBand(metric: GrowthMetricType, ageMonths: number, standardKey: GrowthStandardKey): GrowthBand {
  const template = growthReferenceTemplates[metric]
  const scale = growthStandardScales[standardKey][metric]

  if (ageMonths <= template[0].ageMonths) {
    const point = template[0]
    return {
      p3: point.p3 * scale,
      p50: point.p50 * scale,
      p97: point.p97 * scale
    }
  }

  const last = template[template.length - 1]
  if (ageMonths >= last.ageMonths) {
    return {
      p3: last.p3 * scale,
      p50: last.p50 * scale,
      p97: last.p97 * scale
    }
  }

  for (let index = 0; index < template.length - 1; index += 1) {
    const current = template[index]
    const next = template[index + 1]

    if (ageMonths >= current.ageMonths && ageMonths <= next.ageMonths) {
      const ratio = (ageMonths - current.ageMonths) / (next.ageMonths - current.ageMonths)
      return {
        p3: (current.p3 + (next.p3 - current.p3) * ratio) * scale,
        p50: (current.p50 + (next.p50 - current.p50) * ratio) * scale,
        p97: (current.p97 + (next.p97 - current.p97) * ratio) * scale
      }
    }
  }

  return {
    p3: last.p3 * scale,
    p50: last.p50 * scale,
    p97: last.p97 * scale
  }
}

function normalCdf(value: number) {
  const sign = value < 0 ? -1 : 1
  const x = Math.abs(value) / Math.sqrt(2)
  const t = 1 / (1 + 0.3275911 * x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const erf = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x)
  return 0.5 * (1 + sign * erf)
}

function interpolateSdPoint(current: Nhc2025SdBandPoint, next: Nhc2025SdBandPoint, ratio: number): Nhc2025SdBandPoint {
  return {
    ageMonths: Number((current.ageMonths + (next.ageMonths - current.ageMonths) * ratio).toFixed(2)),
    minus3: current.minus3 + (next.minus3 - current.minus3) * ratio,
    minus2: current.minus2 + (next.minus2 - current.minus2) * ratio,
    minus1: current.minus1 + (next.minus1 - current.minus1) * ratio,
    median: current.median + (next.median - current.median) * ratio,
    plus1: current.plus1 + (next.plus1 - current.plus1) * ratio,
    plus2: current.plus2 + (next.plus2 - current.plus2) * ratio,
    plus3: current.plus3 + (next.plus3 - current.plus3) * ratio
  }
}

function interpolateNhc2025Row(metric: 'height' | 'weight', gender: BabyGender, ageMonths: number): Nhc2025SdBandPoint {
  const table = nhc2025SdTables[metric][gender]

  if (ageMonths <= table[0].ageMonths) {
    return table[0]
  }

  const last = table[table.length - 1]
  if (ageMonths >= last.ageMonths) {
    return last
  }

  for (let index = 0; index < table.length - 1; index += 1) {
    const current = table[index]
    const next = table[index + 1]

    if (ageMonths >= current.ageMonths && ageMonths <= next.ageMonths) {
      const ratio = (ageMonths - current.ageMonths) / Math.max(next.ageMonths - current.ageMonths, 0.001)
      return interpolateSdPoint(current, next, ratio)
    }
  }

  return last
}

function getNhc2025ValueAtZ(row: Nhc2025SdBandPoint, z: number) {
  const zAnchors = [-3, -2, -1, 0, 1, 2, 3]
  const values = [row.minus3, row.minus2, row.minus1, row.median, row.plus1, row.plus2, row.plus3]

  if (z <= zAnchors[0]) {
    return values[0]
  }

  if (z >= zAnchors[zAnchors.length - 1]) {
    return values[values.length - 1]
  }

  for (let index = 0; index < zAnchors.length - 1; index += 1) {
    const currentZ = zAnchors[index]
    const nextZ = zAnchors[index + 1]
    if (z >= currentZ && z <= nextZ) {
      const ratio = (z - currentZ) / (nextZ - currentZ)
      return values[index] + (values[index + 1] - values[index]) * ratio
    }
  }

  return row.median
}

function getNhc2025ZForValue(row: Nhc2025SdBandPoint, value: number) {
  const zAnchors = [-3, -2, -1, 0, 1, 2, 3]
  const values = [row.minus3, row.minus2, row.minus1, row.median, row.plus1, row.plus2, row.plus3]

  if (value <= values[0]) {
    return zAnchors[0]
  }

  if (value >= values[values.length - 1]) {
    return zAnchors[zAnchors.length - 1]
  }

  for (let index = 0; index < values.length - 1; index += 1) {
    const currentValue = values[index]
    const nextValue = values[index + 1]
    if (value >= currentValue && value <= nextValue) {
      const ratio = (value - currentValue) / Math.max(nextValue - currentValue, 0.001)
      return zAnchors[index] + (zAnchors[index + 1] - zAnchors[index]) * ratio
    }
  }

  return 0
}

function buildNhc2025Band(metric: 'height' | 'weight', ageMonths: number, gender: BabyGender): GrowthBand {
  const row = interpolateNhc2025Row(metric, gender, ageMonths)
  return {
    p3: getNhc2025ValueAtZ(row, P3_Z),
    p50: row.median,
    p97: getNhc2025ValueAtZ(row, P97_Z)
  }
}

function toLegacyPercentile(value: number, band: GrowthBand) {
  if (value <= band.p3) {
    return Math.max(0.5, 3 - ((band.p3 - value) / Math.max(band.p3, 1)) * 2)
  }

  if (value <= band.p50) {
    return 3 + ((value - band.p3) / Math.max(band.p50 - band.p3, 0.001)) * 47
  }

  if (value <= band.p97) {
    return 50 + ((value - band.p50) / Math.max(band.p97 - band.p50, 0.001)) * 47
  }

  return Math.min(99.5, 97 + ((value - band.p97) / Math.max(band.p97, 1)) * 3)
}

function getLegacyStatus(percentile: number): { label: string; tone: GrowthStatusTone } {
  if (percentile < 3) {
    return { label: '偏低', tone: 'warning' }
  }

  if (percentile < 25) {
    return { label: '关注', tone: 'caution' }
  }

  if (percentile < 75) {
    return { label: '正常', tone: 'healthy' }
  }

  if (percentile < 97) {
    return { label: '中上', tone: 'elevated' }
  }

  return { label: '偏高', tone: 'warning' }
}

function getNhc2025Status(value: number, band: GrowthBand): { label: string; tone: GrowthStatusTone } {
  if (value <= band.p3) {
    return { label: '偏低', tone: 'warning' }
  }

  if (value >= band.p97) {
    return { label: '偏高', tone: 'warning' }
  }

  return { label: '正常', tone: 'healthy' }
}

function getMetricValue(record: GrowthRecord, metric: GrowthMetricType) {
  if (metric === 'height') {
    return record.heightCm ?? null
  }

  if (metric === 'weight') {
    return record.weightKg ?? null
  }

  return record.headCircumferenceCm ?? null
}

function formatMetricValue(metric: GrowthMetricType, value: number) {
  if (metric === 'weight') {
    return Number(value.toFixed(1))
  }

  return Number(value.toFixed(1))
}

function buildGrowthEvaluation(metric: GrowthMetricType, ageMonths: number, value: number, standardKey: GrowthStandardKey, gender?: BabyGender) {
  if (isOfficialNhc2025Metric(metric, standardKey) && gender) {
    const band = buildNhc2025Band(metric, ageMonths, gender)
    const row = interpolateNhc2025Row(metric, gender, ageMonths)
    const z = getNhc2025ZForValue(row, value)
    const percentile = Number((normalCdf(z) * 100).toFixed(1))
    return {
      band,
      percentile,
      status: getNhc2025Status(value, band)
    }
  }

  const band = interpolateLegacyBand(metric, ageMonths, standardKey)
  const percentile = Number(toLegacyPercentile(value, band).toFixed(1))
  return {
    band,
    percentile,
    status: getLegacyStatus(percentile)
  }
}

function buildMetricSnapshot(record: GrowthRecord, birthDate: string, metric: GrowthMetricType, standardKey: GrowthStandardKey, gender?: BabyGender): GrowthMetricSnapshot {
  const value = getMetricValue(record, metric)
  const meta = growthMetricMeta[metric]

  if (value == null) {
    return {
      metric,
      label: meta.shortLabel,
      unit: meta.unit,
      value: null,
      percentile: null,
      statusLabel: '--',
      statusTone: 'caution'
    }
  }

  if (isOfficialNhc2025Metric(metric, standardKey) && !gender) {
    return {
      metric,
      label: meta.shortLabel,
      unit: meta.unit,
      value: formatMetricValue(metric, value),
      percentile: null,
      statusLabel: '需性别',
      statusTone: 'caution'
    }
  }

  const ageMonths = getGrowthAgeMonths(birthDate, record.measuredAt)
  const evaluation = buildGrowthEvaluation(metric, ageMonths, value, standardKey, gender)

  return {
    metric,
    label: meta.shortLabel,
    unit: meta.unit,
    value: formatMetricValue(metric, value),
    percentile: evaluation.percentile,
    statusLabel: evaluation.status.label,
    statusTone: evaluation.status.tone
  }
}

function buildSeedRecords(birthDate?: string) {
  const resolvedBirthDate = getBirthDate(birthDate)
  const today = new Date()
  const totalAgeMonths = Math.max(8, getGrowthAgeMonths(resolvedBirthDate, formatYmd(today)))
  const seedAgeMonths = [0.42, 0.56, 0.72, 0.84, 0.94, 1]
    .map((ratio) => Math.max(1.5, Number((totalAgeMonths * ratio).toFixed(2))))
    .filter((value, index, list) => index === 0 || value - list[index - 1] > 0.35)

  return seedAgeMonths.map((ageMonths, index) => {
    const measuredAt = formatYmd(addDays(toDate(resolvedBirthDate), Math.round(ageMonths * MONTH_DAYS)))
    const heightBand = interpolateLegacyBand('height', ageMonths, 'nhc-2025')
    const weightBand = interpolateLegacyBand('weight', ageMonths, 'nhc-2025')
    const headBand = interpolateLegacyBand('head', ageMonths, 'nhc-2025')
    const valueRatio = [0.97, 0.985, 0.995, 1.01, 1.02, 1.015][index] || 1

    return {
      id: `growth-${index + 1}`,
      measuredAt,
      heightCm: Number((heightBand.p50 * valueRatio).toFixed(1)),
      weightKg: Number((weightBand.p50 * valueRatio).toFixed(1)),
      headCircumferenceCm: index >= seedAgeMonths.length - 2 ? null : Number((headBand.p50 * (0.995 + index * 0.002)).toFixed(1))
    } satisfies GrowthRecord
  })
}

function ensureRecords(birthDate?: string) {
  const current = getStoredRecords().sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
  return current
}

export function hydrateGrowthRecords(records: GrowthRecord[]) {
  inMemoryRecords = records.slice().sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
  return inMemoryRecords
}

export function clearHydratedGrowthRecords() {
  inMemoryRecords = null
}

export function readGrowthRecords(birthDate?: string) {
  return ensureRecords(birthDate)
}

export function getGrowthRecord(id: string, birthDate?: string) {
  return ensureRecords(birthDate).find((item) => item.id === id) || null
}

export function saveGrowthRecord(payload: GrowthRecordPayload, birthDate?: string, id?: string) {
  const current = ensureRecords(birthDate)
  const nextRecord: GrowthRecord = {
    id: id || `growth-${Date.now()}`,
    measuredAt: payload.measuredAt,
    heightCm: payload.heightCm ?? null,
    weightKg: payload.weightKg ?? null,
    headCircumferenceCm: payload.headCircumferenceCm ?? null
  }

  const next = id ? current.map((item) => (item.id === id ? nextRecord : item)) : [nextRecord, ...current]
  const sorted = next.sort((left, right) => right.measuredAt.localeCompare(left.measuredAt))
  writeRecords(sorted)
  return sorted
}

export function deleteGrowthRecord(id: string, birthDate?: string) {
  const next = ensureRecords(birthDate).filter((item) => item.id !== id)
  writeRecords(next)
  return next
}

export function getGrowthListItems(birthDate?: string, standardKey: GrowthStandardKey = 'nhc-2025', gender?: BabyGender): GrowthRecordListItem[] {
  const resolvedBirthDate = getBirthDate(birthDate)

  return ensureRecords(resolvedBirthDate).map((record) => ({
    id: record.id,
    measuredAt: record.measuredAt,
    ageLabel: formatAgeLabel(resolvedBirthDate, record.measuredAt),
    metrics: [
      buildMetricSnapshot(record, resolvedBirthDate, 'height', standardKey, gender),
      buildMetricSnapshot(record, resolvedBirthDate, 'weight', standardKey, gender),
      buildMetricSnapshot(record, resolvedBirthDate, 'head', standardKey, gender)
    ]
  }))
}

function buildBandWindow(metric: GrowthMetricType, minimumAge: number, maximumAge: number, standardKey: GrowthStandardKey, gender?: BabyGender) {
  if (isOfficialNhc2025Metric(metric, standardKey) && !gender) {
    return []
  }

  const points: GrowthReferenceBandPoint[] = []
  const step = 0.5

  for (let age = minimumAge; age <= maximumAge + 0.001; age += step) {
    const normalizedAge = Number(age.toFixed(2))
    const band = isOfficialNhc2025Metric(metric, standardKey) && gender
      ? buildNhc2025Band(metric, normalizedAge, gender)
      : interpolateLegacyBand(metric, normalizedAge, standardKey)

    points.push({
      ageMonths: normalizedAge,
      p3: Number(band.p3.toFixed(1)),
      p50: Number(band.p50.toFixed(1)),
      p97: Number(band.p97.toFixed(1))
    })
  }

  return points
}

function resolveRangeDomain(rangeKey: GrowthRangeKey) {
  if (rangeKey === 'threeYear') {
    return {
      minAgeMonths: 0,
      maxAgeMonths: 36
    }
  }

  if (rangeKey === 'oneYear') {
    return {
      minAgeMonths: 0,
      maxAgeMonths: 12
    }
  }

  return {
    minAgeMonths: 0,
    maxAgeMonths: 6
  }
}

function getFallbackMetricValues(metric: GrowthMetricType) {
  if (metric === 'weight') {
    return [2, 18]
  }

  if (metric === 'head') {
    return [32, 50]
  }

  return [44, 108]
}

export function getGrowthChartDataset(options: {
  birthDate?: string
  gender?: BabyGender
  metric: GrowthMetricType
  rangeKey: GrowthRangeKey
  standardKey: GrowthStandardKey
}): GrowthChartDataset {
  const resolvedBirthDate = getBirthDate(options.birthDate)
  const records = ensureRecords(resolvedBirthDate)
  const { minAgeMonths, maxAgeMonths } = resolveRangeDomain(options.rangeKey)

  const points = records
    .slice()
    .reverse()
    .map((record) => {
      const value = getMetricValue(record, options.metric)
      if (value == null) {
        return null
      }

      const ageMonths = getGrowthAgeMonths(resolvedBirthDate, record.measuredAt)
      if (ageMonths < minAgeMonths || ageMonths > maxAgeMonths) {
        return null
      }

      if (isOfficialNhc2025Metric(options.metric, options.standardKey) && !options.gender) {
        return {
          id: record.id,
          measuredAt: record.measuredAt,
          ageLabel: formatAgeLabel(resolvedBirthDate, record.measuredAt),
          xLabel: `${Math.round(ageMonths)}个月`,
          ageMonths: Number(ageMonths.toFixed(2)),
          value: formatMetricValue(options.metric, value),
          percentile: null,
          statusLabel: '需性别'
        } satisfies GrowthChartPoint
      }

      const evaluation = buildGrowthEvaluation(options.metric, ageMonths, value, options.standardKey, options.gender)

      return {
        id: record.id,
        measuredAt: record.measuredAt,
        ageLabel: formatAgeLabel(resolvedBirthDate, record.measuredAt),
        xLabel: `${Math.round(ageMonths)}个月`,
        ageMonths: Number(ageMonths.toFixed(2)),
        value: formatMetricValue(options.metric, value),
        percentile: evaluation.percentile,
        statusLabel: evaluation.status.label
      } satisfies GrowthChartPoint
    })
    .filter((item): item is GrowthChartPoint => !!item)

  const bands = buildBandWindow(options.metric, minAgeMonths, maxAgeMonths, options.standardKey, options.gender)
  const fallbackValues = getFallbackMetricValues(options.metric)
  const allValues = [
    ...points.map((item) => item.value),
    ...bands.map((item) => item.p3),
    ...bands.map((item) => item.p97)
  ]
  const minValue = Math.min(...(allValues.length ? allValues : fallbackValues))
  const maxValue = Math.max(...(allValues.length ? allValues : fallbackValues))
  const padding = Math.max((maxValue - minValue) * 0.08, options.metric === 'weight' ? 0.6 : 2)

  return {
    metric: options.metric,
    unit: growthMetricMeta[options.metric].unit,
    minAgeMonths,
    maxAgeMonths,
    minValue: Number((minValue - padding).toFixed(1)),
    maxValue: Number((maxValue + padding).toFixed(1)),
    points,
    bands
  }
}

export function getGrowthStandardOptions() {
  return growthStandardOptions
}

export function getGrowthRangeOptions() {
  return growthRangeOptions
}

export function getGrowthMetricMeta(metric: GrowthMetricType) {
  return growthMetricMeta[metric]
}

export function getGrowthSourceText(standardKey: GrowthStandardKey) {
  return growthStandardOptions.find((item) => item.key === standardKey)?.sourceLabel || growthStandardOptions[0].sourceLabel
}
