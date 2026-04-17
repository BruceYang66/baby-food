<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { DailyMealPlan, HistoryMealPlan, WeeklyMealPlanDay } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import { readAuthSession, getPlanPageData, openProtectedPage } from '@/services/api'

const isLoggedIn = ref(false)
const todayPlan = ref<DailyMealPlan>()
const weeklyPlans = ref<WeeklyMealPlanDay[]>([])
const historyPlans = ref<HistoryMealPlan[]>([])
const loading = ref(false)

async function loadPage() {
  const session = readAuthSession()
  isLoggedIn.value = !!session?.token

  if (!isLoggedIn.value) {
    return
  }

  loading.value = true

  try {
    const data = await getPlanPageData()
    todayPlan.value = data.todayMealPlan
    weeklyPlans.value = data.weeklyPlanDays
    historyPlans.value = data.historyMealPlans
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '辅食中心加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const recommendedDays = computed(() => weeklyPlans.value.filter((item) => item.isRecommended).slice(0, 3))
const recentHistory = computed(() => historyPlans.value.slice(0, 3))
const completedHistoryCount = computed(() => historyPlans.value.filter((item) => item.completionRate >= 100).length)

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goGeneratePage() {
  openProtectedPage('/pages/generate/index')
}

function goPlanCenter() {
  openProtectedPage('/pages/plan/index', 'reLaunch')
}

function goRecipeLibrary() {
  uni.navigateTo({ url: '/pages/recipe-list/index' })
}

function goFavorites() {
  openProtectedPage('/pages/favorites/index')
}

function openWeeklyPlan(plan: WeeklyMealPlanDay) {
  if (plan.isRecommended) {
    openProtectedPage(`/pages/plan-edit/index?date=${plan.planDate}`)
    return
  }

  uni.navigateTo({ url: `/pages/plan-detail/index?id=${plan.id}` })
}

function openHistoryPlan(plan: HistoryMealPlan) {
  uni.navigateTo({ url: `/pages/plan-detail/index?id=${plan.id}` })
}

onShow(loadPage)
onShareAppMessage(() => ({ title: '辅食中心：计划、食谱、收藏一站管理', path: '/pages/feeding/index' }))
onShareTimeline(() => ({ title: '辅食中心：计划、食谱、收藏一站管理' }))
</script>

<template>
  <view class="page-shell feeding-page">
    <AppNavBar title="辅食中心" subtitle="计划、食谱、收藏都在这里" />

    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="guest-view">
      <view class="login-prompt-card card">
        <text class="login-prompt-icon">🍚</text>
        <view class="login-prompt-content">
          <text class="login-prompt-title">登录后管理辅食计划</text>
          <text class="login-prompt-desc">生成个性化计划、记录喂养历史、收藏喜欢的食谱</text>
        </view>
        <view class="login-prompt-btn" @tap="goLogin">立即登录</view>
      </view>

      <view class="section">
        <text class="section-title">公开功能</text>
      </view>

      <view class="quick-grid">
        <view class="quick-card soft-card" @tap="goRecipeLibrary">
          <text class="quick-icon">🥣</text>
          <text class="quick-title">食谱库</text>
          <text class="quick-desc">浏览各类辅食食谱</text>
        </view>
        <view class="quick-card soft-card" @tap="uni.navigateTo({ url: '/pages/guide/index' })">
          <text class="quick-icon">📚</text>
          <text class="quick-title">喂养指南</text>
          <text class="quick-desc">各月龄科学喂养建议</text>
        </view>
        <view class="quick-card soft-card" @tap="uni.navigateTo({ url: '/pages/taboo/index' })">
          <text class="quick-icon">⚠️</text>
          <text class="quick-title">食材禁忌</text>
          <text class="quick-desc">了解宝宝不能吃什么</text>
        </view>
        <view class="quick-card soft-card" @tap="uni.navigateTo({ url: '/pages/knowledge/index' })">
          <text class="quick-icon">📖</text>
          <text class="quick-title">育儿知识</text>
          <text class="quick-desc">专业育儿知识库</text>
        </view>
      </view>

      <view class="feature-tips card">
        <text class="tips-title">🎯 登录后可使用</text>
        <view class="tips-list">
          <text class="tips-item">• 生成个性化辅食计划</text>
          <text class="tips-item">• 记录每日喂养情况</text>
          <text class="tips-item">• 收藏喜欢的食谱</text>
          <text class="tips-item">• 查看历史计划和统计</text>
        </view>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="logged-view">
      <view v-if="todayPlan" class="hero-card card">
        <view class="hero-main">
          <text class="hero-kicker">今日计划</text>
          <text class="hero-title">{{ todayPlan.dateLabel }}</text>
          <text class="hero-desc">共 {{ todayPlan.entries.length }} 餐，营养评分 {{ todayPlan.nutritionScore }}，喝水建议 {{ todayPlan.waterSuggestion }}</text>
        </view>
        <view class="hero-side">
          <text class="hero-badge">{{ todayPlan.isSaved ? '已保存' : '待保存' }}</text>
          <view class="hero-btn primary-button" @tap="goPlanCenter">查看详情</view>
        </view>
      </view>

      <view class="quick-grid">
        <view class="quick-card soft-card primary" @tap="goGeneratePage">
          <text class="quick-icon">🍚</text>
          <text class="quick-title">生成今日辅食</text>
          <text class="quick-desc">按月龄和需求快速出计划</text>
        </view>
        <view class="quick-card soft-card secondary" @tap="goPlanCenter">
          <text class="quick-icon">📅</text>
          <text class="quick-title">计划中心</text>
          <text class="quick-desc">今日 / 本周 / 历史集中管理</text>
        </view>
        <view class="quick-card soft-card" @tap="goRecipeLibrary">
          <text class="quick-icon">🥣</text>
          <text class="quick-title">食谱库</text>
          <text class="quick-desc">查找食谱并加入计划</text>
        </view>
        <view class="quick-card soft-card" @tap="goFavorites">
          <text class="quick-icon">♡</text>
          <text class="quick-title">我的收藏</text>
          <text class="quick-desc">常做辅食一键复用</text>
        </view>
      </view>

      <view class="summary-row">
        <view class="summary-card card">
          <text class="summary-label">历史计划</text>
          <text class="summary-value">{{ historyPlans.length }}</text>
        </view>
        <view class="summary-card card">
          <text class="summary-label">满分完成</text>
          <text class="summary-value">{{ completedHistoryCount }}</text>
        </view>
        <view class="summary-card card">
          <text class="summary-label">本周推荐</text>
          <text class="summary-value">{{ recommendedDays.length }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-row">
          <text class="section-title">本周推荐</text>
          <text class="section-link" @tap="goPlanCenter">查看全部</text>
        </view>
        <view v-if="recommendedDays.length" class="recommend-list">
          <view v-for="plan in recommendedDays" :key="plan.id" class="recommend-card card" @tap="openWeeklyPlan(plan)">
            <view class="recommend-head">
              <view>
                <text class="recommend-day">{{ plan.dayLabel }}</text>
                <text class="recommend-date">{{ plan.dateLabel }}</text>
              </view>
              <text class="recommend-tag">{{ plan.tagLabel }}</text>
            </view>
            <text class="recommend-summary">{{ plan.summary }}</text>
            <text class="recommend-meta">{{ plan.recipeTitles.join(' · ') }}</text>
          </view>
        </view>
        <view v-else class="empty-card soft-card">
          <text class="empty-title">还没有推荐计划</text>
          <text class="empty-desc">先生成今日辅食，系统会逐步形成更完整的周计划。</text>
        </view>
      </view>

      <view class="section">
        <view class="section-row">
          <text class="section-title">最近历史</text>
          <text class="section-link" @tap="goPlanCenter">进入历史</text>
        </view>
        <view v-if="recentHistory.length" class="history-list">
          <view v-for="plan in recentHistory" :key="plan.id" class="history-card soft-card" @tap="openHistoryPlan(plan)">
            <view>
              <text class="history-date">{{ plan.dateLabel }}</text>
              <text class="history-summary">{{ plan.summary }}</text>
            </view>
            <text class="history-rate">{{ plan.completionRate }}%</text>
          </view>
        </view>
        <view v-else class="empty-card soft-card">
          <text class="empty-title">还没有历史记录</text>
          <text class="empty-desc">保存过的每日计划会出现在这里，方便家人回看。</text>
        </view>
      </view>

      <view class="fixed-bottom-actions feeding-actions">
        <view class="outline-button" @tap="goRecipeLibrary">浏览食谱库</view>
        <view class="primary-button" @tap="goGeneratePage">生成今日辅食</view>
      </view>
    </view>

    <AppTabBar active="feeding" />
  </view>
</template>

<style scoped lang="scss">
.feeding-page {
  padding-bottom: 300rpx;
}

.guest-view,
.logged-view {
  min-height: calc(100vh - 120rpx);
}

.login-prompt-card {
  margin-top: 18rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.login-prompt-icon {
  font-size: 56rpx;
  flex-shrink: 0;
}

.login-prompt-content {
  flex: 1;
  min-width: 0;
}

.login-prompt-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 8rpx;
}

.login-prompt-desc {
  display: block;
  font-size: 24rpx;
  color: var(--mini-text-muted);
  line-height: 1.6;
}

.login-prompt-btn {
  flex-shrink: 0;
  padding: 18rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.section {
  margin-top: 36rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.feature-tips {
  margin-top: 24rpx;
  padding: 28rpx;
}

.tips-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tips-item {
  font-size: 24rpx;
  color: var(--mini-text);
  line-height: 1.6;
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 18rpx;
  padding: 30rpx;
}

.hero-main {
  flex: 1;
}

.hero-kicker,
.summary-label,
.recommend-date,
.history-summary {
  display: block;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.hero-title,
.summary-value,
.recommend-day,
.history-date {
  display: block;
  margin-top: 10rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-desc,
.recommend-summary,
.recommend-meta,
.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14rpx;
}

.hero-badge,
.recommend-tag {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.18);
  color: var(--mini-primary-deep);
  font-size: 20rpx;
  font-weight: 700;
}

.hero-btn {
  min-width: 180rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 24rpx;
}

.quick-card {
  padding: 26rpx;
}

.quick-card.primary {
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.26), rgba(255, 255, 255, 0.96));
}

.quick-card.secondary {
  background: linear-gradient(135deg, rgba(168, 230, 207, 0.28), rgba(255, 255, 255, 0.96));
}

.quick-icon {
  display: block;
  font-size: 40rpx;
}

.quick-title,
.empty-title {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.quick-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.summary-card {
  padding: 24rpx;
}

.section {
  margin-top: 32rpx;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recommend-list,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 16rpx;
}

.recommend-card,
.empty-card {
  padding: 24rpx;
}

.recommend-head,
.history-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.history-card {
  padding: 24rpx;
}

.history-rate {
  flex-shrink: 0;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
}

.feeding-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
