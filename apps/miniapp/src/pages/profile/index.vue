<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { BabyProfile, ProfileMenuItem, WechatEntry } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import { clearAuthSession, readAuthSession, getProfileData, listBabyProfiles, logout, openProtectedPage } from '@/services/api'

const isLoggedIn = ref(false)
const activeBaby = ref<BabyProfile | null>(null)
const menus = ref<ProfileMenuItem[]>([])
const wechatEntries = ref<WechatEntry[]>([])

// 公开菜单（未登录也可访问）
const publicMenus = [
  {
    key: 'guide',
    icon: '📚',
    title: '喂养指南',
    subtitle: '各月龄科学喂养建议'
  },
  {
    key: 'taboo',
    icon: '⚠️',
    title: '食材禁忌',
    subtitle: '了解宝宝不能吃什么'
  },
  {
    key: 'help',
    icon: '❓',
    title: '帮助中心',
    subtitle: '使用说明与常见问题'
  }
]

const canEditActiveBaby = computed(() => activeBaby.value?.role !== 'viewer')
const activeBabyRoleLabel = computed(() => {
  if (!activeBaby.value?.role) {
    return ''
  }

  if (activeBaby.value.role === 'owner') {
    return '拥有者'
  }

  if (activeBaby.value.role === 'viewer') {
    return '只读成员'
  }

  return '协作成员'
})

async function loadProfile() {
  const session = readAuthSession()
  isLoggedIn.value = !!session?.token

  if (!isLoggedIn.value) {
    return
  }

  try {
    const [data, babyList] = await Promise.all([
      getProfileData(),
      listBabyProfiles().catch(() => ({ babies: [] as BabyProfile[] }))
    ])
    // Find the active baby from the list (has accurate isActive flag)
    activeBaby.value = babyList.babies.find((b) => b.isActive) ?? data.babyProfile
    menus.value = data.profileMenus
    wechatEntries.value = data.wechatEntries
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

// onShow 确保从宝宝管理页返回后刷新当前宝宝显示
onShow(async () => {
  await loadProfile()
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

async function handleLogout() {
  const confirm = await uni.showModal({
    title: '退出登录',
    content: '退出后将返回登录页，当前本地登录状态会被清除。'
  })
  if (!confirm.confirm) return
  try {
    await logout()
  } catch {
  } finally {
    clearAuthSession()
    uni.reLaunch({ url: '/pages/home/index' })
  }
}

function openShareGuide() {
  uni.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
  uni.showToast({ title: '请点击右上角转发给家人朋友', icon: 'none' })
}

function openActiveBabyEditor() {
  if (!activeBaby.value) {
    return
  }

  if (!canEditActiveBaby.value) {
    uni.showToast({ title: '当前为只读成员，暂不能编辑宝宝档案', icon: 'none' })
    return
  }

  uni.navigateTo({ url: `/pages/baby-form/index?id=${activeBaby.value.id}` })
}

function openMenu(menu: ProfileMenuItem) {
  if (menu.key === 'baby') {
    uni.navigateTo({ url: '/pages/babies/index' })
    return
  }
  if (menu.key === 'family') {
    openProtectedPage('/pages/family/index')
    return
  }
  if (menu.key === 'history') {
    openProtectedPage('/pages/plan/index', 'reLaunch')
    return
  }
  if (menu.key === 'favorite') {
    openProtectedPage('/pages/favorites/index')
    return
  }
  if (menu.key === 'allergy') {
    openProtectedPage('/pages/allergy/index')
    return
  }
  if (menu.key === 'message') {
    openProtectedPage('/pages/message/index')
    return
  }
  if (menu.key === 'help') {
    uni.navigateTo({ url: '/pages/help/index' })
    return
  }
  if (menu.key === 'share') {
    openShareGuide()
    return
  }
  if (menu.key === 'logout') {
    void handleLogout()
    return
  }
}

function openPublicMenu(menu: typeof publicMenus[0]) {
  if (menu.key === 'guide') {
    uni.navigateTo({ url: '/pages/guide/index' })
    return
  }
  if (menu.key === 'taboo') {
    uni.navigateTo({ url: '/pages/taboo/index' })
    return
  }
  if (menu.key === 'help') {
    uni.navigateTo({ url: '/pages/help/index' })
    return
  }
}

function openWechatEntry(entry: WechatEntry) {
  if (entry.key === 'subscribe') {
    openProtectedPage('/pages/message/index')
    return
  }
  if (entry.key === 'desktop') {
    uni.showModal({
      title: '添加到我的小程序',
      content: '可在微信右上角菜单中选择"添加到我的小程序"，方便下次直接打开。',
      showCancel: false
    })
    return
  }
  if (entry.key === 'share') {
    openShareGuide()
  }
}

onShareAppMessage(() => ({ title: '宝宝辅食生成器', path: '/pages/home/index' }))
onShareTimeline(() => ({ title: '宝宝辅食生成器' }))
</script>

<template>
  <view class="page-shell profile-page">
    <AppNavBar title="我的" subtitle="宝宝档案与常用设置" />

    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="guest-view">
      <view class="login-card card">
        <view class="login-avatar">👤</view>
        <text class="login-title">登录后体验完整功能</text>
        <text class="login-desc">生成个性化辅食计划、记录喂养历史、收藏喜欢的食谱</text>
        <view class="login-btn" @tap="goLogin">立即登录</view>
      </view>

      <view class="section">
        <text class="section-title">公开功能</text>
      </view>

      <view class="menu-list card">
        <view v-for="menu in publicMenus" :key="menu.key" class="menu-item" @tap="openPublicMenu(menu)">
          <view class="menu-icon">{{ menu.icon }}</view>
          <view class="menu-main">
            <text class="menu-title">{{ menu.title }}</text>
            <text class="menu-subtitle">{{ menu.subtitle }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="feature-tips card">
        <text class="tips-title">🎯 登录后可使用</text>
        <view class="tips-list">
          <text class="tips-item">• 创建宝宝档案，记录成长信息</text>
          <text class="tips-item">• 生成个性化辅食计划</text>
          <text class="tips-item">• 记录每日喂养情况</text>
          <text class="tips-item">• 收藏喜欢的食谱</text>
          <text class="tips-item">• 家庭成员协同管理</text>
        </view>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="logged-view">
      <!-- 当前宝宝卡片 -->
      <view v-if="activeBaby" class="hero-card card" @tap="uni.navigateTo({ url: '/pages/babies/index' })">
        <view class="hero-avatar-wrap">
          <image v-if="activeBaby.avatar" class="hero-avatar" :src="activeBaby.avatar" mode="aspectFill" />
          <view v-else class="hero-avatar-placeholder">{{ activeBaby.nickname[0] }}</view>
          <view class="active-dot" />
        </view>
        <view class="hero-info">
          <view class="hero-name-row">
            <text class="hero-name">{{ activeBaby.nickname }}</text>
            <text class="current-tag">当前宝宝</text>
          </view>
          <text class="hero-meta">{{ activeBaby.monthAgeLabel }} · {{ activeBaby.stageLabel }}</text>
          <view v-if="activeBabyRoleLabel" class="hero-role-pill">
            <text class="hero-role-text">家庭身份：{{ activeBabyRoleLabel }}</text>
          </view>
          <view v-if="activeBaby.allergens.length" class="hero-allergen">
            <text class="allergen-text">过敏：{{ activeBaby.allergens.join('、') }}</text>
          </view>
          <view v-else class="hero-allergen empty">
            <text class="allergen-text">暂未记录过敏原</text>
          </view>
        </view>
        <view class="hero-edit-btn" :class="{ disabled: !canEditActiveBaby }" @tap.stop="openActiveBabyEditor">
          <text class="hero-edit-icon">✎</text>
          <text class="hero-edit-label">编辑</text>
        </view>
      </view>

      <!-- 无宝宝时的空态 -->
      <view v-else class="empty-hero soft-card" @tap="uni.navigateTo({ url: '/pages/baby-form/index' })">
        <text class="empty-title">还没有宝宝档案</text>
        <text class="empty-desc">点击此处填写宝宝昵称、生日和过敏原</text>
        <view class="empty-btn primary-button">添加宝宝档案</view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-list card">
        <view v-for="menu in menus" :key="menu.key" class="menu-item" @tap="openMenu(menu)">
          <view class="menu-icon">{{ menu.icon }}</view>
          <view class="menu-main">
            <text class="menu-title">{{ menu.title }}</text>
            <text class="menu-subtitle">{{ menu.subtitle }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 微信入口 -->
      <view class="wechat-grid">
        <view v-for="entry in wechatEntries" :key="entry.key" class="wechat-card soft-card" @tap="openWechatEntry(entry)">
          <text class="wechat-icon">{{ entry.icon }}</text>
          <text class="wechat-title">{{ entry.title }}</text>
        </view>
      </view>
    </view>

    <AppTabBar active="profile" />
  </view>
</template>

<style scoped lang="scss">
.profile-page {
  padding-top: 0;
}

.guest-view,
.logged-view {
  min-height: calc(100vh - 120rpx);
}

.login-card {
  margin-top: 16rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(255,179,102,0.3), rgba(255,255,255,0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-bottom: 24rpx;
}

.login-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-text);
  margin-bottom: 16rpx;
}

.login-desc {
  font-size: 24rpx;
  color: var(--mini-text-muted);
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.login-btn {
  width: 100%;
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
  margin-bottom: 16rpx;
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

/* 当前宝宝 hero 卡片 */
.hero-card {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
}

.hero-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.hero-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 999rpx;
  display: block;
}

.hero-avatar-placeholder {
  width: 100rpx;
  height: 100rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
  text-align: center;
  line-height: 100rpx;
}

.active-dot {
  position: absolute;
  bottom: 2rpx;
  right: 2rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 999rpx;
  background: var(--mini-secondary-deep);
  border: 3rpx solid var(--mini-bg);
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.hero-name {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.current-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(168, 230, 207, 0.3);
  font-size: 20rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
}

.hero-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.hero-role-pill {
  margin-top: 12rpx;
}

.hero-role-text {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.2);
  font-size: 20rpx;
  color: var(--mini-primary-deep);
}

.hero-allergen {
  margin-top: 12rpx;
  padding: 10rpx 16rpx;
  border-radius: 12rpx;
  background: rgba(255, 179, 102, 0.15);
}

.hero-allergen.empty {
  background: rgba(0, 0, 0, 0.04);
}

.allergen-text {
  font-size: 22rpx;
  color: var(--mini-text);
}

.hero-edit-btn {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(255, 179, 102, 0.2);
}

.hero-edit-btn.disabled {
  opacity: 0.5;
}

.hero-edit-icon {
  font-size: 28rpx;
}

.hero-edit-label {
  font-size: 20rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.empty-hero {
  margin-top: 16rpx;
  padding: 48rpx 32rpx;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.empty-btn {
  margin: 28rpx auto 0;
  width: 360rpx;
  padding: 22rpx 0;
}

.menu-list {
  margin-top: 24rpx;
  padding: 0;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255, 179, 102, 0.15);
  text-align: center;
  line-height: 64rpx;
  font-size: 28rpx;
  flex-shrink: 0;
}

.menu-main {
  flex: 1;
  min-width: 0;
}

.menu-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.menu-subtitle {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.menu-arrow {
  font-size: 32rpx;
  color: var(--mini-text-muted);
  flex-shrink: 0;
}

.wechat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 24rpx;
}

.wechat-card {
  padding: 28rpx 16rpx;
  text-align: center;
}

.wechat-icon {
  display: block;
  font-size: 40rpx;
  margin-bottom: 12rpx;
}

.wechat-title {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-text);
}
</style>
