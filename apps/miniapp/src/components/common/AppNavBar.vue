<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  centerTitle?: boolean
  rightText?: string
  showBack?: boolean
}>()

const emit = defineEmits<{
  back: []
  right: []
}>()

function getStatusBarHeight() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo().statusBarHeight || 0
  }

  return uni.getSystemInfoSync().statusBarHeight || 0
}

const statusBarHeight = Math.max(getStatusBarHeight(), 20)
const resolvedShowBack = computed(() => props.showBack ?? getCurrentPages().length > 1)
const navStyle = computed(() => ({
  paddingTop: `${statusBarHeight}px`,
  minHeight: `${statusBarHeight + 56}px`
}))

function goHome() {
  uni.reLaunch({ url: '/pages/home/index' })
}

function handleBack() {
  if (!resolvedShowBack.value) {
    return
  }

  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1,
      fail: () => {
        goHome()
      }
    })
    emit('back')
    return
  }

  goHome()
  emit('back')
}

function handleRight() {
  emit('right')
}
</script>

<template>
  <view class="app-nav" :style="navStyle">
    <view class="nav-side" :class="{ placeholder: !resolvedShowBack }" @tap="handleBack">
      <view v-if="resolvedShowBack" class="back-btn">
        <text class="back-icon">‹</text>
      </view>
    </view>
    <view class="nav-center" :class="{ centered: centerTitle }">
      <text class="nav-title">{{ title }}</text>
      <text v-if="subtitle" class="nav-subtitle">{{ subtitle }}</text>
    </view>
    <view class="nav-side right" @tap="handleRight">
      <text>{{ rightText || '' }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8rpx;
  padding-bottom: 12rpx;
  padding-left: 8rpx;
}

.nav-side {
  display: flex;
  align-items: center;
  width: 88rpx;
  min-height: 88rpx;
  font-size: 40rpx;
  color: var(--mini-primary-deep);
}

.nav-side.placeholder {
  color: transparent;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: var(--mini-primary-deep);
  margin-top: -4rpx;
}

.nav-side.right {
  justify-content: flex-end;
  text-align: right;
  font-size: 24rpx;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 88rpx;
}

.nav-center.centered {
  align-items: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.nav-subtitle {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}
</style>
