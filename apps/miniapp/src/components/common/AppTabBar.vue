<script setup lang="ts">
import { rootTabs, type RootTabKey } from '@/config/app'

const props = defineProps<{
  active: RootTabKey
}>()

function go(path: string, key: RootTabKey) {
  if (key === props.active) {
    return
  }

  // Tab 页面都支持未登录访问，直接跳转
  uni.reLaunch({ url: path })
}
</script>

<template>
  <view class="tabbar-shell">
    <view
      v-for="tab in rootTabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: active === tab.key }"
      @tap="go(tab.path, tab.key)"
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
  justify-content: space-between;
  align-items: stretch;
  gap: 8rpx;
  padding: 18rpx 12rpx;
  border-radius: 36rpx;
  background: rgba(253, 248, 243, 0.94);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 -8rpx 28rpx rgba(25, 27, 25, 0.06);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 8rpx 0;
  border-radius: 999rpx;
  color: #9b8d83;
}

.tab-item.active {
  color: var(--mini-secondary-deep);
  background: rgba(255, 179, 102, 0.2);
  transform: translateY(-4rpx);
}

.tab-icon {
  font-size: 30rpx;
  line-height: 1;
}

.tab-label {
  margin-top: 6rpx;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;
}
</style>
