<script setup lang="ts">
import type { MealPlanEntry } from '@baby-food/shared-types'
import TagChip from '@/components/common/TagChip.vue'

const props = defineProps<{
  item: MealPlanEntry
  showSwap?: boolean
}>()

const emit = defineEmits<{
  swap: []
}>()

function goRecipeDetail() {
  if (!props.item.recipeId) {
    return
  }

  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${props.item.recipeId}` })
}

function handleSwap() {
  emit('swap')
}
</script>

<template>
  <view class="meal-card card">
    <image class="meal-image" :src="item.image" mode="aspectFill" />
    <view class="meal-main">
      <view class="meal-head">
        <view>
          <text class="meal-time">{{ item.time }}</text>
          <text class="meal-title">{{ item.title }}</text>
        </view>
        <text class="meal-focus">{{ item.focus }}</text>
      </view>
      <view class="meal-tags">
        <TagChip v-for="tag in item.tags" :key="tag" :text="tag" accent="secondary" />
      </view>
      <view class="meal-actions">
        <view class="ghost-btn" :class="{ disabled: !item.recipeId }" @tap="goRecipeDetail">查看做法</view>
        <view v-if="showSwap !== false" class="swap-btn" @tap="handleSwap">换一道</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.meal-card {
  display: flex;
  gap: 20rpx;
  padding: 22rpx;
}

.meal-image {
  width: 184rpx;
  height: 184rpx;
  border-radius: 24rpx;
}

.meal-main {
  flex: 1;
}

.meal-time {
  display: block;
  font-size: 22rpx;
  color: var(--mini-secondary-deep);
}

.meal-title {
  display: block;
  margin-top: 6rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.meal-focus {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.meal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.meal-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 18rpx;
}

.ghost-btn,
.swap-btn {
  padding: 12rpx 20rpx;
  border-radius: var(--mini-radius-pill);
  font-size: 22rpx;
  font-weight: 600;
}

.ghost-btn {
  background: rgba(255, 179, 102, 0.18);
  color: var(--mini-primary-deep);
}

.ghost-btn.disabled {
  opacity: 0.45;
}

.swap-btn {
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}
</style>
