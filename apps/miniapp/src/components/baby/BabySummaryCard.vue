<script setup lang="ts">
import type { BabyProfile } from '@baby-food/shared-types'

defineProps<{
  baby: BabyProfile
}>()
</script>

<template>
  <view class="baby-card card">
    <image class="avatar" :src="baby.avatar" mode="aspectFill" />
    <view class="content">
      <text class="name">{{ baby.nickname }}</text>
      <text class="meta">{{ baby.monthAgeLabel }} · {{ baby.stageLabel }}</text>
      <view class="allergens">
        <text class="allergen-label">已避开：</text>
        <text class="allergen-text">{{ baby.allergens.join('、') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.baby-card {
  display: flex;
  gap: 22rpx;
  padding: 28rpx;
  align-items: center;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 999rpx;
}

.content {
  flex: 1;
}

.name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.allergens {
  display: inline-flex;
  margin-top: 18rpx;
  padding: 10rpx 20rpx;
  border-radius: var(--mini-radius-pill);
  background: rgba(214, 106, 106, 0.12);
}

.allergen-label,
.allergen-text {
  font-size: 22rpx;
  color: #a44d4d;
}
</style>
