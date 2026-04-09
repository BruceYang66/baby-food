<script setup lang="ts">
import type { RecipeDetail } from '@baby-food/shared-types'

defineProps<{
  recipe: RecipeDetail
}>()
</script>

<template>
  <view class="meta-grid soft-card">
    <view class="meta-item">
      <text class="meta-label">适龄</text>
      <text class="meta-value">{{ recipe.ageLabel }}</text>
    </view>
    <view class="meta-item">
      <text class="meta-label">时长</text>
      <text class="meta-value">{{ recipe.durationLabel }}</text>
    </view>
    <view class="meta-item">
      <text class="meta-label">难度</text>
      <text class="meta-value">{{ recipe.difficultyLabel }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
  padding: 24rpx;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.meta-label {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.meta-value {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}
</style>
