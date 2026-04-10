<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { BabyProfile } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { activateBaby, ensureProtectedPageAccess, listBabyProfiles } from '@/services/api'

const babies = ref<BabyProfile[]>([])
const switching = ref(false)
const loading = ref(true)

// 使用 onShow 而非 onMounted，确保从 baby-form 返回后自动刷新列表
onShow(async () => {
  if (!ensureProtectedPageAccess({ allowNoBaby: true })) return
  await load()
})

async function load() {
  loading.value = true
  try {
    const result = await listBabyProfiles()
    babies.value = result.babies
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function handleActivate(b: BabyProfile) {
  if (switching.value || b.isActive) return
  switching.value = true
  try {
    await activateBaby(b.id)
    babies.value = babies.value.map((item) => ({ ...item, isActive: item.id === b.id }))
    uni.showToast({ title: `已切换到 ${b.nickname}`, icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '切换失败', icon: 'none' })
  } finally {
    switching.value = false
  }
}

function editBaby(b: BabyProfile) {
  uni.navigateTo({ url: `/pages/baby-form/index?id=${b.id}` })
}

function addBaby() {
  uni.navigateTo({ url: '/pages/baby-form/index?new=1' })
}
</script>

<template>
  <view class="page-shell babies-page">
    <AppNavBar title="宝宝档案" subtitle="管理宝宝信息与切换" :show-back="true" />

    <view v-if="loading" class="loading-tip">
      <text>加载中...</text>
    </view>

    <view v-else>
      <view v-if="babies.length === 0" class="empty-card card">
        <text class="empty-title">还没有宝宝档案</text>
        <text class="empty-desc">填写宝宝昵称、生日和过敏原，首页与辅食计划将按当前宝宝生成</text>
        <view class="primary-button empty-btn" @tap="addBaby">添加宝宝档案</view>
      </view>

      <view v-else class="baby-list">
        <view
          v-for="b in babies"
          :key="b.id"
          class="baby-row card"
          :class="{ active: b.isActive }"
          @tap="handleActivate(b)"
        >
          <!-- 头像 -->
          <view class="avatar-wrap">
            <image v-if="b.avatar" class="avatar" :src="b.avatar" mode="aspectFill" />
            <view v-else class="avatar-placeholder">{{ b.nickname[0] }}</view>
            <view v-if="b.isActive" class="online-dot" />
          </view>

          <!-- 信息 -->
          <view class="info">
            <view class="name-row">
              <text class="name">{{ b.nickname }}</text>
              <text v-if="b.isActive" class="active-tag">当前宝宝</text>
            </view>
            <text class="meta">{{ b.monthAgeLabel }} · {{ b.stageLabel }}</text>
            <view v-if="b.allergens.length" class="allergen-pill">
              <text class="allergen-text">过敏：{{ b.allergens.join('、') }}</text>
            </view>
            <view v-else class="allergen-pill empty">
              <text class="allergen-text">暂未记录过敏原</text>
            </view>
          </view>

          <!-- 编辑按钮 -->
          <view class="edit-btn" @tap.stop="editBaby(b)">
            <text class="edit-icon">✎</text>
            <text class="edit-label">编辑</text>
          </view>
        </view>
      </view>

      <!-- 添加宝宝 -->
      <view class="add-row" @tap="addBaby">
        <text class="add-icon">+</text>
        <text class="add-text">添加宝宝</text>
      </view>

      <text class="tip-text">点击宝宝卡片即可切换当前宝宝，首页与辅食计划将按当前宝宝生成</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.babies-page {
  padding-top: 0;
}

.loading-tip {
  padding: 60rpx;
  text-align: center;
  color: var(--mini-text-muted);
  font-size: 26rpx;
}

/* 空态 */
.empty-card {
  margin-top: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.empty-desc {
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
  text-align: center;
}

.empty-btn {
  margin-top: 8rpx;
  width: 100%;
}

/* 宝宝列表 */
.baby-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.baby-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
}

.baby-row.active {
  border: 2rpx solid rgba(255, 179, 102, 0.5);
  background: rgba(255, 248, 240, 0.95);
}

/* 头像 */
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 999rpx;
  display: block;
}

.avatar-placeholder {
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

.online-dot {
  position: absolute;
  bottom: 2rpx;
  right: 2rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 999rpx;
  background: #4caf50;
  border: 3rpx solid #fff;
}

/* 信息 */
.info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.active-tag {
  font-size: 20rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
  background: rgba(255, 179, 102, 0.25);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.allergen-pill {
  display: inline-flex;
  margin-top: 10rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(214, 106, 106, 0.10);
}

.allergen-pill.empty {
  background: rgba(0, 0, 0, 0.05);
}

.allergen-text {
  font-size: 20rpx;
  color: #a44d4d;
}

.allergen-pill.empty .allergen-text {
  color: var(--mini-text-muted);
}

/* 编辑按钮 */
.edit-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.edit-icon {
  font-size: 30rpx;
  color: var(--mini-primary-deep);
}

.edit-label {
  font-size: 18rpx;
  color: var(--mini-text-muted);
}

/* 添加宝宝行 */
.add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-top: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  border: 2rpx dashed rgba(107, 98, 91, 0.2);
  background: rgba(255, 255, 255, 0.7);
}

.add-icon {
  font-size: 32rpx;
  color: var(--mini-primary-deep);
  font-weight: 700;
}

.add-text {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

/* 底部提示 */
.tip-text {
  display: block;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
  text-align: center;
  line-height: 1.8;
  padding: 0 16rpx;
}
</style>
