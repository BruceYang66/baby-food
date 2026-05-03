<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  threshold?: number
  bottom?: string
  right?: string
}>(), {
  threshold: 240,
  bottom: '24px',
  right: '24px'
})

const visible = ref(false)

function updateVisibility() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  const scrollTop = Math.max(window.scrollY, root.scrollTop)
  const hasScrollableContent = root.scrollHeight > window.innerHeight + 24
  visible.value = hasScrollableContent && scrollTop > props.threshold
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
  window.addEventListener('resize', updateVisibility)
  requestAnimationFrame(updateVisibility)
  window.setTimeout(updateVisibility, 120)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateVisibility)
  window.removeEventListener('resize', updateVisibility)
})
</script>

<template>
  <button
    v-if="visible"
    class="back-to-top-btn"
    :style="{ right: props.right, bottom: props.bottom }"
    @click="scrollToTop"
    aria-label="一键置顶"
  >
    ↑
  </button>
</template>

<style scoped>
.back-to-top-btn {
  position: fixed;
  z-index: 30;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--admin-primary), var(--admin-primary-container));
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  box-shadow: var(--admin-floating-shadow);
  cursor: pointer;
}
</style>
