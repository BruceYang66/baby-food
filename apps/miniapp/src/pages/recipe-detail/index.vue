<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { RecipeDetail } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import RecipeMetaGrid from '@/components/recipe/RecipeMetaGrid.vue'
import RecipeSteps from '@/components/recipe/RecipeSteps.vue'
import TagChip from '@/components/common/TagChip.vue'
import { getRecipeDetailData } from '@/services/mock'

const recipe = ref<RecipeDetail>()

onMounted(async () => {
  recipe.value = await getRecipeDetailData()
})
</script>

<template>
  <view class="recipe-page" v-if="recipe">
    <AppNavBar title="食谱详情" @back="uni.navigateBack()" right-text="♡" />

    <image class="hero-image" :src="recipe.heroImage" mode="aspectFill" />

    <view class="content-shell">
      <view class="title-block">
        <view class="tag-row">
          <TagChip :text="recipe.ageLabel" accent="secondary" />
          <TagChip v-for="tag in recipe.tags" :key="tag" :text="tag" accent="primary" />
        </view>
        <text class="recipe-title">{{ recipe.title }}</text>
        <text class="recipe-desc">{{ recipe.description }}</text>
      </view>

      <RecipeMetaGrid :recipe="recipe" />

      <view class="section">
        <text class="section-title">食材清单</text>
        <view class="ingredient-list">
          <view v-for="ingredient in recipe.ingredients" :key="ingredient.id" class="ingredient-card card">
            <text class="ingredient-name">{{ ingredient.name }}</text>
            <text class="ingredient-amount">{{ ingredient.amount }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">制作步骤</text>
        <RecipeSteps :steps="recipe.steps" />
      </view>

      <view class="section">
        <text class="section-title">营养小贴士</text>
        <view class="tips-card soft-card">
          <text v-for="tip in recipe.nutritionTips" :key="tip" class="tip-item">• {{ tip }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">关联推荐</text>
        <view class="related-list">
          <view v-for="item in recipe.relatedRecipes" :key="item.id" class="related-card card">
            <image class="related-image" :src="item.image" mode="aspectFill" />
            <view class="related-main">
              <text class="related-title">{{ item.title }}</text>
              <text class="related-meta">{{ item.tags.join(' · ') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="fixed-bottom-actions">
      <view class="bottom-mini-btn">收藏</view>
      <view class="bottom-mini-btn">分享</view>
      <view class="bottom-mini-btn primary">加入计划</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.recipe-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FDF8F3 0%, #FBF5EF 100%);
}

.hero-image {
  width: 100%;
  height: 560rpx;
}

.content-shell {
  padding: 0 32rpx 200rpx;
  margin-top: -36rpx;
}

.title-block {
  padding: 30rpx;
  border-radius: 36rpx;
  background: rgba(253, 248, 243, 0.96);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.recipe-title {
  display: block;
  margin-top: 18rpx;
  font-size: 44rpx;
  line-height: 1.4;
  font-weight: 700;
}

.recipe-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.section {
  margin-top: 28rpx;
}

.ingredient-list,
.related-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.ingredient-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx;
}

.ingredient-name {
  font-size: 26rpx;
  font-weight: 700;
}

.ingredient-amount {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.tips-card {
  margin-top: 16rpx;
  padding: 26rpx;
}

.tip-item {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-secondary-deep);
}

.related-card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
}

.related-image {
  width: 170rpx;
  height: 132rpx;
  border-radius: 22rpx;
}

.related-main {
  flex: 1;
}

.related-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.related-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.bottom-mini-btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 24rpx;
  background: rgba(255,255,255,0.88);
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.bottom-mini-btn.primary {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}
</style>
