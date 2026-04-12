<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { BabyProfile, ProfileMenuItem, WechatEntry } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import { clearAuthSession, ensureProtectedPageAccess, getProfileData, listBabyProfiles, logout, openProtectedPage } from '@/services/api'

const activeBaby = ref<BabyProfile | null>(null)
const menus = ref<ProfileMenuItem[]>([])
const wechatEntries = ref<WechatEntry[]>([])

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
  const [data, babyList] = await Promise.all([
    getProfileData(),
    listBabyProfiles().catch(() => ({ babies: [] as BabyProfile[] }))
  ])
  // Find the active baby from the list (has accurate isActive flag)
  activeBaby.value = babyList.babies.find((b) => b.isActive) ?? data.babyProfile
  menus.value = data.profileMenus
  wechatEntries.value = data.wechatEntries
}

// onShow 确保从宝宝管理页返回后刷新当前宝宝显示
onShow(async () => {
  if (!ensureProtectedPageAccess({ allowNoBaby: true })) return
  await loadProfile()
})

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
    uni.reLaunch({ url: '/pages/login/index' })
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
    openProtectedPage('/pages/help/index')
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

onShareAppMessage(() => ({ title: '宝宝辅食生成器', path: '/pages/login/index' }))
onShareTimeline(() => ({ title: '宝宝辅食生成器' }))
</script>

<template>
  <view class="page-shell profile-page">
    <AppNavBar title="我的" subtitle="宝宝档案与常用设置" />

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

    <AppTabBar active="profile" />
  </view>
</template>

<style scoped lang="scss">
.profile-page {
  padding-top: 0;
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
  background: #4caf50;
  border: 3rpx solid #fff;
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
  font-size: 20rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
  background: rgba(255, 179, 102, 0.25);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.hero-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.hero-role-pill {
  display: inline-flex;
  margin-top: 10rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(0, 93, 170, 0.10);
}

.hero-role-text {
  font-size: 20rpx;
  color: var(--mini-primary-deep);
}

.hero-allergen {
  display: inline-flex;
  margin-top: 10rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(214, 106, 106, 0.10);
}

.hero-allergen.empty {
  background: rgba(0, 0, 0, 0.05);
}

.allergen-text {
  font-size: 20rpx;
  color: #a44d4d;
}

.hero-allergen.empty .allergen-text {
  color: var(--mini-text-muted);
}

.hero-edit-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.hero-edit-btn.disabled {
  opacity: 0.5;
}

.hero-edit-icon {
  font-size: 30rpx;
  color: var(--mini-primary-deep);
}

.hero-edit-label {
  font-size: 18rpx;
  color: var(--mini-text-muted);
}

/* 空态 */
.empty-hero {
  margin-top: 16rpx;
  padding: 36rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.empty-desc {
  font-size: 24rpx;
  color: var(--mini-text-muted);
  line-height: 1.6;
}

.empty-btn {
  margin-top: 12rpx;
  width: 100%;
  text-align: center;
}

/* 菜单 */
.menu-list {
  margin-top: 28rpx;
  padding: 10rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx 18rpx;
}

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255,179,102,0.16);
  text-align: center;
  line-height: 72rpx;
  font-size: 30rpx;
}

.menu-main {
  flex: 1;
}

.menu-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.menu-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.menu-arrow {
  font-size: 36rpx;
  color: #b9ada4;
}

/* 微信入口 */
.wechat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.wechat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 16rpx;
}

.wechat-icon {
  font-size: 34rpx;
}

.wechat-title {
  text-align: center;
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--mini-text);
}
</style>
