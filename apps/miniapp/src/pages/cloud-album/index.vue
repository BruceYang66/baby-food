<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import type { CloudAlbumEntry, CloudAlbumMonthSummary, CloudAlbumTimelineGroup } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import {
  ensureProtectedPageAccess,
  getCloudAlbumPageData,
  normalizeAppImageUrl,
  openProtectedPage
} from '@/services/api'

const activeView = ref<'timeline' | 'month'>('timeline')
const selectedMonthKey = ref('')
const loading = ref(false)
const totalCount = ref(0)
const babyTitle = ref('云相册')
const babySubtitle = ref('按时间记录宝宝成长瞬间')
const timelineGroups = ref<CloudAlbumTimelineGroup[]>([])
const monthSummaries = ref<CloudAlbumMonthSummary[]>([])

const visibleTimelineGroups = computed(() => {
  if (!selectedMonthKey.value) {
    return timelineGroups.value
  }
  return timelineGroups.value.filter((group) => group.entries.some((entry) => entry.monthKey === selectedMonthKey.value))
})

const selectedMonthLabel = computed(() => {
  const summary = monthSummaries.value.find((item) => item.monthKey === selectedMonthKey.value)
  return summary ? `${summary.year}年${summary.month}月` : ''
})

const monthYearGroups = computed(() => {
  const groups = new Map<number, CloudAlbumMonthSummary[]>()
  monthSummaries.value.forEach((item) => {
    const current = groups.get(item.year) ?? []
    current.push(item)
    groups.set(item.year, current)
  })
  return Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months].sort((a, b) => b.month - a.month)
    }))
})

function formatGroupDateLabel(group: CloudAlbumTimelineGroup) {
  const today = new Date()
  const [yearText = '', monthText = '', dayText = ''] = group.date.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (
    year === today.getFullYear()
    && month === today.getMonth() + 1
    && day === today.getDate()
  ) {
    return '今天'
  }

  if (year !== today.getFullYear()) {
    return `${year}年${month}月${day}日`
  }

  return `${month}月${day}日`
}

function formatEntryRecordedLabel(entry: CloudAlbumEntry) {
  const date = new Date(entry.recordedAt)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

function getAssetGridClass(entry: CloudAlbumEntry) {
  const count = entry.assets.length
  if (count === 1) {
    return 'count-1'
  }
  if (count === 2) {
    return 'count-2'
  }
  if (count === 4) {
    return 'count-4'
  }
  return 'count-many'
}

function openEditor() {
  openProtectedPage('/pages/cloud-album/editor')
}

function openEntryEditor(entryId: string) {
  openProtectedPage(`/pages/cloud-album/editor?entryId=${encodeURIComponent(entryId)}`)
}

function clearMonthFilter() {
  selectedMonthKey.value = ''
}

function focusMonth(summary: CloudAlbumMonthSummary) {
  selectedMonthKey.value = summary.monthKey
  activeView.value = 'timeline'
}

function previewEntryImages(entry: CloudAlbumEntry, currentUrl: string) {
  uni.previewImage({
    current: currentUrl,
    urls: entry.assets.map((asset) => normalizeAppImageUrl(asset.url))
  })
}

async function loadPage() {
  if (!ensureProtectedPageAccess()) {
    return
  }

  loading.value = true
  try {
    const data = await getCloudAlbumPageData()
    totalCount.value = data.totalCount
    timelineGroups.value = data.timelineGroups
    monthSummaries.value = data.monthSummaries
    babyTitle.value = data.babyProfile?.nickname ? `${data.babyProfile.nickname}的云相册` : '云相册'
    babySubtitle.value = data.babyProfile?.monthAgeLabel || '按时间记录宝宝成长瞬间'
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '云相册加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(loadPage)
onShareAppMessage(() => ({ title: '宝宝云相册', path: '/pages/cloud-album/index' }))
onShareTimeline(() => ({ title: '宝宝云相册' }))
</script>

<template>
  <view class="page-shell album-page">
    <AppNavBar :title="babyTitle" :subtitle="babySubtitle" :show-back="true" />

    <view class="hero-card card">
      <view class="hero-copy">
        <text class="hero-kicker">成长记录</text>
        <text class="hero-title">已保存 {{ totalCount }} 张照片</text>
        <text class="hero-desc">按日期时间轴回看成长瞬间，也可以切换到按月汇总快速浏览。</text>
      </view>
      <view class="hero-switcher">
        <view class="switch-chip" :class="{ active: activeView === 'timeline' }" @tap="activeView = 'timeline'">时间轴</view>
        <view class="switch-chip" :class="{ active: activeView === 'month' }" @tap="activeView = 'month'">按月汇总</view>
      </view>
    </view>

    <view v-if="selectedMonthKey && activeView === 'timeline'" class="filter-banner soft-card">
      <view>
        <text class="filter-title">当前筛选：{{ selectedMonthLabel }}</text>
        <text class="filter-desc">查看这个月的全部相册记录</text>
      </view>
      <view class="filter-action" @tap="clearMonthFilter">清除</view>
    </view>

    <view v-if="activeView === 'timeline'" class="timeline-wrap">
      <view v-if="visibleTimelineGroups.length" class="group-list">
        <view v-for="group in visibleTimelineGroups" :key="group.date" class="day-group">
          <view class="day-group-head">
            <view class="day-group-dot" />
            <view class="day-group-main">
              <text class="day-group-title">{{ formatGroupDateLabel(group) }}</text>
              <text v-if="group.ageLabel" class="day-group-age">{{ group.ageLabel }}</text>
            </view>
            <view class="day-group-count-pill">
              <text class="day-group-count">{{ group.count }} 张</text>
            </view>
          </view>

          <view class="entry-list">
            <view v-for="entry in group.entries" :key="entry.id" class="entry-card">
              <view class="media-frame">
                <view v-if="entry.content" class="media-note">
                  <text class="media-note-text">{{ entry.content }}</text>
                </view>

                <view class="asset-grid" :class="getAssetGridClass(entry)">
                  <image
                    v-for="asset in entry.assets"
                    :key="asset.id"
                    class="asset-image"
                    :src="normalizeAppImageUrl(asset.url)"
                    mode="aspectFill"
                    @tap.stop="previewEntryImages(entry, normalizeAppImageUrl(asset.url))"
                  />
                </view>

                <view class="entry-footer">
                  <view class="entry-footer-main">
                    <text class="entry-role">{{ entry.authorRoleLabel || entry.authorName || '家人' }}</text>
                    <text class="entry-time">{{ formatEntryRecordedLabel(entry) }}</text>
                  </view>
                  <view class="entry-footer-side">
                    <text v-if="entry.isMilestone" class="entry-badge warm">大事记</text>
                    <text v-if="entry.visibility === 'self'" class="entry-badge">仅自己</text>
                    <view class="entry-edit" @tap.stop="openEntryEditor(entry.id)">编辑</view>
                  </view>
                </view>
              </view>

              <view v-if="entry.tags.length" class="tag-row">
                <text v-for="tag in entry.tags" :key="tag" class="tag-chip"># {{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-card soft-card">
        <text class="empty-title">还没有相册记录</text>
        <text class="empty-desc">点右下角按钮上传第一组宝宝照片，时间轴会按日期自动归档展示。</text>
      </view>
    </view>

    <view v-else class="month-wrap">
      <view v-if="monthYearGroups.length" class="month-year-list">
        <view v-for="yearGroup in monthYearGroups" :key="yearGroup.year" class="year-section">
          <text class="year-title">{{ yearGroup.year }}年</text>
          <view class="month-list">
            <view v-for="month in yearGroup.months" :key="month.monthKey" class="month-card card" @tap="focusMonth(month)">
              <view class="month-cover-grid">
                <image v-for="(cover, index) in month.coverUrls.slice(0, 4)" :key="`${month.monthKey}-${index}`" class="month-cover" :src="normalizeAppImageUrl(cover)" mode="aspectFill" />
                <view v-if="!month.coverUrls.length" class="month-cover empty">{{ month.month }}月</view>
              </view>
              <view class="month-main">
                <text class="month-title">{{ month.month }}月</text>
                <text class="month-meta">{{ month.count }} 张照片</text>
                <text class="month-meta" v-if="month.milestoneCount">{{ month.milestoneCount }} 条大事记</text>
              </view>
              <text class="month-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-card soft-card">
        <text class="empty-title">还没有月度内容</text>
        <text class="empty-desc">发布照片后，这里会自动按月份为你生成相册汇总。</text>
      </view>
    </view>

    <view class="fab" @tap="openEditor">
      <text class="fab-icon">📷</text>
      <text class="fab-plus">＋</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.album-page {
  padding-bottom: 240rpx;
}

.hero-card,
.filter-banner,
.empty-card,
.month-card {
  margin-top: 20rpx;
}

.hero-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 28rpx 30rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 245, 234, 0.9));
  box-shadow: 0 18rpx 40rpx rgba(138, 81, 8, 0.08);
}

.hero-copy {
  display: flex;
  flex-direction: column;
}

.hero-kicker,
.tag-chip {
  font-size: 20rpx;
  font-weight: 700;
}

.hero-kicker {
  display: inline-flex;
  width: fit-content;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  color: #d46d97;
  background: rgba(255, 105, 156, 0.1);
}

.hero-title,
.empty-title,
.year-title,
.day-group-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-title {
  margin-top: 14rpx;
}

.hero-desc,
.filter-desc,
.empty-desc,
.day-group-age,
.month-meta,
.entry-time,
.media-note-text {
  display: block;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.hero-desc,
.filter-desc,
.empty-desc,
.month-meta {
  margin-top: 10rpx;
}

.hero-switcher {
  display: flex;
  width: fit-content;
  padding: 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 2rpx rgba(138, 81, 8, 0.05);
}

.switch-chip {
  min-width: 140rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.switch-chip.active {
  background: linear-gradient(135deg, rgba(255, 126, 168, 0.18), rgba(255, 91, 147, 0.08));
  color: #d94d86;
  box-shadow: 0 8rpx 18rpx rgba(255, 105, 156, 0.12);
}

.filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 250, 0.94));
}

.filter-title,
.month-title,
.entry-role {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.filter-action {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 105, 156, 0.12);
  color: #d94d86;
  font-size: 22rpx;
  font-weight: 700;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-top: 24rpx;
}

.day-group {
  position: relative;
  padding-left: 30rpx;
}

.day-group::before {
  content: '';
  position: absolute;
  top: 44rpx;
  left: 10rpx;
  bottom: 0;
  width: 2rpx;
  background: linear-gradient(180deg, rgba(255, 105, 156, 0.34), rgba(255, 105, 156, 0.08));
}

.day-group-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.day-group-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 999rpx;
  background: #ff6aa3;
  box-shadow: 0 0 0 8rpx rgba(255, 106, 163, 0.14);
  flex-shrink: 0;
}

.day-group-main {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  flex: 1;
}

.day-group-count-pill {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 105, 156, 0.08);
}

.day-group-count {
  font-size: 22rpx;
  color: #d46d97;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
  margin-top: 18rpx;
  margin-left: 18rpx;
}

.entry-card {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.media-frame {
  overflow: hidden;
  border-radius: 36rpx;
  background: #fff;
  box-shadow: 0 18rpx 40rpx rgba(89, 63, 39, 0.1);
}

.media-note {
  padding: 22rpx 24rpx 16rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 250, 0.94));
}

.media-note-text {
  color: var(--mini-text);
}

.asset-grid {
  display: grid;
  gap: 8rpx;
  padding: 8rpx;
  background: linear-gradient(180deg, rgba(255, 248, 250, 0.9), rgba(247, 239, 230, 0.9));
}

.asset-grid.count-1 {
  grid-template-columns: 1fr;
}

.asset-grid.count-1 .asset-image {
  height: 760rpx;
}

.asset-grid.count-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.asset-grid.count-2 .asset-image {
  height: 360rpx;
}

.asset-grid.count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.asset-grid.count-4 .asset-image {
  height: 260rpx;
}

.asset-grid.count-many {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.asset-grid.count-many .asset-image {
  height: 220rpx;
}

.asset-image {
  width: 100%;
  display: block;
  background: #f8f2ec;
  border-radius: 24rpx;
}

.entry-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 22rpx 20rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 250, 252, 0.96));
  border-top: 2rpx solid rgba(255, 105, 156, 0.06);
}

.entry-footer-main {
  flex: 1;
  min-width: 0;
}

.entry-footer-side,
.tag-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
}

.entry-role {
  color: #202020;
}

.entry-time {
  margin-top: 4rpx;
}

.entry-badge,
.tag-chip {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 105, 156, 0.08);
  color: #d46d97;
}

.entry-badge {
  font-size: 20rpx;
}

.entry-badge.warm {
  background: rgba(255, 179, 102, 0.18);
  color: #8a5108;
}

.entry-edit {
  min-width: 96rpx;
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 105, 156, 0.14);
  color: #d94d86;
  font-size: 20rpx;
  font-weight: 700;
  box-shadow: inset 0 0 0 2rpx rgba(255, 105, 156, 0.08);
}

.month-year-list,
.month-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.year-section + .year-section {
  margin-top: 28rpx;
}

.month-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 250, 0.92));
}

.month-cover-grid {
  width: 160rpx;
  height: 160rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8rpx;
  flex-shrink: 0;
}

.month-cover,
.month-cover.empty {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  background: var(--mini-surface-soft);
}

.month-cover.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mini-text-muted);
  font-size: 24rpx;
}

.month-main {
  flex: 1;
}

.month-arrow {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.fab {
  position: fixed;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 48rpx);
  width: 120rpx;
  height: 120rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8ab2, #ff5b93);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 42rpx rgba(255, 91, 147, 0.26);
}

.fab-icon {
  font-size: 40rpx;
}

.fab-plus {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
