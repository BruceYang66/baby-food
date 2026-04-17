<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  show: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择接种日期'
})

const emit = defineEmits<{
  close: []
  confirm: [date: string]
}>()

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)

function handleClose() {
  emit('close')
}

function handleToday() {
  emit('confirm', today)
}

function handleDateChange(e: any) {
  selectedDate.value = e.detail.value
}

function handleConfirm() {
  emit('confirm', selectedDate.value)
}
</script>

<template>
  <view v-if="show" class="date-picker-modal" @tap="handleClose">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
        <view class="modal-close" @tap="handleClose">✕</view>
      </view>

      <view class="modal-body">
        <view class="quick-action">
          <view class="quick-btn" @tap="handleToday">
            <text class="quick-icon">📅</text>
            <text class="quick-text">今天</text>
            <text class="quick-date">{{ today }}</text>
          </view>
        </view>

        <view class="divider">
          <text class="divider-text">或选择其他日期</text>
        </view>

        <view class="picker-wrap">
          <picker mode="date" :value="selectedDate" :end="today" @change="handleDateChange">
            <view class="picker-display">
              <text class="picker-label">接种日期</text>
              <text class="picker-value">{{ selectedDate }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>

      <view class="modal-footer">
        <view class="footer-btn btn-cancel" @tap="handleClose">取消</view>
        <view class="footer-btn btn-confirm" @tap="handleConfirm">确认</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.date-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  animation: slideUp 0.3s ease;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
  border-bottom: 2rpx solid #f2ede8;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1d1b19;
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #6b625b;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:active {
  background: #f2ede8;
}

.modal-body {
  flex: 1;
  padding: 32rpx 40rpx;
  overflow-y: auto;
}

.quick-action {
  margin-bottom: 32rpx;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.15), rgba(255, 255, 255, 0.95));
  border-radius: 20rpx;
  border: 2rpx solid rgba(255, 179, 102, 0.3);
  transition: all 0.2s;
}

.quick-btn:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.25), rgba(255, 255, 255, 0.95));
}

.quick-icon {
  font-size: 40rpx;
}

.quick-text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: #8a5108;
}

.quick-date {
  font-size: 24rpx;
  color: #a67c52;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32rpx 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 2rpx;
  background: #e6e2dd;
}

.divider-text {
  padding: 0 24rpx;
  font-size: 22rpx;
  color: #6b625b;
}

.picker-wrap {
  margin-bottom: 20rpx;
}

.picker-display {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  background: #f8f3ee;
  border-radius: 20rpx;
  border: 2rpx solid #e6e2dd;
  transition: all 0.2s;
}

.picker-display:active {
  background: #f2ede8;
}

.picker-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1d1b19;
  margin-right: 24rpx;
}

.picker-value {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: #8a5108;
}

.picker-arrow {
  font-size: 32rpx;
  color: #6b625b;
  transform: rotate(-90deg);
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 2rpx solid #f2ede8;
}

.footer-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f2ede8;
  color: #6b625b;
}

.btn-cancel:active {
  background: #e6e2dd;
}

.btn-confirm {
  background: linear-gradient(135deg, #8a5108, #ffb366);
  color: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(138, 81, 8, 0.25);
}

.btn-confirm:active {
  transform: scale(0.98);
}
</style>
