<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { BabyProfile, DailyMealPlan, MealCount, MealPlanEntry, NutritionGoal, SaveMealPlanPayload } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import NutritionScoreCard from '@/components/meal/NutritionScoreCard.vue'
import MealTimeline from '@/components/meal/MealTimeline.vue'
import { ensureProtectedPageAccess, getGeneratePageData, saveMealPlan, swapMealPlanItem, updateMealPlan } from '@/services/api'

const PENDING_RECIPE_KEY = 'pendingPlanRecipe'
const SAVED_PLAN_KEY = 'savedGeneratePlan'
const RESTORE_SAVED_PLAN_KEY = 'restoreSavedPlan'
const PREFERRED_INGREDIENT_KEY = 'preferredIngredient'
const DEFAULT_GOALS: NutritionGoal[] = ['补铁', '补钙', 'DHA', '通便', '开胃', '挑食', '免疫力', '手抓食', '病期适用']

const baby = ref<BabyProfile>()
const plan = ref<DailyMealPlan>()
const selectedCount = ref<MealCount>('3餐')
const selectedGoals = ref<NutritionGoal[]>(['补钙'])
const goals = ref<NutritionGoal[]>(DEFAULT_GOALS)
const loading = ref(false)
const saving = ref(false)
const swappingEntryId = ref('')

function applyPendingRecipe() {
  if (!plan.value) {
    return
  }

  const pending = uni.getStorageSync(PENDING_RECIPE_KEY) as {
    id?: string
    title?: string
    image?: string
    tags?: string[]
  } | undefined

  if (!pending?.id) {
    return
  }

  const targetIndex = plan.value.entries.findIndex((item) => item.slot === 'dinner')
  const resolvedIndex = targetIndex >= 0 ? targetIndex : plan.value.entries.length - 1

  if (resolvedIndex < 0) {
    return
  }

  plan.value = {
    ...plan.value,
    entries: plan.value.entries.map((item, index) => {
      if (index !== resolvedIndex) {
        return item
      }

      return {
        ...item,
        recipeId: pending.id,
        title: pending.title ?? item.title,
        image: pending.image ?? item.image,
        tags: Array.isArray(pending.tags) ? pending.tags : item.tags,
        focus: '已从食谱详情加入'
      }
    })
  }

  uni.removeStorageSync(PENDING_RECIPE_KEY)
  uni.showToast({ title: '已加入当前计划', icon: 'none' })
}

function applyPreferredIngredient() {
  if (!plan.value) {
    return
  }

  const ingredient = uni.getStorageSync(PREFERRED_INGREDIENT_KEY)

  if (typeof ingredient !== 'string' || !ingredient) {
    return
  }

  const targetIndex = plan.value.entries.findIndex((item) => item.slot === 'lunch')
  const resolvedIndex = targetIndex >= 0 ? targetIndex : 0

  if (!plan.value.entries[resolvedIndex]) {
    return
  }

  plan.value = {
    ...plan.value,
    entries: plan.value.entries.map((item, index) => index === resolvedIndex ? {
      ...item,
      title: `${ingredient}${item.title}`,
      focus: `${ingredient}优先搭配`
    } : item)
  }

  uni.removeStorageSync(PREFERRED_INGREDIENT_KEY)
  uni.showToast({ title: `已优先搭配${ingredient}`, icon: 'none' })
}

function applySavedPlan() {
  const shouldRestore = uni.getStorageSync(RESTORE_SAVED_PLAN_KEY)

  if (!shouldRestore) {
    return false
  }

  const saved = uni.getStorageSync(SAVED_PLAN_KEY) as {
    babyProfile?: BabyProfile
    todayMealPlan?: DailyMealPlan
    mealCount?: MealCount
    goals?: NutritionGoal[]
  } | undefined

  uni.removeStorageSync(RESTORE_SAVED_PLAN_KEY)

  if (!saved?.todayMealPlan || !saved.babyProfile) {
    uni.showToast({ title: '没有可恢复的计划', icon: 'none' })
    return false
  }

  baby.value = saved.babyProfile
  plan.value = saved.todayMealPlan
  goals.value = DEFAULT_GOALS
  selectedCount.value = saved.mealCount ?? selectedCount.value
  selectedGoals.value = Array.isArray(saved.goals) && saved.goals.length ? saved.goals : selectedGoals.value
  applyPendingRecipe()
  applyPreferredIngredient()
  uni.showToast({ title: '已恢复计划', icon: 'none' })
  return true
}

async function loadPlan() {
  if (!ensureProtectedPageAccess()) {
    return
  }

  if (applySavedPlan()) {
    return
  }

  loading.value = true

  try {
    const data = await getGeneratePageData({
      mealCount: selectedCount.value,
      goals: selectedGoals.value
    })

    baby.value = data.babyProfile
    plan.value = data.todayMealPlan
    goals.value = data.nutritionGoals
    applyPendingRecipe()
    applyPreferredIngredient()
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '生成失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadPlan)

function toggleGoal(goal: NutritionGoal) {
  if (selectedGoals.value.includes(goal)) {
    selectedGoals.value = selectedGoals.value.filter((item) => item !== goal)
    return
  }

  selectedGoals.value = [...selectedGoals.value, goal]
}

async function swapMeal(entry: MealPlanEntry) {
  if (!plan.value || swappingEntryId.value) {
    return
  }

  swappingEntryId.value = entry.id

  try {
    let currentPlan = plan.value
    const isSyntheticPlan = !currentPlan.id || currentPlan.id.startsWith('recommended-') || currentPlan.id.startsWith('generated-')
    let targetEntryId = entry.id

    if (isSyntheticPlan) {
      const saved = await saveMealPlan(buildSavePayload(currentPlan))
      currentPlan = saved.mealPlan
      plan.value = currentPlan
      targetEntryId = currentPlan.entries.find((item) => item.slot === entry.slot)?.id ?? ''

      if (!targetEntryId) {
        throw new Error('当前餐次保存失败，请重试')
      }
    }

    const data = await swapMealPlanItem(currentPlan.id, targetEntryId)
    plan.value = data.mealPlan
    uni.showToast({ title: '已换一道', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '替换失败',
      icon: 'none'
    })
  } finally {
    swappingEntryId.value = ''
  }
}

function buildSavePayload(currentPlan: DailyMealPlan): SaveMealPlanPayload {
  return {
    title: '已保存辅食计划',
    dateLabel: currentPlan.dateLabel,
    planDate: currentPlan.planDate,
    nutritionScore: currentPlan.nutritionScore,
    waterSuggestion: currentPlan.waterSuggestion,
    entries: currentPlan.entries.map((entry) => ({
      recipeId: entry.recipeId,
      customRecipeId: entry.customRecipeId,
      isCustom: entry.isCustom,
      slot: entry.slot,
      time: entry.time,
      title: entry.title,
      focus: entry.focus,
      image: entry.image,
      tags: entry.tags
    }))
  }
}

async function persistPlan() {
  if (!plan.value) {
    return
  }

  saving.value = true

  try {
    const payload = buildSavePayload(plan.value)
    // id 为 synthetic（'meal-snack' 或 'recommended-*'）时表示尚未写入 DB，需要新建
    const isSyntheticId = !plan.value.id
      || plan.value.id === 'meal-snack'
      || plan.value.id.startsWith('recommended-')
    const result = isSyntheticId
      ? await saveMealPlan(payload)
      : await updateMealPlan(plan.value.id, payload)

    plan.value = result.mealPlan
    uni.setStorageSync(SAVED_PLAN_KEY, {
      savedAt: new Date().toISOString(),
      babyProfile: baby.value,
      todayMealPlan: result.mealPlan,
      mealCount: selectedCount.value,
      goals: selectedGoals.value
    })
    uni.showToast({ title: '已保存计划', icon: 'success' })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '保存失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

function sharePlan() {
  uni.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })
  uni.showToast({ title: '点击右上角 ··· 转发', icon: 'none', duration: 1500 })
}

onShareAppMessage(() => ({
  title: plan.value ? `${baby.value?.nickname ?? '宝宝'}的今日辅食计划` : '宝宝今日辅食计划',
  path: '/pages/generate/index'
}))

onShareTimeline(() => ({
  title: plan.value ? `${baby.value?.nickname ?? '宝宝'}的今日辅食计划` : '宝宝今日辅食计划'
}))
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="生成今日辅食" subtitle="按宝宝当前状态智能搭配" :show-back="true" />

    <view class="picker card" v-if="baby">
      <image class="picker-avatar" :src="baby.avatar" mode="aspectFill" />
      <view>
        <text class="picker-name">{{ baby.nickname }}</text>
        <text class="picker-meta">{{ baby.monthAgeLabel }} · {{ baby.stageLabel }}</text>
      </view>
      <text class="picker-arrow">⌄</text>
    </view>

    <view class="soft-card setting-panel">
      <text class="setting-label">每日餐数</text>
      <view class="count-row">
        <view class="count-chip" :class="{ active: selectedCount === '2餐' }" @tap="selectedCount = '2餐'">2餐</view>
        <view class="count-chip" :class="{ active: selectedCount === '3餐' }" @tap="selectedCount = '3餐'">3餐</view>
        <view class="count-chip" :class="{ active: selectedCount === '3餐+点心' }" @tap="selectedCount = '3餐+点心'">3餐+点心</view>
      </view>

      <text class="setting-label">特殊需求</text>
      <view class="chip-row">
        <view
          v-for="goal in goals"
          :key="goal"
          class="chip"
          :class="{ active: selectedGoals.includes(goal) }"
          @tap="toggleGoal(goal)"
        >
          {{ goal }}
        </view>
      </view>

      <view class="allergy-tip" v-if="baby && baby.allergens.length">过敏提醒：已避开 {{ baby.allergens.join('、') }}</view>
      <view class="primary-button" @tap="loadPlan">{{ loading ? '生成中...' : '一键生成' }}</view>
    </view>

    <NutritionScoreCard v-if="plan" :plan="plan" />

    <view class="section" v-if="plan">
      <text class="section-title">三餐推荐</text>
      <MealTimeline :plan="plan" @swap="swapMeal" />
      <text v-if="swappingEntryId" class="swap-tip">正在替换餐次...</text>
    </view>

    <view class="fixed-bottom-actions">
      <view class="bottom-mini-btn" @tap="persistPlan">{{ saving ? '保存中...' : '保存计划' }}</view>
      <view class="bottom-mini-btn" @tap="sharePlan">分享</view>
      <view class="bottom-mini-btn primary" @tap="loadPlan">{{ loading ? '生成中...' : '重新生成' }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.picker {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
}

.picker-avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 999rpx;
}

.picker-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.picker-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.picker-arrow {
  margin-left: auto;
  font-size: 36rpx;
  color: var(--mini-text-muted);
}

.setting-panel {
  margin-top: 24rpx;
  padding: 28rpx;
}

.setting-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.count-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.count-chip {
  flex: 1;
  padding: 20rpx 0;
  border-radius: var(--mini-radius-pill);
  background: rgba(255,255,255,0.8);
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.count-chip.active {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}

.allergy-tip {
  margin: 24rpx 0;
  padding: 18rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(214, 106, 106, 0.08);
  font-size: 24rpx;
  color: #a94f4f;
}

.section {
  margin-top: 30rpx;
}

.swap-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.bottom-mini-btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 24rpx;
  background: rgba(255,255,255,0.88);
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.bottom-mini-btn.primary {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}
</style>
