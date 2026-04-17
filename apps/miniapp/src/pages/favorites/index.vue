<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FavoriteRecipeItem, FavoriteKnowledgeItem } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getFavoritesPageData, removeFavorite as removeFavoriteApi } from '@/services/api'

const recipes = ref<FavoriteRecipeItem[]>([])
const articles = ref<FavoriteKnowledgeItem[]>([])
const loading = ref(false)

async function loadFavorites() {
  loading.value = true
  try {
    const data = await getFavoritesPageData()
    recipes.value = data.recipes
    articles.value = data.articles
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '收藏读取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goRecipeDetail(recipeId: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${recipeId}` })
}

function goArticleDetail(articleId: string) {
  uni.navigateTo({ url: `/pages/knowledge/index?articleId=${articleId}` })
}

function removeFavorite(recipeId: string) {
  uni.showModal({
    title: '取消收藏',
    content: '确定要取消收藏这道食谱吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeFavoriteApi(recipeId)
          recipes.value = recipes.value.filter((item) => item.recipe.id !== recipeId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
        } catch {
          uni.showToast({ title: '操作失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

onMounted(loadFavorites)
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="我的收藏" subtitle="食谱与干货内容" :show-back="true" />

    <view v-if="!recipes.length && !articles.length && !loading" class="empty-card soft-card">
      <text class="empty-title">还没有收藏内容</text>
      <text class="empty-desc">去食谱详情页或干货文章点一下收藏，这里就会自动同步显示。</text>
    </view>

    <view v-else class="favorites-container">
      <view v-if="recipes.length" class="section">
        <text class="section-title">收藏的食谱</text>
        <view class="recipe-list">
          <view v-for="item in recipes" :key="item.id" class="recipe-card card">
            <image class="recipe-image" :src="item.recipe.image" mode="aspectFill" @tap="goRecipeDetail(item.recipe.id)" />
            <view class="recipe-main" @tap="goRecipeDetail(item.recipe.id)">
              <text class="recipe-title">{{ item.recipe.title }}</text>
              <text class="recipe-meta">{{ item.recipe.ageLabel }} · {{ item.recipe.durationLabel }} · {{ item.recipe.difficultyLabel }}</text>
              <text class="recipe-tags">{{ item.recipe.tags.join(' · ') }}</text>
            </view>
            <view class="recipe-action" @tap="removeFavorite(item.recipe.id)">×</view>
          </view>
        </view>
      </view>

      <view v-if="articles.length" class="section">
        <text class="section-title">收藏的干货</text>
        <view class="article-list">
          <view v-for="item in articles" :key="item.id" class="article-card card" @tap="goArticleDetail(item.article.id)">
            <image v-if="item.article.image" class="article-image" :src="item.article.image" mode="aspectFill" />
            <view class="article-main">
              <text class="article-category">{{ item.article.categoryLabel }}</text>
              <text class="article-title">{{ item.article.title }}</text>
              <text class="article-subtitle">{{ item.article.subtitle }}</text>
              <view class="article-tags">
                <text v-for="tag in item.article.tags" :key="tag" class="article-tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.empty-card {
  margin-top: 24rpx;
  padding: 32rpx;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.favorites-container {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.section {
  margin-top: 24rpx;
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.recipe-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx;
}

.recipe-image {
  width: 180rpx;
  height: 140rpx;
  border-radius: 22rpx;
}

.recipe-main {
  flex: 1;
}

.recipe-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.recipe-meta,
.recipe-tags {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.recipe-action {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(214, 106, 106, 0.12);
  text-align: center;
  line-height: 56rpx;
  font-size: 36rpx;
  color: #a94f4f;
  font-weight: 700;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.article-card {
  overflow: hidden;
}

.article-image {
  width: 100%;
  height: 240rpx;
  display: block;
}

.article-main {
  padding: 24rpx;
}

.article-category {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: var(--mini-secondary-deep);
}

.article-title {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.article-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.article-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}
</style>
