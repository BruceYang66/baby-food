<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { RecipeAdminRow } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import TagChip from '@/components/common/TagChip.vue'
import { getAppAdminRecipes, normalizeAppImageUrl, readAuthSession, syncAppSession } from '@/services/api'

const rows = ref<RecipeAdminRow[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const activeStatus = ref<RecipeAdminRow['contentStatus'] | ''>('')

const statusOptions: Array<{ value: RecipeAdminRow['contentStatus'] | ''; label: string }> = [
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
    const matchesStatus = !activeStatus.value || item.contentStatus === activeStatus.value
    const matchesKeyword = !keyword
      || item.title.toLowerCase().includes(keyword)
      || item.tags.some((tag) => tag.toLowerCase().includes(keyword))
      || item.ageLabel.toLowerCase().includes(keyword)
    return matchesStatus && matchesKeyword
  })
})

const totalLabel = computed(() => {
  if (!rows.value.length) {
    return '管理新增与编辑食谱内容'
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
    rows.value = await getAppAdminRecipes()
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '食谱读取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  uni.navigateTo({ url: '/pages/admin/recipes/editor' })
}

function openEdit(id: string) {
  uni.navigateTo({ url: `/pages/admin/recipes/editor?id=${id}` })
}

function getStatusAccent(status: RecipeAdminRow['contentStatus']) {
  if (status === 'published') return 'secondary'
  if (status === 'pending_review') return 'warning'
  if (status === 'offline' || status === 'trash') return 'danger'
  return 'neutral'
}

function getStatusLabel(status: RecipeAdminRow['contentStatus']) {
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
    <AppNavBar title="食谱管理" :subtitle="totalLabel" :show-back="true" />

    <view class="hero-card card">
      <text class="hero-kicker">内容运营</text>
      <text class="hero-title">按标题、状态快速定位，再继续修改内容</text>
      <text class="hero-desc">整卡点击可直接进入编辑，适合快速调整封面、标签与步骤。</text>
    </view>

    <view class="search-box soft-card">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input v-model="searchKeyword" class="search-input" type="text" placeholder="搜索食谱名称、标签或月龄" placeholder-class="search-placeholder" />
        <text v-if="searchKeyword" class="clear-icon" @tap="clearSearch">✕</text>
      </view>
    </view>

    <scroll-view scroll-x class="chip-scroll" show-scrollbar="false">
      <view class="chip-row chips-nowrap">
        <view
          v-for="status in statusOptions"
          :key="status.label"
          class="chip"
          :class="{ active: activeStatus === status.value }"
          @tap="activeStatus = status.value"
        >
          {{ status.label }}
        </view>
      </view>
    </scroll-view>

    <view v-if="loading" class="soft-card state-card">加载中...</view>
    <view v-else-if="!rows.length" class="soft-card state-card">还没有食谱，点击右下角新增第一道内容。</view>
    <view v-else-if="!filteredRows.length" class="soft-card state-card">当前没有符合筛选条件的食谱。</view>

    <view v-else class="list-wrap">
      <view v-for="item in filteredRows" :key="item.id" class="card list-item" @tap="openEdit(item.id)">
        <image v-if="item.cover" class="cover-image" :src="normalizeAppImageUrl(item.cover)" mode="aspectFill" />
        <view v-else class="cover-placeholder">🥣</view>

        <view class="item-main">
          <view class="top-row">
            <text class="title">{{ item.title }}</text>
            <text class="hint">编辑 ›</text>
          </view>

          <view class="meta-row">
            <text class="meta">{{ item.ageLabel }}</text>
            <TagChip :text="getStatusLabel(item.contentStatus)" :accent="getStatusAccent(item.contentStatus)" />
          </view>

          <view v-if="item.tags.length" class="tag-row">
            <TagChip v-for="tag in item.tags.slice(0, 4)" :key="tag" :text="tag" accent="primary" />
          </view>
          <text v-else class="empty-tags">暂未设置标签</text>

          <view class="foot-row">
            <text class="meta">收藏 {{ item.favorites }}</text>
            <text class="meta">{{ item.updatedAt }}</text>
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
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.2), rgba(255, 255, 255, 0.96));
}

.hero-kicker,
.hero-desc,
.meta,
.empty-tags,
.hint {
  color: var(--mini-text-muted);
}

.hero-kicker {
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

.hero-desc {
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

.chips-nowrap {
  flex-wrap: nowrap;
  padding-bottom: 6rpx;
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

.list-item {
  overflow: hidden;
}

.cover-image,
.cover-placeholder {
  width: 100%;
  height: 280rpx;
  display: block;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.18), rgba(168, 230, 207, 0.16));
  font-size: 72rpx;
}

.item-main {
  padding: 24rpx;
}

.top-row,
.meta-row,
.foot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.title {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hint,
.meta,
.empty-tags {
  font-size: 22rpx;
}

.meta-row,
.foot-row {
  margin-top: 14rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
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
