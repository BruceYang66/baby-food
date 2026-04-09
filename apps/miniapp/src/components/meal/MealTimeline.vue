<script setup lang="ts">
import type { DailyMealPlan } from '@baby-food/shared-types'
import MealCard from './MealCard.vue'

defineProps<{
  plan: DailyMealPlan
}>()

const slotNameMap: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐'
}
</script>

<template>
  <view class="timeline-wrap">
    <view v-for="entry in plan.entries" :key="entry.id" class="timeline-item">
      <view class="timeline-axis">
        <view class="node"></view>
        <view class="line"></view>
      </view>
      <view class="timeline-content">
        <text class="timeline-title">{{ slotNameMap[entry.slot] }} · {{ entry.time }}</text>
        <MealCard :item="entry" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.timeline-item {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  margin-bottom: 26rpx;
}

.timeline-axis {
  position: relative;
  width: 36rpx;
  display: flex;
  justify-content: center;
}

.node {
  position: relative;
  z-index: 2;
  width: 22rpx;
  height: 22rpx;
  margin-top: 18rpx;
  border-radius: 999rpx;
  background: var(--mini-secondary);
  box-shadow: 0 0 0 10rpx rgba(168, 230, 207, 0.18);
}

.line {
  position: absolute;
  top: 44rpx;
  bottom: -26rpx;
  width: 4rpx;
  background: linear-gradient(180deg, rgba(168,230,207,0.6), rgba(44,105,86,0.18));
}

.timeline-item:last-child .line {
  display: none;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  display: block;
  margin: 8rpx 0 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}
</style>
