<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { BabyProfile, DailyMealPlan } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import NutritionScoreCard from '@/components/meal/NutritionScoreCard.vue'
import MealTimeline from '@/components/meal/MealTimeline.vue'
import { ensureProtectedPageAccess, getMealPlanDetail, readAuthSession } from '@/services/api'

const SAVED_PLAN_KEY = 'savedGeneratePlan'
const RESTORE_SAVED_PLAN_KEY = 'restoreSavedPlan'

const mealPlan = ref<DailyMealPlan>()
const loading = ref(false)
const restoring = ref(false)
const baby = ref<BabyProfile | null>(readAuthSession()?.babyProfile ?? null)

async function loadDetail() {
  if (!ensureProtectedPageAccess()) {
    return
  }

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const planId = currentPage?.options?.id

  if (typeof planId !== 'string' || !planId) {
    uni.showToast({ title: '缺少计划编号', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const data = await getMealPlanDetail(planId)
    mealPlan.value = data.mealPlan
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '计划读取失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)

function restoreToGenerate() {
  if (!mealPlan.value || !baby.value || restoring.value) {
    return
  }

  restoring.value = true

  try {
    uni.setStorageSync(SAVED_PLAN_KEY, {
      savedAt: new Date().toISOString(),
      babyProfile: baby.value,
      todayMealPlan: mealPlan.value,
      mealCount: mealPlan.value.entries.some((entry) => entry.slot === 'snack') ? '3餐+点心' : mealPlan.value.entries.length <= 2 ? '2餐' : '3餐',
      goals: []
    })
    uni.setStorageSync(RESTORE_SAVED_PLAN_KEY, true)
    uni.navigateTo({ url: '/pages/generate/index' })
  } finally {
    restoring.value = false
  }
}

function sharePlanDetail() {
  uni.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })
  uni.showToast({ title: '点击右上角 ··· 转发', icon: 'none', duration: 1500 })
}

onShareAppMessage(() => ({
  title: mealPlan.value ? `${mealPlan.value.dateLabel}辅食计划` : '宝宝辅食计划详情',
  path: mealPlan.value ? `/pages/plan-detail/index?id=${mealPlan.value.id}` : '/pages/plan/index'
}))

onShareTimeline(() => ({
  title: mealPlan.value ? `${mealPlan.value.dateLabel}辅食计划` : '宝宝辅食计划详情'
}))
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="计划详情" subtitle="查看历史辅食安排" :show-back="true" />

    <view v-if="mealPlan" class="hero-panel card">
      <view>
        <text class="hero-kicker">历史计划</text>
        <text class="hero-date">{{ mealPlan.dateLabel }}</text>
      </view>
      <view class="hero-badge">可继续调整</view>
    </view>

    <NutritionScoreCard v-if="mealPlan" :plan="mealPlan" />

    <view v-if="mealPlan" class="section">
      <text class="section-title">三餐明细</text>
      <MealTimeline :plan="mealPlan" :allow-swap="false" />
    </view>

    <view class="fixed-bottom-actions" v-if="mealPlan">
      <view class="bottom-mini-btn" @tap="sharePlanDetail">分享</view>
      <view class="bottom-mini-btn primary" @tap="restoreToGenerate">{{ restoring ? '处理中...' : '继续调整' }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
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

.section {
  margin-top: 30rpx;
}

.bottom-mini-btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 24rpx;
  background: rgba(255,255,255,0.88);
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.bottom-mini-btn.primary {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}
</style>
