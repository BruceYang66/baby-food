<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { RecipeDetail } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import RecipeMetaGrid from '@/components/recipe/RecipeMetaGrid.vue'
import RecipeSteps from '@/components/recipe/RecipeSteps.vue'
import TagChip from '@/components/common/TagChip.vue'
import { getRecipeDetailData, normalizeAppImageUrl, openProtectedPage, readFavoriteRecipeIds, addFavorite, removeFavorite } from '@/services/api'

const PENDING_RECIPE_KEY = 'pendingPlanRecipe'
const PREVIEW_STORAGE_KEY = 'adminRecipePreview'

const recipe = ref<RecipeDetail>()
const loading = ref(false)
const favoriteIds = ref<string[]>([])
const isPreview = ref(false)

function goRecipe(id: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${id}` })
}

function readPreviewRecipe() {
  const preview = uni.getStorageSync(PREVIEW_STORAGE_KEY) as RecipeDetail | undefined
  if (preview && typeof preview === 'object' && typeof preview.title === 'string') {
    recipe.value = preview
    isPreview.value = true
    return true
  }
  return false
}

function loadRecipe(recipeId: string) {
  loading.value = true

  getRecipeDetailData(recipeId)
    .then((data) => {
      recipe.value = data
    })
    .catch((error) => {
      uni.showToast({
        title: error instanceof Error ? error.message : '食谱读取失败',
        icon: 'none'
      })
    })
    .finally(() => {
      loading.value = false
    })
}

onLoad((options) => {
  favoriteIds.value = readFavoriteRecipeIds()

  if (options?.preview === 'admin' && readPreviewRecipe()) {
    return
  }

  const recipeId = typeof options?.id === 'string' ? options.id : ''
  if (recipeId) {
    loadRecipe(recipeId)
    return
  }

  uni.showToast({ title: '缺少食谱编号', icon: 'none' })
})

async function toggleFavorite() {
  if (!recipe.value || isPreview.value) {
    return
  }

  const id = recipe.value.id
  const exists = favoriteIds.value.includes(id)
  favoriteIds.value = exists
    ? favoriteIds.value.filter((item) => item !== id)
    : [...favoriteIds.value, id]

  try {
    if (exists) {
      await removeFavorite(id)
    } else {
      await addFavorite(id)
    }
    uni.showToast({ title: exists ? '已取消收藏' : '已收藏', icon: 'success' })
  } catch {
    favoriteIds.value = exists
      ? [...favoriteIds.value, id]
      : favoriteIds.value.filter((item) => item !== id)
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

function shareRecipe() {
  if (isPreview.value) {
    return
  }

  uni.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })
  uni.showToast({ title: '点击右上角 ··· 转发', icon: 'none', duration: 1500 })
}

onShareAppMessage(() => ({
  title: recipe.value?.title ?? '宝宝辅食食谱',
  path: isPreview.value ? '/pages/home/index' : (recipe.value ? `/pages/recipe-detail/index?id=${recipe.value.id}` : '/pages/guide/index')
}))

onShareTimeline(() => ({
  title: recipe.value?.title ?? '宝宝辅食食谱'
}))

function addToPlan() {
  if (!recipe.value || isPreview.value) {
    return
  }

  uni.setStorageSync(PENDING_RECIPE_KEY, {
    id: recipe.value.id,
    title: recipe.value.title,
    image: recipe.value.image,
    tags: recipe.value.tags
  })

  if (!openProtectedPage('/pages/generate/index')) {
    uni.removeStorageSync(PENDING_RECIPE_KEY)
  }
}
</script>

<template>
  <view class="recipe-page" v-if="recipe">
    <AppNavBar :title="isPreview ? '食谱预览' : '食谱详情'" :show-back="true" :right-text="isPreview ? '' : (favoriteIds.includes(recipe.id) ? '♥' : '♡')" @right="toggleFavorite" />

    <image class="hero-image" :src="normalizeAppImageUrl(recipe.heroImage)" mode="aspectFill" />

    <view class="content-shell">
      <view v-if="isPreview" class="preview-banner soft-card">
        <text class="preview-title">当前是预览效果</text>
        <text class="preview-desc">返回编辑页后可继续修改，再次查看会覆盖这份预览内容。</text>
      </view>

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

      <view v-if="recipe.relatedRecipes.length" class="section">
        <text class="section-title">关联推荐</text>
        <view class="related-list">
          <view v-for="item in recipe.relatedRecipes" :key="item.id" class="related-card card" @tap="goRecipe(item.id)">
            <image class="related-image" :src="normalizeAppImageUrl(item.image)" mode="aspectFill" />
            <view class="related-main">
              <text class="related-title">{{ item.title }}</text>
              <text class="related-meta">{{ item.tags.join(' · ') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!isPreview" class="fixed-bottom-actions">
      <view class="bottom-mini-btn" @tap="toggleFavorite">{{ favoriteIds.includes(recipe.id) ? '已收藏' : '收藏' }}</view>
      <view class="bottom-mini-btn" @tap="shareRecipe">分享</view>
      <view class="bottom-mini-btn primary" @tap="addToPlan">加入计划</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.recipe-page {
  min-height: 100vh;
  padding-top: calc(constant(safe-area-inset-top));
  padding-top: calc(env(safe-area-inset-top));
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

.preview-banner {
  padding: 24rpx 26rpx;
  margin-bottom: 18rpx;
}

.preview-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.preview-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
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
