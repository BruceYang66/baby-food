<script setup lang="ts">
import { ref } from 'vue'
import { updateUserProfile, readAuthSession } from '@/services/api'

const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbgIUEab7BuoSHZ3pgRyDMaiaSSD1ZklDkD4siaA/0'

const avatarUrl = ref('')
const nickname = ref('')
const saving = ref(false)

// 用户选择微信头像
function onChooseAvatar(e: { detail: { avatarUrl: string } }) {
  avatarUrl.value = e.detail.avatarUrl
}

async function save() {
  const name = nickname.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  saving.value = true
  try {
    await updateUserProfile({
      nickname: name,
      avatarUrl: avatarUrl.value || undefined
    })

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
  <view class="page">
    <view class="header">
      <text class="title">完善个人信息</text>
      <text class="subtitle">设置你的昵称和头像</text>
    </view>

    <view class="avatar-section">
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image
          class="avatar-img"
          :src="avatarUrl || DEFAULT_AVATAR"
          mode="aspectFill"
        />
        <view class="avatar-edit-badge">
          <text class="avatar-edit-icon">✎</text>
        </view>
      </button>
      <text class="avatar-hint">点击更换微信头像</text>
    </view>

    <view class="form-section">
      <view class="field-label">昵称</view>
      <!-- type="nickname" 会触发微信昵称选择器 -->
      <input
        class="nickname-input"
        type="nickname"
        :value="nickname"
        placeholder="点击使用微信昵称"
        placeholder-class="input-placeholder"
        @change="nickname = ($event.detail as any).value"
        @input="nickname = ($event.detail as any).value"
      />
    </view>

    <view class="actions">
      <button
        class="btn-primary"
        :disabled="saving"
        @tap="save"
      >
        {{ saving ? '保存中...' : '完成设置' }}
      </button>
      <text class="btn-skip" @tap="skip">跳过，稍后再设置</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: var(--mini-bg, #FDF8F3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 60rpx;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: var(--mini-text, #1a1a1a);
}

.subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--mini-text-muted, #888);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.avatar-btn {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  border: none;
  overflow: visible;

  &::after {
    border: none;
  }
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(0, 93, 170, 0.15);
}

.avatar-edit-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--mini-primary, #005daa);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-icon {
  font-size: 24rpx;
  color: #fff;
}

.avatar-hint {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted, #888);
}

.form-section {
  width: 100%;
  margin-bottom: 48rpx;
}

.field-label {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--mini-text-muted, #888);
  margin-bottom: 16rpx;
}

.nickname-input {
  width: 100%;
  height: 96rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  color: var(--mini-text, #1a1a1a);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.input-placeholder {
  color: #bbb;
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
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
  font-size: 26rpx;
  color: var(--mini-text-muted, #888);
}
</style>
