<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { DailyMealPlan, HistoryMealPlan, WeeklyMealPlanDay } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import MealTimeline from '@/components/meal/MealTimeline.vue'
import { ensureProtectedPageAccess, getPlanPageData, openProtectedPage } from '@/services/api'

const activeTab = ref<'today' | 'week' | 'history'>('today')
const todayPlan = ref<DailyMealPlan>()
const history = ref<HistoryMealPlan[]>([])
const weeklyPlans = ref<WeeklyMealPlanDay[]>([])

onMounted(async () => {
  if (!ensureProtectedPageAccess()) {
    return
  }

  const data = await getPlanPageData()
  todayPlan.value = data.todayMealPlan
  history.value = data.historyMealPlans
  weeklyPlans.value = data.weeklyPlanDays
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

function goWeeklyPlan(plan: WeeklyMealPlanDay) {
  if (!plan.isRecommended) {
    goPlanDetail(plan.id)
    return
  }

  // 推荐天：有真实食谱则跳第一个食谱详情，否则跳生成页
  const firstRecipeId = plan.recipeIds[0]
  if (firstRecipeId) {
    uni.navigateTo({ url: `/pages/recipe-detail/index?id=${firstRecipeId}` })
  } else {
    goGeneratePage()
  }
}
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
        <text class="hero-date">{{ activeTab === 'week' ? '本周 7 天安排' : activeTab === 'history' ? '历史膳食记录' : todayPlan.dateLabel }}</text>
      </view>
      <view class="hero-badge">{{ activeTab === 'week' ? '可提前查看' : '已生成计划' }}</view>
    </view>

    <view v-if="activeTab === 'today' && todayPlan">
      <MealTimeline :plan="todayPlan" @swap="goGeneratePage" />
    </view>

    <view v-if="activeTab === 'week'" class="week-grid">
      <view v-for="plan in weeklyPlans" :key="plan.id" class="week-card card" @tap="goWeeklyPlan(plan)">
        <view class="week-head">
          <view>
            <text class="week-day">{{ plan.dayLabel }}</text>
            <text class="week-date">{{ plan.dateLabel }}</text>
          </view>
          <view class="week-side">
            <text class="week-tag" :class="{ recommend: plan.isRecommended }">{{ plan.tagLabel }}</text>
            <text class="week-rate">{{ plan.completionRate }}%</text>
          </view>
        </view>
        <text class="week-summary">{{ plan.summary }}</text>
        <text class="week-meta">{{ plan.recipeTitles.join(' · ') }}</text>
      </view>
    </view>

    <view v-if="activeTab === 'history'" class="history-list">
      <view v-for="item in history" :key="item.id" class="history-card card" @tap="goPlanDetail(item.id)">
        <view>
          <text class="history-date">{{ item.dateLabel }}</text>
          <text class="history-summary">{{ item.summary }}</text>
        </view>
        <text class="history-rate">{{ item.completionRate }}%</text>
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

.week-grid,
.history-list {
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

.week-day,
.history-date {
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

.week-rate,
.history-rate {
  font-size: 30rpx;
  font-weight: 800;
  color: var(--mini-secondary-deep);
}

.week-date,
.week-summary,
.week-meta,
.history-summary {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.history-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx;
}
</style>
