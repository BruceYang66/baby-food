<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ReminderCategory, ReminderRepeatType } from '@baby-food/shared-types'
import DatePickerModal from '@/components/common/DatePickerModal.vue'
import { createReminder, getReminderItems, removeReminderItem, updateReminder } from '@/services/api'
import { getReminderCategoryOptions, getReminderRepeatOptions } from '@/services/local-reminder'

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

const reminderId = ref('')
const title = ref('')
const date = ref(formatYmd(new Date()))
const time = ref('09:00')
const category = ref<ReminderCategory>('supplement')
const customCategoryLabel = ref('')
const repeatType = ref<ReminderRepeatType>('once')
const note = ref('')
const showDatePicker = ref(false)
const categoryOptions = getReminderCategoryOptions()
const repeatOptions = getReminderRepeatOptions()

const pageTitle = computed(() => (reminderId.value ? '编辑提醒' : '添加提醒'))
const canSave = computed(() => !!title.value.trim() && !!date.value && !!time.value && (category.value !== 'custom' || !!customCategoryLabel.value.trim()))

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.navigateTo({ url: '/pages/reminder/index' })
    }
  })
}

function handleDateConfirm(value: string) {
  date.value = value
  showDatePicker.value = false
}

async function loadReminder(id: string) {
  try {
    const record = (await getReminderItems()).find((item) => item.id === id)
    if (!record) {
      uni.showToast({ title: '未找到对应提醒', icon: 'none' })
      return
    }

    title.value = record.title
    date.value = record.date
    time.value = record.time || '09:00'
    category.value = record.category
    customCategoryLabel.value = record.customCategoryLabel || ''
    repeatType.value = record.repeatType
    note.value = record.note || ''
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '提醒加载失败', icon: 'none' })
  }
}

async function submit() {
  if (!canSave.value) {
    return
  }

  try {
    const payload = {
      title: title.value.trim(),
      date: date.value,
      time: time.value,
      category: category.value,
      customCategoryLabel: category.value === 'custom' ? customCategoryLabel.value.trim() : undefined,
      repeatType: repeatType.value,
      note: note.value.trim(),
      source: 'manual' as const
    }

    if (reminderId.value) {
      await updateReminder(reminderId.value, payload)
    } else {
      await createReminder(payload)
    }

    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      goBack()
    }, 260)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
  }
}

function handleDelete() {
  if (!reminderId.value) {
    return
  }

  uni.showModal({
    title: '删除提醒',
    content: '确定删除这条提醒吗？',
    confirmText: '删除',
    confirmColor: '#d95a85',
    success: async (result) => {
      if (!result.confirm) {
        return
      }

      try {
        await removeReminderItem(reminderId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          goBack()
        }, 260)
      } catch (error) {
        uni.showToast({ title: error instanceof Error ? error.message : '删除失败', icon: 'none' })
      }
    }
  })
}

onLoad((options) => {
  if (options?.id && typeof options.id === 'string') {
    reminderId.value = options.id
    void loadReminder(options.id)
  }
})
</script>

<template>
  <view class="page-shell reminder-edit-page">
    <view class="edit-nav" :style="navStyle">
      <view class="edit-nav-side" @tap="goBack">‹</view>
      <text class="edit-nav-title">{{ pageTitle }}</text>
      <view class="edit-nav-side placeholder" />
    </view>

    <view class="edit-card card">
      <view class="form-row vertical">
        <text class="form-label">提醒标题</text>
        <input v-model="title" class="form-input" maxlength="20" placeholder="例如：服用 AD 滴剂" placeholder-class="placeholder" />
      </view>

      <view class="form-divider" />

      <view class="form-row">
        <text class="form-label">提醒日期</text>
        <view class="form-value-row" @tap="showDatePicker = true">
          <text class="form-value">{{ formatDisplayDate(date) }}</text>
          <text class="form-arrow">›</text>
        </view>
      </view>

      <view class="form-divider" />

      <view class="form-row">
        <text class="form-label">提醒时间</text>
        <picker mode="time" :value="time" @change="(event) => { time = event.detail.value }">
          <view class="form-value-row">
            <text class="form-value">{{ time }}</text>
            <text class="form-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-divider" />

      <view class="form-row vertical">
        <text class="form-label">提醒分类</text>
        <view class="chip-wrap">
          <view
            v-for="option in categoryOptions"
            :key="option.key"
            class="chip"
            :class="{ active: category === option.key }"
            @tap="category = option.key"
          >
            {{ option.icon }} {{ option.label }}
          </view>
        </view>
      </view>

      <view v-if="category === 'custom'" class="form-divider" />

      <view v-if="category === 'custom'" class="form-row vertical">
        <text class="form-label">自定义分类</text>
        <input v-model="customCategoryLabel" class="form-input" maxlength="20" placeholder="例如：体检、亲子活动、外出就诊" placeholder-class="placeholder" />
      </view>

      <view class="form-divider" />

      <view class="form-row vertical">
        <text class="form-label">重复方式</text>
        <view class="chip-wrap compact">
          <view
            v-for="option in repeatOptions"
            :key="option.key"
            class="chip compact"
            :class="{ active: repeatType === option.key }"
            @tap="repeatType = option.key"
          >
            {{ option.label }}
          </view>
        </view>
      </view>

      <view class="form-divider" />

      <view class="form-row vertical">
        <text class="form-label">备注</text>
        <textarea v-model="note" class="form-textarea" maxlength="80" placeholder="补充提醒细节，可不填" placeholder-class="placeholder" />
      </view>
    </view>

    <view class="save-bar">
      <view v-if="reminderId" class="save-bar-btn secondary" @tap="handleDelete">删除</view>
      <view class="save-bar-btn primary" :class="{ disabled: !canSave }" @tap="submit">保存提醒</view>
    </view>

    <DatePickerModal :show="showDatePicker" :value="date" title="选择提醒日期" label="提醒日期" @close="showDatePicker = false" @confirm="handleDateConfirm" />
  </view>
</template>

<style scoped lang="scss">
.reminder-edit-page {
  padding-bottom: 200rpx;
}

.edit-nav {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 26rpx;
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
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.edit-card {
  padding: 0 28rpx;
  border-radius: 28rpx;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx 0;
}

.form-row.vertical {
  display: block;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.form-input,
.form-textarea {
  width: 100%;
  margin-top: 18rpx;
  font-size: 28rpx;
  color: var(--mini-text);
}

.form-input {
  height: 84rpx;
}

.form-textarea {
  min-height: 140rpx;
  line-height: 1.7;
}

.placeholder {
  color: #b4ada7;
}

.form-value-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.form-value {
  font-size: 28rpx;
  color: #3d3936;
}

.form-arrow {
  font-size: 36rpx;
  line-height: 1;
  color: #b0aaa4;
}

.form-divider {
  height: 2rpx;
  background: rgba(29, 27, 25, 0.08);
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 18rpx;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  min-height: 64rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #f4efe9;
  color: #625b56;
  font-size: 24rpx;
}

.chip.compact {
  min-height: 58rpx;
}

.chip.active {
  background: rgba(168, 230, 207, 0.34);
  color: var(--mini-secondary-deep);
  font-weight: 700;
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
  background: rgba(253, 248, 243, 0.94);
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
  background: linear-gradient(135deg, var(--mini-secondary-deep), #49ae76);
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
