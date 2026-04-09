<script setup lang="ts">
defineProps<{
  active: 'home' | 'plan' | 'profile'
}>()

const tabs = [
  { key: 'home', label: '首页', icon: '⌂', path: '/pages/home/index' },
  { key: 'plan', label: '辅食计划', icon: '☰', path: '/pages/plan/index' },
  { key: 'profile', label: '我的', icon: '☺', path: '/pages/profile/index' }
] as const

function go(path: string) {
  uni.reLaunch({ url: path })
}
</script>

<template>
  <view class="tabbar-shell">
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: active === tab.key }"
      @tap="go(tab.path)"
    >
      <text class="tab-icon">{{ tab.icon }}</text>
      <text class="tab-label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.tabbar-shell {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 28rpx;
  z-index: 20;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 12rpx;
  border-radius: 36rpx;
  background: rgba(253, 248, 243, 0.94);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 -8rpx 28rpx rgba(25, 27, 25, 0.06);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 160rpx;
  color: #9b8d83;
}

.tab-item.active {
  color: var(--mini-secondary-deep);
  transform: translateY(-4rpx);
}

.tab-icon {
  font-size: 34rpx;
}

.tab-label {
  margin-top: 6rpx;
  font-size: 22rpx;
  font-weight: 600;
}
</style>
