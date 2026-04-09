<script setup lang="ts">
import type { GuideStage } from '@baby-food/shared-types'

defineProps<{
  stages: GuideStage[]
  activeKey: string
}>()

const emit = defineEmits<{
  change: [key: string]
}>()
</script>

<template>
  <scroll-view scroll-x class="age-tabs" show-scrollbar="false">
    <view class="age-tabs-inner">
      <view
        v-for="stage in stages"
        :key="stage.key"
        class="age-tab"
        :class="{ active: stage.key === activeKey }"
        @tap="emit('change', stage.key)"
      >
        {{ stage.label }}
      </view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.age-tabs {
  white-space: nowrap;
}

.age-tabs-inner {
  display: flex;
  gap: 18rpx;
  padding-bottom: 10rpx;
}

.age-tab {
  padding: 16rpx 28rpx;
  border-radius: var(--mini-radius-pill);
  background: rgba(255,255,255,0.72);
  color: var(--mini-text-muted);
  font-size: 24rpx;
  font-weight: 700;
}

.age-tab.active {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}
</style>
