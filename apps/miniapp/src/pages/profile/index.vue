<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BabyProfile, ProfileMenuItem, WechatEntry } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import { getProfileData } from '@/services/mock'

const baby = ref<BabyProfile>()
const menus = ref<ProfileMenuItem[]>([])
const wechatEntries = ref<WechatEntry[]>([])

onMounted(async () => {
  const data = await getProfileData()
  baby.value = data.babyProfile
  menus.value = data.profileMenus
  wechatEntries.value = data.wechatEntries
})
</script>

<template>
  <view class="page-shell profile-page">
    <AppNavBar title="我的" subtitle="宝宝档案与常用设置" />

    <view v-if="baby" class="profile-hero">
      <image class="profile-avatar" :src="baby.avatar" mode="aspectFill" />
      <text class="profile-name">{{ baby.nickname }}</text>
      <text class="profile-meta">{{ baby.monthAgeLabel }} · {{ baby.stageLabel }}</text>

      <view class="growth-grid">
        <view class="growth-card soft-card">
          <text class="growth-label">当前阶段</text>
          <text class="growth-value">碎末状辅食</text>
        </view>
        <view class="growth-card soft-card">
          <text class="growth-label">已尝试食材</text>
          <text class="growth-value green">42 种</text>
        </view>
      </view>
    </view>

    <view class="menu-list card">
      <view v-for="menu in menus" :key="menu.key" class="menu-item">
        <view class="menu-icon">{{ menu.icon }}</view>
        <view class="menu-main">
          <text class="menu-title">{{ menu.title }}</text>
          <text class="menu-subtitle">{{ menu.subtitle }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="wechat-grid">
      <view v-for="entry in wechatEntries" :key="entry.key" class="wechat-card soft-card">
        <text class="wechat-icon">{{ entry.icon }}</text>
        <text class="wechat-title">{{ entry.title }}</text>
      </view>
    </view>

    <AppTabBar active="profile" />
  </view>
</template>

<style scoped lang="scss">
.profile-page {
  padding-top: 10rpx;
}

.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 999rpx;
  border: 8rpx solid rgba(255,255,255,0.8);
  box-shadow: var(--mini-shadow-card);
}

.profile-name {
  display: block;
  margin-top: 24rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.profile-meta {
  display: block;
  margin-top: 10rpx;
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(168,230,207,0.24);
  font-size: 22rpx;
  color: var(--mini-secondary-deep);
}

.growth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  width: 100%;
  margin-top: 28rpx;
}

.growth-card {
  padding: 24rpx;
}

.growth-label {
  display: block;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.growth-value {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.growth-value.green {
  color: var(--mini-secondary-deep);
}

.menu-list {
  margin-top: 28rpx;
  padding: 10rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx 18rpx;
}

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255,179,102,0.16);
  text-align: center;
  line-height: 72rpx;
  font-size: 30rpx;
}

.menu-main {
  flex: 1;
}

.menu-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.menu-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.menu-arrow {
  font-size: 36rpx;
  color: #b9ada4;
}

.wechat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.wechat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 16rpx;
}

.wechat-icon {
  font-size: 34rpx;
}

.wechat-title {
  text-align: center;
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--mini-text);
}
</style>
