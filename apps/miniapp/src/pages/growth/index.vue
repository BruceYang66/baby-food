<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { GrowthStandardKey, GrowthTabKey } from '@baby-food/shared-types'
import GrowthStandardSheet from '@/components/growth/GrowthStandardSheet.vue'
import GrowthTrendChart from '@/components/growth/GrowthTrendChart.vue'
import { deleteGrowthRecordEntry, getGrowthRecords, readAuthSession } from '@/services/api'
import {
  getGrowthChartDataset,
  getGrowthListItems,
  getGrowthMetricMeta,
  getGrowthSourceText,
  getGrowthStandardOptions,
  hydrateGrowthRecords
} from '@/services/local-growth'

const tabs: Array<{ key: GrowthTabKey; label: string }> = [
  { key: 'list', label: '记录列表' },
  { key: 'height', label: '身高曲线' },
  { key: 'weight', label: '体重曲线' },
  { key: 'head', label: '头围曲线' }
]

function getStatusBarHeight() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo().statusBarHeight || 0
  }

  return uni.getSystemInfoSync().statusBarHeight || 0
}

const navStyle = computed(() => ({
  paddingTop: `${Math.max(getStatusBarHeight(), 20)}px`
}))

const activeTab = ref<GrowthTabKey>('list')
const rangeKey = ref<'halfYear' | 'oneYear' | 'threeYear'>('halfYear')
const standardKey = ref<GrowthStandardKey>('nhc-2025')
const showStandardSheet = ref(false)
const activePointId = ref('')
const version = ref(0)
const session = ref(readAuthSession())
const standardOptions = getGrowthStandardOptions()
const babyGender = computed(() => session.value?.babyProfile?.gender)
const officialNeedsGender = computed(() => standardKey.value === 'nhc-2025' && !babyGender.value)
const showOfficialGenderNote = computed(() => officialNeedsGender.value && activeTab.value !== 'head')
const showHeadLegacyNote = computed(() => standardKey.value === 'nhc-2025' && activeTab.value === 'head')

const birthDate = computed(() => session.value?.babyProfile?.birthDate)
const currentAgeMonths = computed(() => {
  if (!birthDate.value) {
    return 18
  }

  const diffMs = new Date().getTime() - new Date(`${birthDate.value}T00:00:00`).getTime()
  return Math.max(1, diffMs / (24 * 60 * 60 * 1000 * 30.4375))
})
const records = computed(() => {
  version.value
  return getGrowthListItems(birthDate.value, standardKey.value, babyGender.value)
})
const chartMetric = computed(() => (activeTab.value === 'list' ? 'height' : activeTab.value))
const chartDataset = computed(() => {
  version.value
  return getGrowthChartDataset({
    birthDate: birthDate.value,
    gender: babyGender.value,
    metric: chartMetric.value,
    rangeKey: rangeKey.value,
    standardKey: standardKey.value
  })
})
const sourceText = computed(() => {
  if (standardKey.value === 'nhc-2025' && chartMetric.value === 'head') {
    return '头围曲线暂沿用本地趋势参考，未接入卫健委2025官方表'
  }

  return getGrowthSourceText(standardKey.value)
})
const currentMetricText = computed(() => {
  const meta = getGrowthMetricMeta(chartMetric.value)
  return `${meta.shortLabel}(${meta.unit})`
})
const currentStandardLabel = computed(() => {
  const option = standardOptions.find((item) => item.key === standardKey.value)
  return option ? `${option.label} (${option.ageRangeLabel})` : ''
})

async function refreshPage() {
  session.value = readAuthSession()

  if (!session.value?.token) {
    hydrateGrowthRecords([])
    version.value += 1
    return
  }

  try {
    const items = await getGrowthRecords()
    hydrateGrowthRecords(items)
    version.value += 1
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '生长记录加载失败', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/home/index',
        fail: () => {
          uni.reLaunch({ url: '/pages/home/index' })
        }
      })
    }
  })
}

function goEdit(id?: string) {
  const query = id ? `?id=${id}` : ''
  uni.navigateTo({ url: `/pages/growth/edit${query}` })
}

function selectTab(tab: GrowthTabKey) {
  activeTab.value = tab
  activePointId.value = ''
}

function confirmStandard(value: GrowthStandardKey) {
  standardKey.value = value
  showStandardSheet.value = false
  activePointId.value = ''
}

function formatHeaderDate(date: string) {
  const [year, month, day] = date.split('-')
  const now = new Date()
  if (Number(year) === now.getFullYear()) {
    return `${Number(month)}月${Number(day)}日`
  }

  return `${year}年${Number(month)}月${Number(day)}日`
}

function formatMetricValue(value: number | null) {
  if (value == null) {
    return '--'
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(1).replace(/\.0$/, '')
}

function openSourceInfo() {
  uni.navigateTo({ url: '/pages/growth/explainer' })
}

function openRecordActions(recordId: string) {
  uni.showActionSheet({
    itemList: ['编辑', '删除该记录'],
    success: (result) => {
      if (result.tapIndex === 0) {
        goEdit(recordId)
        return
      }

      if (result.tapIndex === 1) {
        uni.showModal({
          title: '删除记录',
          content: '确定删除这条记录吗？',
          confirmText: '删除',
          confirmColor: '#d95a85',
          success: async (modalResult) => {
            if (!modalResult.confirm) {
              return
            }

            try {
              await deleteGrowthRecordEntry(recordId)
              uni.showToast({ title: '已删除', icon: 'success' })
              await refreshPage()
            } catch (error) {
              uni.showToast({ title: error instanceof Error ? error.message : '删除失败', icon: 'none' })
            }
          }
        })
      }
    }
  })
}

onLoad((options) => {
  const tab = options?.tab
  if (tab === 'list' || tab === 'height' || tab === 'weight' || tab === 'head') {
    activeTab.value = tab
  }
})

onShow(() => {
  void refreshPage()
})
</script>

<template>
  <view class="page-shell growth-page">
    <view class="growth-nav" :style="navStyle">
      <view class="growth-nav-side" @tap="goBack">
        <view class="growth-nav-back-btn">
          <text class="growth-nav-back-icon">‹</text>
        </view>
      </view>
      <text class="growth-nav-title">身高体重记录</text>
      <view class="growth-nav-side placeholder" />
    </view>

    <view class="growth-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="growth-tab"
        :class="{ active: activeTab === tab.key }"
        @tap="selectTab(tab.key)"
      >
        <text class="growth-tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <view v-if="showOfficialGenderNote" class="growth-notice-card">
      <text class="growth-notice-text">按卫健委2025指南评估身高、体重需要先在宝宝档案中补充性别，当前仅展示已记录数值。</text>
    </view>

    <view v-else-if="showHeadLegacyNote" class="growth-notice-card subtle">
      <text class="growth-notice-text">头围曲线当前继续沿用原有趋势算法，未切换到卫健委2025官方表。</text>
    </view>

    <template v-if="activeTab === 'list'">
      <view class="growth-list">
        <view v-for="record in records" :key="record.id" class="growth-record-card">
          <view class="record-head">
            <text class="record-date">{{ formatHeaderDate(record.measuredAt) }}（{{ record.ageLabel }}）</text>
            <view class="record-more-btn" @tap.stop="openRecordActions(record.id)">
              <text class="record-more">···</text>
            </view>
          </view>

          <view class="record-metrics">
            <view v-for="metric in record.metrics" :key="metric.metric" class="record-metric-item">
              <text class="record-metric-label">{{ metric.label }}{{ metric.unit }}</text>
              <text class="record-metric-value">{{ formatMetricValue(metric.value) }}</text>
              <view class="record-metric-foot">
                <text class="record-metric-percentile">{{ metric.percentile != null ? `${metric.percentile}%` : '--' }}</text>
                <text class="record-metric-status" :class="metric.statusTone">{{ metric.statusLabel }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="growth-fab" @tap="goEdit()">
        <text class="growth-fab-icon">＋</text>
      </view>
    </template>

    <template v-else>
      <view class="chart-card card">
        <view class="chart-standard-row">
          <view class="standard-chip" @tap="showStandardSheet = true">
            <text class="standard-dot">◎</text>
            <text class="standard-text">{{ currentStandardLabel }}</text>
            <text class="standard-arrow">⌄</text>
          </view>
        </view>

        <view class="chart-meta-row">
          <text class="chart-metric-label">{{ currentMetricText }}</text>
          <view class="range-switcher">
            <view class="range-pill" :class="{ active: rangeKey === 'halfYear' }" @tap="rangeKey = 'halfYear'">半年</view>
            <view class="range-pill" :class="{ active: rangeKey === 'oneYear' }" @tap="rangeKey = 'oneYear'">1年</view>
            <view class="range-pill" :class="{ active: rangeKey === 'threeYear' }" @tap="rangeKey = 'threeYear'">3年</view>
          </view>
        </view>

        <view class="chart-body">
          <GrowthTrendChart
            :dataset="chartDataset"
            :active-point-id="activePointId"
            :range-key="rangeKey"
            :current-age-months="currentAgeMonths"
            @select="activePointId = $event"
          />
        </view>

        <view class="chart-footnote-inline">
          <text class="chart-footnote-text">参考来源：{{ sourceText }}</text>
          <text class="chart-footnote-link" @tap="openSourceInfo">了解生长曲线与百分位数</text>
        </view>
      </view>
    </template>

    <GrowthStandardSheet :show="showStandardSheet" :value="standardKey" :options="standardOptions" @close="showStandardSheet = false" @confirm="confirmStandard" />
  </view>
</template>

<style scoped lang="scss">
.growth-page {
  padding-bottom: 120rpx;
}

.growth-nav {
  display: grid;
  grid-template-columns: 88rpx 1fr 88rpx;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.growth-nav-side {
  display: flex;
  align-items: center;
  width: 88rpx;
  min-height: 88rpx;
  color: var(--mini-primary-deep);
}

.growth-nav-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.growth-nav-back-icon {
  margin-top: -4rpx;
  font-size: 48rpx;
  line-height: 1;
  color: var(--mini-primary-deep);
}

.growth-nav-side.placeholder {
  opacity: 0;
}

.growth-nav-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.growth-notice-card {
  margin-bottom: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 243, 205, 0.72);
}

.growth-notice-card.subtle {
  background: rgba(247, 239, 230, 0.72);
}

.growth-notice-text {
  display: block;
  font-size: 22rpx;
  line-height: 1.7;
  color: #7b6a57;
}

.growth-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  margin-bottom: 22rpx;
  border-bottom: 2rpx solid rgba(29, 27, 25, 0.08);
}

.growth-tab {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 16rpx 6rpx 18rpx;
}

.growth-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  width: 40rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #d94373;
}

.growth-tab-text {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.growth-tab.active .growth-tab-text {
  color: #d94373;
  font-weight: 700;
}

.growth-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.growth-record-card {
  padding: 24rpx 22rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--mini-shadow-card);
}

.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.record-date {
  font-size: 28rpx;
  font-weight: 600;
  color: #534d48;
}

.record-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 56rpx;
  height: 44rpx;
}

.record-more {
  color: #b7b0aa;
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

.record-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 22rpx;
}

.record-metric-item {
  min-width: 0;
}

.record-metric-label {
  display: block;
  font-size: 20rpx;
  color: #8f8881;
}

.record-metric-value {
  display: block;
  margin-top: 14rpx;
  font-size: 52rpx;
  line-height: 1;
  font-weight: 700;
  color: #232120;
}

.record-metric-foot {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 12rpx;
}

.record-metric-percentile {
  font-size: 22rpx;
  color: #9a938d;
}

.record-metric-status {
  font-size: 24rpx;
  font-weight: 700;
}

.record-metric-status.healthy {
  color: #3eaf6a;
}

.record-metric-status.caution {
  color: #d28b43;
}

.record-metric-status.elevated {
  color: #4b83d7;
}

.record-metric-status.warning {
  color: #d95a5a;
}

.growth-fab {
  position: fixed;
  right: 32rpx;
  bottom: 180rpx;
  z-index: calc(var(--mini-floating-z) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #d95a85, #c33c6d);
  box-shadow: 0 16rpx 32rpx rgba(217, 90, 133, 0.22);
}

.growth-fab-icon {
  color: #fff;
  font-size: 50rpx;
  line-height: 1;
}

.chart-card {
  padding: 22rpx 20rpx 24rpx;
  border-radius: 28rpx;
}

.chart-standard-row {
  display: flex;
  justify-content: center;
}

.standard-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-width: 440rpx;
  max-width: 100%;
  padding: 14rpx 20rpx;
  border-radius: 999rpx;
  background: #f3f1ee;
}

.standard-dot,
.standard-arrow {
  color: #7a7f8a;
  font-size: 22rpx;
}

.standard-text {
  min-width: 0;
  text-align: center;
  font-size: 22rpx;
  color: #4e4a48;
}

.chart-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 22rpx;
}

.chart-metric-label {
  font-size: 22rpx;
  color: #746d67;
}

.chart-body {
  margin-top: 12rpx;
}

.chart-footnote-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.chart-footnote-text {
  font-size: 22rpx;
  line-height: 1.7;
  color: #847d77;
}

.chart-footnote-link {
  font-size: 24rpx;
  color: #4980d6;
}

.range-switcher {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx;
  border-radius: 999rpx;
  background: #f3f1ee;
}

.range-pill {
  min-width: 74rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  text-align: center;
  line-height: 48rpx;
  font-size: 22rpx;
  color: #6f6963;
}

.range-pill.active {
  background: #ffffff;
  color: #d94373;
  box-shadow: 0 8rpx 16rpx rgba(29, 27, 25, 0.05);
}
</style>
