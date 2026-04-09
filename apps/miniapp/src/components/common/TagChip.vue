<script setup lang="ts">
defineProps<{
  text: string
  accent?: 'primary' | 'secondary' | 'neutral' | 'danger'
}>()
</script>

<template>
  <view class="tag-chip" :class="accent || 'neutral'">
    <text>{{ text }}</text>
  </view>
</template>

<style scoped lang="scss">
.tag-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 20rpx;
  border-radius: var(--mini-radius-pill);
  font-size: 20rpx;
  font-weight: 600;
}

.neutral {
  background: #f4efe8;
  color: var(--mini-text);
}

.primary {
  background: rgba(255, 179, 102, 0.26);
  color: var(--mini-primary-deep);
}

.secondary {
  background: rgba(168, 230, 207, 0.3);
  color: var(--mini-secondary-deep);
}

.danger {
  background: rgba(214, 106, 106, 0.18);
  color: #b24d4d;
}
</style>
