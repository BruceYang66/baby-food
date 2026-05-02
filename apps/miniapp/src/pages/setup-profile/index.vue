<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { readAuthSession, updateUserProfile, uploadAvatar } from '@/services/api'

const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbgIUEab7BuoSHZ3pgRyDMaiaSSD1ZklDkD4siaA/0'

const isEditMode = ref(false)
const avatarUrl = ref('')
const avatarPreview = ref('')
const nickname = ref('')
const saving = ref(false)
const avatarUploading = ref(false)

const pageTitle = computed(() => isEditMode.value ? '个人信息' : '完善个人信息')
const pageSubtitle = computed(() => isEditMode.value ? '修改头像和昵称' : '设置你的昵称和头像')
const submitText = computed(() => saving.value ? '保存中...' : isEditMode.value ? '保存修改' : '完成设置')
const avatarDisplay = computed(() => avatarPreview.value || avatarUrl.value || DEFAULT_AVATAR)
const avatarHint = computed(() => avatarUploading.value ? '头像上传中...' : '点击更换头像')

onLoad((options) => {
  isEditMode.value = options?.mode === 'edit'

  const session = readAuthSession()
  avatarUrl.value = session?.user.avatarUrl ?? ''
  avatarPreview.value = avatarUrl.value
  nickname.value = session?.user.nickname ?? ''
})

async function onChooseAvatar(event: { detail: { avatarUrl: string } }) {
  const tempPath = event.detail.avatarUrl ?? ''
  if (!tempPath || avatarUploading.value) {
    return
  }

  avatarPreview.value = tempPath
  avatarUploading.value = true
  try {
    avatarUrl.value = await uploadAvatar(tempPath)
    avatarPreview.value = avatarUrl.value
  } catch {
    uni.showToast({ title: '头像上传失败，可稍后重试', icon: 'none' })
    avatarPreview.value = avatarUrl.value
  } finally {
    avatarUploading.value = false
  }
}

// #ifdef H5
function onH5ChooseAvatar() {
  uni.showToast({ title: 'H5 环境暂不支持头像上传', icon: 'none' })
}
// #endif

function handleNicknameChange(event: { detail: { value?: string } }) {
  nickname.value = event.detail.value ?? ''
}

function returnToProfile() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({
    url: '/pages/profile/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/profile/index' })
    }
  })
}

async function save() {
  const name = nickname.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  if (avatarUploading.value) {
    uni.showToast({ title: '头像上传中，请稍候', icon: 'none' })
    return
  }

  saving.value = true
  try {
    await updateUserProfile({
      nickname: name,
      avatarUrl: avatarUrl.value || undefined
    })

    if (isEditMode.value) {
      uni.showToast({ title: '已保存', icon: 'success' })
      returnToProfile()
      return
    }

    const session = readAuthSession()
    if (!session?.hasBaby) {
      uni.reLaunch({ url: '/pages/baby-form/index' })
    } else {
      uni.reLaunch({ url: '/pages/home/index' })
    }
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

function skip() {
  const session = readAuthSession()
  if (!session?.hasBaby) {
    uni.reLaunch({ url: '/pages/baby-form/index' })
  } else {
    uni.reLaunch({ url: '/pages/home/index' })
  }
}
</script>

<template>
  <view class="page-shell profile-setup-page">
    <AppNavBar :title="pageTitle" :subtitle="pageSubtitle" :show-back="isEditMode" />

    <view class="profile-card card">
      <view class="profile-row avatar-row">
        <text class="row-label">头像</text>
        <!-- #ifdef MP-WEIXIN -->
        <button class="avatar-picker" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image class="avatar-img" :src="avatarDisplay" mode="aspectFill" />
          <text class="row-arrow">›</text>
        </button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <button class="avatar-picker" @tap="onH5ChooseAvatar">
          <image class="avatar-img" :src="avatarDisplay" mode="aspectFill" />
          <text class="row-arrow">›</text>
        </button>
        <!-- #endif -->
      </view>

      <view class="row-divider"></view>

      <view class="profile-row nickname-row">
        <text class="row-label">昵称</text>
        <view class="nickname-field">
          <input
            class="nickname-input"
            type="nickname"
            :value="nickname"
            placeholder="请输入昵称"
            placeholder-class="input-placeholder"
            maxlength="20"
            @change="handleNicknameChange"
            @input="handleNicknameChange"
          />
          <text class="row-arrow">›</text>
        </view>
      </view>
    </view>

    <text class="avatar-hint">{{ avatarHint }}</text>

    <view class="actions">
      <button class="btn-primary" :disabled="saving" @tap="save">{{ submitText }}</button>
      <text v-if="!isEditMode" class="btn-skip" @tap="skip">跳过，稍后再设置</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.profile-setup-page {
  padding-top: 0;
  padding-bottom: 60rpx;
}

.profile-card {
  margin-top: 24rpx;
  padding: 0 28rpx;
  overflow: hidden;
}

.profile-row {
  min-height: 124rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.row-label {
  flex-shrink: 0;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.avatar-picker {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;

  &::after {
    border: none;
  }
}

.avatar-img {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999rpx;
  display: block;
  background: rgba(255,255,255,0.92);
}

.nickname-field {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14rpx;
}

.nickname-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  text-align: right;
  font-size: 32rpx;
  color: var(--mini-text);
}

.input-placeholder {
  color: #bbb;
}

.row-arrow {
  flex-shrink: 0;
  font-size: 40rpx;
  line-height: 1;
  color: var(--mini-text-muted);
}

.row-divider {
  height: 1rpx;
  background: rgba(0, 0, 0, 0.06);
}

.avatar-hint {
  display: block;
  margin-top: 18rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
  text-align: right;
}

.actions {
  width: 100%;
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  border-radius: 999rpx;
  background: var(--mini-primary, #005daa);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  box-shadow: 0 12rpx 30rpx rgba(0, 93, 170, 0.25);

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.6;
  }
}

.btn-skip {
  text-align: center;
  font-size: 26rpx;
  color: var(--mini-text-muted, #888);
}
</style>
