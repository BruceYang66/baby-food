<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { BabyProfilePayload, FamilyMember } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import {
  createBabyProfile,
  getFamilyMembers,
  leaveFamily,
  listBabyProfiles,
  takePostLoginRedirect,
  updateBabyProfile,
  uploadAvatar
} from '@/services/api'

const isNewMode = ref(false)
const editingBabyId = ref('')
const readonlyMode = ref(false)
const loading = ref(false)
const saving = ref(false)
const leaving = ref(false)
const nickname = ref('')
const birthDate = ref('')
const allergensText = ref('')
const avatarUrl = ref('')
const avatarPreview = ref('')
const avatarUploading = ref(false)
const monthAgeLabel = ref('')
const stageLabel = ref('')
const currentMember = ref<FamilyMember | null>(null)

const pageTitle = computed(() => {
  if (isNewMode.value) {
    return '添加宝宝'
  }

  return readonlyMode.value ? '宝宝信息' : '编辑宝宝档案'
})

const pageSubtitle = computed(() => {
  if (isNewMode.value) {
    return '填写宝宝基本信息'
  }

  return readonlyMode.value ? '查看宝宝资料与亲友团身份' : '更新昵称、生日与过敏原信息'
})

const submitLabel = computed(() => saving.value ? '保存中...' : isNewMode.value ? '创建档案' : '保存修改')
const relationshipLabel = computed(() => currentMember.value?.relationshipLabel?.trim() || '亲友')
const roleLabel = computed(() => {
  const role = currentMember.value?.role
  if (role === 'owner') {
    return '拥有者'
  }
  if (role === 'viewer') {
    return '只读成员'
  }
  if (role === 'editor') {
    return '协作成员'
  }
  return '家庭成员'
})
const displayAllergens = computed(() => normalizeAllergensInput(allergensText.value).join('、') || '暂未记录')
const coverInitial = computed(() => nickname.value.trim().charAt(0) || '宝')

onLoad(async (options) => {
  const babyId = options?.id ?? ''
  const isNew = options?.new === '1'

  if (isNew || !babyId) {
    isNewMode.value = true
    return
  }

  isNewMode.value = false
  editingBabyId.value = babyId
  loading.value = true

  try {
    const result = await listBabyProfiles()
    const baby = result.babies.find((item) => item.id === babyId)

    if (!baby) {
      uni.showToast({ title: '未找到宝宝档案', icon: 'none' })
      return
    }

    nickname.value = baby.nickname
    birthDate.value = baby.birthDate
    allergensText.value = baby.allergens.join('、')
    monthAgeLabel.value = baby.monthAgeLabel
    stageLabel.value = baby.stageLabel

    if (baby.avatar) {
      avatarUrl.value = baby.avatar
      avatarPreview.value = baby.avatar
    }

    readonlyMode.value = baby.isOwner !== true

    if (readonlyMode.value) {
      const familyData = await getFamilyMembers(babyId)
      currentMember.value = familyData.members.find((member) => member.isCurrentUser) ?? null
    }
  } catch {
    uni.showToast({ title: '加载档案失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

function normalizeAllergensInput(value: string) {
  return value
    .split(/[、，,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

async function onChooseAvatar(event: { detail: { avatarUrl: string } }) {
  const tempPath = event.detail.avatarUrl ?? ''
  if (!tempPath || readonlyMode.value) return
  avatarPreview.value = tempPath
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

// #ifdef H5
function onH5ChooseAvatar() {
  if (readonlyMode.value) {
    return
  }

  uni.showToast({ title: 'H5 环境暂不支持头像上传', icon: 'none' })
}
// #endif

async function submitForm() {
  if (saving.value || readonlyMode.value) return

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

async function handleLeaveFamily() {
  if (!editingBabyId.value || leaving.value || !readonlyMode.value) {
    return
  }

  const confirm = await uni.showModal({
    title: '退出亲友团',
    content: '退出后你将不再关注当前宝宝，也无法继续查看宝宝资料和家庭记录。',
    confirmText: '确认退出',
    cancelText: '再想想'
  })

  if (!confirm.confirm) {
    return
  }

  leaving.value = true
  try {
    await leaveFamily(editingBabyId.value)
    uni.showToast({ title: '已退出亲友团', icon: 'success' })
    uni.reLaunch({ url: '/pages/profile/index' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '退出失败', icon: 'none' })
  } finally {
    leaving.value = false
  }
}
</script>

<template>
  <view class="page-shell baby-form-page" :class="{ 'readonly-shell': readonlyMode }">
    <AppNavBar v-if="!readonlyMode" :title="pageTitle" :subtitle="pageSubtitle" :show-back="true" />
    <AppNavBar v-else :show-back="true" :reserve-left-space="true">
      <template #center>
        <view class="readonly-nav-slot">
          <text class="readonly-nav-title">{{ pageTitle }}</text>
          <text class="readonly-nav-subtitle">{{ pageSubtitle }}</text>
        </view>
      </template>
    </AppNavBar>

    <view v-if="loading" class="loading-card">
      <text>加载中...</text>
    </view>

    <template v-else-if="readonlyMode">
      <view class="readonly-hero">
        <view class="readonly-cover">
          <image v-if="avatarPreview" class="readonly-cover-image" :src="avatarPreview" mode="aspectFill" />
          <view v-else class="readonly-cover-fallback" />
          <view class="readonly-avatar-wrap">
            <image v-if="avatarPreview" class="readonly-avatar" :src="avatarPreview" mode="aspectFill" />
            <view v-else class="readonly-avatar-placeholder">{{ coverInitial }}</view>
          </view>
        </view>
      </view>

      <view class="readonly-panel">
        <view class="readonly-row">
          <text class="readonly-label">宝宝小名</text>
          <text class="readonly-value">{{ nickname }}</text>
        </view>
        <view class="readonly-row">
          <text class="readonly-label">宝宝生日</text>
          <text class="readonly-value">{{ birthDate }}</text>
        </view>
        <view class="readonly-row">
          <text class="readonly-label">月龄阶段</text>
          <text class="readonly-value">{{ monthAgeLabel }} · {{ stageLabel }}</text>
        </view>
        <view class="readonly-row">
          <text class="readonly-label">我是宝宝的</text>
          <text class="readonly-value">{{ relationshipLabel }}</text>
        </view>
        <view class="readonly-row multi-line">
          <text class="readonly-label">过敏原</text>
          <text class="readonly-value">{{ displayAllergens }}</text>
        </view>
        <view class="readonly-row borderless">
          <text class="readonly-label">当前身份</text>
          <text class="readonly-value accent">{{ roleLabel }}</text>
        </view>
      </view>

      <view class="readonly-action danger-button" @tap="handleLeaveFamily">
        {{ leaving ? '退出中...' : '退出亲友团' }}
      </view>
    </template>

    <view v-else class="form-card card">
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

.readonly-shell {
  background: var(--mini-family-bg);
}

.readonly-nav-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.readonly-nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-family-text);
}

.readonly-nav-subtitle {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-family-text-muted);
}

.loading-card {
  margin-top: 24rpx;
  padding: 40rpx;
  text-align: center;
  color: var(--mini-text-muted);
}

.readonly-hero {
  margin-top: 24rpx;
}

.readonly-cover {
  position: relative;
  min-height: 320rpx;
  border-radius: 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 79, 147, 0.42), rgba(255, 179, 102, 0.18));
  border: 1rpx solid var(--mini-family-border);
}

.readonly-cover-image,
.readonly-cover-fallback {
  width: 100%;
  height: 320rpx;
  display: block;
}

.readonly-cover-image {
  opacity: 0.28;
}

.readonly-cover-fallback {
  background: linear-gradient(135deg, rgba(255, 79, 147, 0.4), rgba(255, 179, 102, 0.18));
}

.readonly-avatar-wrap {
  position: absolute;
  left: 28rpx;
  bottom: 28rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 999rpx;
  padding: 8rpx;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(16rpx);
}

.readonly-avatar,
.readonly-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 999rpx;
}

.readonly-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
  color: var(--mini-family-text);
  font-size: 40rpx;
  font-weight: 700;
}

.readonly-panel {
  margin-top: 24rpx;
  border-radius: 28rpx;
  background: var(--mini-family-surface);
  border: 1rpx solid var(--mini-family-border);
  overflow: hidden;
}

.readonly-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  min-height: 108rpx;
  padding: 0 28rpx;
  border-bottom: 1rpx solid var(--mini-family-border);
}

.readonly-row.multi-line {
  align-items: flex-start;
  padding-top: 26rpx;
  padding-bottom: 26rpx;
}

.readonly-row.borderless {
  border-bottom: none;
}

.readonly-label {
  flex-shrink: 0;
  font-size: 26rpx;
  color: var(--mini-family-text);
}

.readonly-value {
  text-align: right;
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--mini-family-text-muted);
}

.readonly-value.accent {
  color: var(--mini-family-accent);
  font-weight: 700;
}

.readonly-action {
  margin-top: 28rpx;
}

.danger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 92rpx;
  border-radius: 24rpx;
  background: rgba(214, 106, 106, 0.18);
  color: #F6B5B5;
  font-size: 30rpx;
  font-weight: 700;
  border: 1rpx solid rgba(214, 106, 106, 0.3);
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
