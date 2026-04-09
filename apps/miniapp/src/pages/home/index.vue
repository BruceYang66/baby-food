<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BabyProfile, HomeFeature, HomeShortcut, IngredientHighlight } from '@baby-food/shared-types'
import AppTabBar from '@/components/common/AppTabBar.vue'
import { getHomeData } from '@/services/mock'

const baby = ref<BabyProfile>()
const features = ref<HomeFeature[]>([])
const shortcuts = ref<HomeShortcut[]>([])
const ingredients = ref<IngredientHighlight[]>([])

onMounted(async () => {
  const data = await getHomeData()
  baby.value = data.babyProfile
  features.value = data.homeFeatures
  shortcuts.value = data.homeShortcuts
  ingredients.value = data.ingredientHighlights
})

function go(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="page-shell home-page">
    <view class="topbar">
      <view class="user-box" v-if="baby">
        <image class="avatar" :src="baby.avatar" mode="aspectFill" />
        <view>
          <text class="baby-name">{{ baby.nickname }}</text>
          <text class="baby-meta">{{ baby.monthAgeLabel }} · {{ baby.stageLabel }}</text>
        </view>
      </view>
      <view class="notify">🔔</view>
    </view>

    <view class="hero-card">
      <view>
        <text class="hero-label">今日食谱</text>
        <text class="hero-title">根据宝宝成长阶段，生成今天的科学辅食安排</text>
      </view>
      <view class="hero-button" @tap="go('/pages/generate/index')">🍚 生成今日辅食</view>
      <view class="hero-decor">🌾</view>
    </view>

    <view class="feature-grid">
      <view
        v-for="feature in features"
        :key="feature.key"
        class="feature-card"
        :class="feature.accent"
        @tap="go(feature.route)"
      >
        <text class="feature-icon">{{ feature.icon }}</text>
        <text class="feature-title">{{ feature.title }}</text>
        <text class="feature-subtitle">{{ feature.subtitle }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">快捷操作</text>
      <view class="shortcut-list">
        <view v-for="item in shortcuts" :key="item.title" class="shortcut-card card">
          <text class="shortcut-icon">{{ item.icon }}</text>
          <view>
            <text class="shortcut-title">{{ item.title }}</text>
            <text class="shortcut-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-row">
        <text class="section-title">本周推荐食材</text>
        <text class="section-link">查看更多</text>
      </view>
      <scroll-view scroll-x class="ingredients-scroll" show-scrollbar="false">
        <view class="ingredients-row">
          <view v-for="item in ingredients" :key="item.id" class="ingredient-card">
            <image class="ingredient-image" :src="item.image" mode="aspectFill" />
            <text class="ingredient-name">{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <AppTabBar active="home" />
  </view>
</template>

<style scoped lang="scss">
.home-page {
  padding-top: 26rpx;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999rpx;
  border: 4rpx solid rgba(255, 179, 102, 0.35);
}

.baby-name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.baby-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.notify {
  width: 76rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.7);
  text-align: center;
  line-height: 76rpx;
  font-size: 30rpx;
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 34rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, rgba(255,179,102,0.35), rgba(255,255,255,0.9));
  box-shadow: var(--mini-shadow-soft);
}

.hero-label {
  display: inline-flex;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.6);
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.hero-title {
  display: block;
  width: 78%;
  margin-top: 18rpx;
  font-size: 40rpx;
  line-height: 1.45;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-button {
  width: 360rpx;
  margin-top: 26rpx;
  padding: 24rpx 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  text-align: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.hero-decor {
  position: absolute;
  right: -10rpx;
  bottom: -24rpx;
  font-size: 140rpx;
  opacity: 0.16;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22rpx;
  margin-top: 28rpx;
}

.feature-card {
  min-height: 232rpx;
  padding: 26rpx;
  border-radius: 32rpx;
  background: rgba(255,255,255,0.85);
  box-shadow: var(--mini-shadow-card);
}

.feature-card.primary {
  background: rgba(255, 179, 102, 0.26);
}

.feature-card.secondary {
  background: rgba(168, 230, 207, 0.3);
}

.feature-icon {
  display: block;
  font-size: 40rpx;
}

.feature-title {
  display: block;
  margin-top: 28rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.feature-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
}

.section {
  margin-top: 36rpx;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-link {
  font-size: 22rpx;
  color: var(--mini-secondary-deep);
  font-weight: 600;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 16rpx;
}

.shortcut-card {
  display: flex;
  gap: 18rpx;
  align-items: center;
  padding: 24rpx;
}

.shortcut-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255,179,102,0.16);
  text-align: center;
  line-height: 72rpx;
  font-size: 30rpx;
}

.shortcut-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.shortcut-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.ingredients-scroll {
  margin-top: 18rpx;
  white-space: nowrap;
}

.ingredients-row {
  display: flex;
  gap: 18rpx;
}

.ingredient-card {
  width: 214rpx;
}

.ingredient-image {
  width: 214rpx;
  height: 268rpx;
  border-radius: 28rpx;
}

.ingredient-name {
  display: block;
  margin-top: 14rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
