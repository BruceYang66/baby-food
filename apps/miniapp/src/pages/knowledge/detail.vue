<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { KnowledgeArticleDetail } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getKnowledgeArticleDetail } from '@/services/api'

const articleId = ref('')
const article = ref<KnowledgeArticleDetail>()
const loading = ref(false)

async function loadArticle() {
  if (!articleId.value) {
    return
  }

  loading.value = true

  try {
    article.value = await getKnowledgeArticleDetail(articleId.value)
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '文章加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function openRelatedArticle(id: string) {
  uni.navigateTo({
    url: `/pages/knowledge/detail?id=${id}`
  })
}

function handleBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({
      fail: () => {
        // 返回失败时，尝试跳转到知识页
        uni.switchTab({
          url: '/pages/knowledge/index',
          fail: () => {
            // 如果 switchTab 失败，使用 reLaunch
            uni.reLaunch({ url: '/pages/home/index' })
          }
        })
      }
    })
  } else {
    // 只有一个页面时，跳转到知识页
    uni.switchTab({
      url: '/pages/knowledge/index',
      fail: () => {
        uni.reLaunch({ url: '/pages/home/index' })
      }
    })
  }
}

onLoad((options) => {
  if (options?.id) {
    articleId.value = options.id
    loadArticle()
  }
})

onShareAppMessage(() => ({
  title: article.value?.title || '干货百科',
  path: `/pages/knowledge/detail?id=${articleId.value}`
}))

onShareTimeline(() => ({
  title: article.value?.title || '干货百科'
}))
</script>

<template>
  <view class="page-shell detail-page">
    <AppNavBar :title="article?.categoryLabel || '干货详情'" :show-back="true" @back="handleBack" />

    <view v-if="article" class="article-content">
      <!-- 封面图 -->
      <image v-if="article.image" class="cover-image" :src="article.image" mode="aspectFill" />

      <!-- 文章头部 -->
      <view class="article-header">
        <view class="category-badge">{{ article.categoryLabel }}</view>
        <text class="article-title">{{ article.title }}</text>
        <text class="article-subtitle">{{ article.subtitle }}</text>
        <view class="article-tags">
          <text v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>

      <!-- 文章摘要 -->
      <view class="article-summary">
        <text class="summary-text">{{ article.summary }}</text>
      </view>

      <!-- 详细段落 -->
      <view v-if="article.sections && article.sections.length > 0" class="article-sections">
        <view v-for="section in article.sections" :key="section.id" class="section">
          <text v-if="section.title" class="section-title">{{ section.title }}</text>
          <text class="section-content">{{ section.content }}</text>

          <!-- 段落图片 -->
          <view v-if="section.images && section.images.length > 0" class="section-images">
            <image
              v-for="(img, idx) in section.images"
              :key="idx"
              class="section-image"
              :src="img"
              mode="widthFix"
            />
          </view>
        </view>
      </view>

      <!-- 相关文章 -->
      <view v-if="article.relatedArticles && article.relatedArticles.length > 0" class="related-section">
        <text class="section-header">相关推荐</text>
        <view class="related-list">
          <view
            v-for="related in article.relatedArticles"
            :key="related.id"
            class="related-card card"
            @tap="openRelatedArticle(related.id)"
          >
            <image v-if="related.image" class="related-image" :src="related.image" mode="aspectFill" />
            <view class="related-main">
              <text class="related-title">{{ related.title }}</text>
              <text class="related-summary">{{ related.summary }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.detail-page {
  padding-bottom: 80rpx;
}

.article-content {
  padding: 0;
}

.cover-image {
  width: 100%;
  height: 400rpx;
  display: block;
}

.article-header {
  padding: 32rpx;
  background: var(--mini-surface);
}

.category-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: var(--mini-secondary-container);
  color: var(--mini-secondary-deep);
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
}

.article-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.4;
  color: var(--mini-text);
  margin-bottom: 12rpx;
}

.article-subtitle {
  display: block;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
  margin-bottom: 20rpx;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
  font-size: 20rpx;
}

.article-summary {
  padding: 28rpx 32rpx;
  margin: 16rpx 32rpx;
  border-radius: 20rpx;
  background: var(--mini-secondary-container);
}

.summary-text {
  display: block;
  font-size: 26rpx;
  line-height: 1.8;
  color: var(--mini-text);
}

.article-sections {
  padding: 0 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 16rpx;
  padding-left: 16rpx;
  border-left: 6rpx solid var(--mini-primary);
}

.section-content {
  display: block;
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--mini-text);
  white-space: pre-wrap;
  margin-bottom: 20rpx;
}

.section-images {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-image {
  width: 100%;
  border-radius: 16rpx;
  overflow: hidden;
}

.related-section {
  margin-top: 48rpx;
  padding: 32rpx;
  background: var(--mini-surface-container-low);
}

.section-header {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 24rpx;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.related-card {
  display: flex;
  gap: 20rpx;
  overflow: hidden;
}

.related-image {
  width: 180rpx;
  height: 120rpx;
  flex-shrink: 0;
  border-radius: 12rpx;
}

.related-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.related-title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
  line-height: 1.4;
}

.related-summary {
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.loading-state {
  padding: 100rpx 32rpx;
  text-align: center;
}

.loading-text {
  font-size: 26rpx;
  color: var(--mini-text-muted);
}
</style>
