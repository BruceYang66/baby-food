<script setup lang="ts">
const props = defineProps<{
  items: string[]
  active: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()
</script>

<template>
  <view class="symptom-grid">
    <view
      v-for="item in props.items"
      :key="item"
      class="symptom-item"
      :class="{ active: item === props.active }"
      @tap="emit('change', item)"
    >
      <text class="symptom-emoji">{{ item === '腹泻' ? '💧' : item === '感冒' ? '🤒' : item === '咳嗽' ? '😮‍💨' : item === '便秘' ? '🌿' : item === '湿疹' ? '🍃' : item === '积食' ? '🍽️' : item === '贫血' ? '🩸' : '🦷' }}</text>
      <text class="symptom-text">{{ item }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.symptom-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18rpx;
}

.symptom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 144rpx;
  border-radius: 28rpx;
  background: rgba(255,255,255,0.7);
}

.symptom-item.active {
  background: rgba(255, 179, 102, 0.42);
  box-shadow: inset 0 0 0 4rpx rgba(138, 81, 8, 0.16);
}

.symptom-emoji {
  font-size: 42rpx;
}

.symptom-text {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--mini-text);
}
</style>
