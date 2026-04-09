<script setup lang="ts">
defineProps<{
  soft?: boolean
  padding?: string
}>()
</script>

<template>
  <view class="surface-card" :class="{ soft }" :style="{ padding: padding || '28rpx' }">
    <slot />
  </view>
</template>

<style scoped lang="scss">
.surface-card {
  border-radius: var(--mini-radius-lg);
  background: var(--mini-surface);
  box-shadow: var(--mini-shadow-card);
}

.surface-card.soft {
  background: var(--mini-surface-soft);
  box-shadow: none;
}
</style>
