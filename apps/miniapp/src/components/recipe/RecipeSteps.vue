<script setup lang="ts">
import type { RecipeStep } from '@baby-food/shared-types'
import { normalizeAppImageUrl } from '@/services/api'

defineProps<{
  steps: RecipeStep[]
}>()
</script>

<template>
  <view class="steps-wrap">
    <view v-for="step in steps" :key="step.stepNo" class="step-card card">
      <view class="step-index">{{ step.stepNo }}</view>
      <image v-if="step.image" class="step-image" :src="normalizeAppImageUrl(step.image)" mode="widthFix" />
      <text class="step-title">{{ step.title }}</text>
      <text class="step-desc">{{ step.description }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.steps-wrap {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.step-card {
  position: relative;
  padding: 26rpx;
}

.step-index {
  position: absolute;
  left: 20rpx;
  top: 20rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: var(--mini-secondary-deep);
  color: #fff;
  text-align: center;
  line-height: 48rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.step-image {
  width: 100%;
  margin-top: 28rpx;
  border-radius: 24rpx;
  display: block;
}

.step-title {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.step-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}
</style>
