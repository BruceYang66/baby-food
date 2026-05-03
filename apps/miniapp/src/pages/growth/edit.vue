<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import DatePickerModal from '@/components/common/DatePickerModal.vue'
import GrowthNumericKeyboard from '@/components/growth/GrowthNumericKeyboard.vue'
import { deleteGrowthRecord, getGrowthRecord, saveGrowthRecord } from '@/services/local-growth'
import { readAuthSession } from '@/services/api'

function getStatusBarHeight() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo().statusBarHeight || 0
  }

  return uni.getSystemInfoSync().statusBarHeight || 0
}

function formatYmd(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

const navStyle = computed(() => ({
  paddingTop: `${Math.max(getStatusBarHeight(), 20)}px`
}))

const session = readAuthSession()
const birthDate = session?.babyProfile?.birthDate
const recordId = ref('')
const heightValue = ref('')
const weightValue = ref('')
const headValue = ref('')
const measuredAt = ref(formatYmd(new Date()))
const activeField = ref<'height' | 'weight' | 'head' | null>('height')
const showDatePicker = ref(false)
const saving = ref(false)

const canSave = computed(() => !!heightValue.value && !!weightValue.value && !saving.value)
const keyboardVisible = computed(() => !!activeField.value)
const pageClass = computed(() => ({ keyboard: keyboardVisible.value }))
const pageTitle = computed(() => (recordId.value ? '编辑记录' : '添加记录'))

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.navigateTo({ url: '/pages/growth/index' })
    }
  })
}

function focusField(field: 'height' | 'weight' | 'head') {
  activeField.value = field
}

function handleKeyboardInput(value: string) {
  const target = activeField.value
  if (!target) {
    return
  }

  const currentValue = target === 'height' ? heightValue.value : target === 'weight' ? weightValue.value : headValue.value

  if (value === '.' && currentValue.includes('.')) {
    return
  }

  if (value === '.' && !currentValue) {
    updateFieldValue(target, '0.')
    return
  }

  if (currentValue.length >= 5) {
    return
  }

  updateFieldValue(target, `${currentValue}${value}`)
}

function handleKeyboardBackspace() {
  const target = activeField.value
  if (!target) {
    return
  }

  const currentValue = target === 'height' ? heightValue.value : target === 'weight' ? weightValue.value : headValue.value
  updateFieldValue(target, currentValue.slice(0, -1))
}

function updateFieldValue(field: 'height' | 'weight' | 'head', value: string) {
  if (field === 'height') {
    heightValue.value = value
    return
  }

  if (field === 'weight') {
    weightValue.value = value
    return
  }

  headValue.value = value
}

function openDatePicker() {
  activeField.value = null
  showDatePicker.value = true
}

async function submit() {
  if (!canSave.value) {
    return
  }

  try {
    saving.value = true
    saveGrowthRecord(
      {
        measuredAt: measuredAt.value,
        heightCm: Number(heightValue.value),
        weightKg: Number(weightValue.value),
        headCircumferenceCm: headValue.value ? Number(headValue.value) : null
      },
      birthDate,
      recordId.value || undefined
    )

    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      goBack()
    }, 280)
  } finally {
    saving.value = false
  }
}

function handleDelete() {
  if (!recordId.value) {
    return
  }

  uni.showModal({
    title: '删除记录',
    content: '确定删除这条身高体重记录吗？',
    confirmText: '删除',
    confirmColor: '#d95a85',
    success: (result) => {
      if (!result.confirm) {
        return
      }

      deleteGrowthRecord(recordId.value, birthDate)
      uni.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => {
        goBack()
      }, 260)
    }
  })
}

onLoad((options) => {
  if (options?.id && typeof options.id === 'string') {
    recordId.value = options.id
    const record = getGrowthRecord(options.id, birthDate)
    if (record) {
      heightValue.value = record.heightCm != null ? `${record.heightCm}` : ''
      weightValue.value = record.weightKg != null ? `${record.weightKg}` : ''
      headValue.value = record.headCircumferenceCm != null ? `${record.headCircumferenceCm}` : ''
      measuredAt.value = record.measuredAt
    }
  }

  if (options?.measuredAt && typeof options.measuredAt === 'string') {
    measuredAt.value = options.measuredAt
  }
})
</script>

<template>
  <view class="growth-edit-page" :class="pageClass">
    <view class="edit-nav" :style="navStyle">
      <view class="edit-nav-side" @tap="goBack">‹</view>
      <text class="edit-nav-title">{{ pageTitle }}</text>
      <view class="edit-nav-side placeholder" />
    </view>

    <view class="edit-form-card">
      <view class="edit-field" @tap="focusField('height')">
        <text class="edit-field-label">身高</text>
        <view class="edit-field-main" :class="{ active: activeField === 'height' }">
          <text class="edit-field-value" :class="{ placeholder: !heightValue }">{{ heightValue || '请输入身高' }}</text>
          <text class="edit-field-unit">cm</text>
        </view>
      </view>

      <view class="edit-divider" />

      <view class="edit-field" @tap="focusField('weight')">
        <text class="edit-field-label">体重</text>
        <view class="edit-field-main vertical" :class="{ active: activeField === 'weight' }">
          <view class="edit-field-input-row">
            <text class="edit-field-value" :class="{ placeholder: !weightValue }">{{ weightValue || '请输入体重' }}</text>
            <text class="edit-field-unit">kg</text>
          </view>
          <text class="edit-field-tip">连接体脂秤，进入抱婴称重</text>
        </view>
      </view>

      <view class="edit-divider" />

      <view class="edit-field" @tap="focusField('head')">
        <text class="edit-field-label">头围</text>
        <view class="edit-field-main" :class="{ active: activeField === 'head' }">
          <text class="edit-field-value" :class="{ placeholder: !headValue }">{{ headValue || '请输入头围' }}</text>
          <text class="edit-field-unit">cm</text>
        </view>
      </view>

      <view class="edit-divider" />

      <view class="edit-field" @tap="openDatePicker">
        <text class="edit-field-label">测量日期</text>
        <view class="edit-date-row">
          <text class="edit-date-value">{{ formatDisplayDate(measuredAt) }}</text>
          <text class="edit-date-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="save-bar">
      <view v-if="recordId" class="save-bar-btn secondary" @tap="handleDelete">删除</view>
      <view class="save-bar-btn primary" :class="{ disabled: !canSave }" @tap="submit">保存记录</view>
    </view>

    <DatePickerModal :show="showDatePicker" title="选择测量日期" @close="showDatePicker = false" @confirm="(value) => { measuredAt = value; showDatePicker = false }" />

    <GrowthNumericKeyboard :show="keyboardVisible" @input="handleKeyboardInput" @backspace="handleKeyboardBackspace" @close="activeField = null" />
  </view>
</template>

<style scoped lang="scss">
.growth-edit-page {
  min-height: 100vh;
  padding: 0 28rpx 200rpx;
  background: #f2f2f4;
}

.growth-edit-page.keyboard {
  padding-bottom: 640rpx;
}

.edit-nav {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 30rpx;
}

.edit-nav-side {
  font-size: 48rpx;
  line-height: 1;
  color: var(--mini-text);
}

.edit-nav-side.placeholder {
  opacity: 0;
}

.edit-nav-title {
  text-align: center;
  font-size: 38rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.edit-form-card {
  overflow: hidden;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12rpx 30rpx rgba(25, 27, 25, 0.05);
}

.edit-field {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 28rpx 30rpx;
}

.edit-field-label {
  flex-shrink: 0;
  width: 152rpx;
  padding-top: 4rpx;
  font-size: 34rpx;
  color: #292726;
  white-space: nowrap;
}

.edit-field-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
  border-right: 4rpx solid transparent;
}

.edit-field-main.vertical {
  flex-direction: column;
  align-items: flex-end;
  gap: 14rpx;
}

.edit-field-main.active {
  border-right-color: #df7195;
}

.edit-field-input-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.edit-field-value {
  font-size: 34rpx;
  color: #2a2827;
}

.edit-field-value.placeholder {
  color: #b0aaa4;
}

.edit-field-unit {
  font-size: 36rpx;
  color: #2a2827;
}

.edit-field-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #f3f3f4;
  color: #88827d;
  font-size: 22rpx;
}

.edit-divider {
  height: 2rpx;
  margin: 0 30rpx;
  background: rgba(29, 27, 25, 0.08);
}

.edit-date-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.edit-date-value {
  font-size: 34rpx;
  color: #2a2827;
  white-space: nowrap;
}

.edit-date-arrow {
  font-size: 38rpx;
  line-height: 1;
  color: #b0aaa4;
}

.save-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 28rpx;
  z-index: 30;
  display: flex;
  gap: 16rpx;
  padding: 18rpx;
  border-radius: 30rpx;
  background: rgba(242, 242, 244, 0.94);
  box-shadow: 0 -8rpx 28rpx rgba(25, 27, 25, 0.06);
  backdrop-filter: blur(20rpx);
}

.save-bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.save-bar-btn.primary {
  flex: 1;
  background: linear-gradient(135deg, #d95a85, #c33c6d);
  color: #fff;
}

.save-bar-btn.primary.disabled {
  opacity: 0.45;
}

.save-bar-btn.secondary {
  min-width: 180rpx;
  padding: 0 28rpx;
  background: rgba(217, 90, 133, 0.1);
  color: #d95a85;
}
</style>
