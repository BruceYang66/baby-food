<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import type { FavoriteKnowledgeItem, FavoriteRecipeItem, FavoritesPageData } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import {
  ensureProtectedPageAccess,
  getFavoritesPageData,
  normalizeAppImageUrl,
  readFavoriteRecipeIds,
  readFavoritesPageCache
} from '@/services/api'

const activeTab = ref<'recipes' | 'articles'>('recipes')
const loading = ref(false)
const usingCachedData = ref(false)
const favoriteRecipeIds = ref<string[]>(readFavoriteRecipeIds())
const recipeItems = ref<FavoriteRecipeItem[]>([])
const articleItems = ref<FavoriteKnowledgeItem[]>([])

const recipeCount = computed(() => Math.max(recipeItems.value.length, favoriteRecipeIds.value.length))
const articleCount = computed(() => articleItems.value.length)
const totalCount = computed(() => recipeCount.value + articleCount.value)
const showRecipeCacheHint = computed(() => recipeItems.value.length < favoriteRecipeIds.value.length)
const activeList = computed(() => activeTab.value === 'recipes' ? recipeItems.value : articleItems.value)

function applyPageData(data: FavoritesPageData) {
  favoriteRecipeIds.value = data.recipeIds
  recipeItems.value = data.recipes
  articleItems.value = data.articles
}

function formatSavedAt(savedAt: string) {
  const date = new Date(savedAt)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日收藏`
}

function goRecipeDetail(item: FavoriteRecipeItem) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${item.recipe.id}` })
}

function goArticleDetail(item: FavoriteKnowledgeItem) {
  uni.navigateTo({ url: `/pages/knowledge/detail?id=${item.article.id}` })
}

function goRecipeLibrary() {
  uni.navigateTo({ url: '/pages/recipe-list/index' })
}

function goKnowledgeIndex() {
  uni.navigateTo({ url: '/pages/knowledge/index' })
}

async function loadPage() {
  if (!ensureProtectedPageAccess()) {
    return
  }

  const cachedPage = readFavoritesPageCache()
  usingCachedData.value = false

  if (cachedPage) {
    applyPageData(cachedPage)
  } else {
    favoriteRecipeIds.value = readFavoriteRecipeIds()
    recipeItems.value = []
    articleItems.value = []
  }

  loading.value = true

  try {
    const data = await getFavoritesPageData()
    applyPageData(data)
    usingCachedData.value = false
  } catch (error) {
    usingCachedData.value = Boolean(cachedPage || favoriteRecipeIds.value.length)

    if (!usingCachedData.value) {
      uni.showToast({
        title: error instanceof Error ? error.message : '我的收藏加载失败',
        icon: 'none'
      })
    }
  } finally {
    loading.value = false
  }
}

onShow(loadPage)
onShareAppMessage(() => ({ title: '我的收藏', path: '/pages/favorites/index' }))
onShareTimeline(() => ({ title: '我的收藏' }))
</script>

<template>
  <view class="page-shell favorites-page">
    <AppNavBar title="我的收藏" subtitle="收藏的食谱和干货都在这里" :show-back="true" />

    <view class="hero-card card">
      <view class="hero-copy">
        <text class="hero-kicker">随手保存</text>
        <text class="hero-title">已收藏 {{ totalCount }} 条内容</text>
        <text class="hero-desc">常看的辅食食谱和育儿干货集中保留，回看时更快找到。</text>
      </view>
      <view class="hero-stats">
        <view class="stat-pill warm">
          <text class="stat-value">{{ recipeCount }}</text>
          <text class="stat-label">食谱</text>
        </view>
        <view class="stat-pill cool">
          <text class="stat-value">{{ articleCount }}</text>
          <text class="stat-label">干货</text>
        </view>
      </view>
    </view>

    <view v-if="showRecipeCacheHint" class="cache-banner soft-card">
      <text class="cache-title">已缓存 {{ favoriteRecipeIds.length }} 个食谱收藏</text>
      <text class="cache-desc">当前优先展示已同步到本地的内容，联网后会自动补全完整列表。</text>
    </view>

    <view v-else-if="usingCachedData" class="cache-banner soft-card subtle">
      <text class="cache-title">当前展示本地缓存</text>
      <text class="cache-desc">网络恢复后会自动刷新最新收藏内容。</text>
    </view>

    <view class="tab-switcher card">
      <view class="switch-chip" :class="{ active: activeTab === 'recipes' }" @tap="activeTab = 'recipes'">
        食谱收藏
      </view>
      <view class="switch-chip" :class="{ active: activeTab === 'articles' }" @tap="activeTab = 'articles'">
        干货收藏
      </view>
    </view>

    <view v-if="activeTab === 'recipes'" class="section">
      <view v-if="recipeItems.length" class="recipe-list">
        <view v-for="item in recipeItems" :key="item.id" class="recipe-card card" @tap="goRecipeDetail(item)">
          <image class="recipe-image" :src="normalizeAppImageUrl(item.recipe.image)" mode="aspectFill" />
          <view class="recipe-main">
            <view class="recipe-head">
              <text class="recipe-title">{{ item.recipe.title }}</text>
              <text class="saved-at">{{ formatSavedAt(item.savedAt) }}</text>
            </view>
            <text class="recipe-meta">{{ item.recipe.ageLabel }} · {{ item.recipe.durationLabel }} · {{ item.recipe.difficultyLabel }}</text>
            <text class="recipe-desc">{{ item.recipe.description || '收藏后可随时回看这道食谱。' }}</text>
            <view v-if="item.recipe.tags.length" class="tag-row">
              <text v-for="tag in item.recipe.tags.slice(0, 3)" :key="tag" class="tag-chip">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else-if="!loading && showRecipeCacheHint" class="empty-card soft-card">
        <text class="empty-title">收藏详情待同步</text>
        <text class="empty-desc">本地已经记住 {{ favoriteRecipeIds.length }} 个食谱收藏，联网后会补全详细内容。</text>
      </view>
      <view v-else-if="!loading" class="empty-card soft-card">
        <text class="empty-title">还没有收藏食谱</text>
        <text class="empty-desc">看到合适的食谱时点一下收藏，之后就能在这里快速回看。</text>
        <view class="empty-action primary-button" @tap="goRecipeLibrary">去逛食谱库</view>
      </view>
    </view>

    <view v-else class="section">
      <view v-if="articleItems.length" class="article-list">
        <view v-for="item in articleItems" :key="item.id" class="article-card card" @tap="goArticleDetail(item)">
          <image v-if="item.article.image" class="article-image" :src="normalizeAppImageUrl(item.article.image)" mode="aspectFill" />
          <view class="article-main">
            <view class="article-head">
              <text class="article-category">{{ item.article.categoryLabel }}</text>
              <text class="saved-at">{{ formatSavedAt(item.savedAt) }}</text>
            </view>
            <text class="article-title">{{ item.article.title }}</text>
            <text class="article-subtitle">{{ item.article.subtitle }}</text>
            <text class="article-summary">{{ item.article.summary }}</text>
            <view v-if="item.article.tags.length" class="tag-row">
              <text v-for="tag in item.article.tags.slice(0, 3)" :key="tag" class="tag-chip muted">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else-if="!loading" class="empty-card soft-card">
        <text class="empty-title">还没有收藏干货</text>
        <text class="empty-desc">在干货详情页点一下收藏，重要内容就会沉淀在这里。</text>
        <view class="empty-action outline-button" @tap="goKnowledgeIndex">去看干货百科</view>
      </view>
    </view>

    <view v-if="loading && !activeList.length" class="loading-card soft-card">
      <text class="loading-text">正在整理你的收藏...</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.favorites-page {
  padding-bottom: 120rpx;
}

.hero-card,
.cache-banner,
.tab-switcher,
.empty-card,
.loading-card {
  margin-top: 20rpx;
}

.hero-card {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, rgba(255, 248, 240, 0.98), rgba(255, 255, 255, 0.96));
}

.hero-copy {
  display: flex;
  flex-direction: column;
}

.hero-kicker,
.article-category,
.tag-chip,
.saved-at {
  font-size: 20rpx;
}

.hero-kicker {
  display: inline-flex;
  width: fit-content;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.18);
  color: #8a5108;
  font-weight: 700;
}

.hero-title,
.empty-title,
.recipe-title,
.article-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-title {
  margin-top: 14rpx;
}

.hero-desc,
.cache-desc,
.empty-desc,
.recipe-meta,
.recipe-desc,
.article-subtitle,
.article-summary,
.loading-text {
  display: block;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.hero-desc,
.cache-desc,
.empty-desc,
.recipe-desc,
.article-subtitle,
.article-summary {
  margin-top: 10rpx;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.stat-pill {
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
}

.stat-pill.warm {
  background: rgba(255, 179, 102, 0.18);
}

.stat-pill.cool {
  background: rgba(168, 230, 207, 0.22);
}

.stat-value,
.stat-label,
.cache-title,
.recipe-meta,
.article-head,
.empty-action {
  font-weight: 700;
}

.stat-value {
  display: block;
  font-size: 34rpx;
  color: var(--mini-text);
}

.stat-label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.cache-banner,
.loading-card {
  padding: 24rpx 26rpx;
}

.cache-banner {
  background: rgba(255, 248, 236, 0.92);
}

.cache-banner.subtle {
  background: rgba(247, 239, 230, 0.92);
}

.cache-title {
  display: block;
  font-size: 24rpx;
  color: var(--mini-text);
}

.tab-switcher {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  padding: 12rpx;
}

.switch-chip {
  height: 76rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.switch-chip.active {
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.18), rgba(255, 255, 255, 0.96));
  color: var(--mini-primary-deep);
  font-weight: 700;
}

.section {
  margin-top: 20rpx;
}

.recipe-list,
.article-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.recipe-card,
.article-card {
  overflow: hidden;
}

.recipe-card {
  display: flex;
  gap: 20rpx;
  padding: 22rpx;
}

.recipe-image {
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  background: var(--mini-surface-soft);
}

.recipe-main,
.article-main {
  flex: 1;
  min-width: 0;
}

.recipe-head,
.article-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
}

.saved-at {
  flex-shrink: 0;
  color: var(--mini-text-muted);
}

.recipe-meta {
  margin-top: 10rpx;
  color: var(--mini-primary-deep);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
}

.tag-chip {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.16);
  color: #8a5108;
}

.tag-chip.muted {
  background: rgba(168, 230, 207, 0.18);
  color: var(--mini-secondary-deep);
}

.article-card {
  padding: 24rpx;
}

.article-image {
  width: 100%;
  height: 280rpx;
  display: block;
  border-radius: 24rpx;
  background: var(--mini-surface-soft);
  margin-bottom: 20rpx;
}

.article-category {
  color: var(--mini-secondary-deep);
}

.article-subtitle {
  color: var(--mini-text);
}

.empty-card {
  padding: 30rpx;
}

.empty-action {
  margin-top: 24rpx;
}

.loading-card {
  text-align: center;
}
</style>
