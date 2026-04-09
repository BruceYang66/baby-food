<script setup lang="ts">
defineProps<{
  text: string
  secondary?: boolean
}>()
</script>

<template>
  <button class="action-btn" :class="{ secondary }">
    <slot />
    <text>{{ text }}</text>
  </button>
</template>

<style scoped lang="scss">
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 88rpx;
  padding: 0 28rpx;
  border: none;
  border-radius: var(--mini-radius-pill);
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.action-btn.secondary {
  background: #fff;
  color: var(--mini-text);
}
</style>
