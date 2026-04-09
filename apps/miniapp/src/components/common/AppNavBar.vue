<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  centerTitle?: boolean
  rightText?: string
}>()

const emit = defineEmits<{
  back: []
  right: []
}>()
</script>

<template>
  <view class="app-nav">
    <view class="nav-side" @tap="emit('back')">←</view>
    <view class="nav-center" :class="{ centered: centerTitle }">
      <text class="nav-title">{{ title }}</text>
      <text v-if="subtitle" class="nav-subtitle">{{ subtitle }}</text>
    </view>
    <view class="nav-side right" @tap="emit('right')">
      <text>{{ rightText || '' }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 112rpx;
  padding: 24rpx 8rpx 12rpx;
}

.nav-side {
  width: 88rpx;
  font-size: 40rpx;
  color: var(--mini-primary-deep);
}

.nav-side.right {
  text-align: right;
  font-size: 24rpx;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
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
