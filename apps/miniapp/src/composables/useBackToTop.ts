import { computed, ref } from 'vue'

interface UseBackToTopOptions {
  threshold?: number
  duration?: number
}

export function useBackToTop(options: UseBackToTopOptions = {}) {
  const threshold = options.threshold ?? 360
  const duration = options.duration ?? 280
  const currentScrollTop = ref(0)
  const scrollViewTop = ref(0)

  const showBackToTop = computed(() => currentScrollTop.value >= threshold)

  function normalizeScrollTop(value: number) {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  }

  function handlePageScroll(scrollTop: number) {
    currentScrollTop.value = normalizeScrollTop(scrollTop)
  }

  function handleScrollViewScroll(scrollTop: number) {
    const nextTop = normalizeScrollTop(scrollTop)
    currentScrollTop.value = nextTop
    scrollViewTop.value = nextTop
  }

  function scrollPageToTop() {
    if (currentScrollTop.value <= 0) {
      return
    }

    currentScrollTop.value = 0
    uni.pageScrollTo({
      scrollTop: 0,
      duration
    })
  }

  function scrollScrollViewToTop() {
    if (currentScrollTop.value <= 0) {
      return
    }

    currentScrollTop.value = 0
    scrollViewTop.value = 0
  }

  return {
    scrollViewTop,
    showBackToTop,
    handlePageScroll,
    handleScrollViewScroll,
    scrollPageToTop,
    scrollScrollViewToTop
  }
}
