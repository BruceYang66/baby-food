<script setup lang="ts">
import type { FeedingRecordStatus, MealPlanEntry } from '@baby-food/shared-types'
import TagChip from '@/components/common/TagChip.vue'

const props = defineProps<{
  item: MealPlanEntry
  showSwap?: boolean
}>()

const emit = defineEmits<{
  swap: []
  record: [status: FeedingRecordStatus]
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

function handleRecord(status: FeedingRecordStatus) {
  emit('record', status)
}

function getRecordText() {
  if (props.item.feedingRecord?.status === 'fed') {
    return '已喂养'
  }

  if (props.item.feedingRecord?.status === 'skipped') {
    return '未喂'
  }

  return '待记录'
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
      <view class="meal-record" :class="item.feedingRecord?.status ?? 'pending'">{{ getRecordText() }}</view>
      <view class="meal-actions">
        <view class="ghost-btn" :class="{ disabled: !item.recipeId }" @tap="goRecipeDetail">查看做法</view>
        <view class="record-btn fed" @tap="handleRecord('fed')">已喂</view>
        <view class="record-btn skipped" @tap="handleRecord('skipped')">本餐未喂</view>
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

.meal-record {
  display: inline-flex;
  margin-top: 14rpx;
  padding: 8rpx 18rpx;
  border-radius: var(--mini-radius-pill);
  font-size: 20rpx;
  font-weight: 700;
}

.meal-record.pending {
  background: rgba(255, 179, 102, 0.18);
  color: var(--mini-primary-deep);
}

.meal-record.fed {
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}

.meal-record.skipped {
  background: rgba(195, 201, 214, 0.32);
  color: var(--mini-text-muted);
}

.meal-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 18rpx;
  flex-wrap: wrap;
}

.ghost-btn,
.swap-btn,
.record-btn {
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

.record-btn.fed {
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}

.record-btn.skipped {
  background: rgba(195, 201, 214, 0.32);
  color: var(--mini-text-muted);
}

.swap-btn {
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}
</style>
