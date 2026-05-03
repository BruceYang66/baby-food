<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { BabyGender, BabyProfilePayload, FamilyMember } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import {
  createBabyProfile,
  getFamilyMembers,
  leaveFamily,
  listBabyProfiles,
  normalizeAppImageUrl,
  takePostLoginRedirect,
  updateBabyProfile,
  uploadAvatar
} from '@/services/api'

const genderOptions: Array<{ value: BabyGender; label: string }> = [
  { value: 'girl', label: '小公主' },
  { value: 'boy', label: '小王子' }
]

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
const backgroundImageUrl = ref('')
const backgroundPreview = ref('')
const backgroundUploading = ref(false)
const relationshipInput = ref('')
const gender = ref<BabyGender | ''>('')
const monthAgeLabel = ref('')
const stageLabel = ref('')
const currentMember = ref<FamilyMember | null>(null)

const pageTitle = computed(() => {
  if (isNewMode.value) {
    return '添加宝宝'
  }

  return readonlyMode.value ? '宝宝信息' : '编辑宝宝信息'
})

const pageSubtitle = computed(() => {
  if (isNewMode.value) {
    return '完善头像、背景和基础资料'
  }

  return readonlyMode.value ? '查看宝宝资料与亲友团身份' : '修改宝宝头像、背景与基础资料'
})

const submitLabel = computed(() => saving.value ? '保存中...' : isNewMode.value ? '创建档案' : '保存修改')
const relationshipLabel = computed(() => currentMember.value?.relationshipLabel?.trim() || relationshipInput.value.trim() || '亲友')
const roleLabel = computed(() => {
  const role = currentMember.value?.role
  if (role === 'viewer') {
    return '只读成员'
  }
  if (role === 'editor') {
    return '协作成员'
  }
  if (role === 'owner') {
    return '拥有者'
  }
  return '家庭成员'
})
const displayAllergens = computed(() => normalizeAllergensInput(allergensText.value).join('、') || '暂未记录')
const coverInitial = computed(() => nickname.value.trim().charAt(0) || '宝')
const displayGenderLabel = computed(() => {
  if (gender.value === 'girl') {
    return '小公主'
  }
  if (gender.value === 'boy') {
    return '小王子'
  }
  return '未设置'
})
const heroMeta = computed(() => {
  if (monthAgeLabel.value && stageLabel.value) {
    return `${monthAgeLabel.value} · ${stageLabel.value}`
  }

  return monthAgeLabel.value || stageLabel.value || '填写生日后自动计算月龄阶段'
})

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
    relationshipInput.value = baby.relationshipLabel ?? ''
    gender.value = baby.gender ?? ''
    avatarUrl.value = baby.avatar || ''
    avatarPreview.value = normalizeAppImageUrl(baby.avatar || '')
    backgroundImageUrl.value = baby.backgroundImageUrl || ''
    backgroundPreview.value = normalizeAppImageUrl(baby.backgroundImageUrl || '')
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

function onBirthDateChange(event: { detail: { value: string } }) {
  birthDate.value = event.detail.value
}

function selectGender(value: BabyGender) {
  if (readonlyMode.value) {
    return
  }

  gender.value = value
}

async function uploadImage(kind: 'avatar' | 'background', tempPath: string) {
  if (!tempPath) {
    return
  }

  const previousPreview = kind === 'avatar' ? avatarPreview.value : backgroundPreview.value
  const previousUrl = kind === 'avatar' ? avatarUrl.value : backgroundImageUrl.value

  if (kind === 'avatar') {
    avatarPreview.value = tempPath
    avatarUploading.value = true
  } else {
    backgroundPreview.value = tempPath
    backgroundUploading.value = true
  }

  try {
    const uploadedUrl = await uploadAvatar(tempPath)
    const normalizedUrl = normalizeAppImageUrl(uploadedUrl)

    if (kind === 'avatar') {
      avatarUrl.value = uploadedUrl
      avatarPreview.value = normalizedUrl || tempPath
    } else {
      backgroundImageUrl.value = uploadedUrl
      backgroundPreview.value = normalizedUrl || tempPath
    }
  } catch {
    if (kind === 'avatar') {
      avatarUrl.value = previousUrl
      avatarPreview.value = previousPreview
      uni.showToast({ title: '头像上传失败，可稍后重试', icon: 'none' })
    } else {
      backgroundImageUrl.value = previousUrl
      backgroundPreview.value = previousPreview
      uni.showToast({ title: '背景上传失败，可稍后重试', icon: 'none' })
    }
  } finally {
    if (kind === 'avatar') {
      avatarUploading.value = false
    } else {
      backgroundUploading.value = false
    }
  }
}

async function onChooseAvatar(event: { detail: { avatarUrl: string } }) {
  if (readonlyMode.value) {
    return
  }

  await uploadImage('avatar', event.detail.avatarUrl ?? '')
}

async function chooseImage(kind: 'avatar' | 'background') {
  if (readonlyMode.value || avatarUploading.value || backgroundUploading.value) {
    return
  }

  try {
    const result = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    const tempPath = result.tempFilePaths?.[0] ?? ''
    await uploadImage(kind, tempPath)
  } catch {
    return
  }
}

async function onChooseBackground() {
  await chooseImage('background')
}

// #ifdef H5
async function onH5ChooseAvatar() {
  await chooseImage('avatar')
}
// #endif

async function submitForm() {
  if (saving.value || readonlyMode.value) {
    return
  }

  const trimmedNickname = nickname.value.trim()
  if (!trimmedNickname) {
    uni.showToast({ title: '请填写宝宝昵称', icon: 'none' })
    return
  }

  if (!birthDate.value) {
    uni.showToast({ title: '请选择宝宝生日', icon: 'none' })
    return
  }

  if (avatarUploading.value || backgroundUploading.value) {
    uni.showToast({ title: '图片上传中，请稍候', icon: 'none' })
    return
  }

  const payload: BabyProfilePayload = {
    nickname: trimmedNickname,
    birthDate: birthDate.value,
    allergens: normalizeAllergensInput(allergensText.value),
    avatarUrl: avatarUrl.value || undefined,
    backgroundImageUrl: backgroundImageUrl.value || undefined,
    relationshipLabel: relationshipInput.value,
    gender: gender.value || undefined
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

async function handlePrimaryAction() {
  if (readonlyMode.value) {
    await handleLeaveFamily()
    return
  }

  await submitForm()
}
</script>

<template>
  <view class="page-shell baby-form-page">
    <AppNavBar :title="pageTitle" :subtitle="pageSubtitle" :show-back="true" />

    <view v-if="loading" class="loading-card">
      <text>加载中...</text>
    </view>

    <template v-else>
      <view class="hero-card">
        <image v-if="backgroundPreview" class="hero-card-bg" :src="backgroundPreview" mode="aspectFill" />
        <view v-else class="hero-card-fallback" />
        <view class="hero-card-overlay" />

        <button v-if="!readonlyMode" class="background-btn" @tap="onChooseBackground">
          <text class="background-btn-icon">🖼</text>
          <text class="background-btn-text">{{ backgroundUploading ? '上传中' : '换背景' }}</text>
        </button>

        <view v-if="backgroundUploading" class="hero-upload-mask">
          <text class="hero-upload-text">背景上传中...</text>
        </view>

        <view class="hero-content">
          <view class="hero-avatar-wrap">
            <view v-if="readonlyMode" class="hero-avatar-static">
              <image v-if="avatarPreview" class="hero-avatar" :src="avatarPreview" mode="aspectFill" />
              <view v-else class="hero-avatar-placeholder">{{ coverInitial }}</view>
            </view>
            <template v-else>
              <!-- #ifdef MP-WEIXIN -->
              <button class="hero-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                <image v-if="avatarPreview" class="hero-avatar" :src="avatarPreview" mode="aspectFill" />
                <view v-else class="hero-avatar-placeholder">{{ coverInitial }}</view>
                <view v-if="avatarUploading" class="avatar-upload-mask">
                  <text class="avatar-upload-text">上传中</text>
                </view>
                <view class="hero-avatar-badge">📷</view>
              </button>
              <!-- #endif -->
              <!-- #ifdef H5 -->
              <button class="hero-avatar-btn" @tap="onH5ChooseAvatar">
                <image v-if="avatarPreview" class="hero-avatar" :src="avatarPreview" mode="aspectFill" />
                <view v-else class="hero-avatar-placeholder">{{ coverInitial }}</view>
                <view v-if="avatarUploading" class="avatar-upload-mask">
                  <text class="avatar-upload-text">上传中</text>
                </view>
                <view class="hero-avatar-badge">📷</view>
              </button>
              <!-- #endif -->
            </template>
          </view>

          <view class="hero-copy">
            <text class="hero-name">{{ nickname || '宝宝小名' }}</text>
            <text class="hero-meta">{{ heroMeta }}</text>
            <view class="hero-tags">
              <text v-if="displayGenderLabel !== '未设置'" class="hero-tag">{{ displayGenderLabel }}</text>
              <text v-if="readonlyMode" class="hero-tag muted">{{ roleLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="info-card">
        <view class="info-row">
          <text class="info-label">宝宝小名</text>
          <input
            v-if="!readonlyMode"
            v-model="nickname"
            class="info-input"
            type="text"
            placeholder="请输入宝宝小名"
            maxlength="20"
          />
          <text v-else class="info-value">{{ nickname || '未填写' }}</text>
        </view>

        <view class="info-row gender-row">
          <text class="info-label">宝宝性别</text>
          <view v-if="!readonlyMode" class="gender-options">
            <view
              v-for="option in genderOptions"
              :key="option.value"
              class="gender-option"
              :class="{ active: gender === option.value }"
              @tap="selectGender(option.value)"
            >
              {{ option.label }}
            </view>
          </view>
          <text v-else class="info-value">{{ displayGenderLabel }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">宝宝出生日期</text>
          <picker v-if="!readonlyMode" mode="date" :value="birthDate" start="2018-01-01" end="2035-12-31" @change="onBirthDateChange">
            <view class="picker-value" :class="{ placeholder: !birthDate }">{{ birthDate || '请选择宝宝生日' }}</view>
          </picker>
          <text v-else class="info-value">{{ birthDate || '未填写' }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">我是宝宝的</text>
          <input
            v-if="!readonlyMode"
            v-model="relationshipInput"
            class="info-input"
            type="text"
            placeholder="如：妈妈、爸爸、奶奶"
            maxlength="12"
          />
          <text v-else class="info-value">{{ relationshipLabel }}</text>
        </view>
      </view>

      <view class="helper-card">
        <view class="helper-head">
          <text class="helper-title">补充信息</text>
          <text class="helper-meta">{{ monthAgeLabel || '保存后自动计算月龄阶段' }}</text>
        </view>
        <text class="helper-stage">{{ stageLabel || '填写生日后将自动生成对应辅食阶段' }}</text>
        <textarea
          v-if="!readonlyMode"
          v-model="allergensText"
          class="allergen-input"
          placeholder="过敏原选填，多个项目可用顿号、逗号或空格分隔"
          maxlength="120"
        />
        <view v-else class="allergen-readonly">{{ displayAllergens }}</view>
      </view>

      <view
        class="bottom-action"
        :class="readonlyMode ? 'danger' : 'primary'"
        @tap="handlePrimaryAction"
      >
        {{ readonlyMode ? (leaving ? '退出中...' : '退出亲友团') : submitLabel }}
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.baby-form-page {
  padding-bottom: 72rpx;
}

.loading-card {
  margin-top: 24rpx;
  padding: 40rpx;
  text-align: center;
  color: var(--mini-text-muted);
}

.hero-card {
  position: relative;
  overflow: hidden;
  min-height: 348rpx;
  margin-top: 24rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, rgba(236, 223, 215, 0.96), rgba(251, 245, 239, 0.98));
  box-shadow: var(--mini-shadow-soft);
}

.hero-card-bg,
.hero-card-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-card-bg {
  transform: scale(1.03);
}

.hero-card-fallback {
  background: linear-gradient(135deg, rgba(236, 223, 215, 0.94), rgba(251, 245, 239, 0.98));
}

.hero-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(84, 59, 44, 0.06) 0%, rgba(84, 59, 44, 0.24) 100%);
}

.background-btn,
.hero-avatar-btn {
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  line-height: 1;
}

.background-btn::after,
.hero-avatar-btn::after {
  border: none;
}

.background-btn {
  position: absolute;
  top: 22rpx;
  right: 22rpx;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  height: 58rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(43, 30, 23, 0.42);
  color: #fff;
}

.background-btn-icon,
.background-btn-text {
  font-size: 22rpx;
}

.hero-upload-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(33, 23, 18, 0.18);
}

.hero-upload-text {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  color: var(--mini-text);
  font-size: 24rpx;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 22rpx;
  min-height: 348rpx;
  padding: 34rpx 28rpx 28rpx;
}

.hero-avatar-wrap {
  flex-shrink: 0;
}

.hero-avatar-static {
  width: 144rpx;
  height: 144rpx;
}

.hero-avatar-btn {
  position: relative;
  width: 144rpx;
  height: 144rpx;
  border-radius: 999rpx;
}

.hero-avatar,
.hero-avatar-placeholder {
  width: 144rpx;
  height: 144rpx;
  border-radius: 999rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.92);
  box-sizing: border-box;
  box-shadow: 0 16rpx 28rpx rgba(0, 0, 0, 0.12);
}

.hero-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 239, 231, 0.98));
  color: var(--mini-primary-deep);
  font-size: 52rpx;
  font-weight: 700;
}

.avatar-upload-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: rgba(21, 15, 12, 0.4);
}

.avatar-upload-text {
  color: #fff;
  font-size: 22rpx;
}

.hero-avatar-badge {
  position: absolute;
  right: 0;
  bottom: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.12);
  font-size: 22rpx;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
  padding-bottom: 6rpx;
}

.hero-name {
  display: block;
  color: #fff;
  font-size: 44rpx;
  line-height: 1.15;
  font-weight: 700;
}

.hero-meta {
  display: block;
  color: rgba(255, 255, 255, 0.94);
  font-size: 24rpx;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.hero-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #7b5d4b;
  font-size: 20rpx;
  font-weight: 700;
}

.hero-tag.muted {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.info-card,
.helper-card {
  margin-top: 24rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--mini-shadow-card);
}

.info-card {
  padding: 0 28rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  min-height: 112rpx;
}

.info-row + .info-row {
  border-top: 1rpx solid rgba(107, 98, 91, 0.08);
}

.info-label {
  flex-shrink: 0;
  color: var(--mini-text);
  font-size: 30rpx;
  font-weight: 700;
}

.info-value,
.picker-value {
  text-align: right;
  color: var(--mini-text-muted);
  font-size: 28rpx;
  line-height: 1.5;
}

.info-input {
  flex: 1;
  min-width: 0;
  text-align: right;
  color: var(--mini-text-muted);
  font-size: 28rpx;
}

.placeholder {
  color: rgba(107, 98, 91, 0.45);
}

.gender-row {
  align-items: flex-start;
  padding: 26rpx 0;
}

.gender-options {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12rpx;
  flex: 1;
}

.gender-option {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(247, 239, 230, 0.88);
  color: var(--mini-text-muted);
  font-size: 24rpx;
}

.gender-option.active {
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.94), rgba(246, 157, 118, 0.94));
  color: #fff;
  font-weight: 700;
}

.helper-card {
  padding: 28rpx;
}

.helper-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.helper-title {
  color: var(--mini-text);
  font-size: 28rpx;
  font-weight: 700;
}

.helper-meta {
  color: var(--mini-text-muted);
  font-size: 22rpx;
}

.helper-stage {
  display: block;
  margin-top: 12rpx;
  color: var(--mini-text-muted);
  font-size: 24rpx;
  line-height: 1.7;
}

.allergen-input,
.allergen-readonly {
  width: 100%;
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  background: rgba(247, 239, 230, 0.56);
  color: var(--mini-text-muted);
  font-size: 24rpx;
  line-height: 1.8;
}

.allergen-input {
  min-height: 180rpx;
}

.bottom-action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  margin-top: 28rpx;
  border-radius: 28rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.bottom-action.primary {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  box-shadow: 0 16rpx 28rpx rgba(138, 81, 8, 0.18);
}

.bottom-action.danger {
  background: rgba(255, 255, 255, 0.96);
  color: #ef6a5f;
  box-shadow: var(--mini-shadow-card);
}
</style>