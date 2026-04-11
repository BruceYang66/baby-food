<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AppNavBar from '@/components/common/AppNavBar.vue'
import type { DailyMealPlan, MealPlanEntry, MealSlot, SaveMealPlanPayload } from '@baby-food/shared-types'
import { getMealPlanDetail, saveMealPlan, updateMealPlan } from '@/services/api'

// 路由参数
const planId = ref<string>('')
const planDate = ref<string>('')

// 当前计划数据
const plan = ref<DailyMealPlan | null>(null)
const loading = ref(true)
const saving = ref(false)

// 编辑状态：每个槽位的编辑数据
interface SlotEdit {
  slot: MealSlot
  time: string
  title: string
  focus: string
  recipeId?: string
  customRecipeId?: string
  isCustom?: boolean
  image: string
  tags: string[]
}

const slotOrder: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner']
const slotLabelMap: Record<MealSlot, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  snack: '点心',
  dinner: '晚餐'
}
const slotTimeMap: Record<MealSlot, string> = {
  breakfast: '08:00',
  lunch: '12:30',
  snack: '15:00',
  dinner: '18:00'
}
const slotEmojiMap: Record<MealSlot, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  snack: '🍎',
  dinner: '🌙'
}

const editSlots = ref<SlotEdit[]>([])

function getDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateParts(dateStr: string) {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return { year, month, day }
}

function resolvePlanDate(dateStr?: string) {
  const normalized = typeof dateStr === 'string' ? dateStr.trim() : ''
  return parseDateParts(normalized) ? normalized : getDateKey()
}

// 内联自定义创建状态
const customInputSlot = ref<MealSlot | null>(null)
const customTitle = ref('')
const customFocus = ref('')

// 计划基础信息
const nutritionScore = ref(90)
const waterSuggestion = ref('400ml')

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage?.options ?? {}

  planId.value = options.id ?? ''
  planDate.value = resolvePlanDate(options.date)

  if (planId.value) {
    try {
      const detail = await getMealPlanDetail(planId.value)
      plan.value = detail.mealPlan
      planDate.value = resolvePlanDate(detail.mealPlan.planDate)
      nutritionScore.value = detail.mealPlan.nutritionScore
      waterSuggestion.value = detail.mealPlan.waterSuggestion

      // 初始化编辑槽位（按已有条目，补齐空槽位）
      initEditSlots(detail.mealPlan.entries)
    } catch {
      uni.showToast({ title: '计划加载失败', icon: 'none' })
      initEditSlots([])
    }
  } else {
    // 新建计划（无 planId）
    initEditSlots([])
  }

  loading.value = false
})

function initEditSlots(entries: MealPlanEntry[]) {
  const entryMap = new Map<MealSlot, MealPlanEntry>()
  for (const entry of entries) {
    entryMap.set(entry.slot, entry)
  }

  editSlots.value = slotOrder.map((slot) => {
    const entry = entryMap.get(slot)
    return {
      slot,
      time: entry?.time ?? slotTimeMap[slot],
      title: entry?.title ?? '',
      focus: entry?.focus ?? '',
      recipeId: entry?.recipeId,
      customRecipeId: entry?.customRecipeId,
      isCustom: entry?.isCustom,
      image: entry?.image ?? '',
      tags: entry?.tags ?? []
    }
  })
}

const filledSlots = computed(() => editSlots.value.filter((s) => !!s.title))
const isEmpty = computed(() => filledSlots.value.length === 0)

// 打开食谱选择器
function openRecipePicker(slotIndex: number) {
  const slot = editSlots.value[slotIndex]
  uni.navigateTo({
    url: '/pages/recipe-picker/index',
    events: {
      selectRecipe: (recipe: { id: string; title: string; focus: string; image: string; tags: string[] }) => {
        editSlots.value[slotIndex].recipeId = recipe.id
        editSlots.value[slotIndex].customRecipeId = undefined
        editSlots.value[slotIndex].isCustom = false
        editSlots.value[slotIndex].title = recipe.title
        editSlots.value[slotIndex].focus = recipe.focus
        editSlots.value[slotIndex].image = recipe.image
        editSlots.value[slotIndex].tags = recipe.tags
      }
    }
  })
}

// 开启内联自定义输入
function openCustomInput(slot: MealSlot) {
  customInputSlot.value = slot
  const existing = editSlots.value.find((s) => s.slot === slot)
  customTitle.value = existing?.recipeId ? '' : (existing?.title ?? '')
  customFocus.value = existing?.recipeId ? '' : (existing?.focus ?? '')
}

function confirmCustomInput() {
  const title = customTitle.value.trim()
  if (!title) {
    uni.showToast({ title: '请填写菜品名称', icon: 'none' })
    return
  }

  const slot = customInputSlot.value!
  const index = editSlots.value.findIndex((s) => s.slot === slot)
  if (index >= 0) {
    const previous = editSlots.value[index]
    editSlots.value[index].title = title
    editSlots.value[index].focus = customFocus.value.trim() || '自定义菜品'
    editSlots.value[index].recipeId = undefined
    editSlots.value[index].customRecipeId = previous.isCustom ? previous.customRecipeId : undefined
    editSlots.value[index].isCustom = true
    editSlots.value[index].image = previous.isCustom ? previous.image : ''
    editSlots.value[index].tags = previous.isCustom ? previous.tags : []
  }

  customInputSlot.value = null
  customTitle.value = ''
  customFocus.value = ''
}

function cancelCustomInput() {
  customInputSlot.value = null
  customTitle.value = ''
  customFocus.value = ''
}

// 清空某个槽位
function clearSlot(slotIndex: number) {
  editSlots.value[slotIndex].title = ''
  editSlots.value[slotIndex].focus = ''
  editSlots.value[slotIndex].recipeId = undefined
  editSlots.value[slotIndex].customRecipeId = undefined
  editSlots.value[slotIndex].isCustom = undefined
  editSlots.value[slotIndex].image = ''
  editSlots.value[slotIndex].tags = []
}

// 保存计划
async function saveplan() {
  const filled = editSlots.value.filter((s) => !!s.title)
  if (filled.length === 0) {
    uni.showToast({ title: '请至少添加一个餐次', icon: 'none' })
    return
  }

  saving.value = true

  const payload: SaveMealPlanPayload = {
    title: planId.value ? '已保存辅食计划' : `${formatDateLabel(planDate.value)}辅食计划`,
    planDate: planDate.value,
    dateLabel: formatDateLabel(planDate.value),
    nutritionScore: nutritionScore.value,
    waterSuggestion: waterSuggestion.value,
    entries: filled.map((s) => ({
      recipeId: s.recipeId,
      customRecipeId: s.customRecipeId,
      isCustom: s.isCustom ?? !s.recipeId,
      slot: s.slot,
      time: s.time,
      title: s.title,
      focus: s.focus,
      image: s.image,
      tags: s.tags
    }))
  }

  try {
    const result = planId.value
      ? await updateMealPlan(planId.value, payload)
      : await saveMealPlan(payload)

    planId.value = result.mealPlan.id
    plan.value = result.mealPlan
    planDate.value = resolvePlanDate(result.mealPlan.planDate)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

function formatDateLabel(dateStr: string) {
  const today = getDateKey()
  if (dateStr === today) return '今天'

  const parts = parseDateParts(dateStr)
  if (!parts) return dateStr

  return `${parts.month}月${parts.day}日`
}

const pageTitle = computed(() => {
  if (!planDate.value) return '编辑计划'
  return planId.value ? `编辑 ${formatDateLabel(planDate.value)} 计划` : `新建 ${formatDateLabel(planDate.value)} 计划`
})
</script>

<template>
  <view class="page-shell">
    <AppNavBar :title="pageTitle" subtitle="选择食谱或自定义菜品" :show-back="true" />

    <view v-if="loading" class="loading-state soft-card">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else>
      <!-- 餐次编辑列表 -->
      <view class="slot-list">
        <view v-for="(slot, index) in editSlots" :key="slot.slot" class="slot-card card">
          <view class="slot-header">
            <view class="slot-label-row">
              <text class="slot-emoji">{{ slotEmojiMap[slot.slot] }}</text>
              <text class="slot-label">{{ slotLabelMap[slot.slot] }}</text>
              <text class="slot-time">{{ slot.time }}</text>
            </view>
            <view v-if="slot.title" class="slot-clear-btn" @tap="clearSlot(index)">
              <text class="slot-clear-text">清除</text>
            </view>
          </view>

          <!-- 已设置餐次 -->
          <view v-if="slot.title" class="slot-filled">
            <view class="slot-info">
              <text class="slot-title">{{ slot.title }}</text>
              <text class="slot-focus">{{ slot.focus }}</text>
              <view v-if="slot.tags.length" class="slot-tags">
                <text v-for="tag in slot.tags.slice(0, 3)" :key="tag" class="slot-tag">{{ tag }}</text>
              </view>
            </view>
            <view class="slot-actions">
              <view class="slot-action-btn" @tap="openRecipePicker(index)">换食谱</view>
              <view class="slot-action-btn outline" @tap="openCustomInput(slot.slot)">自定义</view>
            </view>
          </view>

          <!-- 未设置餐次 -->
          <view v-else class="slot-empty">
            <view class="add-btn primary" @tap="openRecipePicker(index)">
              <text class="add-btn-icon">📖</text>
              <text class="add-btn-text">从食谱库选择</text>
            </view>
            <view class="add-btn outline" @tap="openCustomInput(slot.slot)">
              <text class="add-btn-icon">✏️</text>
              <text class="add-btn-text">自定义创建</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 内联自定义输入 -->
      <view v-if="customInputSlot" class="custom-overlay" @tap="cancelCustomInput">
        <view class="custom-panel card" @tap.stop>
          <text class="custom-panel-title">自定义菜品 — {{ slotLabelMap[customInputSlot] }}</text>
          <view class="custom-form-scroll">
            <view class="custom-field">
              <text class="custom-label">菜品名称</text>
              <textarea
                class="custom-input"
                v-model="customTitle"
                placeholder="如：南瓜泥、鸡肉粥..."
                maxlength="40"
                auto-height
                cursor-spacing="120"
              />
            </view>
            <view class="custom-field">
              <text class="custom-label">备注说明（选填）</text>
              <textarea
                class="custom-input"
                v-model="customFocus"
                placeholder="如：补铁强化、软烂好消化..."
                maxlength="60"
                auto-height
                cursor-spacing="120"
              />
            </view>
          </view>
          <view class="custom-actions">
            <view class="custom-cancel" @tap="cancelCustomInput">取消</view>
            <view class="custom-confirm primary-button" @tap="confirmCustomInput">确定</view>
          </view>
        </view>
      </view>

      <!-- 营养分数/饮水建议 -->
      <view class="meta-card soft-card">
        <view class="meta-row">
          <text class="meta-label">营养评分</text>
          <view class="meta-score-row">
            <text
              v-for="score in [70, 80, 90, 100]"
              :key="score"
              class="meta-score-chip"
              :class="{ active: nutritionScore === score }"
              @tap="nutritionScore = score"
            >{{ score }}</text>
          </view>
        </view>
        <view class="meta-row">
          <text class="meta-label">饮水建议</text>
          <view class="meta-score-row">
            <text
              v-for="water in ['350ml', '400ml', '450ml', '500ml']"
              :key="water"
              class="meta-score-chip"
              :class="{ active: waterSuggestion === water }"
              @tap="waterSuggestion = water"
            >{{ water }}</text>
          </view>
        </view>
      </view>

      <!-- 底部保存按钮 -->
      <view class="fixed-bottom-actions single">
        <view class="bottom-mini-btn primary" :class="{ disabled: saving }" @tap="saveplan">
          {{ saving ? '保存中...' : '保存计划' }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
  margin-top: 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: var(--mini-text-muted);
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
}

.slot-card {
  padding: 28rpx;
}

.slot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.slot-label-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.slot-emoji {
  font-size: 32rpx;
}

.slot-label {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.slot-time {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.slot-clear-btn {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.06);
}

.slot-clear-text {
  font-size: 20rpx;
  color: var(--mini-text-muted);
}

.slot-filled {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}

.slot-info {
  flex: 1;
  min-width: 0;
}

.slot-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.slot-focus {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.slot-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.slot-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.18);
  font-size: 18rpx;
  color: var(--mini-primary-deep);
}

.slot-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex-shrink: 0;
}

.slot-action-btn {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: var(--mini-primary-deep);
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.slot-action-btn.outline {
  background: transparent;
  border: 2rpx solid var(--mini-primary-deep);
  color: var(--mini-primary-deep);
}

.slot-empty {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.add-btn {
  min-height: 104rpx;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 20rpx 16rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  box-sizing: border-box;
}

.add-btn.outline {
  background: transparent;
  border: 2rpx solid rgba(0, 0, 0, 0.1);
}

.add-btn-icon {
  font-size: 26rpx;
}

.add-btn-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  text-align: center;
  white-space: normal;
  word-break: break-word;
}

.add-btn.outline .add-btn-text {
  color: var(--mini-text-muted);
}

/* 自定义输入面板 */
.custom-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
}

.custom-panel {
  width: 100%;
  max-height: 72vh;
  margin: 0;
  border-radius: 32rpx 32rpx 0 0;
  padding: 36rpx 32rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.custom-panel-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
  margin-bottom: 24rpx;
}

.custom-form-scroll {
  max-height: 42vh;
  overflow: scroll;
}

.custom-field {
  margin-bottom: 24rpx;
}

.custom-label {
  display: block;
  font-size: 22rpx;
  color: var(--mini-text-muted);
  margin-bottom: 10rpx;
}

.custom-input {
  width: 100%;
  min-height: 96rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.04);
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.custom-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.custom-cancel {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.06);
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
}

.custom-confirm {
  flex: 2;
  padding: 24rpx 0;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
}

/* 营养信息配置 */
.meta-card {
  margin-top: 24rpx;
  padding: 28rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-label {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.meta-score-row {
  display: flex;
  gap: 12rpx;
}

.meta-score-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.06);
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.meta-score-chip.active {
  background: var(--mini-primary-deep);
  color: #fff;
  font-weight: 700;
}

.fixed-bottom-actions.single {
  justify-content: center;
}

.bottom-mini-btn.disabled {
  opacity: 0.5;
}
</style>
