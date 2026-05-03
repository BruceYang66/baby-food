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
  background: #d2d4d8;
  box-shadow: 0 -14rpx 34rpx rgba(25, 27, 25, 0.08);
}

.keyboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76rpx;
  padding: 0 28rpx;
  background: rgba(255, 255, 255, 0.3);
}

.toolbar-spacer {
  width: 64rpx;
  height: 64rpx;
}

.toolbar-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  border: 3rpx solid rgba(29, 27, 25, 0.72);
  background: rgba(255, 255, 255, 0.6);
}

.toolbar-close-icon {
  font-size: 34rpx;
  line-height: 1;
  color: var(--mini-text);
}

.keyboard-grid {
  padding: 14rpx 14rpx calc(24rpx + env(safe-area-inset-bottom));
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
  height: 104rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 -4rpx 0 rgba(0, 0, 0, 0.04);
}

.keyboard-key:active {
  transform: scale(0.98);
  background: rgba(250, 250, 250, 0.98);
}

.keyboard-key.icon {
  background: rgba(247, 247, 247, 0.92);
}

.keyboard-key-text {
  font-size: 56rpx;
  line-height: 1;
  color: #1f1f20;
  font-weight: 500;
}
</style>
