import type {
  FeedingJournalDayStat,
  FeedingJournalDaySummary,
  FeedingJournalEntry,
  FeedingJournalMonthPoint,
  FeedingJournalMonthStats,
  FeedingJournalType,
  FeedingJournalWeekStats,
  LifeRecordScope
} from '@baby-food/shared-types'

const STORAGE_KEY = 'miniapp-feeding-journal-v1'
const DEFAULT_MILK_TARGET_ML = 800
const ALL_RECORD_TYPES: FeedingJournalType[] = [
  'breast',
  'formula',
  'bottle-breast',
  'sleep',
  'diaper',
  'pump',
  'solid',
  'bath',
  'play',
  'swim',
  'water',
  'supplement',
  'other'
]
let inMemoryEntries: FeedingJournalEntry[] | null = []

function pad(value: number) {
  return `${value}`.padStart(2, '0')
}

function toYmd(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toHm(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function normalizeDate(value?: string) {
  return value || toYmd(new Date())
}

function normalizeTime(value?: string) {
  return value || toHm(new Date())
}

function isFeedingJournalType(value: unknown): value is FeedingJournalType {
  return typeof value === 'string' && ALL_RECORD_TYPES.includes(value as FeedingJournalType)
}

function compareEntries(left: FeedingJournalEntry, right: FeedingJournalEntry) {
  const dateDiff = left.date.localeCompare(right.date)
  if (dateDiff !== 0) {
    return dateDiff
  }

  const timeDiff = left.time.localeCompare(right.time)
  if (timeDiff !== 0) {
    return timeDiff
  }

  return left.createdAt.localeCompare(right.createdAt)
}

function sortAscending(items: FeedingJournalEntry[]) {
  return items.slice().sort(compareEntries)
}

function sortDescending(items: FeedingJournalEntry[]) {
  return items.slice().sort((left, right) => compareEntries(right, left))
}

function describeEntry(entry: FeedingJournalEntry) {
  if (entry.type === 'breast') {
    const sideLabel = entry.breast?.side === 'left' ? '左侧' : entry.breast?.side === 'right' ? '右侧' : entry.breast?.side === 'switch' ? '左右切换' : ''
    const durationLabel = entry.breast?.durationMinutes ? `${entry.breast.durationMinutes}分钟` : ''
    return ['母乳', sideLabel, durationLabel].filter(Boolean).join(' ')
  }

  if (entry.type === 'formula') {
    return entry.formula?.brand ? `${entry.formula.brand} 配方奶` : '配方奶'
  }

  if (entry.type === 'bottle-breast') {
    return entry.amountValue ? `瓶喂母乳 ${entry.amountValue}ml` : '瓶喂母乳'
  }

  if (entry.type === 'solid') {
    return entry.solid?.foodName || entry.title
  }

  if (entry.type === 'water') {
    return entry.amountValue ? `饮水 ${entry.amountValue}ml` : '饮水'
  }

  if (entry.type === 'supplement') {
    return entry.supplement?.name || entry.title
  }

  if (entry.type === 'sleep') {
    return entry.sleep?.durationMinutes ? `睡眠 ${entry.sleep.durationMinutes}分钟` : '睡眠'
  }

  if (entry.type === 'diaper') {
    return entry.diaper?.kind ? `换尿布 · ${entry.diaper.kind}` : '换尿布'
  }

  if (entry.type === 'pump') {
    return entry.pump?.amountMl ? `吸奶 ${entry.pump.amountMl}ml` : '吸奶'
  }

  if (entry.type === 'bath') {
    return entry.bath?.durationMinutes ? `洗澡 ${entry.bath.durationMinutes}分钟` : '洗澡'
  }

  if (entry.type === 'play') {
    return entry.play?.durationMinutes ? `玩耍 ${entry.play.durationMinutes}分钟` : '玩耍'
  }

  if (entry.type === 'swim') {
    return entry.swim?.durationMinutes ? `游泳 ${entry.swim.durationMinutes}分钟` : '游泳'
  }

  return entry.other?.categoryLabel || entry.title || '其他事件'
}

function normalizeStoredEntry(raw: unknown): FeedingJournalEntry | null {
  const item = raw as Record<string, unknown> | null | undefined
  if (!item || typeof item !== 'object') {
    return null
  }

  const type = isFeedingJournalType(item.type) ? item.type : 'other'
  const normalized: FeedingJournalEntry = {
    id: typeof item.id === 'string' ? item.id : `feeding-${Date.now()}`,
    date: normalizeDate(typeof item.date === 'string' ? item.date : undefined),
    time: normalizeTime(typeof item.time === 'string' ? item.time : undefined),
    type,
    title: typeof item.title === 'string' ? item.title : '记录',
    description: typeof item.description === 'string' ? item.description : '',
    amountValue: typeof item.amountValue === 'number' ? item.amountValue : undefined,
    amountUnit: typeof item.amountUnit === 'string' ? item.amountUnit : undefined,
    note: typeof item.note === 'string' ? item.note : undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    source: item.source === 'reminder' ? 'reminder' : 'manual',
    sourceReminderIds: Array.isArray(item.sourceReminderIds)
      ? item.sourceReminderIds.filter((id): id is string => typeof id === 'string')
      : undefined,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    breast: item.breast as FeedingJournalEntry['breast'],
    formula: item.formula as FeedingJournalEntry['formula'],
    bottleBreast: item.bottleBreast as FeedingJournalEntry['bottleBreast'],
    solid: item.solid as FeedingJournalEntry['solid'],
    water: item.water as FeedingJournalEntry['water'],
    supplement: item.supplement as FeedingJournalEntry['supplement'],
    sleep: item.sleep as FeedingJournalEntry['sleep'],
    diaper: item.diaper as FeedingJournalEntry['diaper'],
    pump: item.pump as FeedingJournalEntry['pump'],
    bath: item.bath as FeedingJournalEntry['bath'],
    play: item.play as FeedingJournalEntry['play'],
    swim: item.swim as FeedingJournalEntry['swim'],
    other: item.other as FeedingJournalEntry['other']
  }

  normalized.description = normalized.description || describeEntry(normalized)
  return normalized
}

function getStoredEntries() {
  if (inMemoryEntries) {
    return inMemoryEntries.slice()
  }

  const stored = uni.getStorageSync(STORAGE_KEY)
  return Array.isArray(stored)
    ? stored.map(normalizeStoredEntry).filter((item): item is FeedingJournalEntry => Boolean(item))
    : []
}

function writeEntries(items: FeedingJournalEntry[]) {
  const next = sortAscending(items)
  inMemoryEntries = next
  uni.setStorageSync(STORAGE_KEY, next)
}

function getMilkMl(entry: FeedingJournalEntry) {
  if (entry.type === 'breast') {
    return entry.breast?.estimatedMilkMl ?? entry.amountValue ?? 0
  }

  if (entry.type === 'formula' || entry.type === 'bottle-breast') {
    return entry.amountValue ?? entry.bottleBreast?.amountMl ?? 0
  }

  return 0
}

function getWaterMl(entry: FeedingJournalEntry) {
  if (entry.type !== 'water') {
    return 0
  }

  return entry.water?.amountMl ?? entry.amountValue ?? 0
}

function getSolidCount(entry: FeedingJournalEntry) {
  return entry.type === 'solid' ? 1 : 0
}

function getSupplementCount(entry: FeedingJournalEntry) {
  return entry.type === 'supplement' ? 1 : 0
}

function getDayLabel(date: Date) {
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return labels[date.getDay()]
}

function buildDayStat(date: Date, entries: FeedingJournalEntry[]): FeedingJournalDayStat {
  return {
    date: toYmd(date),
    label: getDayLabel(date),
    milkMl: entries.reduce((sum, entry) => sum + getMilkMl(entry), 0),
    solidCount: entries.reduce((sum, entry) => sum + getSolidCount(entry), 0),
    waterMl: entries.reduce((sum, entry) => sum + getWaterMl(entry), 0),
    supplementCount: entries.reduce((sum, entry) => sum + getSupplementCount(entry), 0),
    totalCount: entries.length
  }
}

function getWeekStart(dateValue: string) {
  const date = parseYmd(dateValue)
  const day = date.getDay()
  const offset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() + offset)
  return weekStart
}

function getMonthStart(dateValue: string) {
  const date = parseYmd(dateValue)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthEnd(dateValue: string) {
  const date = parseYmd(dateValue)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function resolveScopeRange(scope: LifeRecordScope, anchorDate: string) {
  if (scope === 'week') {
    const start = getWeekStart(anchorDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: toYmd(start), end: toYmd(end) }
  }

  if (scope === 'month') {
    return {
      start: toYmd(getMonthStart(anchorDate)),
      end: toYmd(getMonthEnd(anchorDate))
    }
  }

  const entries = readFeedingEntries()
  if (!entries.length) {
    const today = toYmd(new Date())
    return { start: today, end: today }
  }

  return {
    start: entries[0].date,
    end: entries[entries.length - 1].date
  }
}

function matchesTypes(entry: FeedingJournalEntry, types?: FeedingJournalType[]) {
  return !types?.length || types.includes(entry.type)
}

function getEntriesByDateRange(start: string, end: string, types?: FeedingJournalType[]) {
  return readFeedingEntries().filter((entry) => entry.date >= start && entry.date <= end && matchesTypes(entry, types))
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

function buildRangeDayStats(startValue: string, endValue: string, types?: FeedingJournalType[]) {
  const start = parseYmd(startValue)
  const end = parseYmd(endValue)
  const days: FeedingJournalDayStat[] = []

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateKey = getDateKey(date)
    const entries = getEntriesByDateRange(dateKey, dateKey, types)
    days.push(buildDayStat(new Date(date), entries))
  }

  return days
}

function summarizeEntries(entries: FeedingJournalEntry[], milkTargetMl = DEFAULT_MILK_TARGET_ML): FeedingJournalDaySummary {
  const milkMl = entries.reduce((sum, entry) => sum + getMilkMl(entry), 0)
  const solidCount = entries.reduce((sum, entry) => sum + getSolidCount(entry), 0)
  const waterMl = entries.reduce((sum, entry) => sum + getWaterMl(entry), 0)
  const supplementCount = entries.reduce((sum, entry) => sum + getSupplementCount(entry), 0)

  return {
    milkMl,
    milkTargetMl,
    milkProgress: milkTargetMl > 0 ? Math.min(1, milkMl / milkTargetMl) : 0,
    solidCount,
    waterMl,
    supplementCount,
    totalCount: entries.length
  }
}

export function getFeedingRecordDateLabel(dateValue: string) {
  const today = toYmd(new Date())
  if (dateValue === today) {
    const date = parseYmd(dateValue)
    return `今天 ${date.getMonth() + 1}月${date.getDate()}日`
  }

  const date = parseYmd(dateValue)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function hydrateFeedingEntries(items: FeedingJournalEntry[]) {
  inMemoryEntries = sortAscending(items)
  return inMemoryEntries
}

export function clearHydratedFeedingEntries() {
  inMemoryEntries = null
}

export function readFeedingEntries() {
  return sortAscending(getStoredEntries())
}

export function getFeedingEntryById(id: string) {
  return readFeedingEntries().find((entry) => entry.id === id) || null
}

export function saveFeedingEntry(input: Omit<FeedingJournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'description'> & { description?: string }, id?: string) {
  const current = readFeedingEntries()
  const now = new Date().toISOString()
  const existing = id ? current.find((entry) => entry.id === id) : null

  const nextEntry: FeedingJournalEntry = {
    id: id || `feeding-${Date.now()}`,
    date: normalizeDate(input.date),
    time: normalizeTime(input.time),
    type: input.type,
    title: input.title,
    description: input.description?.trim() || describeEntry(input as FeedingJournalEntry),
    amountValue: input.amountValue,
    amountUnit: input.amountUnit,
    note: input.note,
    tags: input.tags,
    source: input.source || 'manual',
    sourceReminderIds: input.sourceReminderIds,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    breast: input.breast,
    formula: input.formula,
    bottleBreast: input.bottleBreast,
    solid: input.solid,
    water: input.water,
    supplement: input.supplement,
    sleep: input.sleep,
    diaper: input.diaper,
    pump: input.pump,
    bath: input.bath,
    play: input.play,
    swim: input.swim,
    other: input.other
  }

  const next = existing
    ? current.map((entry) => (entry.id === id ? nextEntry : entry))
    : [...current, nextEntry]

  writeEntries(next)
  return sortAscending(next)
}

export function removeFeedingEntry(id: string) {
  const next = readFeedingEntries().filter((entry) => entry.id !== id)
  writeEntries(next)
  return next
}

export function getFeedingEntriesByDate(dateValue: string) {
  const date = normalizeDate(dateValue)
  return sortDescending(readFeedingEntries().filter((entry) => entry.date === date))
}

export function getFeedingDaySummary(dateValue: string, milkTargetMl = DEFAULT_MILK_TARGET_ML): FeedingJournalDaySummary {
  return summarizeEntries(getFeedingEntriesByDate(dateValue), milkTargetMl)
}

export function queryFeedingEntries(options: {
  scope: LifeRecordScope
  anchorDate: string
  types?: FeedingJournalType[]
}) {
  const range = resolveScopeRange(options.scope, options.anchorDate)
  return sortDescending(getEntriesByDateRange(range.start, range.end, options.types))
}

export function getFeedingTimelineGroups(options: {
  scope: LifeRecordScope
  anchorDate: string
  types?: FeedingJournalType[]
}) {
  const entries = queryFeedingEntries(options)
  const groups = new Map<string, FeedingJournalEntry[]>()

  for (const entry of entries) {
    if (!groups.has(entry.date)) {
      groups.set(entry.date, [])
    }
    groups.get(entry.date)?.push(entry)
  }

  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    label: getFeedingRecordDateLabel(date),
    totalCount: items.length,
    summary: summarizeEntries(items),
    entries: items
  }))
}

export function getFeedingScopeSummary(options: {
  scope: LifeRecordScope
  anchorDate: string
  types?: FeedingJournalType[]
}, milkTargetMl = DEFAULT_MILK_TARGET_ML) {
  return summarizeEntries(queryFeedingEntries(options), milkTargetMl)
}

export function getFeedingWeekStats(anchorDate: string, types?: FeedingJournalType[]): FeedingJournalWeekStats {
  const start = toYmd(getWeekStart(anchorDate))
  const endDate = new Date(getWeekStart(anchorDate))
  endDate.setDate(endDate.getDate() + 6)
  const days = buildRangeDayStats(start, toYmd(endDate), types)

  return {
    days,
    maxMilkMl: Math.max(100, ...days.map((day) => day.milkMl)),
    maxSolidCount: Math.max(1, ...days.map((day) => day.solidCount)),
    maxTotalCount: Math.max(1, ...days.map((day) => day.totalCount))
  }
}

export function getFeedingMonthStats(anchorDate: string, types?: FeedingJournalType[]): FeedingJournalMonthStats {
  const start = getMonthStart(anchorDate)
  const end = getMonthEnd(anchorDate)
  const points: FeedingJournalMonthPoint[] = []

  for (let day = 1; day <= end.getDate(); day += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), day)
    const dateKey = toYmd(date)
    const entries = getEntriesByDateRange(dateKey, dateKey, types)
    const stat = buildDayStat(date, entries)

    points.push({
      date: stat.date,
      label: `${day}`,
      milkMl: stat.milkMl,
      solidCount: stat.solidCount,
      waterMl: stat.waterMl,
      totalCount: stat.totalCount
    })
  }

  return {
    points,
    maxMilkMl: Math.max(100, ...points.map((point) => point.milkMl)),
    maxSolidCount: Math.max(1, ...points.map((point) => point.solidCount)),
    maxTotalCount: Math.max(1, ...points.map((point) => point.totalCount))
  }
}

export function getFeedingAllStats(types?: FeedingJournalType[]) {
  const entries = sortAscending(readFeedingEntries().filter((entry) => matchesTypes(entry, types)))
  const monthMap = new Map<string, { label: string; milkMl: number; solidCount: number; waterMl: number; totalCount: number }>()

  for (const entry of entries) {
    const [year, month] = entry.date.split('-')
    const key = `${year}-${month}`
    const existing = monthMap.get(key) || {
      label: `${Number(month)}月`,
      milkMl: 0,
      solidCount: 0,
      waterMl: 0,
      totalCount: 0
    }

    existing.milkMl += getMilkMl(entry)
    existing.solidCount += getSolidCount(entry)
    existing.waterMl += getWaterMl(entry)
    existing.totalCount += 1
    monthMap.set(key, existing)
  }

  const points: FeedingJournalMonthPoint[] = Array.from(monthMap.entries()).map(([date, value]) => ({
    date,
    label: value.label,
    milkMl: value.milkMl,
    solidCount: value.solidCount,
    waterMl: value.waterMl,
    totalCount: value.totalCount
  }))

  return {
    points,
    maxMilkMl: Math.max(100, ...points.map((point) => point.milkMl), 100),
    maxSolidCount: Math.max(1, ...points.map((point) => point.solidCount), 1),
    maxTotalCount: Math.max(1, ...points.map((point) => point.totalCount), 1)
  }
}

export function getFeedingTimelinePreview(limit = 5) {
  return sortDescending(readFeedingEntries()).slice(0, limit)
}
