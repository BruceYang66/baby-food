<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { BabyProfilePayload } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { createBabyProfile, listBabyProfiles, takePostLoginRedirect, updateBabyProfile, updateUserProfile } from '@/services/api'

const isNewMode = ref(false)
const editingBabyId = ref('')

const saving = ref(false)
const nickname = ref('')
const birthDate = ref('')
const allergensText = ref('')
const avatarUrl = ref('')  // 始终是 https://thirdwx.qpic.cn/... 永久链接或空

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
      // 只回填 https 永久链接，本地临时路径不回填
      avatarUrl.value = (baby.avatar && baby.avatar.startsWith('https://')) ? baby.avatar : ''
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

// 微信 chooseAvatar 返回的是 https://thirdwx.qpic.cn/... 永久 CDN 链接
// 预览时接受任何 URL（含本地 tmp 路径），提交时再过滤只存 https 链接
function onChooseAvatar(event: { detail: { avatarUrl: string } }) {
  const url = event.detail.avatarUrl ?? ''
  if (url) {
    avatarUrl.value = url
  }
}

// H5 环境下的头像选择
// #ifdef H5
function onH5ChooseAvatar() {
  uni.showToast({ title: 'H5 环境暂不支持头像上传', icon: 'none' })
}
// #endif

// open-type="nickname" 的输入框在真机上会弹出微信昵称选择面板
// 使用 @blur（失焦）或 @confirm（回车）事件捕获值，@input 与该 type 存在兼容性问题
function onNicknameInput(event: { detail: { value: string } }) {
  nickname.value = event.detail.value
}

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

  const validAvatarUrl = (avatarUrl.value && avatarUrl.value.startsWith('https://'))
    ? avatarUrl.value
    : undefined

  const payload: BabyProfilePayload = {
    nickname: trimmedNickname,
    birthDate: birthDate.value,
    allergens: normalizeAllergensInput(allergensText.value),
    avatarUrl: validAvatarUrl
  }

  saving.value = true

  try {
    if (!isNewMode.value && editingBabyId.value) {
      await updateBabyProfile(editingBabyId.value, payload)
      uni.showToast({ title: '已更新档案', icon: 'success' })
    } else {
      await createBabyProfile(payload)
      uni.showToast({ title: '档案创建成功', icon: 'success' })

      // 新建宝宝时，同步将头像保存到用户账号（首页头像兜底显示用）
      if (validAvatarUrl) {
        updateUserProfile({ avatarUrl: validAvatarUrl }).catch(() => {/* 静默失败 */})
      }
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
            v-if="avatarUrl"
            class="avatar-img"
            :src="avatarUrl"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-placeholder-icon">+</text>
            <text class="avatar-placeholder-text">上传头像</text>
          </view>
        </button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <button class="avatar-btn" @tap="onH5ChooseAvatar">
          <image
            v-if="avatarUrl"
            class="avatar-img"
            :src="avatarUrl"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-placeholder-icon">+</text>
            <text class="avatar-placeholder-text">上传头像</text>
          </view>
        </button>
        <!-- #endif -->
        <text class="avatar-hint">{{ avatarUrl ? '点击更换头像' : '点击选择宝宝头像（选填）' }}</text>
      </view>

      <!-- 宝宝昵称：open-type="nickname" 触发微信昵称填写面板 -->
      <view class="field-block">
        <text class="field-label">宝宝昵称</text>
        <!-- #ifdef MP-WEIXIN -->
        <input
          class="field-input"
          type="nickname"
          :value="nickname"
          placeholder="点击选择或输入宝宝昵称"
          maxlength="20"
          @blur="onNicknameInput"
          @confirm="onNicknameInput"
        />
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <input
          v-model="nickname"
          class="field-input"
          type="text"
          placeholder="请输入宝宝昵称"
          maxlength="20"
        />
        <!-- #endif -->
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

.avatar-btn {
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
