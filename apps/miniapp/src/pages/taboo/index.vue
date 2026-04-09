<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TabooGuide } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import SymptomGrid from '@/components/taboo/SymptomGrid.vue'
import { getTabooData } from '@/services/mock'

const symptoms = ['感冒', '腹泻', '便秘', '咳嗽', '湿疹', '积食', '贫血', '出牙']
const activeSymptom = ref('腹泻')
const guide = ref<TabooGuide>()

async function load(symptom: string) {
  activeSymptom.value = symptom
  guide.value = await getTabooData(symptom)
}

onMounted(() => {
  load(activeSymptom.value)
})
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="生病忌口查询" subtitle="宝宝不舒服？查查能吃什么" @back="uni.navigateBack()" />

    <view class="search-box soft-card">
      <text class="search-placeholder">🔍 搜索病症，如：腹泻、咳嗽、湿疹</text>
    </view>

    <SymptomGrid :items="symptoms" :active="activeSymptom" @change="load" />

    <view v-if="guide" class="result-stack">
      <view class="result-card danger-block">
        <text class="result-title">❌ 暂时不要吃</text>
        <view class="reason-item" v-for="item in guide.avoid" :key="item.food">
          <text class="reason-food">{{ item.food }}</text>
          <text class="reason-text">{{ item.reason }}</text>
        </view>
      </view>

      <view class="result-card good-block">
        <text class="result-title">✅ 推荐吃这些</text>
        <view class="recommend-row">
          <view v-for="food in guide.recommended" :key="food" class="recommend-pill">{{ food }}</view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">🍚 病期食谱推荐</text>
        <view class="recipe-list">
          <view v-for="recipe in guide.recipes" :key="recipe.id" class="recipe-card card">
            <image class="recipe-image" :src="recipe.image" mode="aspectFill" />
            <view class="recipe-content">
              <text class="recipe-title">{{ recipe.title }}</text>
              <text class="recipe-desc">{{ recipe.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="medical-tip soft-card">
        <text class="medical-title">就医提示</text>
        <text v-for="tip in guide.medicalTips" :key="tip" class="medical-text">• {{ tip }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.search-box {
  margin: 20rpx 0 24rpx;
  padding: 24rpx 28rpx;
}

.search-placeholder {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.result-stack {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
}

.result-card {
  padding: 28rpx;
  border-radius: 32rpx;
}

.danger-block {
  background: rgba(214, 106, 106, 0.12);
}

.good-block {
  background: rgba(168, 230, 207, 0.24);
}

.result-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.reason-item {
  margin-top: 18rpx;
}

.reason-food {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
}

.reason-text,
.medical-text,
.recipe-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.recommend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}

.recommend-pill {
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.8);
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.recipe-card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
}

.recipe-image {
  width: 180rpx;
  height: 140rpx;
  border-radius: 22rpx;
}

.recipe-content {
  flex: 1;
}

.recipe-title,
.medical-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.medical-tip {
  padding: 28rpx;
}
</style>
