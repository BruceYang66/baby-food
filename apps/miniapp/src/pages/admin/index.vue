<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { readAuthSession, syncAppSession } from '@/services/api'

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

async function openRecipeAdmin() {
  if (!await ensureAdminAccess()) return
  uni.navigateTo({ url: '/pages/admin/recipes/index' })
}

async function openKnowledgeAdmin() {
  if (!await ensureAdminAccess()) return
  uni.navigateTo({ url: '/pages/admin/knowledge/index' })
}

onShow(() => {
  void ensureAdminAccess()
})
</script>

<template>
  <view class="page-shell admin-home-page">
    <AppNavBar title="内容管理" subtitle="管理食谱与干货内容" :show-back="true" />

    <view class="card admin-card" @tap="openRecipeAdmin">
      <text class="admin-title">食谱管理</text>
      <text class="admin-subtitle">新增、编辑食谱内容</text>
    </view>

    <view class="card admin-card" @tap="openKnowledgeAdmin">
      <text class="admin-title">干货管理</text>
      <text class="admin-subtitle">新增、编辑干货文章</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.admin-home-page {
  padding-top: 0;
}

.admin-card {
  margin-top: 20rpx;
  padding: 30rpx;
}

.admin-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.admin-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}
</style>
