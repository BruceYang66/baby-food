<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import type { BabyProfile } from '@baby-food/shared-types'
import AppTabBar from '@/components/common/AppTabBar.vue'
import {
  getFamilyMembers,
  getHomeData,
  getKnowledgePageData,
  getReminderItems,
  normalizeAppImageUrl,
  openProtectedPage,
  readAuthSession
} from '@/services/api'
import {
  homeDashboardDailyChange,
  homeDashboardModules,
  homeDashboardMonthlyFocusText,
  homeDashboardRecommendations
} from '@/data/mock'
import { getHomeReminderPreview, hydrateReminderItems } from '@/services/local-reminder'

type DashboardModule = (typeof homeDashboardModules)[number]
type DashboardTodo = {
  id: string
  title: string
  timeLabel?: string
  route?: string
  status: 'pending' | 'done'
}
type DashboardRecommendation = {
  id: string
  title: string
  tag?: string
  badge?: string
  image: string
  route: string
}

const HOME_HERO_BACKDROP = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmXfJcO59h61fGz9hA8pX97XG7-Xf8n8xS-L7P0G4-o9M-v3-R3X8-r6_f-yG'

const isLoggedIn = ref(false)
const baby = ref<BabyProfile | null>(null)
const familyFriendCount = ref(0)
const dashboardTodos = ref<DashboardTodo[]>([])
const homeRecommendations = ref<DashboardRecommendation[]>(homeDashboardRecommendations.map((item, index) => ({
  id: item.id,
  title: item.title,
  tag: item.tag,
  badge: item.badge ?? (index === 0 ? '最新' : undefined),
  image: normalizeAppImageUrl(item.image),
  route: item.route
})))

const publicFeatures = [
  {
    key: 'guide',
    icon: '📚',
    title: '喂养指南',
    subtitle: '各月龄科学喂养建议',
    route: '/pages/guide/index',
    accent: 'primary'
  },
  {
    key: 'taboo',
    icon: '⚠️',
    title: '食材禁忌',
    subtitle: '了解宝宝不能吃什么',
    route: '/pages/taboo/index',
    accent: 'secondary'
  },
  {
    key: 'vaccine',
    icon: '💉',
    title: '疫苗计划',
    subtitle: '疫苗接种时间表',
    route: '/pages/vaccine/index',
    accent: 'primary'
  },
  {
    key: 'knowledge',
    icon: '📖',
    title: '育儿知识',
    subtitle: '专业育儿知识库',
    route: '/pages/knowledge/index',
    accent: 'secondary'
  }
]

function getStatusBarHeight() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo().statusBarHeight || 0
  }

  return uni.getSystemInfoSync().statusBarHeight || 0
}

const pageStyle = computed(() => ({
  paddingTop: `${getStatusBarHeight() + 12}px`
}))

const heroAvatar = computed(() => {
  if (!baby.value?.avatar) {
    return ''
  }

  return normalizeAppImageUrl(baby.value.avatar)
})

const heroBackgroundImage = computed(() => {
  if (!baby.value?.backgroundImageUrl) {
    return ''
  }

  return normalizeAppImageUrl(baby.value.backgroundImageUrl)
})

const heroHasCustomBackdrop = computed(() => Boolean(heroBackgroundImage.value))
const heroBackdrop = computed(() => heroBackgroundImage.value || heroAvatar.value || HOME_HERO_BACKDROP)
const displayBabyName = computed(() => baby.value?.nickname || '米米')
const displayBabyAge = computed(() => baby.value?.monthAgeLabel || '')
const displayBabyStage = computed(() => baby.value?.stageLabel || '')
const monthlyFocusLabel = computed(() => baby.value?.monthAgeLabel || '当前阶段')
const familyPillText = computed(() => {
  if (familyFriendCount.value > 0) {
    return `${familyFriendCount.value}位亲友`
  }

  return '邀请亲友'
})
const todayLabel = computed(() => {
  const now = new Date()
  return `今日 ${now.getMonth() + 1}月${now.getDate()}日`
})

async function loadFamilyFriendCount(babyId?: string) {
  if (!babyId) {
    familyFriendCount.value = 0
    return
  }

  try {
    const data = await getFamilyMembers(babyId)
    familyFriendCount.value = Math.max(0, data.members?.length ?? 0)
  } catch {
    familyFriendCount.value = 0
  }
}

async function loadHomeRecommendations() {
  try {
    const data = await getKnowledgePageData()
    const latestArticles = data.articles.slice(0, 3)

    if (!latestArticles.length) {
      return
    }

    homeRecommendations.value = latestArticles.map((article, index) => ({
      id: article.id,
      title: article.title,
      tag: article.categoryLabel || article.tags[0] || '干货',
      badge: index === 0 ? '最新' : undefined,
      image: normalizeAppImageUrl(article.image || ''),
      route: `/pages/knowledge/detail?id=${article.id}`
    }))
  } catch {
    homeRecommendations.value = homeDashboardRecommendations.map((item, index) => ({
      id: item.id,
      title: item.title,
      tag: item.tag,
      badge: item.badge ?? (index === 0 ? '最新' : undefined),
      image: normalizeAppImageUrl(item.image),
      route: item.route
    }))
  }
}

async function loadDashboardTodos() {
  try {
    const items = await getReminderItems()
    hydrateReminderItems(items)
    const preview = getHomeReminderPreview(3)

    dashboardTodos.value = preview.map((item) => ({
      id: item.id,
      title: item.title,
      timeLabel: item.timeLabel,
      route: item.route,
      status: item.status
    }))
  } catch {
    dashboardTodos.value = []
  }
}

async function loadHome() {
  const session = readAuthSession()
  isLoggedIn.value = !!session?.token
  baby.value = session?.babyProfile ?? null
  await loadDashboardTodos()

  if (!isLoggedIn.value) {
    familyFriendCount.value = 0
    void loadHomeRecommendations()
    return
  }

  try {
    const data = await getHomeData()
    baby.value = data.babyProfile
    await Promise.all([
      loadFamilyFriendCount(data.babyProfile?.id),
      loadHomeRecommendations()
    ])
  } catch (error) {
    console.error('Failed to load home data:', error)

    if (baby.value?.id) {
      await Promise.all([
        loadFamilyFriendCount(baby.value.id),
        loadHomeRecommendations()
      ])
      return
    }

    isLoggedIn.value = false
    familyFriendCount.value = 0
    void loadHomeRecommendations()
  }
}

onShow(() => {
  void loadHome()
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function go(url: string) {
  const routeBase = url.split('?')[0]
  const publicPages = [
    '/pages/guide/index',
    '/pages/taboo/index',
    '/pages/vaccine/index',
    '/pages/knowledge/index',
    '/pages/knowledge/detail',
    '/pages/help/index'
  ]

  if (publicPages.includes(routeBase)) {
    uni.navigateTo({ url })
    return
  }

  openProtectedPage(url)
}

function goFamily() {
  openProtectedPage('/pages/family/index')
}

function goEditBaby() {
  if (baby.value?.id) {
    uni.navigateTo({ url: `/pages/baby-form/index?id=${baby.value.id}` })
    return
  }

  uni.navigateTo({ url: '/pages/baby-form/index?new=1' })
}

function showComingSoon(title = '功能建设中') {
  uni.showToast({ title, icon: 'none' })
}

function openModule(module: DashboardModule) {
  if (!module.implemented || !module.route) {
    showComingSoon('功能建设中')
    return
  }

  go(module.route)
}

function openDailyChange() {
  showComingSoon('成长解读建设中')
}

function openMonthlyFocus() {
  go('/pages/guide/index')
}

function openTodo(todo: DashboardTodo) {
  if (todo.route) {
    go(todo.route)
    return
  }

  if (todo.id === 'todo-vaccine') {
    go('/pages/vaccine/index')
    return
  }

  go('/pages/reminder/index')
}

function addReminder() {
  go('/pages/reminder/edit')
}

function openReminderList() {
  go('/pages/reminder/index')
}

function openRecommendation(item: DashboardRecommendation) {
  go(item.route)
}

function openFab() {
  go('/pages/generate/index')
}

onShareAppMessage(() => ({
  title: baby.value ? `${baby.value.nickname}的育儿助手` : '养娃小管家 - 科学喂养，健康成长',
  path: '/pages/home/index'
}))

onShareTimeline(() => ({
  title: '养娃小管家 - 科学喂养，健康成长'
}))
</script>

<template>
  <view class="page-shell home-page" :style="pageStyle">
    <view v-if="!isLoggedIn" class="guest-view">
      <view class="topbar">
        <view class="app-title">
          <text class="app-name">养娃小管家</text>
          <text class="app-slogan">科学喂养，健康成长</text>
        </view>
        <view class="login-btn" @tap="goLogin">登录</view>
      </view>

      <view class="welcome-card">
        <text class="welcome-emoji">👶</text>
        <text class="welcome-title">欢迎使用养娃小管家</text>
        <text class="welcome-desc">为宝宝提供科学的辅食计划和喂养指导</text>
        <view class="welcome-action" @tap="goLogin">
          <text class="welcome-btn">登录体验完整功能 →</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">公开功能</text>
        <text class="section-subtitle">无需登录即可浏览</text>
      </view>

      <view class="feature-grid guest-feature-grid">
        <view
          v-for="feature in publicFeatures"
          :key="feature.key"
          class="feature-card"
          :class="feature.accent"
          @tap="go(feature.route)"
        >
          <text class="feature-icon">{{ feature.icon }}</text>
          <text class="feature-title">{{ feature.title }}</text>
          <text class="feature-subtitle">{{ feature.subtitle }}</text>
        </view>
      </view>

      <view class="login-prompt-card">
        <text class="login-prompt-title">🎯 登录后可使用</text>
        <view class="login-prompt-list">
          <text class="login-prompt-item">• 生成个性化辅食计划</text>
          <text class="login-prompt-item">• 记录宝宝喂养历史</text>
          <text class="login-prompt-item">• 收藏喜欢的食谱</text>
          <text class="login-prompt-item">• 家庭成员协同管理</text>
        </view>
        <view class="login-prompt-btn" @tap="goLogin">立即登录</view>
      </view>
    </view>

    <view v-else class="logged-view">
      <view class="dashboard-hero" :class="{ 'custom-backdrop': heroHasCustomBackdrop }">
        <image class="dashboard-hero-bg" :src="heroBackdrop" mode="aspectFill" />
        <view class="dashboard-hero-overlay" />
        <view class="hero-deco hero-deco-left" />
        <view class="hero-deco hero-deco-right" />

        <view class="dashboard-hero-topbar">
          <view class="dashboard-hero-title-wrap">
            <text class="dashboard-hero-topname">{{ displayBabyName }}</text>
            <view class="dashboard-hero-topline" />
          </view>
        </view>

        <view class="dashboard-hero-profile">
          <view class="hero-profile-main">
            <view class="hero-avatar-wrap">
              <image v-if="heroAvatar" class="hero-avatar" :src="heroAvatar" mode="aspectFill" />
              <view v-else class="hero-avatar-fallback">{{ displayBabyName[0] }}</view>
            </view>
            <view class="hero-profile-copy">
              <text class="hero-name">{{ displayBabyName }}</text>
              <view v-if="displayBabyAge || displayBabyStage" class="hero-meta-row">
                <text class="hero-meta">
                  {{ displayBabyAge }}<text v-if="displayBabyStage" class="hero-meta stage"> · {{ displayBabyStage }}</text>
                </text>
                <view class="hero-edit-badge" @tap.stop="goEditBaby">
                  <text class="hero-edit-icon">✎</text>
                </view>
              </view>
            </view>
          </view>

          <view class="family-pill" @tap="goFamily">
            <text class="family-pill-heart">❤</text>
            <text class="family-pill-text">{{ familyPillText }}</text>
            <text class="family-pill-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="daily-change-card" @tap="openDailyChange">
        <text class="daily-change-label">宝宝今日变化：</text>
        <text class="daily-change-text">{{ homeDashboardDailyChange }}</text>
        <text class="daily-change-arrow">›</text>
      </view>

      <view class="monthly-card card">
        <view class="monthly-head">
          <text class="monthly-head-icon">✦</text>
          <text class="monthly-head-title">本月发育重点</text>
        </view>
        <text class="monthly-desc">
          <text class="monthly-age">{{ monthlyFocusLabel }}：</text>{{ homeDashboardMonthlyFocusText }}
        </text>
        <view class="monthly-link" @tap="openMonthlyFocus">查看完整指南 →</view>
      </view>

      <view class="module-grid">
        <view
          v-for="module in homeDashboardModules"
          :key="module.key"
          class="module-item"
          @tap="openModule(module)"
        >
          <view class="module-icon-wrap" :class="[module.tone, module.shape]">
            <text class="module-icon">{{ module.icon }}</text>
          </view>
          <text class="module-title">{{ module.title }}</text>
        </view>
      </view>

      <view class="todo-card card">
        <view class="todo-head" @tap="openReminderList">
          <view class="todo-title-row">
            <text class="todo-badge">待办</text>
            <text class="todo-title">提醒事项</text>
          </view>
          <view class="todo-head-right">
            <text class="todo-date">{{ todayLabel }}</text>
            <view class="todo-head-link">
              <text class="todo-head-link-text">更多</text>
              <text class="todo-head-arrow">›</text>
            </view>
          </view>
        </view>

        <view class="todo-list">
          <view v-for="todo in dashboardTodos" :key="todo.id" class="todo-item" :class="{ done: todo.status === 'done' }" @tap="openTodo(todo)">
            <view class="todo-main">
              <view class="todo-radio" :class="{ done: todo.status === 'done' }" />
              <text class="todo-item-title" :class="{ done: todo.status === 'done' }">{{ todo.title }}</text>
            </view>
            <view class="todo-item-side">
              <text v-if="todo.status === 'done'" class="todo-item-status">已办</text>
              <text class="todo-item-time" :class="{ done: todo.status === 'done' }">{{ todo.timeLabel }}</text>
            </view>
          </view>
        </view>

        <view class="todo-add" @tap="addReminder">
          <text class="todo-add-plus">＋</text>
          <text class="todo-add-text">添加提醒</text>
        </view>
      </view>

      <view class="recommend-section">
        <text class="recommend-heading">热门推荐</text>
        <scroll-view scroll-x class="recommend-scroll" show-scrollbar="false">
          <view class="recommend-row">
            <view
              v-for="item in homeRecommendations"
              :key="item.id"
              class="recommend-card"
              @tap="openRecommendation(item)"
            >
              <image class="recommend-image" :src="item.image" mode="aspectFill" />
              <view class="recommend-overlay">
                <view class="recommend-tags">
                  <text v-if="item.badge" class="recommend-badge">{{ item.badge }}</text>
                  <text v-if="item.tag" class="recommend-tag">{{ item.tag }}</text>
                </view>
                <text class="recommend-title">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- <view class="home-fab" @tap="openFab">
        <text class="home-fab-icon">＋</text>
      </view> -->
    </view>

    <AppTabBar active="home" />
  </view>
</template>

<style scoped lang="scss">
.home-page {
  position: relative;
  padding-bottom: 240rpx;
}

.guest-view,
.logged-view {
  min-height: calc(100vh - 120rpx);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.app-title {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.app-name {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.app-slogan {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.login-btn {
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.welcome-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.25), rgba(255, 255, 255, 0.9));
  box-shadow: var(--mini-shadow-soft);
  text-align: center;
}

.welcome-emoji {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.welcome-title {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 16rpx;
}

.welcome-desc {
  font-size: 26rpx;
  color: var(--mini-text-muted);
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.welcome-action {
  width: 100%;
}

.welcome-btn {
  display: block;
  padding: 24rpx 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
}

.section {
  margin-top: 36rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.section-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.guest-feature-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.login-prompt-card {
  margin-top: 36rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: rgba(168, 230, 207, 0.25);
  box-shadow: var(--mini-shadow-card);
}

.login-prompt-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 20rpx;
}

.login-prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.login-prompt-item {
  font-size: 26rpx;
  color: var(--mini-text);
  line-height: 1.6;
}

.login-prompt-btn {
  padding: 22rpx 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-secondary-deep), #3db886);
  text-align: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.feature-grid {
  display: grid;
  gap: 22rpx;
  margin-top: 28rpx;
}

.feature-card {
  min-height: 232rpx;
  padding: 26rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: var(--mini-shadow-card);
}

.feature-card.primary {
  background: rgba(255, 179, 102, 0.26);
}

.feature-card.secondary {
  background: rgba(168, 230, 207, 0.3);
}

.feature-icon {
  display: block;
  font-size: 40rpx;
}

.feature-title {
  display: block;
  margin-top: 28rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.feature-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
}

.logged-view {
  position: relative;
}

.dashboard-hero {
  position: relative;
  overflow: hidden;
  min-height: 268rpx;
  padding: 18rpx 24rpx 40rpx;
  border-radius: 34rpx;
  background: linear-gradient(180deg, rgba(251, 246, 241, 0.22) 0%, rgba(225, 207, 191, 0.22) 100%);
  box-shadow: var(--mini-shadow-soft);
}

.dashboard-hero.custom-backdrop {
  min-height: 286rpx;
}

.dashboard-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.95;
  transform: scale(1.04);
  filter: blur(2rpx) saturate(0.92);
}

.dashboard-hero.custom-backdrop .dashboard-hero-bg {
  filter: blur(0) saturate(0.98);
}

.dashboard-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(96, 73, 56, 0.14) 0%, rgba(89, 68, 53, 0.24) 100%);
}

.dashboard-hero.custom-backdrop .dashboard-hero-overlay {
  background: linear-gradient(180deg, rgba(76, 56, 42, 0.06) 0%, rgba(76, 56, 42, 0.28) 100%);
}

.hero-deco {
  position: absolute;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  filter: blur(6rpx);
}

.hero-deco-left {
  width: 120rpx;
  height: 120rpx;
  left: -34rpx;
  top: 106rpx;
}

.hero-deco-right {
  width: 112rpx;
  height: 112rpx;
  right: -20rpx;
  top: 74rpx;
}

.dashboard-hero-topbar,
.dashboard-hero-profile {
  position: relative;
  z-index: 1;
}

.dashboard-hero-topbar {
  display: flex;
  justify-content: center;
}

.dashboard-hero-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.dashboard-hero-topname {
  color: #fff;
  font-size: 27rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.dashboard-hero-topline {
  width: 42rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.95);
}

.dashboard-hero-profile {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 104rpx;
}

.hero-profile-main {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-width: 0;
}

.hero-avatar-wrap {
  flex-shrink: 0;
}

.hero-avatar,
.hero-avatar-fallback {
  width: 82rpx;
  height: 82rpx;
  border-radius: 999rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.64);
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.14);
}

.hero-avatar-fallback {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  line-height: 74rpx;
}

.hero-profile-copy {
  min-width: 0;
}

.hero-name {
  display: block;
  font-size: 36rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #fff;
}

.hero-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.hero-meta {
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.94);
}

.hero-meta.stage {
  color: rgba(255, 255, 255, 0.9);
}

.hero-edit-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.18);
  border: 1rpx solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10rpx);
}

.hero-edit-icon {
  color: rgba(255, 255, 255, 0.98);
  font-size: 18rpx;
  line-height: 1;
}

.family-pill {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 239, 246, 0.95);
  box-shadow: 0 10rpx 18rpx rgba(217, 90, 133, 0.12);
}

.family-pill-heart,
.family-pill-text,
.family-pill-arrow {
  color: #d9688d;
}

.family-pill-heart,
.family-pill-arrow {
  font-size: 20rpx;
}

.family-pill-text {
  font-size: 20rpx;
  font-weight: 700;
}

.daily-change-card {
  position: relative;
  z-index: 2;
  margin: -8rpx 14rpx 0;
  padding: 22rpx 24rpx 20rpx;
  border-radius: 24rpx;
  background: #fff1e8;
  box-shadow: 0 8rpx 18rpx rgba(176, 47, 0, 0.06);
}

.daily-change-label,
.daily-change-text,
.daily-change-arrow {
  font-size: 22rpx;
  line-height: 1.8;
}

.daily-change-label {
  color: #b02f00;
  font-weight: 700;
}

.daily-change-text {
  color: #524438;
}

.daily-change-arrow {
  color: #b02f00;
  margin-left: 8rpx;
}

.monthly-card {
  margin-top: 18rpx;
  padding: 30rpx;
  border-radius: 28rpx;
}

.monthly-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.monthly-head-icon,
.monthly-head-title,
.monthly-link,
.monthly-age {
  color: var(--mini-secondary-deep);
}

.monthly-head-icon {
  font-size: 22rpx;
}

.monthly-head-title {
  font-size: 28rpx;
  font-weight: 700;
}

.monthly-desc {
  display: block;
  margin-top: 22rpx;
  padding-top: 2rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.monthly-age {
  font-weight: 700;
}

.monthly-link {
  display: inline-flex;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid rgba(44, 105, 86, 0.12);
  font-size: 22rpx;
  font-weight: 700;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 28rpx 10rpx;
  margin-top: 34rpx;
  padding: 8rpx 4rpx 2rpx;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.module-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82rpx;
  height: 82rpx;
  transition: transform 0.18s ease;
}

.module-item:active .module-icon-wrap {
  transform: scale(0.94);
}

.module-icon {
  font-size: 34rpx;
}

.module-title {
  text-align: center;
  font-size: 24rpx;
  line-height: 1.4;
  font-weight: 500;
  color: var(--mini-text-muted);
}

.shape-1 {
  border-radius: 50% 50% 30% 70% / 46% 56% 44% 54%;
}

.shape-2 {
  border-radius: 58% 42% 54% 46% / 44% 56% 44% 56%;
}

.shape-3 {
  border-radius: 44% 56% 46% 54% / 58% 40% 60% 42%;
}

.shape-4 {
  border-radius: 42% 58% 58% 42% / 62% 34% 66% 38%;
}

.orange {
  background: #ffedd8;
}

.teal {
  background: #dff7f1;
}

.blue {
  background: #e2edff;
}

.rose {
  background: #fde5ea;
}

.amber {
  background: #fff1d5;
}

.purple {
  background: #f1e6ff;
}

.pink {
  background: #ffe4f4;
}

.green {
  background: #def6dd;
}

.indigo {
  background: #e5e8ff;
}

.slate {
  background: #eff2f4;
}

.todo-card {
  margin-top: 34rpx;
  padding: 26rpx 24rpx;
  border-radius: 28rpx;
}

.todo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.todo-head-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.todo-head-link {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(247, 239, 230, 0.92);
}

.todo-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.todo-badge {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: var(--mini-danger);
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
}

.todo-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.todo-date {
  font-size: 20rpx;
  color: var(--mini-text-muted);
}

.todo-head-link-text {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.todo-head-arrow {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.todo-list {
  margin-top: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx;
  border-radius: 22rpx;
  background: rgba(247, 239, 230, 0.48);
}

.todo-item.done {
  background: rgba(239, 242, 244, 0.88);
}

.todo-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.todo-radio {
  width: 30rpx;
  height: 30rpx;
  border-radius: 999rpx;
  border: 3rpx solid rgba(44, 105, 86, 0.35);
  background: rgba(255, 255, 255, 0.8);
}

.todo-item-title {
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--mini-text);
}

.todo-item-time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.todo-item-side {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.todo-item-status {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(44, 105, 86, 0.12);
  color: var(--mini-secondary-deep);
  font-size: 18rpx;
  font-weight: 700;
}

.todo-radio.done {
  background: rgba(44, 105, 86, 0.18);
  border-color: rgba(44, 105, 86, 0.48);
}

.todo-item-title.done,
.todo-item-time.done {
  color: rgba(107, 98, 91, 0.56);
  text-decoration: line-through;
}

.todo-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 88rpx;
  margin-top: 20rpx;
  border-radius: 999rpx;
  border: 2rpx dashed rgba(138, 81, 8, 0.18);
  color: var(--mini-text-muted);
}

.todo-add-plus,
.todo-add-text {
  font-size: 24rpx;
}

.recommend-section {
  margin-top: 34rpx;
}

.recommend-heading {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.recommend-scroll {
  margin-top: 18rpx;
  white-space: nowrap;
}

.recommend-row {
  display: flex;
  gap: 24rpx;
  padding-right: 24rpx;
}

.recommend-card {
  position: relative;
  width: 332rpx;
  height: 220rpx;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 28rpx;
  box-shadow: var(--mini-shadow-card);
}

.recommend-image {
  width: 100%;
  height: 100%;
}

.recommend-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 22rpx;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 20%, rgba(0, 0, 0, 0.68) 100%);
}

.recommend-tags {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.recommend-badge,
.recommend-tag {
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-size: 18rpx;
  font-weight: 700;
}

.recommend-badge {
  background: #00a96b;
  color: #fff;
}

.recommend-tag {
  background: rgba(255, 255, 255, 0.24);
  color: #fff;
}

.recommend-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 24rpx;
  line-height: 1.5;
  font-weight: 700;
  color: #fff;
}

.home-fab {
  position: fixed;
  right: 32rpx;
  bottom: 174rpx;
  z-index: calc(var(--mini-floating-z) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-secondary-deep), #48b06c);
  box-shadow: 0 16rpx 32rpx rgba(44, 105, 86, 0.22);
}

.home-fab-icon {
  color: #fff;
  font-size: 48rpx;
  line-height: 1;
}
</style>
