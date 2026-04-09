<script setup lang="ts">
import type { GuideRule } from '@baby-food/shared-types'
import TagChip from '@/components/common/TagChip.vue'

defineProps<{
  rule: GuideRule
}>()

function resolveAccent(type: GuideRule['type']) {
  if (type === 'recommended') return 'secondary'
  if (type === 'forbidden') return 'danger'
  return 'primary'
}
</script>

<template>
  <view class="food-rule" :class="rule.type">
    <text class="rule-title">{{ rule.title }}</text>
    <text v-if="rule.note" class="rule-note">{{ rule.note }}</text>
    <view class="rule-foods">
      <TagChip
        v-for="food in rule.foods"
        :key="food"
        :text="food"
        :accent="resolveAccent(rule.type)"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
.food-rule {
  padding: 26rpx;
  border-radius: var(--mini-radius-lg);
}

.food-rule.recommended {
  background: rgba(168, 230, 207, 0.22);
}

.food-rule.cautious {
  background: rgba(255, 179, 102, 0.18);
}

.food-rule.forbidden {
  background: rgba(214, 106, 106, 0.12);
}

.rule-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.rule-note {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
}

.rule-foods {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}
</style>
