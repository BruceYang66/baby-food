<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { KnowledgeArticleDetail } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import BackToTopFab from '@/components/common/BackToTopFab.vue'
import { useBackToTop } from '@/composables/useBackToTop'
import { getKnowledgeArticleDetail, normalizeAppImageUrl } from '@/services/api'

const PREVIEW_STORAGE_KEY = 'adminKnowledgePreview'

const articleId = ref('')
const article = ref<KnowledgeArticleDetail>()
const loading = ref(false)
const isPreview = ref(false)
const { showBackToTop, handlePageScroll, scrollPageToTop } = useBackToTop()

function resolveSectionImages(section: NonNullable<KnowledgeArticleDetail['sections']>[number]) {
  if (section.imageItems && section.imageItems.length > 0) {
    return section.imageItems
  }
  return section.images.map((url) => ({ url, style: 'rounded' as const, aspectRatio: 'wide' as const }))
}

function getSectionLayoutType(section: NonNullable<KnowledgeArticleDetail['sections']>[number]) {
  return section.layout?.type ?? 'stack'
}

function getSectionGridClass(section: NonNullable<KnowledgeArticleDetail['sections']>[number]) {
  return section.layout?.type === 'grid' && section.layout.columns === 3 ? 'layout-grid-3' : ''
}

function readPreviewArticle() {
  const preview = uni.getStorageSync(PREVIEW_STORAGE_KEY) as KnowledgeArticleDetail | undefined
  if (preview && typeof preview === 'object' && typeof preview.title === 'string') {
    article.value = preview
    isPreview.value = true
    return true
  }
  return false
}

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
        uni.switchTab({
          url: '/pages/knowledge/index',
          fail: () => {
            uni.reLaunch({ url: '/pages/home/index' })
          }
        })
      }
    })
  } else {
    uni.switchTab({
      url: '/pages/knowledge/index',
      fail: () => {
        uni.reLaunch({ url: '/pages/home/index' })
      }
    })
  }
}

onPageScroll(({ scrollTop }) => {
  handlePageScroll(scrollTop)
})

onLoad((options) => {
  if (options?.preview === 'admin' && readPreviewArticle()) {
    return
  }

  if (options?.id) {
    articleId.value = options.id
    void loadArticle()
  }
})

onShareAppMessage(() => ({
  title: article.value?.title || '干货百科',
  path: isPreview.value ? '/pages/home/index' : `/pages/knowledge/detail?id=${articleId.value}`
}))

onShareTimeline(() => ({
  title: article.value?.title || '干货百科'
}))
</script>

<template>
  <view class="page-shell detail-page">
    <AppNavBar :title="isPreview ? '干货预览' : (article?.categoryLabel || '干货详情')" :show-back="true" @back="handleBack" />

    <view v-if="article" class="article-content">
      <view v-if="isPreview" class="preview-banner soft-card">
        <text class="preview-title">当前是预览效果</text>
        <text class="preview-desc">返回编辑页后可继续修改，再次查看会覆盖这份预览内容。</text>
      </view>

      <image v-if="article.image" class="cover-image" :src="normalizeAppImageUrl(article.image)" mode="aspectFill" />

      <view class="article-header">
        <view class="category-badge">{{ article.categoryLabel }}</view>
        <text class="article-title">{{ article.title }}</text>
        <text class="article-subtitle">{{ article.subtitle }}</text>
        <view class="article-tags">
          <text v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>

      <view class="article-summary">
        <text class="summary-text">{{ article.summary }}</text>
      </view>

      <view v-if="article.content" class="article-sections intro-shell">
        <view class="section">
          <text class="section-title">正文导语</text>
          <text class="section-content">{{ article.content }}</text>
        </view>
      </view>

      <view v-if="article.sections && article.sections.length > 0" class="article-sections">
        <view v-for="section in article.sections" :key="section.id" class="section">
          <text v-if="section.title" class="section-title">{{ section.title }}</text>
          <text class="section-content">{{ section.content }}</text>

          <scroll-view
            v-if="resolveSectionImages(section).length > 0 && getSectionLayoutType(section) === 'carousel'"
            scroll-x
            class="section-images layout-carousel"
          >
            <view
              v-for="(image, idx) in resolveSectionImages(section)"
              :key="idx"
              class="section-image-shell carousel-item"
              :class="[`image-${image.aspectRatio ?? 'wide'}`, image.style === 'square' ? 'is-square' : 'is-rounded']"
            >
              <image class="section-image" :src="normalizeAppImageUrl(image.url)" mode="aspectFill" />
            </view>
          </scroll-view>

          <view
            v-else-if="resolveSectionImages(section).length > 0"
            class="section-images"
            :class="[`layout-${getSectionLayoutType(section)}`, getSectionGridClass(section)]"
          >
            <view
              v-for="(image, idx) in resolveSectionImages(section)"
              :key="idx"
              class="section-image-shell"
              :class="[`image-${image.aspectRatio ?? 'wide'}`, image.style === 'square' ? 'is-square' : 'is-rounded']"
            >
              <image class="section-image" :src="normalizeAppImageUrl(image.url)" mode="aspectFill" />
            </view>
          </view>
        </view>
      </view>

      <view v-if="article.relatedArticles && article.relatedArticles.length > 0" class="related-section">
        <text class="section-header">相关推荐</text>
        <view class="related-list">
          <view
            v-for="related in article.relatedArticles"
            :key="related.id"
            class="related-card card"
            @tap="openRelatedArticle(related.id)"
          >
            <image v-if="related.image" class="related-image" :src="normalizeAppImageUrl(related.image)" mode="aspectFill" />
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

    <BackToTopFab :visible="showBackToTop" @tap="scrollPageToTop" />
  </view>
</template>

<style scoped lang="scss">
.detail-page {
  padding-bottom: 80rpx;
}

.article-content {
  padding: 0;
}

.preview-banner {
  margin-top: 18rpx;
  margin-bottom: 18rpx;
  padding: 24rpx 26rpx;
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
  background: rgba(168, 230, 207, 0.3);
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
  background: rgba(168, 230, 207, 0.18);
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

.intro-shell {
  margin-top: 10rpx;
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
  gap: 16rpx;
}

.section-images.layout-stack {
  display: flex;
  flex-direction: column;
}

.section-images.layout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-images.layout-grid.layout-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.section-images.layout-carousel {
  white-space: nowrap;
}

.section-image-shell {
  overflow: hidden;
}

.section-image-shell.is-rounded {
  border-radius: 16rpx;
}

.section-image-shell.is-square {
  border-radius: 0;
}

.section-image-shell.image-wide {
  height: 320rpx;
}

.section-image-shell.image-square {
  height: 240rpx;
}

.section-image-shell.image-portrait {
  height: 420rpx;
}

.carousel-item {
  display: inline-block;
  width: 360rpx;
  margin-right: 16rpx;
  vertical-align: top;
}

.section-image {
  width: 100%;
  height: 100%;
  display: block;
}

.related-section {
  margin-top: 48rpx;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.7);
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
