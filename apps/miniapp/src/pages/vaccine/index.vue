<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { VaccinePageData, VaccineRecordItem } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import BackToTopFab from '@/components/common/BackToTopFab.vue'
import DatePickerModal from '@/components/common/DatePickerModal.vue'
import { useBackToTop } from '@/composables/useBackToTop'
import { readAuthSession, getVaccinePageData, saveVaccineRecord } from '@/services/api'

type TabKey = 'timeline' | 'records' | 'tips'

const isLoggedIn = ref(false)
const pageData = ref<VaccinePageData>()
const loading = ref(false)
const activeTab = ref<TabKey>('timeline')
const showDatePicker = ref(false)
const currentVaccineItem = ref<VaccineRecordItem | null>(null)
const datePickerValue = computed(() => currentVaccineItem.value?.vaccinatedAt || new Date().toISOString().split('T')[0])
const { showBackToTop, scrollViewTop, handleScrollViewScroll, scrollScrollViewToTop } = useBackToTop()

// 按月龄排序时间轴组
const sortedTimelineGroups = computed(() => {
  if (!pageData.value?.timelineGroups) return []
  return [...pageData.value.timelineGroups].sort((a, b) => {
    // 将月龄统一转换为月数进行排序
    // "0月" -> 0, "2月" -> 2, "12~15月龄" -> 12, "1岁" -> 12, "2岁" -> 24
    const parseAgeToMonths = (key: string): number => {
      // 处理区间型月龄（如 "12~15月龄"），取第一个数字
      if (key.includes('~')) {
        const match = key.match(/(\d+)/)
        return match ? parseInt(match[1]) : 0
      }
      // 提取数字
      const match = key.match(/(\d+)/)
      const num = match ? parseInt(match[1]) : 0
      // 如果是岁，转换为月
      if (key.includes('岁')) {
        return num * 12
      }
      return num
    }
    const aMonths = parseAgeToMonths(a.key)
    const bMonths = parseAgeToMonths(b.key)
    return aMonths - bMonths
  })
})

const allItems = computed(() => sortedTimelineGroups.value.flatMap((g) => g.items))
const timelineColumns = computed(() =>
  sortedTimelineGroups.value.map((group) => ({
    ...group,
    freeItems: group.items.filter((item) => item.category === 'free'),
    optionalItems: group.items.filter((item) => item.category === 'optional')
  }))
)

// 简化月龄标签显示（去掉"龄"字）
function simplifyAgeLabel(label: string): string {
  return label.replace('月龄', '月').replace('岁龄', '岁')
}
const freeVaccines = computed(() => allItems.value.filter((item) => item.category === 'free'))
const optionalVaccines = computed(() => allItems.value.filter((item) => item.category === 'optional'))
const completedFree = computed(() => freeVaccines.value.filter((item) => item.status === 'completed').length)
const pendingFree = computed(() => freeVaccines.value.filter((item) => item.status === 'pending').length)
const recordedOptional = computed(() => optionalVaccines.value.filter((item) => item.status === 'completed').length)
const availableOptional = computed(() => optionalVaccines.value.length)
const completedItems = computed(() =>
  allItems.value
    .filter((item) => item.status === 'completed')
    .sort((a, b) => (b.vaccinatedAt || '').localeCompare(a.vaccinatedAt || ''))
)

function switchTab(tab: TabKey) {
  activeTab.value = tab
}

function handleScrollContentScroll(event: { detail: { scrollTop: number } }) {
  handleScrollViewScroll(event.detail.scrollTop)
}

function getCategoryLabel(item: VaccineRecordItem) {
  return item.category === 'free' ? '免费' : '自费'
}

async function toggleVaccineCheck(item: VaccineRecordItem) {
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '需要登录',
      content: '登录后可记录疫苗接种情况',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/login/index' })
        }
      }
    })
    return
  }

  if (loading.value) {
    return
  }

  if (item.status === 'completed') {
    // 已接种：弹出操作选择（编辑日期 or 取消接种）
    uni.showActionSheet({
      itemList: ['修改接种日期', '取消接种记录'],
      success: async (res) => {
        if (res.tapIndex === 0) {
          currentVaccineItem.value = item
          showDatePicker.value = true
        } else if (res.tapIndex === 1) {
          uni.showModal({
            title: '确认取消',
            content: `确定要取消「${item.name}」的接种记录吗？`,
            confirmText: '确认取消',
            cancelText: '保留',
            success: async (modalRes) => {
              if (modalRes.confirm) {
                await performVaccineUpdate(item.id, 'pending', undefined)
              }
            }
          })
        }
      }
    })
    return
  }

  // 未接种：打开日期选择弹窗
  currentVaccineItem.value = item
  showDatePicker.value = true
}

function handleDatePickerClose() {
  showDatePicker.value = false
  currentVaccineItem.value = null
}

async function handleDatePickerConfirm(date: string) {
  if (currentVaccineItem.value) {
    await performVaccineUpdate(currentVaccineItem.value.id, 'completed', date)
  }
  showDatePicker.value = false
  currentVaccineItem.value = null
}

async function performVaccineUpdate(scheduleId: string, status: 'pending' | 'completed', vaccinatedAt?: string) {
  try {
    loading.value = true
    await saveVaccineRecord({
      scheduleId,
      status,
      vaccinatedAt: status === 'completed' ? vaccinatedAt : undefined,
      note: status === 'completed' ? '已接种' : undefined
    })

    // 重新加载数据
    await loadPage()

    uni.showToast({
      title: status === 'completed' ? '已标记为完成' : '已取消标记',
      icon: 'success'
    })
  } catch (error) {
    console.error('performVaccineUpdate error:', error)
    uni.showToast({
      title: error instanceof Error ? error.message : '操作失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function handleVaccineDetail(item: VaccineRecordItem) {
  const sections: string[] = []

  // 基本信息
  sections.push('【基本信息】')
  sections.push(`推荐月龄：${item.recommendedAgeLabel}`)
  sections.push(`类型：${getCategoryLabel(item)}`)
  sections.push(`预防疾病：${item.disease}`)
  sections.push('')

  // 接种状态
  if (item.status === 'completed') {
    sections.push('【接种记录】')
    if (item.vaccinatedAt) {
      sections.push(`接种时间：${item.vaccinatedAt}`)
    }
    if (item.note && item.note !== '已接种') {
      sections.push(`备注：${item.note}`)
    }
  } else {
    // 未接种，显示描述
    if (item.description) {
      sections.push('【疫苗说明】')
      sections.push(item.description)
    }
  }

  uni.showModal({
    title: item.name,
    content: sections.join('\n'),
    showCancel: false,
    confirmText: '知道了'
  })
}

async function loadPage() {
  const session = readAuthSession()
  isLoggedIn.value = !!session?.token

  loading.value = true

  try {
    pageData.value = await getVaccinePageData()
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '疫苗记录加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onShow(loadPage)
onShareAppMessage(() => ({ title: '宝宝疫苗接种记录', path: '/pages/vaccine/index' }))
onShareTimeline(() => ({ title: '宝宝疫苗接种记录' }))
</script>

<template>
  <view class="vaccine-page">
    <AppNavBar title="疫苗接种" :show-back="true" center-title />

    <view class="fixed-header">
      <!-- 未登录提示 -->
      <view v-if="!isLoggedIn" class="login-tip-card">
        <text class="login-tip-icon">💉</text>
        <view class="login-tip-content">
          <text class="login-tip-title">查看疫苗接种时间表</text>
          <text class="login-tip-desc">登录后可记录宝宝的接种情况</text>
        </view>
        <view class="login-tip-btn" @tap="uni.navigateTo({ url: '/pages/login/index' })">登录</view>
      </view>

      <!-- 统计卡片（仅登录后显示） -->
      <view v-else-if="pageData?.babyProfile" class="stats-grid">
        <view class="stat-card stat-free">
          <view class="stat-icon-bg">🛡️</view>
          <view class="stat-header">
            <view class="stat-icon-wrap">
              <text class="stat-icon">🛡️</text>
            </view>
            <text class="stat-label">免费疫苗</text>
          </view>
          <view class="stat-body">
            <text class="stat-value">{{ completedFree }} <text class="stat-unit">已完成</text></text>
            <text class="stat-desc">剩余 {{ pendingFree }} 剂待接种</text>
          </view>
        </view>

        <view class="stat-card stat-optional">
          <view class="stat-icon-bg">💊</view>
          <view class="stat-header">
            <view class="stat-icon-wrap">
              <text class="stat-icon">💊</text>
            </view>
            <text class="stat-label">自费疫苗</text>
          </view>
          <view class="stat-body">
            <text class="stat-value">{{ recordedOptional }} <text class="stat-unit">已记录</text></text>
            <text class="stat-desc">可选 {{ availableOptional }} 剂</text>
          </view>
        </view>
      </view>

      <!-- 标签切换 -->
      <view class="tab-switcher">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'timeline' }"
          @tap="switchTab('timeline')"
        >
          <text class="tab-text">时间轴</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'records' }"
          @tap="switchTab('records')"
        >
          <text class="tab-text">已接种记录</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'tips' }"
          @tap="switchTab('tips')"
        >
          <text class="tab-text">注意事项</text>
        </view>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <scroll-view
      class="scroll-content"
      scroll-y
      :scroll-top="scrollViewTop"
      scroll-with-animation
      :show-scrollbar="false"
      @scroll="handleScrollContentScroll"
    >
      <!-- 时间轴视图 -->
      <view v-if="activeTab === 'timeline' && pageData" class="timeline-view">
        <view class="timeline-line"></view>
        <view v-for="(group, groupIndex) in timelineColumns" :key="group.key" class="timeline-stage">
          <view class="stage-node" :class="{ 'node-primary': groupIndex === 0, 'node-highlight': groupIndex === 1 }">
            <text class="node-text">{{ simplifyAgeLabel(group.label) }}</text>
          </view>

          <view class="stage-items">
            <view class="stage-column stage-column-free">
              <view
                v-for="item in group.freeItems"
                :key="item.id"
                class="vaccine-item item-free"
                :class="{ 'item-completed': item.status === 'completed' }"
                @tap="handleVaccineDetail(item)"
              >
                <view class="item-header">
                  <text class="item-name">{{ item.name }}</text>
                  <view class="item-check-area" @tap.stop="toggleVaccineCheck(item)">
                    <view v-if="item.status === 'completed'" class="item-check">✓</view>
                    <view v-else class="item-checkbox">
                      <view class="checkbox-inner"></view>
                    </view>
                  </view>
                </view>
                <text class="item-dose">{{ item.stageLabel }}</text>
                <text v-if="item.status === 'pending'" class="item-badge">进行中</text>
              </view>
            </view>

            <view class="stage-column stage-column-optional">
              <view
                v-for="item in group.optionalItems"
                :key="item.id"
                class="vaccine-item item-optional"
                :class="{ 'item-completed': item.status === 'completed' }"
                @tap="handleVaccineDetail(item)"
              >
                <view class="item-header">
                  <text class="item-name name-optional">{{ item.name }}</text>
                  <view class="item-check-area" @tap.stop="toggleVaccineCheck(item)">
                    <view v-if="item.status === 'completed'" class="item-check">✓</view>
                    <view v-else class="item-checkbox">
                      <view class="checkbox-inner"></view>
                    </view>
                  </view>
                </view>
                <text class="item-dose">{{ item.stageLabel }}</text>
                <text v-if="item.status === 'pending'" class="item-badge">进行中</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 已接种记录视图 -->
      <view v-if="activeTab === 'records' && pageData" class="records-view">
        <view v-if="completedItems.length" class="record-list">
          <view
            v-for="item in completedItems"
            :key="item.id"
            class="record-item"
            @tap="handleVaccineDetail(item)"
          >
            <view class="record-header">
              <text class="record-name">{{ item.name }}</text>
              <text class="record-category" :class="item.category === 'free' ? 'category-free' : 'category-optional'">
                {{ getCategoryLabel(item) }}
              </text>
            </view>
            <text class="record-time">{{ item.vaccinatedAt || item.recommendedAgeLabel }}</text>
            <text class="record-disease">预防：{{ item.disease }}</text>
            <text v-if="item.note && item.note !== '已接种'" class="record-note">{{ item.note }}</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <text class="empty-text">暂无接种记录</text>
        </view>
      </view>

      <!-- 注意事项视图 -->
      <view v-if="activeTab === 'tips' && pageData" class="tips-view">
        <view class="tip-card tip-highlight">
          <view class="tip-icon">💡</view>
          <view class="tip-content">
            <text class="tip-title">接种小贴士</text>
            <text class="tip-text">接种前请确保宝宝近2天无发热症状。接种后需留观30分钟，24小时内避免洗澡。</text>
          </view>
        </view>

        <view v-for="tip in pageData.tips" :key="tip.title" class="tip-card">
          <view class="tip-icon">📋</view>
          <view class="tip-content">
            <text class="tip-title">{{ tip.title }}</text>
            <text class="tip-text">{{ tip.description }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <BackToTopFab :visible="showBackToTop" extra-bottom="132rpx" @tap="scrollScrollViewToTop" />
    <AppTabBar active="vaccine" />

    <DatePickerModal
      :show="showDatePicker"
      :value="datePickerValue"
      title="选择接种日期"
      label="接种日期"
      @close="handleDatePickerClose"
      @confirm="handleDatePickerConfirm"
    />
  </view>
</template>

<style scoped lang="scss">
.vaccine-page {
  min-height: 100vh;
  background: #fef8f3;
  display: flex;
  flex-direction: column;
}

.vaccine-page :deep(.app-nav) {
  margin-bottom: 12rpx;
}

.fixed-header {
  padding: 0 32rpx 0;
}

/* 未登录提示卡片 */
.login-tip-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.2), rgba(255, 255, 255, 0.95));
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(138, 81, 8, 0.08);
}

.login-tip-icon {
  font-size: 48rpx;
  flex-shrink: 0;
}

.login-tip-content {
  flex: 1;
  min-width: 0;
}

.login-tip-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #8a5108;
  margin-bottom: 6rpx;
}

.login-tip-desc {
  display: block;
  font-size: 22rpx;
  color: #a67c52;
}

.login-tip-btn {
  flex-shrink: 0;
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ffb366, #ff9933);
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.stat-card {
  position: relative;
  padding: 28rpx 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(89, 63, 39, 0.06);
}

.stat-free {
  background: rgba(104, 171, 255, 0.1);
  border: 2rpx solid rgba(104, 171, 255, 0.05);
}

.stat-optional {
  background: rgba(135, 61, 166, 0.1);
  border: 2rpx solid rgba(135, 61, 166, 0.05);
}

.stat-icon-bg {
  position: absolute;
  right: -24rpx;
  top: -24rpx;
  font-size: 100rpx;
  opacity: 0.08;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.stat-icon-wrap {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-free .stat-icon-wrap {
  background: #0060ac;
}

.stat-optional .stat-icon-wrap {
  background: #873da6;
}

.stat-icon {
  font-size: 28rpx;
}

.stat-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1d1b19;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.stat-value {
  font-size: 42rpx;
  font-weight: 700;
  color: #1d1b19;
}

.stat-unit {
  font-size: 22rpx;
  font-weight: 400;
  opacity: 0.7;
}

.stat-desc {
  font-size: 22rpx;
  font-weight: 500;
  color: #0060ac;
}

.stat-optional .stat-desc {
  color: #873da6;
}

/* 标签切换 */
.tab-switcher {
  display: flex;
  background: #f8f3ee;
  padding: 8rpx;
  border-radius: 999rpx;
  margin-bottom: 16rpx;
}

.tab-item {
  flex: 1;
  padding: 16rpx;
  border-radius: 999rpx;
  text-align: center;
  transition: all 0.3s;
}

.tab-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #6b625b;
}

.tab-item.active {
  background: linear-gradient(135deg, #8a5108, #ffb366);
  box-shadow: 0 6rpx 20rpx rgba(138, 81, 8, 0.25);
}

.tab-item.active .tab-text {
  color: #ffffff;
  font-weight: 700;
}

/* 可滚动内容区域 */
.scroll-content {
  flex: 1;
  margin-bottom: 130rpx;
  padding: 0;
}

.scroll-content > view {
  padding: 32rpx 40rpx 40rpx;
}

/* 时间轴视图 */
.timeline-view {
    position: relative;
    padding-bottom: 60rpx;
    padding-right: 5rpx;
    padding-left: 5rpx;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 60rpx;
  width: 4rpx;
  background: linear-gradient(180deg, transparent 0%, #d7c3b3 15%, #d7c3b3 85%, transparent 100%);
  transform: translateX(-50%);
  z-index: 0;
}

.timeline-stage {
  position: relative;
  margin-bottom: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stage-node {
  position: relative;
  z-index: 10;
  height: 56rpx;
  padding: 0 16rpx;
  margin: 0 auto 24rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e6e2dd;
  box-shadow: 0 0 0 10rpx #fef8f3;
  width: fit-content;
}

.node-primary {
  background: linear-gradient(135deg, #8a5108, #ffb366);
}

.node-highlight {
  background: #ffb366;
}

.node-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #6b625b;
  white-space: nowrap;
}

.node-primary .node-text,
.node-highlight .node-text {
  color: #ffffff;
}

.stage-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  padding: 0;
  width: 100%;
}

.stage-column {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.vaccine-item {
  position: relative;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(29, 27, 25, 0.05);
  min-height: 90rpx;
  display: flex;
  flex-direction: column;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.item-free {
  background: linear-gradient(135deg, rgba(104, 171, 255, 0.05), rgba(255, 255, 255, 0.95));
  border-left: 4rpx solid #68abff;
}

.item-optional {
  background: linear-gradient(135deg, rgba(186, 104, 200, 0.05), rgba(255, 255, 255, 0.95));
  border-right: 4rpx solid #ba68c8;
}

.item-completed {
  opacity: 0.75;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rpx;
}

.item-name {
  font-size: 24rpx;
  font-weight: 700;
  color: #2c7cd1;
  flex: 1;
  line-height: 1.4;
  word-break: break-all;
  overflow-wrap: break-word;
  padding-right: 8rpx;
}

.name-optional {
  color: #9c4dcc;
}

.item-check-area {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: -12rpx -8rpx -12rpx 0;
}

.item-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #2ecc71;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.item-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 3rpx solid #68abff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-optional .item-checkbox {
  border-color: #ba68c8;
}

.checkbox-inner {
  width: 18rpx;
  height: 18rpx;
  border-radius: 4rpx;
  background: #68abff;
}

.item-optional .checkbox-inner {
  background: #ba68c8;
}

.item-dose {
  display: block;
  font-size: 20rpx;
  color: #6b625b;
  margin-bottom: 4rpx;
  line-height: 1.4;
  word-break: break-all;
  overflow-wrap: break-word;
}

.item-badge {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(104, 171, 255, 0.15);
  color: #2c7cd1;
  font-size: 16rpx;
  font-weight: 700;
}

.item-optional .item-badge {
  background: rgba(186, 104, 200, 0.15);
  color: #9c4dcc;
}

/* 已接种记录视图 */
.records-view {
  padding-bottom: 60rpx;
  padding-right: 5rpx;
  padding-left: 5rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  padding: 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(29, 27, 25, 0.05);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.record-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1d1b19;
}

.record-category {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.category-free {
  background: rgba(0, 96, 172, 0.1);
  color: #0060ac;
}

.category-optional {
  background: rgba(135, 61, 166, 0.1);
  color: #873da6;
}

.record-time {
  display: block;
  font-size: 22rpx;
  color: #6b625b;
  margin-bottom: 6rpx;
}

.record-disease {
  display: block;
  font-size: 22rpx;
  color: #6b625b;
  margin-bottom: 6rpx;
}

.record-note {
  display: block;
  font-size: 22rpx;
  color: #8a5108;
  margin-top: 10rpx;
  padding: 12rpx;
  background: rgba(255, 179, 102, 0.1);
  border-radius: 12rpx;
}

.empty-state {
  padding: 100rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #6b625b;
}

/* 注意事项视图 */
.tips-view {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
    padding-bottom: 60rpx;
    padding-right: 5rpx;
    padding-left: 5rpx;
}

.tip-card {
  padding: 32rpx;
  border-radius: 28rpx;
  background: #f2ede8;
  border: 2rpx solid rgba(215, 195, 179, 0.2);
  display: flex;
  gap: 28rpx;
}

.tip-highlight {
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.15), rgba(138, 81, 8, 0.08));
  border: 2rpx solid rgba(138, 81, 8, 0.15);
}

.tip-icon {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(138, 81, 8, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.tip-highlight .tip-icon {
  background: rgba(255, 179, 102, 0.3);
}

.tip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.tip-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #1d1b19;
}

.tip-text {
  font-size: 22rpx;
  line-height: 1.6;
  color: #6b625b;
}
</style>
