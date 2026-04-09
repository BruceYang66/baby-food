<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { DailyMealPlan, HistoryMealPlan, RecipeSummary } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import MealTimeline from '@/components/meal/MealTimeline.vue'
import { getPlanPageData } from '@/services/mock'

const activeTab = ref<'today' | 'week' | 'history'>('today')
const todayPlan = ref<DailyMealPlan>()
const history = ref<HistoryMealPlan[]>([])
const weeklyRecipes = ref<RecipeSummary[]>([])

onMounted(async () => {
  const data = await getPlanPageData()
  todayPlan.value = data.todayMealPlan
  history.value = data.historyMealPlans
  weeklyRecipes.value = data.featuredRecipes
})

const tabLabel = computed(() => {
  if (activeTab.value === 'today') return '今日计划'
  if (activeTab.value === 'week') return '本周安排'
  return '历史记录'
})
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="我的辅食计划" subtitle="今日 / 本周 / 历史 一键管理" @back="uni.navigateBack()" />

    <view class="tab-switcher soft-card">
      <view class="tab-chip" :class="{ active: activeTab === 'today' }" @tap="activeTab = 'today'">今日</view>
      <view class="tab-chip" :class="{ active: activeTab === 'week' }" @tap="activeTab = 'week'">本周</view>
      <view class="tab-chip" :class="{ active: activeTab === 'history' }" @tap="activeTab = 'history'">历史</view>
    </view>

    <view class="hero-panel card" v-if="todayPlan">
      <view>
        <text class="hero-kicker">{{ tabLabel }}</text>
        <text class="hero-date">{{ todayPlan.dateLabel }}</text>
      </view>
      <view class="hero-badge">第 12 周</view>
    </view>

    <view v-if="activeTab === 'today' && todayPlan">
      <MealTimeline :plan="todayPlan" />
    </view>

    <view v-if="activeTab === 'week'" class="week-grid">
      <view v-for="recipe in weeklyRecipes" :key="recipe.id" class="week-card card">
        <image class="week-image" :src="recipe.image" mode="aspectFill" />
        <text class="week-title">{{ recipe.title }}</text>
        <text class="week-meta">{{ recipe.tags.join(' · ') }}</text>
      </view>
    </view>

    <view v-if="activeTab === 'history'" class="history-list">
      <view v-for="item in history" :key="item.id" class="history-card card">
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
  padding: 20rpx;
}

.week-image {
  width: 100%;
  height: 260rpx;
  border-radius: 24rpx;
}

.week-title {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
}

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

.history-date {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.history-rate {
  font-size: 30rpx;
  font-weight: 800;
  color: var(--mini-secondary-deep);
}
</style>
