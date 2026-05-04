<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FeedingRecordStatus, MealPlanEntry } from '@baby-food/shared-types'
import TagChip from '@/components/common/TagChip.vue'
import { normalizeAppImageUrl } from '@/services/api'

const props = defineProps<{
  item: MealPlanEntry
  showSwap?: boolean
}>()

const emit = defineEmits<{
  swap: []
  record: [status: FeedingRecordStatus]
}>()

const imageLoadFailed = ref(false)

const normalizedImage = computed(() => {
  if (imageLoadFailed.value) {
    return ''
  }

  const image = props.item.image?.trim() ?? ''
  return image ? normalizeAppImageUrl(image) : ''
})

const fallbackTitleLines = computed(() => {
  const title = props.item.title.replace(/\s+/g, '').trim()

  if (!title) {
    return ['今日辅食']
  }

  if (title.length <= 5) {
    return [title]
  }

  if (title.length <= 10) {
    const midpoint = Math.ceil(title.length / 2)
    return [title.slice(0, midpoint), title.slice(midpoint)]
  }

  return [title.slice(0, 5), title.slice(5, 10)]
})

const fallbackPaletteClass = computed(() => {
  const seed = props.item.title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return `palette-${(seed % 4) + 1}`
})

const fallbackTag = computed(() => props.item.tags[0] ?? '均衡搭配')

watch(
  () => [props.item.id, props.item.image],
  () => {
    imageLoadFailed.value = false
  }
)

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

function handleImageError() {
  imageLoadFailed.value = true
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
    <image v-if="normalizedImage" class="meal-image" :src="normalizedImage" mode="aspectFill" @error="handleImageError" />
    <view v-else class="meal-image meal-image-fallback" :class="fallbackPaletteClass">
      <view class="meal-image-glow"></view>
      <text class="meal-image-kicker">辅食计划</text>
      <view class="meal-image-copy">
        <text v-for="(line, index) in fallbackTitleLines" :key="`${item.id}-${index}`" class="meal-image-line">{{ line }}</text>
      </view>
      <text class="meal-image-caption">{{ fallbackTag }}</text>
    </view>
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
  flex-shrink: 0;
}

.meal-image-fallback {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18rpx;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.55);
}

.meal-image-fallback.palette-1 {
  background: linear-gradient(135deg, rgba(255, 239, 222, 0.98), rgba(255, 248, 235, 0.98));
}

.meal-image-fallback.palette-2 {
  background: linear-gradient(135deg, rgba(232, 248, 240, 0.98), rgba(251, 247, 239, 0.98));
}

.meal-image-fallback.palette-3 {
  background: linear-gradient(135deg, rgba(255, 243, 229, 0.98), rgba(255, 235, 215, 0.98));
}

.meal-image-fallback.palette-4 {
  background: linear-gradient(135deg, rgba(244, 238, 228, 0.98), rgba(255, 248, 235, 0.98));
}

.meal-image-glow {
  position: absolute;
  top: -24rpx;
  right: -18rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.36);
}

.meal-image-kicker,
.meal-image-copy,
.meal-image-caption {
  position: relative;
  z-index: 1;
}

.meal-image-kicker {
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: rgba(138, 81, 8, 0.72);
}

.meal-image-copy {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meal-image-line {
  font-size: 28rpx;
  line-height: 1.2;
  font-weight: 800;
  color: var(--mini-primary-deep);
}

.meal-image-caption {
  align-self: flex-start;
  max-width: 100%;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  color: var(--mini-text-muted);
  font-size: 18rpx;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
