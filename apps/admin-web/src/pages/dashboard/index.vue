<script setup lang="ts">
import { computed, onActivated, onMounted, onUnmounted, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import type { DashboardMetric, DashboardTrendPoint, ReviewQueueItem } from '@baby-food/shared-types'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { getDashboardFeedbackTrend, getDashboardOverview } from '@/services/api'

type DashboardTrendRange = 'week' | 'month' | 'year' | 'all'

type LineTrendPoint = DashboardTrendPoint & {
  x: number
  y: number
}

type TrendPanelConfig = {
  averageDayLabel: string
  averageMonthLabel: string
  averageRangeLabel: string
  descriptionMap: Record<DashboardTrendRange, string>
  totalLabel: string
}

const router = useRouter()
const dashboardMetrics = ref<DashboardMetric[]>([])
const reviewQueue = ref<ReviewQueueItem[]>([])
const userTrend = ref<DashboardTrendPoint[]>([])
const feedbackTrend = ref<DashboardTrendPoint[]>([])
const selectedUserTrendRange = ref<DashboardTrendRange>('week')
const selectedFeedbackTrendRange = ref<DashboardTrendRange>('week')

const metricRouteMap: Record<string, { path: string; query?: Record<string, string> }> = {
  users: { path: '/users' },
  recipes: { path: '/recipes/list' },
  pending: { path: '/reviews' },
  published: { path: '/recipes/list', query: { contentStatus: 'published' } },
  knowledgePublished: { path: '/knowledge/list', query: { contentStatus: 'published' } },
  feedback: { path: '/feedback' }
}

const trendRangeOptions: Array<{ label: string; value: DashboardTrendRange }> = [
  { label: '近一周', value: 'week' },
  { label: '近一月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '全部', value: 'all' }
]

const lineChartPadding = {
  top: 30,
  right: 24,
  bottom: 34,
  left: 24
}
const lineChartInnerHeight = 172

const overviewRefreshState = {
  isRefreshing: false,
  lastRefreshAt: 0,
  latestRequestId: 0
}
const feedbackRefreshState = {
  isRefreshing: false,
  lastRefreshAt: 0,
  latestRequestId: 0
}

function openRoute(path: string, query?: Record<string, string>) {
  router.push({ path, query })
}

function openMetric(metricKey: string) {
  const target = metricRouteMap[metricKey]
  if (!target) {
    return
  }

  openRoute(target.path, target.query)
}

async function loadDashboard(force = false) {
  const now = Date.now()
  if (!force && (overviewRefreshState.isRefreshing || now - overviewRefreshState.lastRefreshAt < 1000)) {
    return
  }

  const requestId = ++overviewRefreshState.latestRequestId
  overviewRefreshState.isRefreshing = true
  overviewRefreshState.lastRefreshAt = now

  try {
    const data = await getDashboardOverview(selectedUserTrendRange.value)
    if (requestId !== overviewRefreshState.latestRequestId) {
      return
    }

    dashboardMetrics.value = data.metrics
    reviewQueue.value = data.reviewQueue
    userTrend.value = data.userTrend
  } finally {
    if (requestId === overviewRefreshState.latestRequestId) {
      overviewRefreshState.isRefreshing = false
    }
  }
}

async function loadFeedbackTrend(force = false) {
  const now = Date.now()
  if (!force && (feedbackRefreshState.isRefreshing || now - feedbackRefreshState.lastRefreshAt < 1000)) {
    return
  }

  const requestId = ++feedbackRefreshState.latestRequestId
  feedbackRefreshState.isRefreshing = true
  feedbackRefreshState.lastRefreshAt = now

  try {
    const data = await getDashboardFeedbackTrend(selectedFeedbackTrendRange.value)
    if (requestId !== feedbackRefreshState.latestRequestId) {
      return
    }

    feedbackTrend.value = data
  } finally {
    if (requestId === feedbackRefreshState.latestRequestId) {
      feedbackRefreshState.isRefreshing = false
    }
  }
}

function refreshTrendPanels(force = false) {
  void loadDashboard(force)
  void loadFeedbackTrend(force)
}

function changeUserTrendRange(range: DashboardTrendRange) {
  if (range === selectedUserTrendRange.value) {
    return
  }

  selectedUserTrendRange.value = range
  void loadDashboard(true)
}

function changeFeedbackTrendRange(range: DashboardTrendRange) {
  if (range === selectedFeedbackTrendRange.value) {
    return
  }

  selectedFeedbackTrendRange.value = range
  void loadFeedbackTrend(true)
}

function handleWindowFocus() {
  refreshTrendPanels()
}

function handleVisibilityChange() {
  if (document.visibilityState !== 'visible') {
    return
  }

  refreshTrendPanels()
}

function createTrendPanelState(
  points: Ref<DashboardTrendPoint[]>,
  selectedRange: Ref<DashboardTrendRange>,
  config: TrendPanelConfig
) {
  const description = computed(() => config.descriptionMap[selectedRange.value])
  const maxValue = computed(() => Math.max(...points.value.map((item) => item.value), 1))
  const total = computed(() => points.value.reduce((sum, item) => sum + item.value, 0))
  const peakPoint = computed(() => points.value.reduce<DashboardTrendPoint | null>((peak, item) => {
    if (!peak || item.value > peak.value) {
      return item
    }
    return peak
  }, null))
  const average = computed(() => {
    if (!points.value.length) {
      return '0'
    }

    const averageValue = total.value / points.value.length
    return averageValue >= 10 ? averageValue.toFixed(1) : averageValue.toFixed(2)
  })
  const averageLabel = computed(() => {
    if (selectedRange.value === 'week' || selectedRange.value === 'month') {
      return config.averageDayLabel
    }
    if (selectedRange.value === 'year') {
      return config.averageMonthLabel
    }
    return config.averageRangeLabel
  })
  const summaryCards = computed(() => [
    {
      label: config.totalLabel,
      value: String(total.value),
      note: selectedRange.value === 'all' ? '当前统计范围内' : '当前周期内'
    },
    {
      label: '峰值节点',
      value: String(peakPoint.value?.value ?? 0),
      note: peakPoint.value?.label ?? '暂无数据'
    },
    {
      label: averageLabel.value,
      value: average.value,
      note: selectedRange.value === 'all' ? '长期趋势参考' : '节奏观察参考'
    }
  ])
  const lineChartHeight = computed(() => lineChartPadding.top + lineChartInnerHeight + lineChartPadding.bottom)
  const lineChartBaseY = computed(() => lineChartHeight.value - lineChartPadding.bottom)
  const lineGridLines = computed(() => [0, 0.33, 0.66, 1].map((ratio) => lineChartPadding.top + lineChartInnerHeight * ratio))
  const gapWeights = computed(() => {
    if (points.value.length < 2) {
      return []
    }

    return points.value.slice(1).map((point, index) => {
      const previousPoint = points.value[index]

      if (selectedRange.value === 'month') {
        if (!previousPoint.value && !point.value) {
          return 0.34
        }
        if (!previousPoint.value || !point.value) {
          return 0.62
        }
        return 1
      }

      if (selectedRange.value === 'all') {
        if (!previousPoint.value && !point.value) {
          return 0.72
        }
      }

      return 1
    })
  })
  const lineChartWidth = computed(() => {
    if (points.value.length <= 1) {
      return 560
    }

    const baseGapMap: Record<DashboardTrendRange, number> = {
      week: 78,
      month: 32,
      year: 64,
      all: 68
    }
    const minWidthMap: Record<DashboardTrendRange, number> = {
      week: 560,
      month: 640,
      year: 720,
      all: 760
    }
    const totalGapWeight = gapWeights.value.reduce((sum, weight) => sum + weight, 0)
    return Math.max(
      minWidthMap[selectedRange.value],
      Math.round(lineChartPadding.left + lineChartPadding.right + totalGapWeight * baseGapMap[selectedRange.value])
    )
  })
  const lineTrendPoints = computed<LineTrendPoint[]>(() => {
    if (!points.value.length) {
      return []
    }

    if (points.value.length === 1) {
      return points.value.map((point) => ({
        ...point,
        x: lineChartWidth.value / 2,
        y: lineChartPadding.top + (1 - point.value / maxValue.value) * lineChartInnerHeight
      }))
    }

    const usableWidth = Math.max(lineChartWidth.value - lineChartPadding.left - lineChartPadding.right, 1)
    const totalGapWeight = gapWeights.value.reduce((sum, weight) => sum + weight, 0) || 1
    let accumulatedWeight = 0

    return points.value.map((point, index) => {
      const x = lineChartPadding.left + usableWidth * (index === 0 ? 0 : accumulatedWeight / totalGapWeight)
      if (index < gapWeights.value.length) {
        accumulatedWeight += gapWeights.value[index]
      }

      return {
        ...point,
        x,
        y: lineChartPadding.top + (1 - point.value / maxValue.value) * lineChartInnerHeight
      }
    })
  })
  const linePath = computed(() => {
    if (!lineTrendPoints.value.length) {
      return ''
    }

    return lineTrendPoints.value
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')
  })
  const lineAreaPath = computed(() => {
    if (!lineTrendPoints.value.length) {
      return ''
    }

    const firstPoint = lineTrendPoints.value[0]
    const lastPoint = lineTrendPoints.value[lineTrendPoints.value.length - 1]
    return `${linePath.value} L ${lastPoint.x} ${lineChartBaseY.value} L ${firstPoint.x} ${lineChartBaseY.value} Z`
  })

  function shouldShowAxisLabel(index: number, point: DashboardTrendPoint) {
    const lastIndex = points.value.length - 1

    if (selectedRange.value === 'week' || selectedRange.value === 'year') {
      return true
    }

    if (selectedRange.value === 'month') {
      return index === 0 || index === lastIndex || point.value > 0 || index % 5 === 0
    }

    if (points.value.length <= 12) {
      return true
    }

    const step = Math.max(1, Math.ceil(points.value.length / 6))
    return index === 0 || index === lastIndex || index % step === 0
  }

  return {
    description,
    lineAreaPath,
    lineChartBaseY,
    lineChartHeight,
    lineChartWidth,
    lineGridLines,
    linePath,
    lineTrendPoints,
    summaryCards,
    shouldShowAxisLabel
  }
}

const {
  description: userTrendDescription,
  lineAreaPath: userTrendAreaPath,
  lineChartBaseY: userTrendBaseY,
  lineChartHeight: userTrendChartHeight,
  lineChartWidth: userTrendChartWidth,
  lineGridLines: userTrendGridLines,
  linePath: userTrendPath,
  lineTrendPoints: userTrendPoints,
  summaryCards: userTrendSummaryCards,
  shouldShowAxisLabel: shouldShowUserTrendAxisLabel
} = createTrendPanelState(userTrend, selectedUserTrendRange, {
  totalLabel: '累计新增',
  averageDayLabel: '日均新增',
  averageMonthLabel: '月均新增',
  averageRangeLabel: '区间均值',
  descriptionMap: {
    week: '近 7 日新增用户趋势，适合快速查看最近波动。',
    month: '近 30 日新增用户趋势，适合观察阶段性增长变化。',
    year: '本年新增用户趋势，适合查看年度增长节奏。',
    all: '全部历史新增用户趋势，适合复盘长期增长轨迹。'
  }
})

const {
  description: feedbackTrendDescription,
  lineAreaPath: feedbackTrendAreaPath,
  lineChartBaseY: feedbackTrendBaseY,
  lineChartHeight: feedbackTrendChartHeight,
  lineChartWidth: feedbackTrendChartWidth,
  lineGridLines: feedbackTrendGridLines,
  linePath: feedbackTrendPath,
  lineTrendPoints: feedbackTrendPoints,
  summaryCards: feedbackTrendSummaryCards,
  shouldShowAxisLabel: shouldShowFeedbackTrendAxisLabel
} = createTrendPanelState(feedbackTrend, selectedFeedbackTrendRange, {
  totalLabel: '累计反馈',
  averageDayLabel: '日均反馈',
  averageMonthLabel: '月均反馈',
  averageRangeLabel: '区间均值',
  descriptionMap: {
    week: '近 7 日用户反馈趋势，适合判断近期问题波动。',
    month: '近 30 日用户反馈趋势，适合观察集中反馈周期。',
    year: '本年用户反馈趋势，适合查看年度反馈节奏。',
    all: '全部历史用户反馈趋势，适合复盘长期反馈走势。'
  }
})

onMounted(() => {
  refreshTrendPanels(true)
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onActivated(() => {
  refreshTrendPanels()
})

onUnmounted(() => {
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="grid-gap-20">
    <section style="display:grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap:16px;">
      <button
        v-for="metric in dashboardMetrics"
        :key="metric.key"
        type="button"
        @click="openMetric(metric.key)"
        style="display:block; width:100%; padding:0; border:0; background:transparent; text-align:left; cursor:pointer;"
      >
        <KpiCard :label="metric.label" :value="metric.value" :trend="metric.trend" :accent="metric.accent" />
      </button>
    </section>

    <section style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:20px; align-items:start;">
      <div class="grid-gap-20">
        <div class="panel trend-panel">
          <div class="trend-panel-header">
            <div>
              <div class="panel-title" style="font-size:24px;">用户增长趋势</div>
              <div class="trend-panel-subtitle">{{ userTrendDescription }}</div>
            </div>
            <div class="trend-range-tabs">
              <button
                v-for="option in trendRangeOptions"
                :key="`user-${option.value}`"
                type="button"
                class="trend-range-btn"
                :class="{ active: selectedUserTrendRange === option.value }"
                @click="changeUserTrendRange(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="trend-summary-grid">
            <div v-for="card in userTrendSummaryCards" :key="card.label" class="trend-summary-card">
              <div class="trend-summary-label">{{ card.label }}</div>
              <div class="trend-summary-value">{{ card.value }}</div>
              <div class="trend-summary-note">{{ card.note }}</div>
            </div>
          </div>

          <div class="trend-chart-shell">
            <div class="trend-line-scroll">
              <svg
                class="trend-line-svg"
                :viewBox="`0 0 ${userTrendChartWidth} ${userTrendChartHeight}`"
                :style="{ minWidth: `${userTrendChartWidth}px`, height: `${userTrendChartHeight}px` }"
                role="img"
                aria-label="用户增长趋势折线图"
              >
                <defs>
                  <linearGradient id="userTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(0,93,170,0.22)" />
                    <stop offset="100%" stop-color="rgba(0,93,170,0.02)" />
                  </linearGradient>
                  <linearGradient id="userTrendLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#005daa" />
                    <stop offset="100%" stop-color="#4f89d4" />
                  </linearGradient>
                </defs>

                <line
                  v-for="gridY in userTrendGridLines"
                  :key="`user-grid-${gridY}`"
                  :x1="lineChartPadding.left"
                  :x2="userTrendChartWidth - lineChartPadding.right"
                  :y1="gridY"
                  :y2="gridY"
                  class="trend-line-grid"
                />

                <path v-if="userTrendAreaPath" :d="userTrendAreaPath" fill="url(#userTrendAreaGradient)" />
                <path v-if="userTrendPath" :d="userTrendPath" class="trend-line-path user-line" />

                <g v-for="(point, index) in userTrendPoints" :key="`user-point-${point.label}-${index}`">
                  <circle :cx="point.x" :cy="point.y" r="4.5" class="trend-line-point user-point" />
                  <text v-if="point.value" :x="point.x" :y="point.y - 12" class="trend-line-value user-value">{{ point.value }}</text>
                  <text
                    v-if="shouldShowUserTrendAxisLabel(index, point)"
                    :x="point.x"
                    :y="userTrendChartHeight - 8"
                    class="trend-line-label"
                  >{{ point.label }}</text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div class="panel trend-panel trend-panel-feedback">
          <div class="trend-panel-header">
            <div>
              <div class="panel-title" style="font-size:24px;">用户反馈趋势</div>
              <div class="trend-panel-subtitle">{{ feedbackTrendDescription }}</div>
            </div>
            <div class="trend-range-tabs">
              <button
                v-for="option in trendRangeOptions"
                :key="`feedback-${option.value}`"
                type="button"
                class="trend-range-btn"
                :class="{ active: selectedFeedbackTrendRange === option.value }"
                @click="changeFeedbackTrendRange(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="trend-summary-grid">
            <div v-for="card in feedbackTrendSummaryCards" :key="card.label" class="trend-summary-card">
              <div class="trend-summary-label">{{ card.label }}</div>
              <div class="trend-summary-value">{{ card.value }}</div>
              <div class="trend-summary-note">{{ card.note }}</div>
            </div>
          </div>

          <div class="trend-chart-shell feedback-shell">
            <div class="trend-line-scroll">
              <svg
                class="trend-line-svg"
                :viewBox="`0 0 ${feedbackTrendChartWidth} ${feedbackTrendChartHeight}`"
                :style="{ minWidth: `${feedbackTrendChartWidth}px`, height: `${feedbackTrendChartHeight}px` }"
                role="img"
                aria-label="用户反馈趋势折线图"
              >
                <defs>
                  <linearGradient id="feedbackTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(223,105,58,0.24)" />
                    <stop offset="100%" stop-color="rgba(223,105,58,0.03)" />
                  </linearGradient>
                  <linearGradient id="feedbackTrendLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#d25f2d" />
                    <stop offset="100%" stop-color="#ef9b61" />
                  </linearGradient>
                </defs>

                <line
                  v-for="gridY in feedbackTrendGridLines"
                  :key="`feedback-grid-${gridY}`"
                  :x1="lineChartPadding.left"
                  :x2="feedbackTrendChartWidth - lineChartPadding.right"
                  :y1="gridY"
                  :y2="gridY"
                  class="trend-line-grid"
                />

                <path v-if="feedbackTrendAreaPath" :d="feedbackTrendAreaPath" fill="url(#feedbackTrendAreaGradient)" />
                <path v-if="feedbackTrendPath" :d="feedbackTrendPath" class="trend-line-path feedback-line" />

                <g v-for="(point, index) in feedbackTrendPoints" :key="`feedback-point-${point.label}-${index}`">
                  <circle :cx="point.x" :cy="point.y" r="4.5" class="trend-line-point feedback-point" />
                  <text v-if="point.value" :x="point.x" :y="point.y - 12" class="trend-line-value feedback-value">{{ point.value }}</text>
                  <text
                    v-if="shouldShowFeedbackTrendAxisLabel(index, point)"
                    :x="point.x"
                    :y="feedbackTrendChartHeight - 8"
                    class="trend-line-label"
                  >{{ point.label }}</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-gap-20">
        <div class="panel">
          <div class="panel-title" style="font-size:24px;">快捷入口</div>
          <div class="grid-gap-16" style="margin-top:18px; grid-template-columns: repeat(2, minmax(0, 1fr)); display:grid;">
            <button class="ghost-btn" @click="openRoute('/reviews')">审核待处理</button>
            <button class="ghost-btn" @click="openRoute('/imports')">批量导入</button>
            <button class="ghost-btn" @click="openRoute('/feedback')">用户反馈</button>
            <button class="ghost-btn" @click="openRoute('/imports')">导出报表</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title" style="font-size:24px;">最新审核队列</div>
          <div class="table-shell" style="margin-top: 18px;">
            <div v-for="item in reviewQueue" :key="item.id" class="table-row" style="grid-template-columns: 1fr 140px;">
              <div>
                <div style="font-weight:700;">{{ item.title }}</div>
                <div style="margin-top:6px; font-size:13px; color:var(--admin-text-muted);">{{ item.source }} · {{ item.submittedBy }} · {{ item.submittedAt }}</div>
              </div>
              <div style="font-size:13px; color:var(--admin-primary); justify-self:end;">{{ item.focus }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.trend-panel {
  background: linear-gradient(180deg, rgba(0, 93, 170, 0.03), #fff 34%);
}

.trend-panel-feedback {
  background: linear-gradient(180deg, rgba(223, 105, 58, 0.04), #fff 36%);
}

.trend-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.trend-panel-subtitle {
  margin-top: 6px;
  color: var(--admin-text-muted);
}

.trend-range-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.trend-range-btn {
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: var(--admin-surface-lowest);
  color: var(--admin-text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.trend-range-btn.active {
  background: rgba(0, 93, 170, 0.12);
  color: var(--admin-primary);
  box-shadow: inset 0 0 0 1px rgba(0, 93, 170, 0.12);
}

.trend-summary-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.trend-summary-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--admin-surface-lowest);
}

.trend-summary-label {
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--admin-text-muted);
}

.trend-summary-value {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: var(--admin-text);
}

.trend-summary-note {
  margin-top: 8px;
  font-size: 12px;
  color: var(--admin-text-muted);
}

.trend-chart-shell {
  margin-top: 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,248,252,0.96));
  padding: 18px 18px 14px;
}

.feedback-shell {
  background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(252,246,242,0.98));
}

.trend-line-scroll {
  overflow-x: auto;
  padding-bottom: 6px;
}

.trend-line-svg {
  display: block;
}

.trend-line-grid {
  stroke: rgba(0, 93, 170, 0.08);
  stroke-width: 1;
}

.trend-line-path {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-line-path.user-line {
  stroke: url(#userTrendLineGradient);
}

.trend-line-path.feedback-line {
  stroke: url(#feedbackTrendLineGradient);
}

.trend-line-point {
  fill: #ffffff;
  stroke-width: 2;
}

.trend-line-point.user-point {
  stroke: #005daa;
}

.trend-line-point.feedback-point {
  stroke: #d25f2d;
}

.trend-line-value {
  font-size: 11px;
  font-weight: 700;
  text-anchor: middle;
}

.trend-line-value.user-value {
  fill: #005daa;
}

.trend-line-value.feedback-value {
  fill: #d25f2d;
}

.trend-line-label {
  fill: #7d8797;
  font-size: 11px;
  text-anchor: middle;
}
</style>
