<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BackToTopFab from '@/components/common/BackToTopFab.vue'
import { useBackToTop } from '@/composables/useBackToTop'
import { getReminderItems, markReminderItemsDone, toggleReminderDoneStatus } from '@/services/api'
import {
  getReminderCategoryLabel,
  getReminderCategoryMeta,
  getReminderGroups,
  getReminderRepeatLabel,
  getReminderStats,
  hydrateReminderItems
} from '@/services/local-reminder'

type ReminderFilterKey = 'all' | 'today' | 'pending' | 'done'

function getStatusBarHeight() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo().statusBarHeight || 0
  }

  return uni.getSystemInfoSync().statusBarHeight || 0
}

const navStyle = computed(() => ({
  paddingTop: `${Math.max(getStatusBarHeight(), 20)}px`
}))

const filter = ref<ReminderFilterKey>('all')
const version = ref(0)
const { showBackToTop, handleScrollViewScroll, scrollViewTop, scrollScrollViewToTop } = useBackToTop()

const groups = computed(() => {
  version.value
  return getReminderGroups(filter.value)
})
const stats = computed(() => {
  version.value
  return getReminderStats()
})
const visiblePendingIds = computed(() =>
  groups.value.flatMap((group) => group.items.filter((item) => item.status === 'pending').map((item) => item.id))
)
const canMarkAllDone = computed(() => visiblePendingIds.value.length > 0 && filter.value !== 'done')

async function refreshPage() {
  try {
    hydrateReminderItems(await getReminderItems())
    version.value += 1
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '提醒加载失败', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function goEdit(id?: string) {
  const query = id ? `?id=${id}` : ''
  uni.navigateTo({ url: `/pages/reminder/edit${query}` })
}

async function handleToggle(id: string) {
  try {
    await toggleReminderDoneStatus(id)
    await refreshPage()
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '更新失败', icon: 'none' })
  }
}

async function handleMarkAllDone() {
  if (!visiblePendingIds.value.length) {
    return
  }

  try {
    await markReminderItemsDone({ ids: visiblePendingIds.value })
    uni.showToast({ title: '已批量标记完成', icon: 'success' })
    await refreshPage()
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '操作失败', icon: 'none' })
  }
}

onShow(() => {
  void refreshPage()
})
</script>

<template>
  <view class="page-shell reminder-page">
    <view class="reminder-nav" :style="navStyle">
      <view class="reminder-nav-side" @tap="goBack">‹</view>
      <text class="reminder-nav-title">提醒事项</text>
      <view class="reminder-nav-add" @tap="goEdit()">添加</view>
    </view>

    <view class="reminder-filter-row">
      <view class="reminder-filter" :class="{ active: filter === 'all' }" @tap="filter = 'all'">全部</view>
      <view class="reminder-filter" :class="{ active: filter === 'today' }" @tap="filter = 'today'">今日</view>
      <view class="reminder-filter" :class="{ active: filter === 'pending' }" @tap="filter = 'pending'">待办</view>
      <view class="reminder-filter" :class="{ active: filter === 'done' }" @tap="filter = 'done'">已办</view>
    </view>

    <scroll-view scroll-y class="reminder-scroll" :scroll-top="scrollViewTop" @scroll="(event) => handleScrollViewScroll(event.detail.scrollTop)">
      <view class="reminder-summary card">
        <view class="reminder-summary-head">
          <view>
            <text class="reminder-summary-title">今日待办</text>
            <text class="reminder-summary-value">{{ stats.todayPending }}</text>
          </view>
          <view v-if="canMarkAllDone" class="reminder-summary-action" @tap="handleMarkAllDone">一键已办</view>
        </view>
        <text class="reminder-summary-desc">共 {{ stats.total }} 条提醒，待办 {{ stats.pending }} 条，已办 {{ stats.done }} 条。</text>
      </view>

      <view v-if="groups.length" class="reminder-groups">
        <view v-for="group in groups" :key="group.label" class="reminder-group">
          <text class="reminder-group-title">{{ group.label }}</text>
          <view class="reminder-card-list">
            <view
              v-for="item in group.items"
              :key="item.id"
              class="reminder-card"
              :class="{ done: item.status === 'done' }"
              @tap="goEdit(item.id)"
            >
              <view class="reminder-card-main">
                <view class="reminder-check" :class="{ done: item.status === 'done' }" @tap.stop="handleToggle(item.id)">
                  <text class="reminder-check-icon">{{ item.status === 'done' ? '✓' : '' }}</text>
                </view>
                <view class="reminder-card-copy">
                  <view class="reminder-card-top">
                    <view class="reminder-category-chip" :class="[getReminderCategoryMeta(item.category).accent, { done: item.status === 'done' }]">
                      <text class="reminder-category-icon">{{ getReminderCategoryMeta(item.category).icon }}</text>
                      <text class="reminder-category-text">{{ getReminderCategoryLabel(item) }}</text>
                    </view>
                    <text class="reminder-card-time" :class="{ done: item.status === 'done' }">{{ item.time || '--:--' }}</text>
                  </view>
                  <text class="reminder-card-title" :class="{ done: item.status === 'done' }">{{ item.title }}</text>
                  <text class="reminder-card-meta" :class="{ done: item.status === 'done' }">{{ getReminderRepeatLabel(item.repeatType) }}<text v-if="item.note"> · {{ item.note }}</text></text>
                </view>
              </view>
              <view class="reminder-status-btn" :class="{ done: item.status === 'done' }" @tap.stop="handleToggle(item.id)">
                {{ item.status === 'done' ? '撤销' : '完成' }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="reminder-empty card">
        <text class="reminder-empty-icon">🗓️</text>
        <text class="reminder-empty-title">还没有提醒事项</text>
        <text class="reminder-empty-desc">可以先添加补剂、疫苗或测量提醒。</text>
        <view class="reminder-empty-btn" @tap="goEdit()">新增提醒</view>
      </view>
    </scroll-view>

    <BackToTopFab :show="showBackToTop" @tap="scrollScrollViewToTop" />
  </view>
</template>

<style scoped lang="scss">
.reminder-page {
  padding-bottom: 60rpx;
}

.reminder-nav {
  display: grid;
  grid-template-columns: 72rpx 1fr 112rpx;
  align-items: center;
  gap: 12rpx;
}

.reminder-nav-side {
  font-size: 48rpx;
  line-height: 1;
  color: var(--mini-text);
}

.reminder-nav-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.reminder-nav-add {
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 98rpx;
  height: 62rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-secondary-deep), #49ae76);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.reminder-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 22rpx;
}

.reminder-filter {
  min-width: 94rpx;
  height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.86);
  color: #6e6762;
  text-align: center;
  line-height: 60rpx;
  font-size: 24rpx;
}

.reminder-filter.active {
  background: rgba(168, 230, 207, 0.34);
  color: var(--mini-secondary-deep);
  font-weight: 700;
}

.reminder-scroll {
  height: calc(100vh - 220rpx);
  margin-top: 18rpx;
}

.reminder-summary {
  padding: 28rpx;
  border-radius: 28rpx;
}

.reminder-summary-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.reminder-summary-title {
  display: block;
  font-size: 24rpx;
  color: #8a837d;
}

.reminder-summary-value {
  display: block;
  margin-top: 14rpx;
  font-size: 64rpx;
  line-height: 1;
  font-weight: 700;
  color: var(--mini-text);
}

.reminder-summary-action {
  flex-shrink: 0;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(168, 230, 207, 0.22);
  color: var(--mini-secondary-deep);
  font-size: 22rpx;
  font-weight: 700;
}

.reminder-summary-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.reminder-groups {
  margin-top: 24rpx;
}

.reminder-group + .reminder-group {
  margin-top: 24rpx;
}

.reminder-group-title {
  display: block;
  margin-bottom: 14rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #7b746d;
}

.reminder-card-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.reminder-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--mini-shadow-card);
}

.reminder-card.done {
  background: rgba(249, 247, 244, 0.96);
}

.reminder-card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 16rpx;
}

.reminder-check {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  margin-top: 6rpx;
  border-radius: 999rpx;
  border: 3rpx solid rgba(44, 105, 86, 0.34);
  background: #fff;
}

.reminder-check.done {
  background: var(--mini-secondary-deep);
  border-color: var(--mini-secondary-deep);
}

.reminder-check-icon {
  color: #fff;
  font-size: 18rpx;
  line-height: 1;
}

.reminder-card-copy {
  flex: 1;
  min-width: 0;
}

.reminder-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.reminder-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #f4efe9;
}

.reminder-category-chip.done {
  opacity: 0.7;
}

.reminder-category-chip.orange { background: rgba(255, 179, 102, 0.18); }
.reminder-category-chip.rose { background: rgba(217, 90, 133, 0.12); }
.reminder-category-chip.green { background: rgba(114, 187, 136, 0.16); }
.reminder-category-chip.teal { background: rgba(90, 162, 181, 0.14); }
.reminder-category-chip.blue { background: rgba(90, 135, 227, 0.14); }
.reminder-category-chip.slate { background: rgba(126, 135, 148, 0.12); }

.reminder-category-icon,
.reminder-category-text {
  font-size: 20rpx;
  color: #625b56;
}

.reminder-card-time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #8c847f;
}

.reminder-card-title {
  display: block;
  margin-top: 14rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.reminder-card-title.done,
.reminder-card-meta.done,
.reminder-card-time.done {
  color: #aba39c;
  text-decoration: line-through;
}

.reminder-card-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
}

.reminder-status-btn {
  flex-shrink: 0;
  min-width: 82rpx;
  height: 54rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(168, 230, 207, 0.25);
  color: var(--mini-secondary-deep);
  text-align: center;
  line-height: 54rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.reminder-status-btn.done {
  background: rgba(126, 135, 148, 0.14);
  color: #7e8794;
}

.reminder-empty {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 42rpx 28rpx;
  text-align: center;
}

.reminder-empty-icon {
  font-size: 64rpx;
}

.reminder-empty-title {
  display: block;
  margin-top: 20rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.reminder-empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.reminder-empty-btn {
  margin-top: 24rpx;
  padding: 20rpx 34rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-secondary-deep), #49ae76);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
