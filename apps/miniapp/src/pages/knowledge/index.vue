<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { KnowledgeArticleSummary, KnowledgePageData } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import { ensureProtectedPageAccess, getKnowledgePageData, openProtectedPage } from '@/services/api'

const activeCategory = ref('all')
const pageData = ref<KnowledgePageData>()
const loading = ref(false)
const searchKeyword = ref('')

const filteredCategories = computed(() => {
  if (!pageData.value?.categories) {
    return []
  }
  // 过滤掉"推荐"和"热点"分类
  return pageData.value.categories.filter((cat) => cat.key !== 'recommended' && cat.key !== 'hot')
})

const visibleArticles = computed(() => {
  if (!pageData.value) {
    return []
  }

  let articles = pageData.value.articles

  // 先按分类过滤
  if (activeCategory.value !== 'all') {
    articles = articles.filter((item) => item.categoryKey === activeCategory.value)
  }

  // 再按搜索关键词过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    articles = articles.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.subtitle.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword))
      )
    })
  }

  return articles
})

async function loadPage() {
  loading.value = true

  try {
    pageData.value = await getKnowledgePageData()

    const validCategories = filteredCategories.value
    if (validCategories && !validCategories.some((item) => item.key === activeCategory.value)) {
      activeCategory.value = 'all'
    }
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '干货百科加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  searchKeyword.value = ''
}

function openArticle(article: KnowledgeArticleSummary) {
  if (article.route === '/pages/plan/index') {
    openProtectedPage(article.route, 'reLaunch')
    return
  }

  // 打开详情页
  uni.navigateTo({
    url: `/pages/knowledge/detail?id=${article.id}`
  })
}

function openGuide() {
  uni.navigateTo({ url: '/pages/guide/index' })
}

function openTaboo() {
  uni.navigateTo({ url: '/pages/taboo/index' })
}

function openFavorites() {
  openProtectedPage('/pages/favorites/index')
}

function openGenerate() {
  openProtectedPage('/pages/generate/index')
}

onShow(loadPage)
onShareAppMessage(() => ({ title: '宝宝干货百科', path: '/pages/knowledge/index' }))
onShareTimeline(() => ({ title: '宝宝干货百科' }))
</script>

<template>
  <view class="page-shell knowledge-page">
    <AppNavBar title="干货百科" subtitle="月龄喂养、病期忌口与经验入口" />

    <view class="search-box">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          type="text"
          placeholder="搜索标题、内容或标签"
          placeholder-class="search-placeholder"
        />
        <text v-if="searchKeyword" class="clear-icon" @tap="clearSearch">✕</text>
      </view>
    </view>

    <scroll-view v-if="pageData" scroll-x class="chip-scroll" show-scrollbar="false">
      <view class="chip-row chips-nowrap">
        <view
          v-for="category in filteredCategories"
          :key="category.key"
          class="chip"
          :class="{ active: activeCategory === category.key }"
          @tap="activeCategory = category.key"
        >
          {{ category.label }}
        </view>
      </view>
    </scroll-view>

    <view class="quick-grid">
      <view class="quick-card soft-card warm" @tap="openGuide">
        <text class="quick-icon">🥣</text>
        <text class="quick-title">月龄指南</text>
        <text class="quick-desc">看当前阶段能吃什么</text>
      </view>
      <view class="quick-card soft-card cool" @tap="openTaboo">
        <text class="quick-icon">🩺</text>
        <text class="quick-title">生病忌口</text>
        <text class="quick-desc">宝宝不舒服时快速查询</text>
      </view>
    </view>

    <view v-if="pageData?.babyProfile" class="context-card soft-card">
      <text class="context-kicker">当前关注</text>
      <text class="context-title">{{ pageData.babyProfile.nickname }} · {{ pageData.babyProfile.monthAgeLabel }}</text>
      <text class="context-desc">建议优先阅读与 {{ pageData.babyProfile.stageLabel }} 相关的月龄喂养节奏，再结合当天状态决定菜单安排。</text>
    </view>

    <view class="section article-section">
      <view class="section-head">
        <text class="section-title">精选内容</text>
        <text class="section-meta">{{ visibleArticles.length }} 条</text>
      </view>
      <view class="article-list">
        <view v-for="article in visibleArticles" :key="article.id" class="article-card card" @tap="openArticle(article)">
          <image v-if="article.image" class="article-image" :src="article.image" mode="aspectFill" />
          <view class="article-main">
            <text class="article-category">{{ article.categoryLabel }}</text>
            <text class="article-title">{{ article.title }}</text>
            <text class="article-subtitle">{{ article.subtitle }}</text>
            <text class="article-summary">{{ article.summary }}</text>
            <view class="article-tags">
              <text v-for="tag in article.tags" :key="tag" class="article-tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="fixed-bottom-actions knowledge-actions">
      <view class="outline-button" @tap="openFavorites">查看收藏</view>
      <view class="primary-button" @tap="openGenerate">生成今日辅食</view>
    </view>

    <AppTabBar active="knowledge" />
  </view>
</template>

<style scoped lang="scss">
.knowledge-page {
  padding-bottom: 300rpx;
}

.hero-card {
  position: relative;
  overflow: hidden;
  margin-top: 20rpx;
  min-height: 360rpx;
}

.hero-image {
  width: 100%;
  height: 360rpx;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32rpx;
  background: linear-gradient(180deg, rgba(29, 27, 25, 0.04), rgba(82, 68, 56, 0.7));
}

.hero-kicker,
.context-kicker,
.article-category {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.hero-kicker {
  width: fit-content;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.hero-title {
  display: block;
  margin-top: 18rpx;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.4;
  color: #fff;
}

.hero-desc,
.context-desc,
.quick-desc,
.article-subtitle,
.article-summary {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.hero-desc {
  color: rgba(255, 255, 255, 0.9);
}

.hero-tags,
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.hero-tag,
.article-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
}

.hero-tag {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.search-box {
  margin-top: 20rpx;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
  background: var(--mini-surface-container-low);
  border-radius: 999rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: var(--mini-text);
  background: transparent;
}

.search-placeholder {
  color: var(--mini-text-muted);
}

.clear-icon {
  font-size: 32rpx;
  padding: 8rpx;
  margin-left: 8rpx;
  color: var(--mini-text-muted);
  opacity: 0.6;
}

.chip-scroll {
  margin-top: 24rpx;
  white-space: nowrap;
}

.chips-nowrap {
  flex-wrap: nowrap;
  width: max-content;
  padding-bottom: 8rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 24rpx;
}

.quick-card {
  padding: 28rpx;
}

.quick-card.warm {
  background: linear-gradient(160deg, rgba(255, 245, 234, 0.96), rgba(255, 255, 255, 0.9));
}

.quick-card.cool {
  background: linear-gradient(160deg, rgba(240, 247, 255, 0.96), rgba(255, 255, 255, 0.9));
}

.quick-icon {
  display: block;
  font-size: 42rpx;
}

.quick-title,
.context-title,
.article-title {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.context-card {
  margin-top: 24rpx;
  padding: 28rpx;
}

.context-kicker {
  color: var(--mini-secondary-deep);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-meta {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.article-section {
  margin-top: 34rpx;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 16rpx;
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
  color: var(--mini-secondary-deep);
}

.article-tag {
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}

.knowledge-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
