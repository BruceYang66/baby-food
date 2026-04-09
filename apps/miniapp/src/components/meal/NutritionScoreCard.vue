<script setup lang="ts">
import type { DailyMealPlan } from '@baby-food/shared-types'

defineProps<{
  plan: DailyMealPlan
}>()
</script>

<template>
  <view class="score-card card">
    <view>
      <text class="label">今日营养评分</text>
      <view class="score-row">
        <text class="score">{{ plan.nutritionScore }}</text>
        <text class="score-tip">卓越</text>
      </view>
      <text class="water">补水建议 {{ plan.waterSuggestion }}</text>
    </view>
    <view class="decor">✦</view>
  </view>
</template>

<style scoped lang="scss">
.score-card {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  padding: 28rpx;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.2), rgba(255,255,255,0.9));
}

.label {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.score-row {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  margin-top: 10rpx;
}

.score {
  font-size: 78rpx;
  line-height: 1;
  font-weight: 800;
  color: var(--mini-primary-deep);
}

.score-tip {
  margin-bottom: 10rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
}

.water {
  display: inline-block;
  margin-top: 16rpx;
  padding: 10rpx 20rpx;
  border-radius: var(--mini-radius-pill);
  background: rgba(168, 230, 207, 0.36);
  font-size: 22rpx;
  color: var(--mini-secondary-deep);
}

.decor {
  font-size: 120rpx;
  opacity: 0.08;
  color: var(--mini-primary-deep);
}
</style>
