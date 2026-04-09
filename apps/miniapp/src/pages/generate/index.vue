<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BabyProfile, DailyMealPlan } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import NutritionScoreCard from '@/components/meal/NutritionScoreCard.vue'
import MealTimeline from '@/components/meal/MealTimeline.vue'
import { getGeneratePageData } from '@/services/mock'

const baby = ref<BabyProfile>()
const plan = ref<DailyMealPlan>()
const selectedCount = ref('3餐')
const selectedGoals = ref<string[]>(['补钙'])
const goals = ref<string[]>([])

onMounted(async () => {
  const data = await getGeneratePageData()
  baby.value = data.babyProfile
  plan.value = data.todayMealPlan
  goals.value = data.nutritionGoals
})

function toggleGoal(goal: string) {
  if (selectedGoals.value.includes(goal)) {
    selectedGoals.value = selectedGoals.value.filter((item) => item !== goal)
    return
  }
  selectedGoals.value = [...selectedGoals.value, goal]
}
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="生成今日辅食" subtitle="按宝宝当前状态智能搭配" @back="uni.navigateBack()" />

    <view class="picker card" v-if="baby">
      <image class="picker-avatar" :src="baby.avatar" mode="aspectFill" />
      <view>
        <text class="picker-name">{{ baby.nickname }}</text>
        <text class="picker-meta">{{ baby.monthAgeLabel }} · {{ baby.stageLabel }}</text>
      </view>
      <text class="picker-arrow">⌄</text>
    </view>

    <view class="soft-card setting-panel">
      <text class="setting-label">每日餐数</text>
      <view class="count-row">
        <view class="count-chip" :class="{ active: selectedCount === '2餐' }" @tap="selectedCount = '2餐'">2餐</view>
        <view class="count-chip" :class="{ active: selectedCount === '3餐' }" @tap="selectedCount = '3餐'">3餐</view>
        <view class="count-chip" :class="{ active: selectedCount === '3餐+点心' }" @tap="selectedCount = '3餐+点心'">3餐+点心</view>
      </view>

      <text class="setting-label">特殊需求</text>
      <view class="chip-row">
        <view
          v-for="goal in goals"
          :key="goal"
          class="chip"
          :class="{ active: selectedGoals.includes(goal) }"
          @tap="toggleGoal(goal)"
        >
          {{ goal }}
        </view>
      </view>

      <view class="allergy-tip" v-if="baby">过敏提醒：已避开 {{ baby.allergens.join('、') }}</view>
      <view class="primary-button">一键生成</view>
    </view>

    <NutritionScoreCard v-if="plan" :plan="plan" />

    <view class="section" v-if="plan">
      <text class="section-title">三餐推荐</text>
      <MealTimeline :plan="plan" />
    </view>

    <view class="fixed-bottom-actions">
      <view class="bottom-mini-btn">保存计划</view>
      <view class="bottom-mini-btn">分享</view>
      <view class="bottom-mini-btn primary">重新生成</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.picker {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
}

.picker-avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 999rpx;
}

.picker-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.picker-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.picker-arrow {
  margin-left: auto;
  font-size: 36rpx;
  color: var(--mini-text-muted);
}

.setting-panel {
  margin-top: 24rpx;
  padding: 28rpx;
}

.setting-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.count-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.count-chip {
  flex: 1;
  padding: 20rpx 0;
  border-radius: var(--mini-radius-pill);
  background: rgba(255,255,255,0.8);
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.count-chip.active {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}

.allergy-tip {
  margin: 24rpx 0;
  padding: 18rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(214, 106, 106, 0.08);
  font-size: 24rpx;
  color: #a94f4f;
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
