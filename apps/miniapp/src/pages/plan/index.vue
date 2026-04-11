<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { DailyMealPlan, HistoryMealPlan, WeeklyMealPlanDay } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import MealTimeline from '@/components/meal/MealTimeline.vue'
import { ensureProtectedPageAccess, getPlanPageData, openProtectedPage } from '@/services/api'

const activeTab = ref<'today' | 'week' | 'history'>('today')
const todayPlan = ref<DailyMealPlan>()
const history = ref<HistoryMealPlan[]>([])
const weeklyPlans = ref<WeeklyMealPlanDay[]>([])
const loading = ref(false)

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function loadPlanPage() {
  if (!ensureProtectedPageAccess()) {
    return
  }

  loading.value = true

  try {
    const data = await getPlanPageData()
    todayPlan.value = data.todayMealPlan
    history.value = data.historyMealPlans
    weeklyPlans.value = data.weeklyPlanDays
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '计划加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 月历当前年月
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth()) // 0-indexed

// 点击日期展开详情
const expandedDate = ref<string | null>(null)

onMounted(loadPlanPage)
onShow(loadPlanPage)

// 历史计划按 planDate 建立 Map，方便月历查找
const historyMap = computed(() => {
  const map = new Map<string, HistoryMealPlan>()
  for (const item of history.value) {
    if (item.planDate) {
      map.set(item.planDate, item)
    }
  }
  return map
})

// 月历格子：当月所有日期（前补空格对齐周一）
const calendarCells = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1)
  // 周一=0, 周二=1 ... 周日=6
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<{ dateKey: string; day: number; plan: HistoryMealPlan | null } | null> = []

  for (let i = 0; i < startOffset; i++) {
    cells.push(null)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      dateKey,
      day: d,
      plan: historyMap.value.get(dateKey) ?? null
    })
  }

  return cells
})

const calendarMonthLabel = computed(() => {
  return `${calendarYear.value}年${calendarMonth.value + 1}月`
})

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
  expandedDate.value = null
}

function nextMonth() {
  const now = new Date()
  if (calendarYear.value > now.getFullYear() || (calendarYear.value === now.getFullYear() && calendarMonth.value >= now.getMonth())) {
    return // 不允许翻到未来月份
  }
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
  expandedDate.value = null
}

function tapCalendarCell(cell: { dateKey: string; plan: HistoryMealPlan | null }) {
  if (!cell.plan) {
    // 点击无计划的日期 → 跳转到新建计划
    goNewPlanForDate(cell.dateKey)
    return
  }
  expandedDate.value = expandedDate.value === cell.dateKey ? null : cell.dateKey
}

const expandedPlan = computed(() => {
  if (!expandedDate.value) return null
  return historyMap.value.get(expandedDate.value) ?? null
})

const tabLabel = computed(() => {
  if (activeTab.value === 'today') return '今日计划'
  if (activeTab.value === 'week') return '本周安排'
  return '历史记录'
})

function goGeneratePage() {
  openProtectedPage('/pages/generate/index')
}

function goPlanDetail(planId: string) {
  uni.navigateTo({ url: `/pages/plan-detail/index?id=${planId}` })
}

function goEditPlan(planId: string, planDate: string) {
  uni.navigateTo({ url: `/pages/plan-edit/index?id=${planId}&date=${planDate}` })
}

function goNewPlanForDate(date: string) {
  uni.navigateTo({ url: `/pages/plan-edit/index?date=${date}` })
}

function goWeeklyPlan(plan: WeeklyMealPlanDay) {
  if (!plan.isRecommended) {
    goPlanDetail(plan.id)
    return
  }

  const firstRecipeId = plan.recipeIds[0]
  if (firstRecipeId) {
    uni.navigateTo({ url: `/pages/recipe-detail/index?id=${firstRecipeId}` })
  } else {
    goGeneratePage()
  }
}

const isCurrentMonth = computed(() => {
  const now = new Date()
  return calendarYear.value === now.getFullYear() && calendarMonth.value === now.getMonth()
})

const todayKey = getLocalDateKey()
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="我的辅食计划" subtitle="今日 / 本周 / 历史 一键管理" />

    <view class="tab-switcher soft-card">
      <view class="tab-chip" :class="{ active: activeTab === 'today' }" @tap="activeTab = 'today'">今日</view>
      <view class="tab-chip" :class="{ active: activeTab === 'week' }" @tap="activeTab = 'week'">本周</view>
      <view class="tab-chip" :class="{ active: activeTab === 'history' }" @tap="activeTab = 'history'">历史</view>
    </view>

    <view class="hero-panel card" v-if="todayPlan">
      <view>
        <text class="hero-kicker">{{ tabLabel }}</text>
        <text class="hero-date">{{ activeTab === 'week' ? '本周 7 天安排' : activeTab === 'history' ? calendarMonthLabel : todayPlan.dateLabel }}</text>
      </view>
      <view class="hero-badge">{{ activeTab === 'week' ? '可提前查看' : activeTab === 'history' ? `${history.length} 条记录` : '已生成计划' }}</view>
    </view>

    <!-- 今日 Tab -->
    <view v-if="activeTab === 'today' && todayPlan">
      <view class="plan-action-row">
        <view class="plan-edit-btn" @tap="goEditPlan(todayPlan.id, todayPlan.planDate)">✏️ 编辑今日计划</view>
      </view>
      <MealTimeline :plan="todayPlan" @swap="goGeneratePage" />
    </view>

    <!-- 本周 Tab -->
    <view v-if="activeTab === 'week'" class="week-grid">
      <view v-for="plan in weeklyPlans" :key="plan.id" class="week-card card">
        <view class="week-head" @tap="goWeeklyPlan(plan)">
          <view>
            <text class="week-day">{{ plan.dayLabel }}</text>
            <text class="week-date">{{ plan.dateLabel }}</text>
          </view>
          <view class="week-side">
            <text class="week-tag" :class="{ recommend: plan.isRecommended }">{{ plan.tagLabel }}</text>
            <text class="week-rate">{{ plan.completionRate }}%</text>
          </view>
        </view>
        <text class="week-summary" @tap="goWeeklyPlan(plan)">{{ plan.summary }}</text>
        <text class="week-meta" @tap="goWeeklyPlan(plan)">{{ plan.recipeTitles.join(' · ') }}</text>
        <view class="week-edit-row">
          <view
            v-if="plan.isRecommended"
            class="week-edit-btn outline"
            @tap="goNewPlanForDate(plan.planDate)"
          >+ 新建当日计划</view>
          <view
            v-else
            class="week-edit-btn"
            @tap="goEditPlan(plan.id, plan.planDate)"
          >✏️ 编辑当日计划</view>
        </view>
      </view>
    </view>

    <!-- 历史 Tab — 月历视图 -->
    <view v-if="activeTab === 'history'" class="calendar-wrap">
      <!-- 月份导航 -->
      <view class="cal-nav">
        <view class="cal-nav-btn" @tap="prevMonth">‹</view>
        <text class="cal-nav-title">{{ calendarMonthLabel }}</text>
        <view class="cal-nav-btn" :class="{ disabled: isCurrentMonth }" @tap="nextMonth">›</view>
      </view>

      <!-- 星期表头 -->
      <view class="cal-header">
        <text v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="cal-weekday">{{ d }}</text>
      </view>

      <!-- 日期格子 -->
      <view class="cal-grid">
        <view
          v-for="(cell, index) in calendarCells"
          :key="index"
          class="cal-cell"
          :class="{
            empty: !cell,
            'has-plan': cell?.plan,
            'no-plan': cell && !cell.plan,
            today: cell?.dateKey === todayKey,
            expanded: cell?.dateKey === expandedDate
          }"
          @tap="cell ? tapCalendarCell(cell) : null"
        >
          <template v-if="cell">
            <text class="cal-day">{{ cell.day }}</text>
            <view v-if="cell.plan" class="cal-food-tag">
              <text class="cal-food-emoji">{{ cell.plan.firstFoodEmoji || '🍚' }}</text>
              <text class="cal-food-name">{{ cell.plan.firstFoodName ? cell.plan.firstFoodName.slice(0, 4) : '' }}</text>
            </view>
          </template>
        </view>
      </view>

      <!-- 点击展开的日期详情 -->
      <view v-if="expandedPlan" class="cal-detail card" @tap.stop>
        <view class="cal-detail-header">
          <text class="cal-detail-date">{{ expandedDate }}</text>
          <text class="cal-detail-score">营养评分 {{ expandedPlan.completionRate }}%</text>
        </view>
        <text class="cal-detail-summary">{{ expandedPlan.summary }}</text>
        <view class="cal-detail-actions">
          <view class="cal-detail-btn secondary-btn" @tap="goPlanDetail(expandedPlan.id)">查看详情</view>
          <view class="cal-detail-btn primary-button" @tap="goEditPlan(expandedPlan.id, expandedPlan.planDate)">✏️ 编辑计划</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="history.length === 0" class="cal-empty soft-card">
        <text class="cal-empty-icon">📅</text>
        <text class="cal-empty-title">还没有历史记录</text>
        <text class="cal-empty-desc">生成并保存今日计划后，这里会显示每天的饮食安排</text>
        <view class="primary-button" style="margin-top: 24rpx;" @tap="goGeneratePage">立即生成今日计划</view>
      </view>
    </view>

    <AppTabBar active="plan" />
  </view>
</template>

<style scoped lang="scss">
.tab-switcher {
  display: flex;
  gap: 14rpx;
  padding: 12rpx;
}

.tab-chip {
  flex: 1;
  padding: 18rpx 0;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.tab-chip.active {
  background: #fff;
  color: var(--mini-primary-deep);
  box-shadow: var(--mini-shadow-card);
}

.hero-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 26rpx;
  padding: 28rpx;
}

.hero-kicker {
  display: block;
  font-size: 22rpx;
  color: var(--mini-secondary-deep);
}

.hero-date {
  display: block;
  margin-top: 10rpx;
  font-size: 38rpx;
  font-weight: 700;
}

.hero-badge {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255,179,102,0.2);
  color: var(--mini-primary-deep);
  font-size: 22rpx;
  font-weight: 700;
}

/* 本周 */
.week-grid {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 26rpx;
}

.week-card {
  padding: 24rpx;
}

.week-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.week-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
}

.week-day {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.week-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255,179,102,0.18);
  color: var(--mini-primary-deep);
  font-size: 20rpx;
  font-weight: 700;
}

.week-tag.recommend {
  background: rgba(168,230,207,0.28);
  color: var(--mini-secondary-deep);
}

.week-rate {
  font-size: 30rpx;
  font-weight: 800;
  color: var(--mini-secondary-deep);
}

.week-date,
.week-summary,
.week-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

/* 编辑按钮行（今日） */
.plan-action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
  margin-bottom: -8rpx;
}

.plan-edit-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: var(--mini-primary-deep);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

/* 本周编辑行 */
.week-edit-row {
  margin-top: 16rpx;
  display: flex;
  justify-content: flex-end;
}

.week-edit-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: var(--mini-primary-deep);
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.week-edit-btn.outline {
  background: transparent;
  border: 2rpx solid var(--mini-secondary-deep);
  color: var(--mini-secondary-deep);
}

/* 日历无计划格子 */
.cal-cell.no-plan {
  opacity: 0.55;
  cursor: pointer;
}

/* 历史展开操作区 */
.cal-detail-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.cal-detail-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.cal-detail-btn.secondary-btn {
  background: rgba(0, 0, 0, 0.06);
  color: var(--mini-text-muted);
}

/* 月历 */
.calendar-wrap {
  margin-top: 26rpx;
}

.cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx 24rpx;
}

.cal-nav-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.85);
  box-shadow: var(--mini-shadow-card);
  text-align: center;
  line-height: 72rpx;
  font-size: 40rpx;
  color: var(--mini-primary-deep);
  font-weight: 700;
}

.cal-nav-btn.disabled {
  opacity: 0.3;
}

.cal-nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.cal-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-bottom: 10rpx;
}

.cal-weekday {
  text-align: center;
  font-size: 20rpx;
  color: var(--mini-text-muted);
  font-weight: 700;
  padding: 8rpx 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6rpx;
}

.cal-cell {
  min-height: 90rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 4rpx 6rpx;
  background: rgba(255,255,255,0.6);
  box-sizing: border-box;
  position: relative;
}

.cal-cell.empty {
  background: transparent;
  box-shadow: none;
}

.cal-cell.has-plan {
  background: rgba(255, 248, 235, 0.95);
  box-shadow: 0 2rpx 8rpx rgba(255, 179, 102, 0.2);
}

.cal-cell.today {
  border: 2rpx solid rgba(255, 179, 102, 0.7);
}

.cal-cell.expanded {
  background: rgba(255, 179, 102, 0.25);
}

.cal-day {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-text);
  line-height: 1;
}

.cal-cell.has-plan .cal-day {
  color: var(--mini-primary-deep);
}

.cal-food-tag {
  margin-top: 4rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}

.cal-food-emoji {
  font-size: 24rpx;
  line-height: 1;
}

.cal-food-name {
  font-size: 16rpx;
  color: var(--mini-text-muted);
  line-height: 1.3;
  text-align: center;
  white-space: normal;
  word-break: break-all;
}

/* 展开详情卡片 */
.cal-detail {
  margin-top: 18rpx;
  padding: 28rpx;
  border-left: 6rpx solid var(--mini-primary);
}

.cal-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.cal-detail-date {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.cal-detail-score {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
}

.cal-detail-summary {
  display: block;
  font-size: 24rpx;
  color: var(--mini-text-muted);
  line-height: 1.7;
  margin-bottom: 20rpx;
}

.cal-detail-btn {
  text-align: center;
}

/* 空状态 */
.cal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 30rpx;
  gap: 16rpx;
  margin-top: 24rpx;
  text-align: center;
}

.cal-empty-icon {
  font-size: 60rpx;
}

.cal-empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.cal-empty-desc {
  font-size: 24rpx;
  color: var(--mini-text-muted);
  line-height: 1.7;
}
</style>
