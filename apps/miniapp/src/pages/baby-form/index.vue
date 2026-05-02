<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { BabyProfilePayload } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { createBabyProfile, listBabyProfiles, takePostLoginRedirect, updateBabyProfile, uploadAvatar } from '@/services/api'

const isNewMode = ref(false)
const editingBabyId = ref('')

const saving = ref(false)
const nickname = ref('')
const birthDate = ref('')
const allergensText = ref('')
const avatarUrl = ref('')        // 永久 URL（上传后），用于提交
const avatarPreview = ref('')    // 临时路径，用于预览
const avatarUploading = ref(false)

const pageTitle = computed(() => isNewMode.value ? '添加宝宝' : '编辑宝宝档案')
const pageSubtitle = computed(() => isNewMode.value ? '填写宝宝基本信息' : '更新昵称、生日与过敏原信息')
const submitLabel = computed(() => saving.value ? '保存中...' : isNewMode.value ? '创建档案' : '保存修改')

onLoad(async (options) => {
  const babyId = options?.id ?? ''
  const isNew = options?.new === '1'

  if (isNew || !babyId) {
    isNewMode.value = true
    return
  }

  isNewMode.value = false
  editingBabyId.value = babyId

  try {
    const result = await listBabyProfiles()
    const baby = result.babies.find((b) => b.id === babyId)
    if (baby) {
      nickname.value = baby.nickname
      birthDate.value = baby.birthDate
      allergensText.value = baby.allergens.join('、')
      if (baby.avatar && baby.avatar.startsWith('https://')) {
        avatarUrl.value = baby.avatar
        avatarPreview.value = baby.avatar
      }
    }
  } catch {
    uni.showToast({ title: '加载档案失败', icon: 'none' })
  }
})

function normalizeAllergensInput(value: string) {
  return value
    .split(/[、，,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

// 微信 chooseAvatar 返回临时路径，立即上传到服务器换取永久 URL
async function onChooseAvatar(event: { detail: { avatarUrl: string } }) {
  const tempPath = event.detail.avatarUrl ?? ''
  if (!tempPath) return
  avatarPreview.value = tempPath   // 先显示临时图预览
  avatarUploading.value = true
  try {
    avatarUrl.value = await uploadAvatar(tempPath)
  } catch {
    uni.showToast({ title: '头像上传失败，可稍后重试', icon: 'none' })
    avatarUrl.value = ''
  } finally {
    avatarUploading.value = false
  }
}

// H5 环境下的头像选择
// #ifdef H5
function onH5ChooseAvatar() {
  uni.showToast({ title: 'H5 环境暂不支持头像上传', icon: 'none' })
}
// #endif

async function submitForm() {
  if (saving.value) return

  const trimmedNickname = nickname.value.trim()
  if (!trimmedNickname) {
    uni.showToast({ title: '请填写宝宝昵称', icon: 'none' })
    return
  }

  if (!birthDate.value) {
    uni.showToast({ title: '请选择宝宝生日', icon: 'none' })
    return
  }

  if (avatarUploading.value) {
    uni.showToast({ title: '头像上传中，请稍候', icon: 'none' })
    return
  }

  const payload: BabyProfilePayload = {
    nickname: trimmedNickname,
    birthDate: birthDate.value,
    allergens: normalizeAllergensInput(allergensText.value),
    avatarUrl: avatarUrl.value || undefined
  }

  saving.value = true

  try {
    if (!isNewMode.value && editingBabyId.value) {
      await updateBabyProfile(editingBabyId.value, payload)
      uni.showToast({ title: '已更新档案', icon: 'success' })
    } else {
      await createBabyProfile(payload)
      uni.showToast({ title: '档案创建成功', icon: 'success' })
    }

    const redirectUrl = takePostLoginRedirect()
    if (redirectUrl) {
      uni.reLaunch({ url: redirectUrl })
      return
    }

    const pageStack = getCurrentPages()
    if (pageStack.length > 1) {
      uni.navigateBack()
    } else {
      uni.reLaunch({ url: '/pages/home/index' })
    }
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '保存失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="page-shell baby-form-page">
    <AppNavBar :title="pageTitle" :subtitle="pageSubtitle" :show-back="true" />

    <view class="form-card card">
      <!-- 头像选择：open-type="chooseAvatar" 返回永久 CDN 链接 -->
      <view class="avatar-block">
        <!-- #ifdef MP-WEIXIN -->
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image
            v-if="avatarPreview"
            class="avatar-img"
            :src="avatarPreview"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-placeholder-icon">+</text>
            <text class="avatar-placeholder-text">上传头像</text>
          </view>
          <view v-if="avatarUploading" class="avatar-uploading-mask">
            <text class="avatar-uploading-text">上传中</text>
          </view>
        </button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <button class="avatar-btn" @tap="onH5ChooseAvatar">
          <image
            v-if="avatarPreview"
            class="avatar-img"
            :src="avatarPreview"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-placeholder-icon">+</text>
            <text class="avatar-placeholder-text">上传头像</text>
          </view>
        </button>
        <!-- #endif -->
        <text class="avatar-hint">{{ avatarUploading ? '上传中...' : avatarPreview ? '点击更换头像' : '点击选择宝宝头像（选填）' }}</text>
      </view>

      <view class="field-block">
        <text class="field-label">宝宝昵称</text>
        <input
          v-model="nickname"
          class="field-input"
          type="text"
          placeholder="请输入宝宝昵称"
          maxlength="20"
        />
      </view>

      <view class="field-block">
        <text class="field-label">宝宝生日</text>
        <picker mode="date" :value="birthDate" start="2018-01-01" end="2035-12-31" @change="birthDate = $event.detail.value">
          <view class="picker-input" :class="{ placeholder: !birthDate }">{{ birthDate || '请选择宝宝生日' }}</view>
        </picker>
      </view>

      <view class="field-block">
        <text class="field-label">过敏原</text>
        <textarea
          v-model="allergensText"
          class="textarea-input"
          placeholder="选填，多个过敏原可用顿号、逗号或空格分隔"
          maxlength="120"
        />
      </view>

      <view class="tip-card soft-card">
        <text class="tip-text">生日将自动换算月龄和辅食阶段，后续首页与生成计划都会按当前宝宝档案取数。</text>
      </view>

      <view class="primary-button submit-btn" @tap="submitForm">{{ submitLabel }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.baby-form-page {
  padding-bottom: 60rpx;
}

.form-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36rpx;
}

.avatar-uploading-mask {
  position: absolute;
  inset: 0;
  border-radius: 80rpx;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploading-text {
  font-size: 22rpx;
  color: #fff;
}

.avatar-btn {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  overflow: hidden;
  line-height: 1;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  display: block;
}

.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 3rpx dashed rgba(107, 98, 91, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.avatar-placeholder-icon {
  font-size: 48rpx;
  line-height: 1;
  color: var(--mini-primary-deep);
  opacity: 0.6;
}

.avatar-placeholder-text {
  font-size: 20rpx;
  color: var(--mini-text-muted);
}

.avatar-hint {
  margin-top: 14rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.field-block + .field-block {
  margin-top: 28rpx;
}

.field-label {
  display: block;
  margin-bottom: 14rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.field-input,
.picker-input,
.textarea-input {
  width: 100%;
  border-radius: 24rpx;
  background: rgba(255,255,255,0.9);
  box-sizing: border-box;
  font-size: 26rpx;
  color: var(--mini-text);
}

.field-input,
.picker-input {
  height: 92rpx;
  padding: 0 24rpx;
}

.field-input {
  line-height: 92rpx;
}

.picker-input {
  display: flex;
  align-items: center;
}

.placeholder {
  color: var(--mini-text-muted);
}

.textarea-input {
  min-height: 180rpx;
  padding: 24rpx;
}

.tip-card {
  margin-top: 28rpx;
  padding: 24rpx;
}

.tip-text {
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.submit-btn {
  margin-top: 28rpx;
}
</style>
