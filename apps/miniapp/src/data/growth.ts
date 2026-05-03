import type {
  GrowthMetricType,
  GrowthRangeOption,
  GrowthReferenceBandPoint,
  GrowthStandardKey,
  GrowthStandardOption
} from '@baby-food/shared-types'

export const growthStandardOptions: GrowthStandardOption[] = [
  {
    key: 'nhc-2025',
    label: '卫健委2025喂养评估指南',
    ageRangeLabel: '0-3岁',
    sourceLabel: '依据国家卫健委2025年《婴幼儿营养喂养评估服务指南（试行）》的婴幼儿营养状况评价指标'
  },
  {
    key: 'nhc-2022',
    label: '卫健委2022儿童生长标准',
    ageRangeLabel: '0-7岁',
    sourceLabel: '依据国家卫健委2022年儿童生长标准整理的本地示例数据'
  },
  {
    key: 'who',
    label: '世卫组织儿童生长标准',
    ageRangeLabel: '0-5岁',
    sourceLabel: '依据 WHO 儿童生长标准整理的本地示例数据'
  }
]

export const growthRangeOptions: GrowthRangeOption[] = [
  { key: 'halfYear', label: '半年', months: 6 },
  { key: 'oneYear', label: '1年', months: 12 },
  { key: 'threeYear', label: '3年', months: 36 }
]

export const growthMetricMeta: Record<GrowthMetricType, { label: string; shortLabel: string; unit: string }> = {
  height: { label: '身高曲线', shortLabel: '身高', unit: 'cm' },
  weight: { label: '体重曲线', shortLabel: '体重', unit: 'kg' },
  head: { label: '头围曲线', shortLabel: '头围', unit: 'cm' }
}

export const growthReferenceTemplates: Record<GrowthMetricType, GrowthReferenceBandPoint[]> = {
  height: [
    { ageMonths: 0, p3: 46.5, p50: 49.8, p97: 53.4 },
    { ageMonths: 3, p3: 57.5, p50: 61.4, p97: 65.5 },
    { ageMonths: 6, p3: 63.5, p50: 67.6, p97: 71.8 },
    { ageMonths: 9, p3: 67.4, p50: 72.0, p97: 76.2 },
    { ageMonths: 12, p3: 71.0, p50: 76.0, p97: 80.8 },
    { ageMonths: 15, p3: 74.2, p50: 79.8, p97: 84.3 },
    { ageMonths: 18, p3: 77.0, p50: 83.4, p97: 88.1 },
    { ageMonths: 24, p3: 82.0, p50: 88.7, p97: 94.3 },
    { ageMonths: 30, p3: 86.4, p50: 93.3, p97: 99.5 },
    { ageMonths: 36, p3: 90.0, p50: 97.2, p97: 103.4 }
  ],
  weight: [
    { ageMonths: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
    { ageMonths: 3, p3: 4.9, p50: 6.1, p97: 7.8 },
    { ageMonths: 6, p3: 6.1, p50: 7.7, p97: 9.8 },
    { ageMonths: 9, p3: 6.9, p50: 8.6, p97: 10.9 },
    { ageMonths: 12, p3: 7.6, p50: 9.4, p97: 11.8 },
    { ageMonths: 15, p3: 8.1, p50: 10.0, p97: 12.6 },
    { ageMonths: 18, p3: 8.6, p50: 10.6, p97: 13.3 },
    { ageMonths: 24, p3: 9.6, p50: 11.8, p97: 14.8 },
    { ageMonths: 30, p3: 10.6, p50: 13.0, p97: 16.3 },
    { ageMonths: 36, p3: 11.3, p50: 14.1, p97: 17.5 }
  ],
  head: [
    { ageMonths: 0, p3: 32.8, p50: 34.5, p97: 36.7 },
    { ageMonths: 3, p3: 38.5, p50: 40.2, p97: 42.3 },
    { ageMonths: 6, p3: 41.2, p50: 43.2, p97: 45.1 },
    { ageMonths: 9, p3: 42.6, p50: 44.6, p97: 46.7 },
    { ageMonths: 12, p3: 43.5, p50: 45.4, p97: 47.7 },
    { ageMonths: 15, p3: 44.0, p50: 46.0, p97: 48.2 },
    { ageMonths: 18, p3: 44.4, p50: 46.4, p97: 48.6 },
    { ageMonths: 24, p3: 45.0, p50: 47.0, p97: 49.2 },
    { ageMonths: 30, p3: 45.4, p50: 47.4, p97: 49.7 },
    { ageMonths: 36, p3: 45.7, p50: 47.8, p97: 50.0 }
  ]
}

export const growthStandardScales: Record<GrowthStandardKey, Record<GrowthMetricType, number>> = {
  'nhc-2025': {
    height: 1,
    weight: 1,
    head: 1
  },
  'nhc-2022': {
    height: 0.992,
    weight: 0.988,
    head: 0.995
  },
  who: {
    height: 1.01,
    weight: 1.015,
    head: 1.005
  }
}
