<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { AdminKnowledgeArticleRow } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import TagChip from '@/components/common/TagChip.vue'
import { getAppAdminKnowledgeList, normalizeAppImageUrl, readAuthSession, syncAppSession } from '@/services/api'

const rows = ref<AdminKnowledgeArticleRow[]>([])
const loading = ref(false)
const activeCategory = ref('')
const activeStatus = ref<AdminKnowledgeArticleRow['contentStatus'] | ''>('')
const searchKeyword = ref('')

const categories = [
  { key: '', label: '全部分类' },
  { key: 'feeding', label: '月龄喂养' },
  { key: 'health', label: '健康护理' },
  { key: 'nutrition', label: '营养知识' },
  { key: 'development', label: '成长发育' },
  { key: 'safety', label: '安全防护' }
]

const statusOptions: Array<{ value: AdminKnowledgeArticleRow['contentStatus'] | ''; label: string }> = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'pending_review', label: '待审核' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下架' },
  { value: 'trash', label: '已删除' }
]

const filteredRows = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    const matchesCategory = !activeCategory.value || item.categoryKey === activeCategory.value
    const matchesStatus = !activeStatus.value || item.contentStatus === activeStatus.value
    const matchesKeyword = !keyword
      || item.title.toLowerCase().includes(keyword)
      || item.subtitle.toLowerCase().includes(keyword)
      || item.summary.toLowerCase().includes(keyword)
      || item.tags.some((tag) => tag.toLowerCase().includes(keyword))
    return matchesCategory && matchesStatus && matchesKeyword
  })
})

const totalLabel = computed(() => {
  if (!rows.value.length) {
    return '新增与编辑干货文章'
  }
  return `筛选 ${filteredRows.value.length} / 全部 ${rows.value.length}`
})

async function ensureAdminAccess() {
  const session = readAuthSession()
  if (!session?.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }

  if (session.canAppAdmin) {
    return true
  }

  const refreshedSession = await syncAppSession()
  if (!refreshedSession) {
    uni.showToast({ title: '权限校验失败，请稍后重试', icon: 'none' })
    return false
  }

  if (refreshedSession.canAppAdmin) {
    return true
  }

  uni.showToast({ title: '当前账号无内容管理权限', icon: 'none' })
  uni.navigateBack({ delta: 1 })
  return false
}

async function loadRows() {
  if (!await ensureAdminAccess()) return
  loading.value = true
  try {
    rows.value = await getAppAdminKnowledgeList()
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '干货读取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  const query = activeCategory.value ? `?categoryKey=${encodeURIComponent(activeCategory.value)}` : ''
  uni.navigateTo({ url: `/pages/admin/knowledge/editor${query}` })
}

function openEdit(id: string) {
  uni.navigateTo({ url: `/pages/admin/knowledge/editor?id=${id}` })
}

function getStatusAccent(status: AdminKnowledgeArticleRow['contentStatus']) {
  if (status === 'published') return 'secondary'
  if (status === 'pending_review') return 'warning'
  if (status === 'offline' || status === 'trash') return 'danger'
  return 'neutral'
}

function getStatusLabel(status: AdminKnowledgeArticleRow['contentStatus']) {
  if (status === 'published') return '已发布'
  if (status === 'pending_review') return '待审核'
  if (status === 'offline') return '已下架'
  if (status === 'trash') return '已删除'
  return '草稿'
}

function clearSearch() {
  searchKeyword.value = ''
}

onShow(() => {
  void loadRows()
})
</script>

<template>
  <view class="page-shell admin-list-page">
    <AppNavBar title="干货管理" :subtitle="totalLabel" :show-back="true" />

    <view class="hero-card soft-card">
      <text class="hero-kicker">内容运营</text>
      <text class="hero-title">按标题、标签、状态和分类快速定位文章</text>
      <text class="hero-desc">轻点卡片即可进入编辑，右下角可以随时新增一篇内容。</text>
    </view>

    <view class="search-box soft-card">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input v-model="searchKeyword" class="search-input" type="text" placeholder="搜索标题、副标题、摘要或标签" placeholder-class="search-placeholder" />
        <text v-if="searchKeyword" class="clear-icon" @tap="clearSearch">✕</text>
      </view>
    </view>

    <scroll-view scroll-x class="chip-scroll" show-scrollbar="false">
      <view class="chip-row chips-nowrap">
        <view
          v-for="category in categories"
          :key="category.key || 'all'"
          class="chip"
          :class="{ active: activeCategory === category.key }"
          @tap="activeCategory = category.key"
        >
          {{ category.label }}
        </view>
      </view>
    </scroll-view>

    <scroll-view scroll-x class="chip-scroll compact" show-scrollbar="false">
      <view class="chip-row chips-nowrap">
        <view
          v-for="status in statusOptions"
          :key="status.label"
          class="chip muted-chip"
          :class="{ active: activeStatus === status.value }"
          @tap="activeStatus = status.value"
        >
          {{ status.label }}
        </view>
      </view>
    </scroll-view>

    <view v-if="loading" class="soft-card state-card">加载中...</view>
    <view v-else-if="!rows.length" class="soft-card state-card">当前分类还没有内容，点击右下角新增第一篇干货。</view>
    <view v-else-if="!filteredRows.length" class="soft-card state-card">当前没有符合筛选条件的文章。</view>

    <view v-else class="list-wrap">
      <view v-for="item in filteredRows" :key="item.id" class="card article-card" @tap="openEdit(item.id)">
        <image v-if="item.coverImage" class="article-image" :src="normalizeAppImageUrl(item.coverImage)" mode="aspectFill" />
        <view v-else class="article-placeholder">📄</view>

        <view class="article-main">
          <view class="meta-head">
            <text class="category-label">{{ item.categoryLabel }}</text>
            <TagChip :text="getStatusLabel(item.contentStatus)" :accent="getStatusAccent(item.contentStatus)" />
          </view>

          <text class="article-title">{{ item.title }}</text>
          <text class="article-subtitle">{{ item.subtitle }}</text>
          <text class="article-summary">{{ item.summary || '暂未填写摘要' }}</text>

          <view v-if="item.tags.length" class="tag-row">
            <TagChip v-for="tag in item.tags.slice(0, 4)" :key="tag" :text="tag" accent="primary" />
          </view>

          <view class="foot-row">
            <text class="foot-text">{{ item.contentType }}</text>
            <text class="foot-text">{{ item.updatedAt }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="fab" @tap="openCreate">＋</view>
  </view>
</template>

<style scoped lang="scss">
.admin-list-page {
  padding-bottom: 240rpx;
}

.hero-card {
  margin-top: 18rpx;
  padding: 28rpx;
}

.hero-kicker,
.hero-desc,
.foot-text,
.article-subtitle,
.article-summary,
.category-label {
  color: var(--mini-text-muted);
}

.hero-kicker,
.category-label {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
}

.hero-title {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-desc,
.article-subtitle,
.article-summary {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
}

.search-box {
  margin-top: 18rpx;
  padding: 18rpx;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  padding: 0 24rpx;
}

.search-icon,
.clear-icon {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.search-input {
  flex: 1;
  height: 80rpx;
  font-size: 26rpx;
}

.chip-scroll {
  margin-top: 18rpx;
  white-space: nowrap;
}

.chip-scroll.compact {
  margin-top: 12rpx;
}

.chips-nowrap {
  flex-wrap: nowrap;
  padding-bottom: 6rpx;
}

.muted-chip:not(.active) {
  background: rgba(255, 255, 255, 0.82);
  color: var(--mini-text-muted);
}

.state-card {
  margin-top: 22rpx;
  padding: 40rpx 28rpx;
  text-align: center;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.list-wrap {
  margin-top: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.article-card {
  overflow: hidden;
}

.article-image,
.article-placeholder {
  width: 100%;
  height: 280rpx;
  display: block;
}

.article-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.14), rgba(168, 230, 207, 0.18));
  font-size: 72rpx;
}

.article-main {
  padding: 24rpx;
}

.meta-head,
.foot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.article-title {
  display: block;
  margin-top: 14rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.foot-row {
  margin-top: 18rpx;
}

.foot-text {
  font-size: 22rpx;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  width: 104rpx;
  height: 104rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 54rpx;
  line-height: 1;
  box-shadow: var(--mini-shadow-soft);
}
</style>
