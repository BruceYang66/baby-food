<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'
import type { GrowthChangePageData } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import BackToTopFab from '@/components/common/BackToTopFab.vue'
import { useBackToTop } from '@/composables/useBackToTop'
import { getGrowthChangePageData } from '@/services/api'

const weekData = ref<GrowthChangePageData | null>(null)
const loading = ref(false)
const requestedWeekNumber = ref<number>()
const { showBackToTop, handlePageScroll, scrollPageToTop } = useBackToTop()

const weekTabs = computed(() => {
  const centerWeek = weekData.value?.weekNumber ?? requestedWeekNumber.value ?? 1
  const startWeek = Math.max(1, centerWeek - 2)
  return Array.from({ length: 5 }, (_, index) => {
    const weekNumber = startWeek + index
    return {
      weekNumber,
      label: `第${weekNumber}周`,
      isCurrent: weekNumber === weekData.value?.currentWeekNumber,
      isActive: weekNumber === weekData.value?.weekNumber
    }
  })
})

async function loadWeek(weekNumber?: number) {
  loading.value = true

  try {
    weekData.value = await getGrowthChangePageData(weekNumber)
    requestedWeekNumber.value = weekData.value.weekNumber
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '成长变化加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function openWeek(weekNumber: number) {
  if (weekNumber === weekData.value?.weekNumber) {
    return
  }

  void loadWeek(weekNumber)
}

onPageScroll(({ scrollTop }) => {
  handlePageScroll(scrollTop)
})

onLoad((options) => {
  const weekNumber = typeof options?.weekNumber === 'string' ? Number.parseInt(options.weekNumber, 10) : undefined
  requestedWeekNumber.value = Number.isFinite(weekNumber) ? weekNumber : undefined
  void loadWeek(requestedWeekNumber.value)
})
</script>

<template>
  <view class="page-shell growth-change-page">
    <AppNavBar title="宝宝周变化" :show-back="true" />

    <scroll-view scroll-x class="week-tabs" show-scrollbar="false">
      <view class="week-tabs-row">
        <view
          v-for="tab in weekTabs"
          :key="tab.weekNumber"
          class="week-tab"
          :class="{ active: tab.isActive }"
          @tap="openWeek(tab.weekNumber)"
        >
          <text class="week-tab-label">{{ tab.label }}</text>
          <text v-if="tab.isCurrent" class="week-tab-note">当前</text>
        </view>
      </view>
    </scroll-view>

    <template v-if="weekData">
      <view class="hero-card card">
        <view class="hero-head">
          <view class="hero-badge">{{ weekData.weekLabel }}</view>
          <text class="hero-stage">{{ weekData.stageLabel }}</text>
        </view>
        <text class="hero-age">{{ weekData.ageLabel }}</text>
        <text class="hero-range">{{ weekData.dateRangeLabel }}</text>
      </view>

      <view class="overview-card soft-card">
        <view class="section-head">
          <text class="section-icon">🍼</text>
          <text class="section-title">宝宝本周概况</text>
        </view>
        <text class="overview-title">{{ weekData.overviewTitle }}</text>
        <text class="overview-summary">{{ weekData.overviewSummary }}</text>

        <view class="highlight-list">
          <view v-for="highlight in weekData.highlights" :key="highlight" class="highlight-item">
            <view class="highlight-dot" />
            <text class="highlight-text">{{ highlight }}</text>
          </view>
        </view>
      </view>

      <view class="metrics-section">
        <text class="section-title plain">生长发育周围看</text>
        <view class="metrics-grid">
          <view v-for="metric in weekData.metricItems" :key="metric.title" class="metric-card card">
            <text class="metric-title">{{ metric.title }}</text>
            <text class="metric-value">{{ metric.value }}</text>
            <text v-if="metric.note" class="metric-note">{{ metric.note }}</text>
          </view>
        </view>
      </view>

      <view class="timeline-section">
        <text class="section-title plain">每天变化</text>
        <view class="timeline-list">
          <view
            v-for="item in weekData.timeline"
            :key="item.date"
            class="timeline-item"
            :class="{ today: item.isToday }"
          >
            <view class="timeline-rail">
              <view class="timeline-dot" />
            </view>
            <view class="timeline-card card">
              <view class="timeline-meta">
                <text class="timeline-age">{{ item.ageLabel }}</text>
                <text class="timeline-date">{{ item.dateLabel }}<text v-if="item.isToday" class="timeline-today"> 今天</text></text>
              </view>
              <text v-if="item.title" class="timeline-title">{{ item.title }}</text>
              <text class="timeline-desc">{{ item.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="weekData.sourceNote" class="source-card">
        <text class="source-title">数据说明</text>
        <text class="source-text">{{ weekData.sourceNote }}</text>
      </view>
    </template>

    <view v-if="loading && !weekData" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <BackToTopFab :visible="showBackToTop" @tap="scrollPageToTop" />
  </view>
</template>

<style scoped lang="scss">
.growth-change-page {
  padding-bottom: 72rpx;
}

.week-tabs {
  margin-top: 12rpx;
  white-space: nowrap;
}

.week-tabs-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 8rpx;
}

.week-tab {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.8);
}

.week-tab.active {
  background: rgba(245, 130, 172, 0.16);
}

.week-tab-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.week-tab-note {
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(245, 130, 172, 0.18);
  color: var(--mini-primary-deep);
  font-size: 18rpx;
}

.hero-card {
  margin-top: 22rpx;
  padding: 30rpx;
}

.hero-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(245, 130, 172, 0.14);
  color: var(--mini-primary-deep);
  font-size: 22rpx;
  font-weight: 700;
}

.hero-stage {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.hero-age {
  display: block;
  margin-top: 18rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-range {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.overview-card,
.source-card {
  margin-top: 22rpx;
  padding: 28rpx;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-icon {
  font-size: 28rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.section-title.plain {
  display: block;
  margin-top: 26rpx;
  margin-bottom: 18rpx;
}

.overview-title {
  display: block;
  margin-top: 16rpx;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.5;
  color: var(--mini-text);
}

.overview-summary,
.highlight-text,
.metric-note,
.timeline-desc,
.source-text,
.loading-text {
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.overview-summary {
  display: block;
  margin-top: 12rpx;
}

.highlight-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 18rpx;
}

.highlight-item {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.highlight-dot,
.timeline-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 999rpx;
  background: #f26fa0;
  flex-shrink: 0;
}

.highlight-dot {
  margin-top: 12rpx;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.metric-card {
  padding: 24rpx;
}

.metric-title {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.metric-value {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--mini-text);
}

.metric-note {
  display: block;
  margin-top: 10rpx;
}

.timeline-list {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 18rpx;
}

.timeline-rail {
  display: flex;
  justify-content: center;
  width: 24rpx;
  position: relative;
}

.timeline-rail::after {
  content: '';
  position: absolute;
  top: 16rpx;
  bottom: -20rpx;
  left: 50%;
  width: 2rpx;
  transform: translateX(-50%);
  background: rgba(242, 111, 160, 0.24);
}

.timeline-item:last-child .timeline-rail::after {
  display: none;
}

.timeline-item.today .timeline-dot {
  width: 18rpx;
  height: 18rpx;
  box-shadow: 0 0 0 8rpx rgba(245, 130, 172, 0.14);
}

.timeline-card {
  flex: 1;
  margin-bottom: 18rpx;
  padding: 24rpx;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: center;
}

.timeline-age,
.timeline-date {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.timeline-today {
  color: var(--mini-primary-deep);
}

.timeline-title {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.timeline-desc {
  display: block;
  margin-top: 12rpx;
}

.source-title {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.source-text {
  display: block;
  margin-top: 10rpx;
}

.loading-state {
  padding: 100rpx 32rpx;
  text-align: center;
}
</style>
