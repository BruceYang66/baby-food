<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import type {
  DiaperRecordKind,
  FeedingJournalEntry,
  FeedingJournalType,
  FeedingReactionTag,
  FeedingSolidIntake,
  LifeRecordDisplayMode,
  LifeRecordScope,
  SupplementDoseUnit
} from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import DatePickerModal from '@/components/common/DatePickerModal.vue'
import { ensureProtectedPageAccess, getPlanPageData, readAuthSession } from '@/services/api'
import {
  getFeedingAllStats,
  getFeedingMonthStats,
  getFeedingRecordDateLabel,
  getFeedingScopeSummary,
  getFeedingTimelineGroups,
  getFeedingWeekStats,
  removeFeedingEntry,
  saveFeedingEntry
} from '@/services/local-feeding-record'
import { markReminderItemsDone } from '@/services/local-reminder'

type TimelineItem = FeedingJournalEntry & {
  icon: string
  dotColor: string
  softColor: string
  typeLabel: string
  amountLabel: string
}

type ChartPoint = {
  x: number
  y: number
}

const SCOPE_TABS: Array<{ key: LifeRecordScope; label: string }> = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'all', label: '全部' }
]

const TYPE_META: Record<FeedingJournalType, { label: string; icon: string; dotColor: string; softColor: string }> = {
  breast: { label: '母乳', icon: '🤱', dotColor: '#5BA7FF', softColor: 'rgba(91, 167, 255, 0.16)' },
  formula: { label: '配方奶', icon: '🍼', dotColor: '#6A9EFF', softColor: 'rgba(106, 158, 255, 0.16)' },
  'bottle-breast': { label: '瓶喂母乳', icon: '🧴', dotColor: '#58B7D9', softColor: 'rgba(88, 183, 217, 0.16)' },
  sleep: { label: '睡眠', icon: '😴', dotColor: '#8476FF', softColor: 'rgba(132, 118, 255, 0.16)' },
  diaper: { label: '换尿布', icon: '🧷', dotColor: '#F4A14E', softColor: 'rgba(244, 161, 78, 0.16)' },
  pump: { label: '吸奶', icon: '🫗', dotColor: '#40BFB3', softColor: 'rgba(64, 191, 179, 0.16)' },
  solid: { label: '辅食', icon: '🥣', dotColor: '#FF9F4A', softColor: 'rgba(255, 159, 74, 0.16)' },
  bath: { label: '洗澡', icon: '🛁', dotColor: '#6BC9D5', softColor: 'rgba(107, 201, 213, 0.16)' },
  play: { label: '玩耍', icon: '🧸', dotColor: '#F48BB6', softColor: 'rgba(244, 139, 182, 0.16)' },
  swim: { label: '游泳', icon: '🏊', dotColor: '#39A9DB', softColor: 'rgba(57, 169, 219, 0.16)' },
  water: { label: '饮水', icon: '💧', dotColor: '#42C7C6', softColor: 'rgba(66, 199, 198, 0.16)' },
  supplement: { label: '补剂', icon: '💊', dotColor: '#9D78FF', softColor: 'rgba(157, 120, 255, 0.16)' },
  other: { label: '其他事件', icon: '✨', dotColor: '#B28B67', softColor: 'rgba(178, 139, 103, 0.16)' }
}

const MODE_OPTIONS: Array<{ key: FeedingJournalType; label: string; icon: string }> = [
  { key: 'breast', label: '母乳', icon: '🤱' },
  { key: 'formula', label: '配方奶', icon: '🍼' },
  { key: 'bottle-breast', label: '瓶喂母乳', icon: '🧴' },
  { key: 'sleep', label: '睡眠', icon: '😴' },
  { key: 'diaper', label: '换尿布', icon: '🧷' },
  { key: 'pump', label: '吸奶', icon: '🫗' },
  { key: 'solid', label: '辅食', icon: '🥣' },
  { key: 'bath', label: '洗澡', icon: '🛁' },
  { key: 'play', label: '玩耍', icon: '🧸' },
  { key: 'swim', label: '游泳', icon: '🏊' },
  { key: 'water', label: '饮水', icon: '💧' },
  { key: 'supplement', label: '补剂', icon: '💊' },
  { key: 'other', label: '其他事件', icon: '✨' }
]

const FORMULA_BRANDS = ['美赞臣', '爱他美', '飞鹤', '自定义'] as const
const FORMULA_STAGES = ['1段', '2段', '3段', '4段'] as const
const FORMULA_TEMPERATURES = ['37℃', '40℃', '45℃'] as const
const FORMULA_QUICK_AMOUNTS = [60, 90, 120, 150, 180, 210]
const FORMULA_TAG_OPTIONS = ['吐奶了', '喝完了', '剩一半']
const BREAST_SIDE_OPTIONS: Array<{ key: 'left' | 'right' | 'switch'; label: string }> = [
  { key: 'left', label: '左侧' },
  { key: 'right', label: '右侧' },
  { key: 'switch', label: '左右切换' }
]
const BREAST_QUICK_TAGS = ['刚换边', '打嗝了', '睡着了']
const SOLID_INTAKE_OPTIONS: Array<{ key: FeedingSolidIntake; label: string; emoji: string }> = [
  { key: 'finished', label: '吃完', emoji: '😋' },
  { key: 'half', label: '吃一半', emoji: '😐' },
  { key: 'few-bites', label: '吃几口', emoji: '😕' },
  { key: 'refused', label: '拒食', emoji: '😫' }
]
const SOLID_REACTION_OPTIONS: Array<{ key: FeedingReactionTag; label: string }> = [
  { key: 'rash', label: '皮疹' },
  { key: 'diarrhea', label: '腹泻' },
  { key: 'vomit', label: '呕吐' },
  { key: 'constipation', label: '便秘' }
]
const WATER_QUICK_AMOUNTS = [30, 50, 80, 100, 150, 200]
const SUPPLEMENT_OPTIONS = ['AD滴剂', '钙剂', 'DHA', '益生菌', '铁剂', '其他']
const SUPPLEMENT_UNITS: SupplementDoseUnit[] = ['滴', '粒', 'ml', '勺']
const DIAPER_OPTIONS: Array<{ key: DiaperRecordKind; label: string }> = [
  { key: 'wet', label: '尿湿' },
  { key: 'dirty', label: '便便' },
  { key: 'mixed', label: '混合' }
]
const GENERIC_DURATION_OPTIONS = [15, 20, 30, 45, 60, 90]

const selectedDate = ref(getTodayYmd())
const activeScope = ref<LifeRecordScope>('week')
const activeDisplayMode = ref<LifeRecordDisplayMode>('timeline')
const appliedTypes = ref<FeedingJournalType[]>([])
const draftTypes = ref<FeedingJournalType[]>([])
const showFilterSheet = ref(false)
const showDatePicker = ref(false)
const showEntrySheet = ref(false)
const entryMode = ref<FeedingJournalType>('formula')
const editingEntryId = ref('')
const pendingReminderIds = ref<string[]>([])
const shouldAutoOpenComposer = ref(false)
const pendingEntryType = ref<FeedingJournalType>('solid')
const todayPlanTitles = ref<string[]>([])
const dataVersion = ref(0)
const session = ref(readAuthSession())

const form = ref({
  date: selectedDate.value,
  time: getCurrentTime(),
  note: '',
  breastSide: 'left' as 'left' | 'right' | 'switch',
  breastDurationMinutes: '15',
  breastMilkMl: '120',
  breastQuickTags: [] as string[],
  formulaMl: '120',
  formulaBrand: FORMULA_BRANDS[0],
  formulaStage: FORMULA_STAGES[0],
  formulaTemperature: FORMULA_TEMPERATURES[0],
  formulaTags: [] as string[],
  bottleBreastMl: '120',
  solidFoodName: '',
  solidIntake: 'finished' as FeedingSolidIntake,
  solidReactions: [] as FeedingReactionTag[],
  waterMl: '100',
  supplementName: SUPPLEMENT_OPTIONS[0],
  supplementDose: '1',
  supplementUnit: SUPPLEMENT_UNITS[0],
  sleepDurationMinutes: '90',
  diaperKind: 'wet' as DiaperRecordKind,
  pumpMl: '120',
  bathDurationMinutes: '20',
  playDurationMinutes: '30',
  swimDurationMinutes: '20',
  otherTitle: '',
  otherCategoryLabel: '其他事件'
})

const displayScopeLabel = computed(() => SCOPE_TABS.find((item) => item.key === activeScope.value)?.label || '全部')
const displayQueryTitle = computed(() => {
  if (!appliedTypes.value.length) {
    return '全部记录'
  }

  if (appliedTypes.value.length === 1) {
    return TYPE_META[appliedTypes.value[0]].label
  }

  return `${appliedTypes.value.length}类记录`
})
const anchorDateLabel = computed(() => getFeedingRecordDateLabel(selectedDate.value))
const currentBabyBirthDate = computed(() => session.value?.babyProfile?.birthDate || '')
const filterSummaryText = computed(() => appliedTypes.value.length ? `已筛选 ${appliedTypes.value.length} 类` : '全部分类')
const sheetTitle = computed(() => {
  const modeLabel = TYPE_META[entryMode.value].label
  return editingEntryId.value ? `编辑${modeLabel}` : `添加${modeLabel}`
})
const rangeSummary = computed(() => {
  dataVersion.value
  return getFeedingScopeSummary({
    scope: activeScope.value,
    anchorDate: selectedDate.value,
    types: appliedTypes.value
  })
})
const timelineGroups = computed(() => {
  dataVersion.value
  return getFeedingTimelineGroups({
    scope: activeScope.value,
    anchorDate: selectedDate.value,
    types: appliedTypes.value
  }).map((group) => ({
    ...group,
    ageLabel: formatAgeAtDate(group.date),
    entries: group.entries.map((entry) => ({
      ...entry,
      icon: TYPE_META[entry.type].icon,
      dotColor: TYPE_META[entry.type].dotColor,
      softColor: TYPE_META[entry.type].softColor,
      typeLabel: TYPE_META[entry.type].label,
      amountLabel: formatTimelineAmount(entry)
    })) as TimelineItem[]
  }))
})
const weekStats = computed(() => {
  dataVersion.value
  return getFeedingWeekStats(selectedDate.value, appliedTypes.value)
})
const monthStats = computed(() => {
  dataVersion.value
  return getFeedingMonthStats(selectedDate.value, appliedTypes.value)
})
const allStats = computed(() => {
  dataVersion.value
  return getFeedingAllStats(appliedTypes.value)
})
const weekHasData = computed(() => weekStats.value.days.some((day) => day.totalCount > 0))
const weekBars = computed(() => weekStats.value.days.map((day) => ({
  ...day,
  totalHeight: day.totalCount ? `${Math.max(16, (day.totalCount / weekStats.value.maxTotalCount) * 180)}rpx` : '8rpx'
})))
const trendSource = computed(() => activeScope.value === 'month' ? monthStats.value : allStats.value)
const trendHasData = computed(() => trendSource.value.points.some((point) => point.totalCount > 0))
const trendChartPoints = computed(() => trendSource.value.points.map((point, index) => ({
  ...point,
  x: index * 56 + 28,
  y: 196 - (point.totalCount ? (point.totalCount / trendSource.value.maxTotalCount) * 128 : 0)
})))
const trendSegments = computed(() => buildSegments(trendChartPoints.value.map((point) => ({ x: point.x, y: point.y })), '#5BA7FF'))
const trendChartWidth = computed(() => `${Math.max(720, trendChartPoints.value.length * 56 + 56)}rpx`)

function getTodayYmd() {
  const now = new Date()
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`
}

function getCurrentTime() {
  const now = new Date()
  return `${`${now.getHours()}`.padStart(2, '0')}:${`${now.getMinutes()}`.padStart(2, '0')}`
}

function parseYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function formatAgeAtDate(dateValue: string) {
  if (!currentBabyBirthDate.value) {
    return ''
  }

  const birthDate = parseYmd(currentBabyBirthDate.value)
  const targetDate = parseYmd(dateValue)
  const diffDays = Math.max(0, Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)))
  const totalMonths = Math.floor(diffDays / 30.44)
  const remainDays = Math.floor(diffDays % 30.44)

  if (totalMonths < 12) {
    return `${totalMonths}个月${remainDays}天`
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return `${years}岁${months}个月${remainDays}天`
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function toggleTag<T extends string>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value]
}

function formatTimelineAmount(entry: FeedingJournalEntry) {
  if (entry.type === 'breast') {
    const duration = entry.breast?.durationMinutes ? `${entry.breast.durationMinutes}分钟` : ''
    const milkMl = entry.breast?.estimatedMilkMl ?? entry.amountValue
    return [duration, milkMl ? `约${milkMl}ml` : ''].filter(Boolean).join(' · ') || '已记录'
  }

  if (entry.type === 'formula' || entry.type === 'bottle-breast' || entry.type === 'water' || entry.type === 'pump') {
    return entry.amountValue ? `${entry.amountValue}${entry.amountUnit || 'ml'}` : '已记录'
  }

  if (entry.type === 'solid') {
    return SOLID_INTAKE_OPTIONS.find((item) => item.key === entry.solid?.intakeLevel)?.label || '已记录'
  }

  if (entry.type === 'supplement') {
    const doseText = entry.supplement?.doseText || (entry.amountValue ? `${entry.amountValue}` : '')
    const unit = entry.supplement?.unit || entry.amountUnit || ''
    return `${doseText}${unit}`.trim() || '已记录'
  }

  if (entry.type === 'sleep') {
    return entry.sleep?.durationMinutes ? `${entry.sleep.durationMinutes}分钟` : '已记录'
  }

  if (entry.type === 'diaper') {
    return entry.diaper?.kind === 'wet' ? '尿湿' : entry.diaper?.kind === 'dirty' ? '便便' : entry.diaper?.kind === 'mixed' ? '混合' : '已记录'
  }

  if (entry.type === 'bath') {
    return entry.bath?.durationMinutes ? `${entry.bath.durationMinutes}分钟` : '已记录'
  }

  if (entry.type === 'play') {
    return entry.play?.durationMinutes ? `${entry.play.durationMinutes}分钟` : '已记录'
  }

  if (entry.type === 'swim') {
    return entry.swim?.durationMinutes ? `${entry.swim.durationMinutes}分钟` : '已记录'
  }

  return entry.other?.categoryLabel || '已记录'
}

function buildSegments(points: ChartPoint[], color: string) {
  return points.slice(1).map((point, index) => {
    const prev = points[index]
    const dx = point.x - prev.x
    const dy = point.y - prev.y
    const width = Math.sqrt(dx * dx + dy * dy)
    const rotate = Math.atan2(dy, dx) * 180 / Math.PI

    return {
      key: `${color}-${index}`,
      left: prev.x,
      top: prev.y,
      width,
      rotate,
      color
    }
  })
}

function refreshPageData() {
  dataVersion.value += 1
  session.value = readAuthSession()
}

async function loadTodayPlanTitles() {
  try {
    const data = await getPlanPageData()
    todayPlanTitles.value = Array.from(new Set((data.todayMealPlan?.entries || []).map((entry) => entry.title).filter(Boolean)))
  } catch {
    todayPlanTitles.value = []
  }
}

function openFilterSheet() {
  draftTypes.value = [...appliedTypes.value]
  showFilterSheet.value = true
}

function closeFilterSheet() {
  showFilterSheet.value = false
}

function toggleFilterType(type: FeedingJournalType) {
  draftTypes.value = toggleTag(draftTypes.value, type)
}

function clearDraftFilters() {
  draftTypes.value = []
}

function applyFilters() {
  appliedTypes.value = [...draftTypes.value]
  closeFilterSheet()
}

function switchScope(scope: LifeRecordScope) {
  activeScope.value = scope
  if (scope === 'all' && activeDisplayMode.value === 'chart') {
    return
  }
}

function toggleDisplayMode() {
  activeDisplayMode.value = activeDisplayMode.value === 'timeline' ? 'chart' : 'timeline'
}

function resetForm(mode: FeedingJournalType) {
  form.value = {
    date: selectedDate.value,
    time: getCurrentTime(),
    note: '',
    breastSide: 'left',
    breastDurationMinutes: '15',
    breastMilkMl: '120',
    breastQuickTags: [],
    formulaMl: '120',
    formulaBrand: FORMULA_BRANDS[0],
    formulaStage: FORMULA_STAGES[0],
    formulaTemperature: FORMULA_TEMPERATURES[0],
    formulaTags: [],
    bottleBreastMl: '120',
    solidFoodName: mode === 'solid' ? (todayPlanTitles.value[0] || '') : '',
    solidIntake: 'finished',
    solidReactions: [],
    waterMl: '100',
    supplementName: SUPPLEMENT_OPTIONS[0],
    supplementDose: '1',
    supplementUnit: SUPPLEMENT_UNITS[0],
    sleepDurationMinutes: '90',
    diaperKind: 'wet',
    pumpMl: '120',
    bathDurationMinutes: '20',
    playDurationMinutes: '30',
    swimDurationMinutes: '20',
    otherTitle: '',
    otherCategoryLabel: '其他事件'
  }
}

function fillForm(entry: FeedingJournalEntry) {
  form.value = {
    date: entry.date,
    time: entry.time,
    note: entry.note || '',
    breastSide: entry.breast?.side || 'left',
    breastDurationMinutes: entry.breast?.durationMinutes ? `${entry.breast.durationMinutes}` : '15',
    breastMilkMl: entry.breast?.estimatedMilkMl ? `${entry.breast.estimatedMilkMl}` : (entry.amountValue ? `${entry.amountValue}` : '120'),
    breastQuickTags: entry.breast?.quickNotes ? [...entry.breast.quickNotes] : [],
    formulaMl: entry.amountValue ? `${entry.amountValue}` : '120',
    formulaBrand: entry.formula?.brand || FORMULA_BRANDS[0],
    formulaStage: entry.formula?.stage || FORMULA_STAGES[0],
    formulaTemperature: entry.formula?.temperature || FORMULA_TEMPERATURES[0],
    formulaTags: entry.formula?.tags ? [...entry.formula.tags] : [],
    bottleBreastMl: entry.amountValue ? `${entry.amountValue}` : '120',
    solidFoodName: entry.solid?.foodName || entry.title,
    solidIntake: entry.solid?.intakeLevel || 'finished',
    solidReactions: entry.solid?.reactions ? [...entry.solid.reactions] : [],
    waterMl: entry.amountValue ? `${entry.amountValue}` : '100',
    supplementName: entry.supplement?.name || SUPPLEMENT_OPTIONS[0],
    supplementDose: entry.supplement?.doseText || (entry.amountValue ? `${entry.amountValue}` : '1'),
    supplementUnit: entry.supplement?.unit || SUPPLEMENT_UNITS[0],
    sleepDurationMinutes: entry.sleep?.durationMinutes ? `${entry.sleep.durationMinutes}` : '90',
    diaperKind: entry.diaper?.kind || 'wet',
    pumpMl: entry.pump?.amountMl ? `${entry.pump.amountMl}` : (entry.amountValue ? `${entry.amountValue}` : '120'),
    bathDurationMinutes: entry.bath?.durationMinutes ? `${entry.bath.durationMinutes}` : '20',
    playDurationMinutes: entry.play?.durationMinutes ? `${entry.play.durationMinutes}` : '30',
    swimDurationMinutes: entry.swim?.durationMinutes ? `${entry.swim.durationMinutes}` : '20',
    otherTitle: entry.title,
    otherCategoryLabel: entry.other?.categoryLabel || entry.title || '其他事件'
  }
}

function openComposer(mode: FeedingJournalType = entryMode.value, entry?: FeedingJournalEntry) {
  entryMode.value = mode
  showEntrySheet.value = true
  editingEntryId.value = entry?.id || ''

  if (entry) {
    pendingReminderIds.value = entry.sourceReminderIds ? [...entry.sourceReminderIds] : []
    fillForm(entry)
    return
  }

  resetForm(mode)
}

function closeComposer() {
  showEntrySheet.value = false
  editingEntryId.value = ''
  pendingReminderIds.value = []
}

function switchMode(mode: FeedingJournalType) {
  entryMode.value = mode
  if (!editingEntryId.value) {
    resetForm(mode)
  }
}

function toggleBreastQuickTag(tag: string) {
  form.value.breastQuickTags = toggleTag(form.value.breastQuickTags, tag)
}

function toggleFormulaTag(tag: string) {
  form.value.formulaTags = toggleTag(form.value.formulaTags, tag)
}

function toggleSolidReaction(tag: FeedingReactionTag) {
  form.value.solidReactions = toggleTag(form.value.solidReactions, tag) as FeedingReactionTag[]
}

function importFromTodayPlan() {
  if (!todayPlanTitles.value.length) {
    uni.showToast({ title: '今天还没有可导入食谱', icon: 'none' })
    return
  }

  uni.showActionSheet({
    itemList: todayPlanTitles.value,
    success: ({ tapIndex }) => {
      form.value.solidFoodName = todayPlanTitles.value[tapIndex]
    }
  })
}

function openRecordActions(entry: FeedingJournalEntry) {
  uni.showActionSheet({
    itemList: ['编辑记录', '删除记录'],
    itemColor: '#1D1B19',
    success: ({ tapIndex }) => {
      if (tapIndex === 0) {
        openComposer(entry.type, entry)
        return
      }

      void handleDeleteEntry(entry.id)
    }
  })
}

async function handleDeleteEntry(id: string) {
  const result = await uni.showModal({
    title: '删除记录',
    content: '删除后将无法恢复，确认删除这条记录吗？'
  })

  if (!result.confirm) {
    return
  }

  removeFeedingEntry(id)
  refreshPageData()
  uni.showToast({ title: '已删除', icon: 'success' })

  if (editingEntryId.value === id) {
    closeComposer()
  }
}

function buildSavePayload() {
  const common = {
    date: form.value.date,
    time: form.value.time,
    note: form.value.note.trim() || undefined,
    source: pendingReminderIds.value.length ? 'reminder' as const : 'manual' as const,
    sourceReminderIds: pendingReminderIds.value.length ? [...pendingReminderIds.value] : undefined
  }

  if (entryMode.value === 'breast') {
    const durationMinutes = toNumber(form.value.breastDurationMinutes)
    const milkMl = toNumber(form.value.breastMilkMl)

    return {
      ...common,
      type: 'breast' as const,
      title: '母乳',
      description: `母乳 ${BREAST_SIDE_OPTIONS.find((item) => item.key === form.value.breastSide)?.label || ''}${durationMinutes ? ` ${durationMinutes}分钟` : ''}`.trim(),
      amountValue: milkMl,
      amountUnit: 'ml',
      tags: form.value.breastQuickTags,
      breast: {
        side: form.value.breastSide,
        durationMinutes,
        estimatedMilkMl: milkMl,
        quickNotes: form.value.breastQuickTags.length ? [...form.value.breastQuickTags] : undefined
      }
    }
  }

  if (entryMode.value === 'formula') {
    const milkMl = toNumber(form.value.formulaMl)
    if (!milkMl) {
      throw new Error('请先输入奶量')
    }

    return {
      ...common,
      type: 'formula' as const,
      title: '配方奶',
      description: `${form.value.formulaBrand} 配方奶`,
      amountValue: milkMl,
      amountUnit: 'ml',
      tags: form.value.formulaTags,
      formula: {
        brand: form.value.formulaBrand,
        stage: form.value.formulaStage,
        temperature: form.value.formulaTemperature,
        tags: form.value.formulaTags.length ? [...form.value.formulaTags] : undefined
      }
    }
  }

  if (entryMode.value === 'bottle-breast') {
    const milkMl = toNumber(form.value.bottleBreastMl)
    if (!milkMl) {
      throw new Error('请先输入瓶喂母乳奶量')
    }

    return {
      ...common,
      type: 'bottle-breast' as const,
      title: '瓶喂母乳',
      description: `瓶喂母乳 ${milkMl}ml`,
      amountValue: milkMl,
      amountUnit: 'ml',
      bottleBreast: {
        amountMl: milkMl
      }
    }
  }

  if (entryMode.value === 'solid') {
    const foodName = form.value.solidFoodName.trim()
    if (!foodName) {
      throw new Error('请先输入辅食名称')
    }

    const intakeLabel = SOLID_INTAKE_OPTIONS.find((item) => item.key === form.value.solidIntake)?.label || '已记录'

    return {
      ...common,
      type: 'solid' as const,
      title: foodName,
      description: `${foodName} · ${intakeLabel}`,
      tags: form.value.solidReactions,
      solid: {
        foodName,
        intakeLevel: form.value.solidIntake,
        reactions: form.value.solidReactions.length ? [...form.value.solidReactions] : undefined
      }
    }
  }

  if (entryMode.value === 'water') {
    const waterMl = toNumber(form.value.waterMl)
    if (!waterMl) {
      throw new Error('请先输入饮水量')
    }

    return {
      ...common,
      type: 'water' as const,
      title: '饮水',
      description: `饮水 ${waterMl}ml`,
      amountValue: waterMl,
      amountUnit: 'ml',
      water: {
        amountMl: waterMl
      }
    }
  }

  if (entryMode.value === 'supplement') {
    const doseText = form.value.supplementDose.trim()
    if (!doseText) {
      throw new Error('请先输入剂量')
    }

    return {
      ...common,
      type: 'supplement' as const,
      title: form.value.supplementName,
      description: `${form.value.supplementName} ${doseText}${form.value.supplementUnit}`,
      amountUnit: form.value.supplementUnit,
      supplement: {
        name: form.value.supplementName,
        doseText,
        unit: form.value.supplementUnit
      }
    }
  }

  if (entryMode.value === 'sleep') {
    const duration = toNumber(form.value.sleepDurationMinutes)
    return {
      ...common,
      type: 'sleep' as const,
      title: '睡眠',
      description: duration ? `睡眠 ${duration}分钟` : '睡眠',
      sleep: {
        durationMinutes: duration
      }
    }
  }

  if (entryMode.value === 'diaper') {
    const label = DIAPER_OPTIONS.find((item) => item.key === form.value.diaperKind)?.label || '换尿布'
    return {
      ...common,
      type: 'diaper' as const,
      title: '换尿布',
      description: `换尿布 · ${label}`,
      diaper: {
        kind: form.value.diaperKind
      }
    }
  }

  if (entryMode.value === 'pump') {
    const pumpMl = toNumber(form.value.pumpMl)
    if (!pumpMl) {
      throw new Error('请先输入吸奶量')
    }

    return {
      ...common,
      type: 'pump' as const,
      title: '吸奶',
      description: `吸奶 ${pumpMl}ml`,
      amountValue: pumpMl,
      amountUnit: 'ml',
      pump: {
        amountMl: pumpMl
      }
    }
  }

  if (entryMode.value === 'bath') {
    const duration = toNumber(form.value.bathDurationMinutes)
    return {
      ...common,
      type: 'bath' as const,
      title: '洗澡',
      description: duration ? `洗澡 ${duration}分钟` : '洗澡',
      bath: {
        durationMinutes: duration
      }
    }
  }

  if (entryMode.value === 'play') {
    const duration = toNumber(form.value.playDurationMinutes)
    return {
      ...common,
      type: 'play' as const,
      title: '玩耍',
      description: duration ? `玩耍 ${duration}分钟` : '玩耍',
      play: {
        durationMinutes: duration
      }
    }
  }

  if (entryMode.value === 'swim') {
    const duration = toNumber(form.value.swimDurationMinutes)
    return {
      ...common,
      type: 'swim' as const,
      title: '游泳',
      description: duration ? `游泳 ${duration}分钟` : '游泳',
      swim: {
        durationMinutes: duration
      }
    }
  }

  const otherTitle = form.value.otherTitle.trim()
  if (!otherTitle) {
    throw new Error('请先输入事件标题')
  }

  return {
    ...common,
    type: 'other' as const,
    title: otherTitle,
    description: form.value.otherCategoryLabel.trim() || otherTitle,
    other: {
      categoryLabel: form.value.otherCategoryLabel.trim() || '其他事件'
    }
  }
}

async function saveRecord() {
  try {
    const isEditing = Boolean(editingEntryId.value)
    const payload = buildSavePayload()
    saveFeedingEntry(payload, editingEntryId.value || undefined)

    if (pendingReminderIds.value.length) {
      markReminderItemsDone(pendingReminderIds.value)
    }

    refreshPageData()
    closeComposer()
    uni.showToast({ title: isEditing ? '已更新' : '记录成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
  }
}

function openNewRecord() {
  openComposer(pendingEntryType.value)
}

function mapEntryType(value?: string): FeedingJournalType {
  if (value === 'supplement' || value === 'water' || value === 'formula' || value === 'breast' || value === 'solid' || value === 'sleep' || value === 'diaper' || value === 'pump' || value === 'bath' || value === 'play' || value === 'swim' || value === 'bottle-breast' || value === 'other') {
    return value
  }

  return 'solid'
}

function handleDateConfirm(value: string) {
  selectedDate.value = value
  showDatePicker.value = false
}

onLoad((options) => {
  if (typeof options?.date === 'string' && options.date) {
    selectedDate.value = options.date
  }

  if (options?.tab === 'week' || options?.tab === 'month' || options?.tab === 'all') {
    activeScope.value = options.tab
  }

  if (options?.tab === 'today') {
    activeScope.value = 'week'
  }

  if (typeof options?.type === 'string') {
    pendingEntryType.value = mapEntryType(options.type)
    shouldAutoOpenComposer.value = true
  }

  if (typeof options?.sourceReminderId === 'string' && options.sourceReminderId) {
    pendingReminderIds.value = [options.sourceReminderId]
    shouldAutoOpenComposer.value = true
  }
})

onShow(async () => {
  if (!ensureProtectedPageAccess()) {
    return
  }

  await loadTodayPlanTitles()
  refreshPageData()

  if (shouldAutoOpenComposer.value) {
    openComposer(pendingEntryType.value)
    shouldAutoOpenComposer.value = false
  }
})

onShareAppMessage(() => ({
  title: '生活记录：记录宝宝每天吃喝与日常事件',
  path: '/pages/record/index'
}))

onShareTimeline(() => ({
  title: '生活记录：记录宝宝每天吃喝与日常事件'
}))
</script>

<template>
  <view class="page-shell record-page">
    <AppNavBar title="生活记录" subtitle="按范围查看喂养与生活事件" :show-back="true" :silent-back-fallback="true" />

    <view class="query-card card">
      <view class="query-row">
        <view class="query-title-wrap" @tap="openFilterSheet">
          <text class="query-title">{{ displayQueryTitle }}</text>
          <text class="query-arrow">⌄</text>
        </view>
        <view class="query-actions">
          <view class="query-action" @tap="openFilterSheet">筛</view>
          <view class="query-action" @tap="showDatePicker = true">📅</view>
          <view class="query-action icon" @tap="toggleDisplayMode">{{ activeDisplayMode === 'timeline' ? '📊' : '🕘' }}</view>
        </view>
      </view>
      <view class="query-meta-row">
        <text class="query-meta">{{ displayScopeLabel }} · {{ anchorDateLabel }}</text>
        <text class="query-meta">{{ filterSummaryText }}</text>
      </view>
      <view class="scope-tabs">
        <view
          v-for="item in SCOPE_TABS"
          :key="item.key"
          class="scope-tab"
          :class="{ active: activeScope === item.key }"
          @tap="switchScope(item.key)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="summary-grid">
      <view class="summary-card card">
        <text class="summary-label">记录总数</text>
        <text class="summary-value">{{ rangeSummary.totalCount }}</text>
      </view>
      <view class="summary-card card">
        <text class="summary-label">奶量</text>
        <text class="summary-value">{{ rangeSummary.milkMl }}ml</text>
      </view>
      <view class="summary-card card">
        <text class="summary-label">辅食</text>
        <text class="summary-value">{{ rangeSummary.solidCount }}次</text>
      </view>
      <view class="summary-card card">
        <text class="summary-label">饮水</text>
        <text class="summary-value">{{ rangeSummary.waterMl }}ml</text>
      </view>
    </view>

    <view v-if="activeDisplayMode === 'timeline'" class="timeline-card card">
      <view class="section-head">
        <text class="section-title">{{ displayScopeLabel }}时间轴</text>
        <text class="section-meta">{{ rangeSummary.totalCount }} 条记录</text>
      </view>

      <view v-if="timelineGroups.length" class="group-list">
        <view v-for="group in timelineGroups" :key="group.date" class="day-group">
          <view class="day-group-head">
            <view>
              <text class="day-group-title">{{ group.label }}</text>
              <text v-if="group.ageLabel" class="day-group-age">{{ group.ageLabel }}</text>
            </view>
            <text class="day-group-summary">{{ group.totalCount }}条 · 奶量{{ group.summary.milkMl }}ml</text>
          </view>

          <view class="timeline-list">
            <view v-for="entry in group.entries" :key="entry.id" class="timeline-item">
              <view class="timeline-side">
                <view class="timeline-dot" :style="{ backgroundColor: entry.dotColor }" />
                <view class="timeline-line" />
              </view>
              <view class="timeline-main card">
                <view class="timeline-top">
                  <view class="timeline-title-row">
                    <text class="timeline-time">{{ entry.time }}</text>
                    <view class="timeline-type-chip" :style="{ backgroundColor: entry.softColor }">
                      <text class="timeline-type-icon">{{ entry.icon }}</text>
                      <text class="timeline-type-text">{{ entry.typeLabel }}</text>
                    </view>
                  </view>
                  <text class="timeline-more" @tap="openRecordActions(entry)">⋮</text>
                </view>
                <text class="timeline-desc">{{ entry.description }}</text>
                <text class="timeline-amount">{{ entry.amountLabel }}</text>
                <text v-if="entry.note" class="timeline-note">备注：{{ entry.note }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-record-state">
        <text class="empty-record-emoji">🗂</text>
        <text class="empty-record-title">当前范围还没有记录</text>
        <text class="empty-record-desc">点击右下角开始，先记下一条喂养或生活事件吧。</text>
      </view>
    </view>

    <view v-else-if="activeScope === 'week'" class="chart-card card">
      <view class="section-head">
        <text class="section-title">本周概览</text>
        <text class="section-meta">按天查看记录次数</text>
      </view>

      <view v-if="weekHasData" class="week-chart">
        <view v-for="day in weekBars" :key="day.date" class="week-bar-col">
          <text class="week-bar-value">{{ day.totalCount }}</text>
          <view class="week-bar-shell">
            <view class="week-bar total" :style="{ height: day.totalHeight }" />
          </view>
          <text class="week-bar-label">{{ day.label }}</text>
        </view>
      </view>

      <view v-else class="empty-chart-state">
        <text class="empty-chart-title">本周还没有趋势</text>
        <text class="empty-chart-desc">记录几笔后，这里会自动生成每周概览。</text>
      </view>
    </view>

    <view v-else class="chart-card card">
      <view class="section-head">
        <text class="section-title">{{ activeScope === 'month' ? '本月趋势' : '全部趋势' }}</text>
        <text class="section-meta">折线展示每日 / 每月记录次数</text>
      </view>

      <scroll-view v-if="trendHasData" scroll-x class="month-chart-scroll" show-scrollbar="false">
        <view class="month-chart" :style="{ width: trendChartWidth }">
          <view class="month-axis" />
          <view
            v-for="segment in trendSegments"
            :key="segment.key"
            class="chart-segment"
            :style="{
              left: `${segment.left}rpx`,
              top: `${segment.top}rpx`,
              width: `${segment.width}rpx`,
              background: segment.color,
              transform: `rotate(${segment.rotate}deg)`
            }"
          />
          <view v-for="point in trendChartPoints" :key="point.date" class="month-point-col" :style="{ left: `${point.x - 22}rpx` }">
            <text class="month-point-value">{{ point.totalCount }}</text>
            <view class="chart-point total" :style="{ top: `${point.y}rpx` }" />
            <text class="month-point-label">{{ point.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view v-else class="empty-chart-state">
        <text class="empty-chart-title">当前还没有趋势数据</text>
        <text class="empty-chart-desc">先记录几笔，折线图会自动生成变化趋势。</text>
      </view>
    </view>

    <view class="record-fab" @tap="openNewRecord">
      <text class="record-fab-icon">＋</text>
    </view>

    <DatePickerModal :show="showDatePicker" title="选择锚点日期" @close="showDatePicker = false" @confirm="handleDateConfirm" />

    <view v-if="showFilterSheet" class="filter-sheet-mask" @tap="closeFilterSheet">
      <view class="filter-sheet" @tap.stop>
        <view class="filter-sheet-handle" />
        <view class="filter-sheet-head">
          <text class="filter-sheet-title">{{ displayQueryTitle }}</text>
          <text class="filter-sheet-meta">请筛选记录项</text>
        </view>
        <view class="filter-grid">
          <view
            v-for="item in MODE_OPTIONS"
            :key="item.key"
            class="filter-chip"
            :class="{ active: draftTypes.includes(item.key) }"
            @tap="toggleFilterType(item.key)"
          >
            <text class="filter-chip-icon">{{ item.icon }}</text>
            <text class="filter-chip-text">{{ item.label }}</text>
          </view>
        </view>
        <view class="filter-sheet-footer">
          <view class="sheet-btn ghost" @tap="clearDraftFilters">不筛选</view>
          <view class="sheet-btn primary" @tap="applyFilters">确定</view>
        </view>
      </view>
    </view>

    <view v-if="showEntrySheet" class="entry-sheet-mask" @tap="closeComposer">
      <view class="entry-sheet" @tap.stop>
        <view class="entry-sheet-handle" />
        <text class="entry-sheet-title">{{ sheetTitle }}</text>

        <view class="entry-mode-grid">
          <view
            v-for="item in MODE_OPTIONS"
            :key="item.key"
            class="entry-mode-tab"
            :class="{ active: entryMode === item.key }"
            @tap="switchMode(item.key)"
          >
            <text class="entry-mode-icon">{{ item.icon }}</text>
            <text class="entry-mode-label">{{ item.label }}</text>
          </view>
        </view>

        <scroll-view scroll-y class="entry-sheet-body">
          <view class="field-row two-col">
            <picker class="field-col-picker" mode="date" :value="form.date" @change="form.date = $event.detail.value">
              <view class="field-card soft-card">
                <text class="field-label">记录日期</text>
                <text class="field-value">{{ form.date }}</text>
              </view>
            </picker>
            <picker class="field-col-picker" mode="time" :value="form.time" @change="form.time = $event.detail.value">
              <view class="field-card soft-card">
                <text class="field-label">记录时间</text>
                <text class="field-value">{{ form.time }}</text>
              </view>
            </picker>
          </view>

          <view v-if="entryMode === 'breast'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">母乳模式</text>
              <view class="chip-row side-row">
                <view
                  v-for="side in BREAST_SIDE_OPTIONS"
                  :key="side.key"
                  class="choice-chip"
                  :class="{ active: form.breastSide === side.key }"
                  @tap="form.breastSide = side.key"
                >
                  {{ side.label }}
                </view>
              </view>
              <view class="field-row two-col compact-gap">
                <view class="input-card soft-card">
                  <text class="field-label">时长（分钟）</text>
                  <input v-model="form.breastDurationMinutes" class="text-input" type="number" placeholder="如 15" />
                </view>
                <view class="input-card soft-card">
                  <text class="field-label">奶量估算（ml）</text>
                  <input v-model="form.breastMilkMl" class="text-input" type="number" placeholder="可选" />
                </view>
              </view>
              <view class="chip-row quick-tag-row">
                <view
                  v-for="tag in BREAST_QUICK_TAGS"
                  :key="tag"
                  class="tag-chip"
                  :class="{ active: form.breastQuickTags.includes(tag) }"
                  @tap="toggleBreastQuickTag(tag)"
                >
                  {{ tag }}
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'formula'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">配方奶模式</text>
              <view class="quick-amount-row">
                <view
                  v-for="amount in FORMULA_QUICK_AMOUNTS"
                  :key="amount"
                  class="amount-chip"
                  :class="{ active: form.formulaMl === `${amount}` }"
                  @tap="form.formulaMl = `${amount}`"
                >
                  {{ amount }}ml
                </view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">奶量（ml）</text>
                <input v-model="form.formulaMl" class="text-input" type="number" placeholder="请输入奶量" />
              </view>
              <view class="field-row two-col compact-gap">
                <picker class="field-col-picker" :range="FORMULA_BRANDS" :value="FORMULA_BRANDS.indexOf(form.formulaBrand)" @change="form.formulaBrand = FORMULA_BRANDS[$event.detail.value]">
                  <view class="field-card soft-card">
                    <text class="field-label">品牌</text>
                    <text class="field-value">{{ form.formulaBrand }}</text>
                  </view>
                </picker>
                <picker class="field-col-picker" :range="FORMULA_STAGES" :value="FORMULA_STAGES.indexOf(form.formulaStage)" @change="form.formulaStage = FORMULA_STAGES[$event.detail.value]">
                  <view class="field-card soft-card">
                    <text class="field-label">段位</text>
                    <text class="field-value">{{ form.formulaStage }}</text>
                  </view>
                </picker>
              </view>
              <view class="chip-row quick-tag-row">
                <view
                  v-for="temperature in FORMULA_TEMPERATURES"
                  :key="temperature"
                  class="choice-chip"
                  :class="{ active: form.formulaTemperature === temperature }"
                  @tap="form.formulaTemperature = temperature"
                >
                  {{ temperature }}
                </view>
              </view>
              <view class="chip-row quick-tag-row">
                <view
                  v-for="tag in FORMULA_TAG_OPTIONS"
                  :key="tag"
                  class="tag-chip"
                  :class="{ active: form.formulaTags.includes(tag) }"
                  @tap="toggleFormulaTag(tag)"
                >
                  {{ tag }}
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'bottle-breast'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">瓶喂母乳</text>
              <view class="input-card soft-card">
                <text class="field-label">奶量（ml）</text>
                <input v-model="form.bottleBreastMl" class="text-input" type="number" placeholder="请输入奶量" />
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'solid'" class="mode-panel">
            <view class="panel-card card">
              <view class="panel-row">
                <text class="panel-title">辅食模式</text>
                <view class="import-btn" @tap="importFromTodayPlan">从今日食谱导入</view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">辅食名称</text>
                <input v-model="form.solidFoodName" class="text-input" type="text" placeholder="如 南瓜米粉 / 鸡肉粥" />
              </view>
              <view class="chip-row intake-row">
                <view
                  v-for="item in SOLID_INTAKE_OPTIONS"
                  :key="item.key"
                  class="intake-chip"
                  :class="{ active: form.solidIntake === item.key }"
                  @tap="form.solidIntake = item.key"
                >
                  <text class="intake-emoji">{{ item.emoji }}</text>
                  <text>{{ item.label }}</text>
                </view>
              </view>
              <view class="chip-row quick-tag-row">
                <view
                  v-for="item in SOLID_REACTION_OPTIONS"
                  :key="item.key"
                  class="tag-chip danger"
                  :class="{ active: form.solidReactions.includes(item.key) }"
                  @tap="toggleSolidReaction(item.key)"
                >
                  {{ item.label }}
                </view>
                <view class="tag-chip" :class="{ active: form.solidReactions.length === 0 }" @tap="form.solidReactions = []">无</view>
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'water'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">饮水模式</text>
              <view class="quick-amount-row">
                <view
                  v-for="amount in WATER_QUICK_AMOUNTS"
                  :key="amount"
                  class="amount-chip"
                  :class="{ active: form.waterMl === `${amount}` }"
                  @tap="form.waterMl = `${amount}`"
                >
                  {{ amount }}ml
                </view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">饮水量（ml）</text>
                <input v-model="form.waterMl" class="text-input" type="number" placeholder="请输入饮水量" />
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'supplement'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">补剂模式</text>
              <view class="supplement-grid">
                <view
                  v-for="item in SUPPLEMENT_OPTIONS"
                  :key="item"
                  class="supplement-chip"
                  :class="{ active: form.supplementName === item }"
                  @tap="form.supplementName = item"
                >
                  {{ item }}
                </view>
              </view>
              <view class="field-row two-col compact-gap">
                <view class="input-card soft-card">
                  <text class="field-label">剂量</text>
                  <input v-model="form.supplementDose" class="text-input" type="number" placeholder="请输入剂量" />
                </view>
                <view class="input-card soft-card">
                  <text class="field-label">单位</text>
                  <view class="chip-row compact-chip-row">
                    <view
                      v-for="unit in SUPPLEMENT_UNITS"
                      :key="unit"
                      class="choice-chip compact"
                      :class="{ active: form.supplementUnit === unit }"
                      @tap="form.supplementUnit = unit"
                    >
                      {{ unit }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'sleep'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">睡眠记录</text>
              <view class="quick-amount-row">
                <view
                  v-for="amount in GENERIC_DURATION_OPTIONS"
                  :key="amount"
                  class="amount-chip"
                  :class="{ active: form.sleepDurationMinutes === `${amount}` }"
                  @tap="form.sleepDurationMinutes = `${amount}`"
                >
                  {{ amount }}分钟
                </view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">时长（分钟）</text>
                <input v-model="form.sleepDurationMinutes" class="text-input" type="number" placeholder="请输入时长" />
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'diaper'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">换尿布</text>
              <view class="chip-row quick-tag-row">
                <view
                  v-for="item in DIAPER_OPTIONS"
                  :key="item.key"
                  class="choice-chip"
                  :class="{ active: form.diaperKind === item.key }"
                  @tap="form.diaperKind = item.key"
                >
                  {{ item.label }}
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'pump'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">吸奶记录</text>
              <view class="input-card soft-card">
                <text class="field-label">吸奶量（ml）</text>
                <input v-model="form.pumpMl" class="text-input" type="number" placeholder="请输入吸奶量" />
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'bath'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">洗澡记录</text>
              <view class="quick-amount-row">
                <view
                  v-for="amount in GENERIC_DURATION_OPTIONS"
                  :key="amount"
                  class="amount-chip"
                  :class="{ active: form.bathDurationMinutes === `${amount}` }"
                  @tap="form.bathDurationMinutes = `${amount}`"
                >
                  {{ amount }}分钟
                </view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">时长（分钟）</text>
                <input v-model="form.bathDurationMinutes" class="text-input" type="number" placeholder="请输入时长" />
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'play'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">玩耍记录</text>
              <view class="quick-amount-row">
                <view
                  v-for="amount in GENERIC_DURATION_OPTIONS"
                  :key="amount"
                  class="amount-chip"
                  :class="{ active: form.playDurationMinutes === `${amount}` }"
                  @tap="form.playDurationMinutes = `${amount}`"
                >
                  {{ amount }}分钟
                </view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">时长（分钟）</text>
                <input v-model="form.playDurationMinutes" class="text-input" type="number" placeholder="请输入时长" />
              </view>
            </view>
          </view>

          <view v-else-if="entryMode === 'swim'" class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">游泳记录</text>
              <view class="quick-amount-row">
                <view
                  v-for="amount in GENERIC_DURATION_OPTIONS"
                  :key="amount"
                  class="amount-chip"
                  :class="{ active: form.swimDurationMinutes === `${amount}` }"
                  @tap="form.swimDurationMinutes = `${amount}`"
                >
                  {{ amount }}分钟
                </view>
              </view>
              <view class="input-card soft-card">
                <text class="field-label">时长（分钟）</text>
                <input v-model="form.swimDurationMinutes" class="text-input" type="number" placeholder="请输入时长" />
              </view>
            </view>
          </view>

          <view v-else class="mode-panel">
            <view class="panel-card card">
              <text class="panel-title">其他事件</text>
              <view class="input-card soft-card">
                <text class="field-label">事件标题</text>
                <input v-model="form.otherTitle" class="text-input" type="text" placeholder="如：外出散步 / 感冒咳嗽" />
              </view>
              <view class="input-card soft-card">
                <text class="field-label">事件分类名</text>
                <input v-model="form.otherCategoryLabel" class="text-input" type="text" placeholder="如：其他事件" />
              </view>
            </view>
          </view>

          <view class="input-card note-card soft-card">
            <text class="field-label">备注</text>
            <textarea v-model="form.note" class="note-input" maxlength="120" placeholder="可补充状态、说明或当天备注" />
          </view>
        </scroll-view>

        <view class="entry-sheet-footer">
          <view v-if="editingEntryId" class="footer-btn delete" @tap="handleDeleteEntry(editingEntryId)">删除</view>
          <view class="footer-btn ghost" @tap="closeComposer">取消</view>
          <view class="footer-btn primary" @tap="saveRecord">保存记录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.record-page {
  padding-bottom: 260rpx;
}

.query-card {
  margin-top: 18rpx;
  padding: 24rpx;
}

.query-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.query-title-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.query-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.query-arrow {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.query-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.query-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(247, 239, 230, 0.9);
  color: var(--mini-primary-deep);
  font-size: 24rpx;
  font-weight: 700;
}

.query-action.icon {
  font-size: 30rpx;
}

.query-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 16rpx;
}

.query-meta {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.scope-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 20rpx;
}

.scope-tab {
  height: 76rpx;
  border-radius: 999rpx;
  background: rgba(247, 239, 230, 0.7);
  color: var(--mini-text-muted);
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scope-tab.active {
  background: linear-gradient(135deg, var(--mini-secondary-deep), #48b06c);
  color: #fff;
  box-shadow: 0 12rpx 24rpx rgba(44, 105, 86, 0.18);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 20rpx;
}

.summary-card {
  padding: 24rpx;
}

.summary-label {
  display: block;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.summary-value {
  display: block;
  margin-top: 10rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.timeline-card,
.chart-card {
  margin-top: 20rpx;
  padding: 28rpx 24rpx 32rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.section-meta {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.group-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.day-group-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.day-group-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.day-group-age {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.day-group-summary {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.timeline-list {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.timeline-item {
  display: flex;
  gap: 14rpx;
}

.timeline-side {
  width: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 999rpx;
  margin-top: 18rpx;
}

.timeline-line {
  flex: 1;
  width: 2rpx;
  margin-top: 8rpx;
  background: rgba(107, 98, 91, 0.12);
}

.timeline-main {
  flex: 1;
  padding: 24rpx;
}

.timeline-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.timeline-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.timeline-time {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.timeline-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
}

.timeline-type-icon,
.timeline-type-text {
  font-size: 20rpx;
  color: var(--mini-text);
}

.timeline-more {
  font-size: 30rpx;
  color: var(--mini-text-muted);
}

.timeline-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--mini-text);
}

.timeline-amount {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-primary-deep);
}

.timeline-note {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
}

.empty-record-state,
.empty-chart-state {
  margin-top: 30rpx;
  padding: 36rpx 12rpx 12rpx;
  text-align: center;
}

.empty-record-emoji {
  display: block;
  font-size: 72rpx;
}

.empty-record-title,
.empty-chart-title {
  display: block;
  margin-top: 14rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.empty-record-desc,
.empty-chart-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.week-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14rpx;
  margin-top: 24rpx;
  min-height: 300rpx;
}

.week-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.week-bar-value {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.week-bar-shell {
  width: 52rpx;
  height: 190rpx;
  border-radius: 999rpx;
  background: rgba(223, 247, 241, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 8rpx;
  box-sizing: border-box;
}

.week-bar.total {
  width: 100%;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #66c793 0%, #2c6956 100%);
}

.week-bar-label {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.month-chart-scroll {
  margin-top: 22rpx;
  white-space: nowrap;
}

.month-chart {
  position: relative;
  height: 250rpx;
  padding: 18rpx 0 44rpx;
}

.month-axis {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 46rpx;
  height: 2rpx;
  background: rgba(107, 98, 91, 0.12);
}

.chart-segment {
  position: absolute;
  height: 4rpx;
  transform-origin: left center;
  border-radius: 999rpx;
}

.month-point-col {
  position: absolute;
  top: 0;
  width: 44rpx;
  text-align: center;
}

.month-point-value {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 6rpx;
  top: 18rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: var(--mini-text);
  white-space: nowrap;
}

.chart-point {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 18rpx;
  height: 18rpx;
  border-radius: 999rpx;
  box-shadow: 0 0 0 6rpx rgba(91, 167, 255, 0.12);
}

.chart-point.total {
  background: #5BA7FF;
}

.month-point-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 60rpx;
  font-size: 20rpx;
  color: var(--mini-text-muted);
}

.record-fab {
  position: fixed;
  right: 32rpx;
  bottom: 174rpx;
  z-index: calc(var(--mini-floating-z) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-secondary-deep), #48b06c);
  box-shadow: 0 16rpx 32rpx rgba(44, 105, 86, 0.22);
}

.record-fab-icon {
  color: #fff;
  font-size: 48rpx;
  line-height: 1;
}

.filter-sheet-mask,
.entry-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(31, 23, 18, 0.26);
  display: flex;
  align-items: flex-end;
}

.filter-sheet,
.entry-sheet {
  width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  background: #fffaf6;
  padding: 18rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.filter-sheet-handle,
.entry-sheet-handle {
  width: 88rpx;
  height: 8rpx;
  margin: 0 auto 18rpx;
  border-radius: 999rpx;
  background: rgba(107, 98, 91, 0.18);
}

.filter-sheet-head {
  text-align: center;
}

.filter-sheet-title,
.entry-sheet-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.filter-sheet-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 28rpx;
}

.filter-chip {
  min-height: 92rpx;
  padding: 12rpx;
  border-radius: 24rpx;
  background: rgba(247, 247, 247, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.filter-chip.active {
  background: rgba(255, 83, 149, 0.16);
  border: 2rpx solid rgba(255, 83, 149, 0.28);
}

.filter-chip-icon {
  font-size: 28rpx;
}

.filter-chip-text {
  font-size: 24rpx;
  color: var(--mini-text);
}

.filter-sheet-footer,
.entry-sheet-footer {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.sheet-btn,
.footer-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.sheet-btn.ghost,
.footer-btn.ghost {
  background: rgba(247, 239, 230, 0.92);
  color: var(--mini-text-muted);
}

.sheet-btn.primary,
.footer-btn.primary {
  background: linear-gradient(135deg, #ff5b92, #ff4b89);
  color: #fff;
}

.footer-btn.delete {
  background: rgba(255, 240, 240, 0.96);
  color: #ef6a5f;
}

.entry-mode-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 20rpx;
}

.entry-mode-tab {
  min-height: 88rpx;
  padding: 10rpx;
  border-radius: 22rpx;
  background: rgba(247, 239, 230, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.entry-mode-tab.active {
  background: rgba(255, 179, 102, 0.28);
  border: 2rpx solid rgba(255, 179, 102, 0.48);
}

.entry-mode-icon {
  font-size: 28rpx;
}

.entry-mode-label {
  font-size: 20rpx;
  color: var(--mini-text);
}

.entry-sheet-body {
  max-height: 860rpx;
  margin-top: 18rpx;
}

.field-row {
  display: flex;
  gap: 16rpx;
}

.field-row.two-col {
  align-items: stretch;
}

.field-col-picker,
.field-row.two-col .input-card {
  flex: 1;
  min-width: 0;
}

.compact-gap {
  margin-top: 16rpx;
}

.field-card,
.input-card,
.panel-card,
.note-card,
.hint-card,
.link-tip {
  padding: 22rpx;
}

.panel-card + .panel-card,
.mode-panel + .mode-panel {
  margin-top: 16rpx;
}

.panel-title,
.field-label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.field-value {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.text-input {
  width: 100%;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--mini-text);
}

.chip-row,
.quick-amount-row,
.supplement-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.choice-chip,
.tag-chip,
.amount-chip,
.supplement-chip,
.intake-chip {
  min-height: 64rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(247, 239, 230, 0.92);
  color: var(--mini-text-muted);
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.choice-chip.active,
.tag-chip.active,
.amount-chip.active,
.supplement-chip.active,
.intake-chip.active {
  background: linear-gradient(135deg, var(--mini-secondary-deep), #48b06c);
  color: #fff;
}

.tag-chip.danger.active {
  background: linear-gradient(135deg, #ef6a5f, #f48d83);
}

.choice-chip.compact {
  min-width: 68rpx;
  padding: 0 14rpx;
}

.compact-chip-row {
  margin-top: 12rpx;
}

.intake-chip {
  min-width: 140rpx;
}

.intake-emoji {
  font-size: 24rpx;
}

.panel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.import-btn {
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.24);
  color: var(--mini-primary-deep);
  font-size: 22rpx;
  font-weight: 700;
}

.note-input {
  width: 100%;
  min-height: 112rpx;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--mini-text);
}
</style>
