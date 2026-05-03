<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GrowthStandardKey, GrowthStandardOption } from '@baby-food/shared-types'

const props = defineProps<{
  show: boolean
  value: GrowthStandardKey
  options: GrowthStandardOption[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [value: GrowthStandardKey]
}>()

const draftValue = ref<GrowthStandardKey>(props.value)

watch(
  () => props.value,
  (value) => {
    draftValue.value = value
  },
  { immediate: true }
)

watch(
  () => props.show,
  (value) => {
    if (value) {
      draftValue.value = props.value
    }
  }
)
</script>

<template>
  <view v-if="show" class="standard-sheet" @tap="emit('close')">
    <view class="standard-sheet-panel" @tap.stop>
      <view class="sheet-head">
        <text class="sheet-action muted" @tap="emit('close')">取消</text>
        <text class="sheet-title">参考标准</text>
        <text class="sheet-action primary" @tap="emit('confirm', draftValue)">确定</text>
      </view>

      <view class="sheet-options">
        <view
          v-for="option in options"
          :key="option.key"
          class="sheet-option"
          :class="{ active: draftValue === option.key }"
          @tap="draftValue = option.key"
        >
          <view class="sheet-option-logo">◎</view>
          <view class="sheet-option-copy">
            <text class="sheet-option-title">{{ option.label }}</text>
            <text class="sheet-option-desc">年龄范围：{{ option.ageRangeLabel }}</text>
          </view>
          <text class="sheet-option-check">{{ draftValue === option.key ? '✓' : '' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.standard-sheet {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.28);
}

.standard-sheet-panel {
  width: 100%;
  border-radius: 28rpx 28rpx 0 0;
  background: #ffffff;
  padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
  animation: slide-up 0.22s ease;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx 24rpx;
}

.sheet-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.sheet-action {
  min-width: 80rpx;
  font-size: 26rpx;
}

.sheet-action.muted {
  color: var(--mini-text-muted);
}

.sheet-action.primary {
  text-align: right;
  color: #d95a85;
  font-weight: 700;
}

.sheet-options {
  padding: 0 22rpx;
}

.sheet-option {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 22rpx;
  border-radius: 22rpx;
  background: #f7f4f1;
}

.sheet-option + .sheet-option {
  margin-top: 18rpx;
}

.sheet-option.active {
  box-shadow: inset 0 0 0 2rpx rgba(217, 90, 133, 0.22);
  background: #fff7fb;
}

.sheet-option-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74rpx;
  height: 74rpx;
  border-radius: 999rpx;
  background: rgba(232, 239, 245, 0.86);
  color: #52616e;
  font-size: 32rpx;
}

.sheet-option-copy {
  flex: 1;
  min-width: 0;
}

.sheet-option-title {
  display: block;
  font-size: 28rpx;
  line-height: 1.5;
  font-weight: 700;
  color: var(--mini-text);
}

.sheet-option-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.sheet-option-check {
  flex-shrink: 0;
  min-width: 32rpx;
  font-size: 32rpx;
  line-height: 1;
  color: #d95a85;
  text-align: right;
}
</style>
