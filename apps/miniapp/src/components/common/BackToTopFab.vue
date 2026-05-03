<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  visible?: boolean
  right?: string
  extraBottom?: string
  zIndex?: number
}>(), {
  visible: false,
  right: 'var(--mini-floating-edge)',
  extraBottom: '0rpx',
  zIndex: 30
})

const emit = defineEmits<{
  tap: []
}>()

const rootStyle = computed(() => ({
  '--mini-back-top-right': props.right,
  '--mini-back-top-extra-bottom': props.extraBottom,
  '--mini-back-top-z': String(props.zIndex)
}) as Record<string, string>)
</script>

<template>
  <view
    class="back-top-fab"
    :class="{ 'is-visible': visible }"
    :style="rootStyle"
    hover-class="back-top-fab--pressed"
    hover-stay-time="80"
    @tap="emit('tap')"
  >
    <text class="back-top-icon">↑</text>
  </view>
</template>

<style scoped lang="scss">
.back-top-fab {
  position: fixed;
  right: var(--mini-back-top-right);
  bottom: calc(var(--mini-floating-bottom) + var(--mini-back-top-extra-bottom) + constant(safe-area-inset-bottom));
  bottom: calc(var(--mini-floating-bottom) + var(--mini-back-top-extra-bottom) + env(safe-area-inset-bottom));
  z-index: var(--mini-back-top-z);
  width: var(--mini-floating-size);
  height: var(--mini-floating-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  border: 2rpx solid rgba(138, 81, 8, 0.08);
  background: rgba(253, 248, 243, 0.94);
  color: var(--mini-primary-deep);
  box-shadow: var(--mini-shadow-soft);
  backdrop-filter: blur(20rpx);
  opacity: 0;
  transform: translateY(20rpx) scale(0.92);
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.back-top-fab.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.back-top-fab--pressed {
  transform: translateY(2rpx) scale(0.97);
}

.back-top-icon {
  font-size: 38rpx;
  line-height: 1;
  font-weight: 700;
}
</style>
