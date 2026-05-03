<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DailyMealPlan, MealSlot, RecipeDetail, SaveMealPlanPayload, WheelCandidate, WheelCategory } from '@baby-food/shared-types'
import { onShow } from '@dcloudio/uni-app'
import { recipeDetail as mockRecipeDetail } from '@/data/mock'
import { wheelCategoryMeta } from '@/data/wheel'
import { createWheelHistory, ensureProtectedPageAccess, getPlanPageData, getWheelHistory, openProtectedPage, readAuthSession, saveMealPlan } from '@/services/api'
import { getWheelCandidates, getWheelFilterTags, spinWheel } from '@/services/local-wheel'

const PREVIEW_STORAGE_KEY = 'adminRecipePreview'

function getStatusBarHeight() {
  if (typeof uni.getWindowInfo === 'function') {
    return uni.getWindowInfo().statusBarHeight || 0
  }

  return uni.getSystemInfoSync().statusBarHeight || 0
}

const navStyle = computed(() => ({
  paddingTop: `${Math.max(getStatusBarHeight(), 20)}px`
}))

const filterTags = getWheelFilterTags()
const selectedFilter = ref<(typeof filterTags)[number]>('全部')
const selectedCategory = ref<WheelCategory | 'all'>('all')
const spinning = ref(false)
const addingToPlan = ref(false)
const rotation = ref(0)
const resultCandidate = ref<WheelCandidate | null>(null)
const displayCandidate = ref<WheelCandidate | null>(null)
const history = ref<WheelCandidate[]>([])
const session = ref(readAuthSession())

const babyBannerText = computed(() => {
  const baby = session.value?.babyProfile
  if (baby?.monthAgeLabel) {
    return `当前宝宝：${baby.monthAgeLabel} · 适配${baby.monthAgeLabel.replace('岁', '').replace('个月', '月龄')}食谱`
  }

  return '当前宝宝：1岁6个月 · 适配18月龄食谱'
})

const filteredCandidates = computed(() => getWheelCandidates(selectedFilter.value === '全部' ? [] : [selectedFilter.value], selectedCategory.value))
const wheelSlots = computed(() => {
  const candidates = getWheelCandidates(selectedFilter.value === '全部' ? [] : [selectedFilter.value])

  return wheelCategoryMeta.map((item) => ({
    ...item,
    isActive: selectedCategory.value === 'all' || selectedCategory.value === item.key,
    candidate: candidates.find((candidate) => candidate.category === item.key) || filteredCandidates.value[0] || null
  }))
})
const ringStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`
}))

function matchesCurrentSelection(candidate: WheelCandidate) {
  const matchCategory = selectedCategory.value === 'all' || candidate.category === selectedCategory.value
  const matchFilter = selectedFilter.value === '全部' || candidate.filterTags.includes(selectedFilter.value)
  return matchCategory && matchFilter
}

const recommendedCandidate = computed(() => {
  if (displayCandidate.value && matchesCurrentSelection(displayCandidate.value)) {
    return displayCandidate.value
  }

  return filteredCandidates.value[0] || null
})

function buildPreviewRecipe(candidate: WheelCandidate): RecipeDetail {
  return {
    ...mockRecipeDetail,
    id: candidate.id,
    title: candidate.title,
    ageLabel: candidate.ageLabel,
    image: mockRecipeDetail.image,
    heroImage: mockRecipeDetail.heroImage,
    tags: candidate.nutritionTags,
    description: `${candidate.title}适合当前转盘筛选结果，可作为今天的灵感参考。`,
    nutritionTips: candidate.nutritionTags.length ? candidate.nutritionTags.map((item) => `${item}方向的本地示例推荐`) : mockRecipeDetail.nutritionTips,
    ingredients: candidate.ingredients.map((item, index) => {
      const [name, amount = '适量'] = item.split(/(?=\d|适量)/)
      return {
        id: `wheel-ingredient-${index + 1}`,
        name: name.trim(),
        amount: amount.trim() || '适量'
      }
    }),
    steps: candidate.steps.map((step, index) => ({
      stepNo: index + 1,
      title: `步骤 ${index + 1}`,
      description: step
    })),
    relatedRecipes: mockRecipeDetail.relatedRecipes
  }
}

function getMealSlotLabel(slot: MealSlot) {
  if (slot === 'breakfast') return '早餐'
  if (slot === 'lunch') return '午餐'
  if (slot === 'dinner') return '晚餐'
  return '加餐'
}

function resolveTargetEntryIndex(plan: DailyMealPlan) {
  const dinnerIndex = plan.entries.findIndex((item) => item.slot === 'dinner')
  return dinnerIndex >= 0 ? dinnerIndex : plan.entries.length - 1
}

function buildSavePayload(plan: DailyMealPlan, candidate: WheelCandidate): SaveMealPlanPayload {
  const targetIndex = resolveTargetEntryIndex(plan)

  return {
    title: '已保存辅食计划',
    dateLabel: plan.dateLabel,
    planDate: plan.planDate,
    nutritionScore: plan.nutritionScore,
    waterSuggestion: plan.waterSuggestion,
    entries: plan.entries.map((entry, index) => {
      if (index !== targetIndex) {
        return {
          recipeId: entry.recipeId,
          customRecipeId: entry.customRecipeId,
          isCustom: entry.isCustom,
          slot: entry.slot,
          time: entry.time,
          title: entry.title,
          focus: entry.focus,
          image: entry.image,
          tags: entry.tags
        }
      }

      return {
        slot: entry.slot,
        time: entry.time,
        title: candidate.title,
        focus: candidate.nutritionTags[0] ?? '转盘推荐',
        image: mockRecipeDetail.image,
        tags: candidate.nutritionTags,
        isCustom: true
      }
    })
  }
}

function confirmReplace(slot: MealSlot, currentTitle: string, nextTitle: string) {
  return new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '替换今日计划',
      content: `今日${getMealSlotLabel(slot)}当前是“${currentTitle}”，是否替换为“${nextTitle}”？`,
      confirmText: '替换',
      cancelText: '取消',
      success: (res) => resolve(Boolean(res.confirm)),
      fail: () => resolve(false)
    })
  })
}

async function addToTodayPlan() {
  const candidate = resultCandidate.value

  if (!candidate || addingToPlan.value) {
    return
  }

  if (!ensureProtectedPageAccess()) {
    return
  }

  addingToPlan.value = true

  try {
    const { todayMealPlan } = await getPlanPageData()

    if (todayMealPlan.entries.some((entry) => entry.title === candidate.title)) {
      uni.showToast({ title: '今日计划已包含这道辅食', icon: 'none' })
      return
    }

    const targetIndex = resolveTargetEntryIndex(todayMealPlan)
    const targetEntry = todayMealPlan.entries[targetIndex]

    if (!targetEntry) {
      throw new Error('今日计划暂不可用，请稍后重试')
    }

    if (targetEntry.feedingRecord?.status) {
      uni.showToast({ title: '该餐次已记录喂养，请到计划页调整', icon: 'none' })
      return
    }

    if (todayMealPlan.isSaved && targetEntry.title && targetEntry.title !== candidate.title) {
      const confirmed = await confirmReplace(targetEntry.slot, targetEntry.title, candidate.title)
      if (!confirmed) {
        return
      }
    }

    await saveMealPlan(buildSavePayload(todayMealPlan, candidate))
    resultCandidate.value = null
    uni.showToast({ title: '已加入今日计划', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '加入失败，请重试',
      icon: 'none'
    })
  } finally {
    addingToPlan.value = false
  }
}

function openCandidateDetail(candidate: WheelCandidate) {
  uni.setStorageSync(PREVIEW_STORAGE_KEY, buildPreviewRecipe(candidate))
  resultCandidate.value = null
  openProtectedPage('/pages/recipe-detail/index?preview=admin')
}

async function refreshHistory() {
  session.value = readAuthSession()

  if (!session.value?.token) {
    history.value = []
    return
  }

  try {
    const items = await getWheelHistory(6)
    history.value = items.map((item) => ({
      id: item.candidateId,
      title: item.title,
      category: item.category,
      icon: item.icon,
      ageLabel: item.ageLabel,
      ingredients: item.ingredients,
      steps: item.steps,
      nutritionTags: item.nutritionTags,
      filterTags: item.filterTags
    }))
  } catch {
    history.value = []
  }
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function showFavoriteToast() {
  uni.showToast({ title: '收藏功能建设中', icon: 'none' })
}

function startSpin() {
  if (spinning.value || !filteredCandidates.value.length) {
    return
  }

  const result = spinWheel(selectedFilter.value === '全部' ? [] : [selectedFilter.value], selectedCategory.value)
  spinning.value = true
  resultCandidate.value = null
  rotation.value += result.rotation

  setTimeout(() => {
    spinning.value = false
    displayCandidate.value = result.candidate
    resultCandidate.value = result.candidate
    history.value = [result.candidate, ...history.value.filter((item) => item.id !== result.candidate.id)].slice(0, 6)

    void createWheelHistory({
      candidate: result.candidate,
      selectedFilters: selectedFilter.value === '全部' ? [] : [selectedFilter.value]
    }).then(() => refreshHistory()).catch(() => undefined)
  }, 3200)
}

onShow(() => {
  void refreshHistory()
})
</script>

<template>
  <view class="page-shell wheel-page">
    <view class="wheel-nav" :style="navStyle">
      <view class="wheel-nav-side" @tap="goBack">
        <view class="wheel-nav-back-btn">
          <text class="wheel-nav-back-icon">‹</text>
        </view>
      </view>
      <text class="wheel-nav-title">今天吃什么？</text>
      <view class="wheel-nav-favorite" @tap="showFavoriteToast">♡</view>
    </view>

    <view class="wheel-banner">
      <text class="wheel-banner-text">{{ babyBannerText }}</text>
    </view>

    <view class="wheel-hero-card card">
      <view class="wheel-hero-top">
        <view>
          <text class="wheel-hero-eyebrow">辅食分类转盘</text>
          <text class="wheel-hero-title">先转到分类，再给出一道可直接查看的具体食谱</text>
        </view>
        <view class="wheel-hero-count">{{ filteredCandidates.length }}道</view>
      </view>

      <view class="wheel-main">
        <view class="wheel-pointer">▼</view>
        <view class="wheel-ring" :style="ringStyle">
          <view class="wheel-ring-backdrop" />
          <view
            v-for="(slot, index) in wheelSlots"
            :key="slot.key"
            class="wheel-slot"
            :style="{ transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-212rpx)` }"
          >
            <view class="wheel-slot-card" :class="{ muted: !slot.isActive }" :style="{ background: slot.color }">
              <text class="wheel-slot-icon">{{ slot.icon }}</text>
              <text class="wheel-slot-label">{{ slot.label }}</text>
            </view>
          </view>
        </view>
        <view class="wheel-center-button" :class="{ spinning }" @tap="startSpin">
          <text class="wheel-center-button-text">{{ spinning ? '转动中' : '开始' }}</text>
        </view>
      </view>
    </view>

    <!-- <view class="category-scroll-wrap lower-categories">
      <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
        <view class="category-row">
          <view class="category-chip" :class="{ active: selectedCategory === 'all' }" @tap="selectedCategory = 'all'">全部分类</view>
          <view
            v-for="item in wheelCategoryMeta"
            :key="item.key"
            class="category-chip"
            :class="{ active: selectedCategory === item.key }"
            @tap="selectedCategory = item.key"
          >
            {{ item.icon }} {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view> -->

    <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
      <view class="filter-row">
        <view
          v-for="tag in filterTags"
          :key="tag"
          class="filter-chip"
          :class="{ active: selectedFilter === tag }"
          @tap="selectedFilter = tag"
        >
          {{ tag }}
        </view>
      </view>
    </scroll-view>

    <view v-if="recommendedCandidate" class="candidate-card card" @tap="openCandidateDetail(recommendedCandidate)">
      <view class="candidate-card-top">
        <view class="candidate-tag-row">
          <text class="candidate-category-tag">{{ recommendedCandidate.icon }} {{ wheelCategoryMeta.find((item) => item.key === recommendedCandidate.category)?.label }}</text>
          <text class="candidate-age-tag">{{ recommendedCandidate.ageLabel }}</text>
        </view>
        <text class="candidate-arrow">›</text>
      </view>
      <text class="candidate-title">{{ recommendedCandidate.title }}</text>
      <text class="candidate-desc">点击可直接进入这道食谱详情预览。</text>
      <view class="candidate-ingredients">
        <text v-for="item in recommendedCandidate.ingredients.slice(0, 3)" :key="item" class="candidate-ingredient">{{ item }}</text>
      </view>
    </view>

    <view class="history-card card">
      <view class="history-head">
        <text class="history-title">最近转到过的食谱</text>
        <text class="history-subtitle">保留最近 6 次结果</text>
      </view>

      <view v-if="history.length" class="history-list">
        <view v-for="item in history" :key="item.id" class="history-item" @tap="openCandidateDetail(item)">
          <view class="history-item-main">
            <text class="history-item-icon">{{ item.icon }}</text>
            <view class="history-item-copy">
              <text class="history-item-title">{{ item.title }}</text>
              <text class="history-item-meta">{{ item.ageLabel }} · {{ item.nutritionTags.join(' · ') }}</text>
            </view>
          </view>
          <text class="history-item-arrow">›</text>
        </view>
      </view>

      <view v-else class="history-empty">
        <text class="history-empty-text">转动一次后，这里会显示最近抽到的辅食。</text>
      </view>
    </view>

    <view v-if="resultCandidate" class="result-sheet" @tap="resultCandidate = null">
      <view class="result-panel" @tap.stop>
        <view class="result-handle" />
        <text class="result-icon">{{ resultCandidate.icon }}</text>
        <text class="result-title">{{ resultCandidate.title }}</text>

        <view class="result-tags">
          <text v-for="item in resultCandidate.ingredients" :key="item" class="result-tag">{{ item }}</text>
        </view>

        <view class="result-steps">
          <view v-for="(step, index) in resultCandidate.steps" :key="step" class="result-step">
            <view class="result-step-no">{{ index + 1 }}</view>
            <text class="result-step-text">{{ step }}</text>
          </view>
        </view>

        <view class="result-age-pill">✓ {{ resultCandidate.ageLabel }}</view>

        <view class="result-actions">
          <view class="result-btn primary" @tap="openCandidateDetail(resultCandidate)">查看食谱详情</view>
          <view class="result-btn secondary" @tap="startSpin">再转一次</view>
        </view>
        <view class="result-link" :class="{ disabled: addingToPlan }" @tap="addToTodayPlan">{{ addingToPlan ? '加入中...' : '加入今日食谱' }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.wheel-page {
  padding-bottom: 80rpx;
}

.wheel-nav {
  display: grid;
  grid-template-columns: 88rpx 1fr 88rpx;
  align-items: center;
  gap: 12rpx;
}

.wheel-nav-side {
  display: flex;
  align-items: center;
  width: 88rpx;
  min-height: 88rpx;
  color: var(--mini-primary-deep);
}

.wheel-nav-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.wheel-nav-back-icon {
  margin-top: -4rpx;
  font-size: 48rpx;
  line-height: 1;
  color: var(--mini-primary-deep);
}

.wheel-nav-favorite {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 88rpx;
  min-height: 88rpx;
  font-size: 44rpx;
  line-height: 1;
  color: var(--mini-text);
}

.wheel-banner {
  margin-top: 18rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #53b889, #78c79e);
}

.wheel-banner-text {
  display: block;
  font-size: 24rpx;
  color: #fff;
  font-weight: 700;
}

.category-scroll-wrap {
  margin-top: 20rpx;
}

.category-scroll,
.filter-scroll {
  white-space: nowrap;
}

.category-row,
.filter-row {
  display: flex;
  gap: 14rpx;
  padding-right: 20rpx;
}

.category-chip,
.filter-chip {
  flex-shrink: 0;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(107, 98, 91, 0.14);
  background: rgba(255, 255, 255, 0.9);
  color: #6b625b;
  font-size: 24rpx;
}

.category-chip.active,
.filter-chip.active {
  border-color: transparent;
  background: #53b889;
  color: #fff;
  font-weight: 700;
}

.wheel-hero-card {
  margin-top: 24rpx;
  padding: 26rpx 20rpx 10rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 247, 239, 0.92) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.wheel-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.wheel-hero-eyebrow {
  display: block;
  font-size: 22rpx;
  color: #9b7e62;
}

.wheel-hero-title {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.6;
  font-weight: 700;
  color: var(--mini-text);
}

.wheel-hero-count {
  flex-shrink: 0;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(83, 184, 137, 0.14);
  color: #3eaf6a;
  font-size: 22rpx;
  font-weight: 700;
}

.wheel-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 26rpx;
  min-height: 580rpx;
}

.wheel-pointer {
  position: absolute;
  top: 6rpx;
  z-index: 3;
  color: #ff6b57;
  font-size: 34rpx;
  line-height: 1;
}

.wheel-ring {
  position: relative;
  width: 520rpx;
  height: 520rpx;
  transition: transform 3.2s cubic-bezier(0.12, 0.86, 0.14, 1);
}

.wheel-ring-backdrop {
  position: absolute;
  inset: 0;
  border-radius: 999rpx;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0.92) 32%, rgba(246, 238, 227, 0.96) 100%);
  box-shadow: 0 26rpx 48rpx rgba(138, 81, 8, 0.14);
}

.wheel-ring-backdrop::before,
.wheel-ring-backdrop::after {
  content: '';
  position: absolute;
  inset: 20rpx;
  border-radius: 999rpx;
  border: 2rpx dashed rgba(138, 81, 8, 0.08);
}

.wheel-ring-backdrop::after {
  inset: 78rpx;
}

.wheel-slot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
}

.wheel-slot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 122rpx;
  min-height: 122rpx;
  padding: 16rpx 12rpx;
  border-radius: 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(25, 27, 25, 0.08);
}

.wheel-slot-card.muted {
  opacity: 0.48;
}

.wheel-slot-icon {
  font-size: 34rpx;
}

.wheel-slot-label {
  margin-top: 10rpx;
  font-size: 18rpx;
  line-height: 1.4;
  text-align: center;
  color: #fff;
  font-weight: 700;
}

.wheel-center-button {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 172rpx;
  height: 172rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8353, #ff5c2b);
  box-shadow: 0 18rpx 36rpx rgba(255, 92, 43, 0.24);
}

.wheel-center-button.spinning {
  animation: pulse 0.8s ease infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.wheel-center-button-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
}

.filter-scroll {
  margin-top: 18rpx;
}

.candidate-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 28rpx;
}

.candidate-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.candidate-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.candidate-category-tag,
.candidate-age-tag {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.candidate-category-tag {
  background: rgba(255, 179, 102, 0.18);
  color: #8a5108;
}

.candidate-age-tag {
  background: rgba(83, 184, 137, 0.14);
  color: #3eaf6a;
}

.candidate-arrow {
  color: #9d948d;
  font-size: 34rpx;
}

.candidate-title {
  display: block;
  margin-top: 18rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.candidate-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.candidate-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.candidate-ingredient {
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(247, 239, 230, 0.76);
  color: #6b625b;
  font-size: 22rpx;
}

.history-card {
  margin-top: 22rpx;
  padding: 26rpx 24rpx;
  border-radius: 28rpx;
}

.history-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
}

.history-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.history-subtitle {
  font-size: 20rpx;
  color: var(--mini-text-muted);
}

.history-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(247, 239, 230, 0.5);
}

.history-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.history-item-icon {
  font-size: 34rpx;
}

.history-item-copy {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.history-item-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.history-item-arrow {
  color: #9d948d;
  font-size: 34rpx;
}

.history-empty {
  margin-top: 18rpx;
  padding: 18rpx 0 4rpx;
}

.history-empty-text {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.result-sheet {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.32);
}

.result-panel {
  width: 100%;
  padding: 16rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  background: #fff;
}

.result-handle {
  width: 84rpx;
  height: 8rpx;
  margin: 0 auto 18rpx;
  border-radius: 999rpx;
  background: rgba(29, 27, 25, 0.1);
}

.result-icon {
  display: block;
  font-size: 64rpx;
  text-align: center;
}

.result-title {
  display: block;
  margin-top: 12rpx;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
}

.result-tag {
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(247, 239, 230, 0.76);
  color: #6b625b;
  font-size: 22rpx;
}

.result-steps {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-step {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.result-step-no {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: rgba(83, 184, 137, 0.16);
  color: #53b889;
  font-size: 22rpx;
  font-weight: 700;
}

.result-step-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.7;
  color: #4d4742;
}

.result-age-pill {
  display: inline-flex;
  margin-top: 24rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(83, 184, 137, 0.18);
  color: #3eaf6a;
  font-size: 22rpx;
  font-weight: 700;
}

.result-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.result-btn {
  flex: 1;
  height: 92rpx;
  border-radius: 999rpx;
  text-align: center;
  line-height: 92rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.result-btn.primary {
  background: linear-gradient(135deg, #52b887, #3eaf6a);
  color: #fff;
}

.result-btn.secondary {
  background: rgba(247, 239, 230, 0.8);
  color: #6b625b;
}

.result-link {
  margin-top: 18rpx;
  text-align: center;
  font-size: 24rpx;
  color: #4980d6;
}

.result-link.disabled {
  opacity: 0.55;
}
</style>
