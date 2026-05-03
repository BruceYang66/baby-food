<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  input: [value: string]
  backspace: []
  close: []
}>()

const rows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace']
]

function handleTap(value: string) {
  if (value === 'backspace') {
    emit('backspace')
    return
  }

  emit('input', value)
}
</script>

<template>
  <view v-if="show" class="keyboard-shell">
    <view class="keyboard-toolbar">
      <view class="toolbar-spacer" />
      <view class="toolbar-close" @tap="emit('close')">
        <text class="toolbar-close-icon">⌄</text>
      </view>
    </view>

    <view class="keyboard-grid">
      <view v-for="(row, rowIndex) in rows" :key="rowIndex" class="keyboard-row">
        <view
          v-for="cell in row"
          :key="cell"
          class="keyboard-key"
          :class="{ icon: cell === 'backspace' }"
          @tap="handleTap(cell)"
        >
          <text v-if="cell !== 'backspace'" class="keyboard-key-text">{{ cell }}</text>
          <text v-else class="keyboard-key-text">⌫</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.keyboard-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  padding-top: 10rpx;
  border-radius: 32rpx 32rpx 0 0;
  background: linear-gradient(180deg, #eef0f4, #dde1e7);
  box-shadow: 0 -18rpx 40rpx rgba(25, 27, 25, 0.12);
}

.keyboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  padding: 0 28rpx;
  background: transparent;
}

.toolbar-spacer {
  width: 68rpx;
  height: 68rpx;
}

.toolbar-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 8rpx 18rpx rgba(51, 60, 78, 0.1);
}

.toolbar-close-icon {
  font-size: 34rpx;
  line-height: 1;
  color: #5c6472;
}

.keyboard-grid {
  padding: 10rpx 14rpx calc(24rpx + env(safe-area-inset-bottom));
}

.keyboard-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.keyboard-row + .keyboard-row {
  margin-top: 14rpx;
}

.keyboard-key {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 108rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10rpx 18rpx rgba(64, 72, 89, 0.08), inset 0 -4rpx 0 rgba(0, 0, 0, 0.04);
}

.keyboard-key:active {
  transform: translateY(2rpx) scale(0.98);
  background: rgba(250, 251, 253, 0.98);
}

.keyboard-key.icon {
  background: rgba(245, 247, 250, 0.96);
}

.keyboard-key-text {
  font-size: 52rpx;
  line-height: 1;
  color: #202330;
  font-weight: 600;
}
</style>
