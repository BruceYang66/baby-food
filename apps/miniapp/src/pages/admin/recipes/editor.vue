<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { AdminRecipeUpsertPayload, ContentStatus, RecipeDetail } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import TagChip from '@/components/common/TagChip.vue'
import {
  createAppAdminRecipe,
  getAppAdminRecipeDetail,
  getAppAdminRecipes,
  readAuthSession,
  syncAppSession,
  updateAppAdminRecipe,
  uploadAdminImage,
  normalizeAppImageUrl
} from '@/services/api'

const PREVIEW_STORAGE_KEY = 'adminRecipePreview'

type EditableIngredient = {
  name: string
  amount: string
  unit: string
}

type EditableStep = {
  title: string
  description: string
  imageUrl: string
  imagePreview: string
}

const recipeId = ref('')
const loading = ref(false)
const saving = ref(false)
const tagInput = ref('')
const suggestedTags = ref<string[]>([])

const statusOptions: Array<{ value: ContentStatus; label: string }> = [
  { value: 'draft', label: '草稿' },
  { value: 'pending_review', label: '待审核' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下架' },
  { value: 'trash', label: '已删除' }
]

const difficultyOptions = ['简单', '中等', '进阶']

const form = ref({
  title: '',
  summary: '',
  coverImage: '',
  coverPreview: '',
  ageMinMonths: '6',
  ageMaxMonths: '8',
  durationLabel: '20分钟',
  difficultyLabel: '简单',
  tagsText: '',
  contentStatus: 'draft' as ContentStatus,
  ingredients: [{ name: '', amount: '', unit: '' }] as EditableIngredient[],
  steps: [{ title: '', description: '', imageUrl: '', imagePreview: '' }] as EditableStep[]
})

const ageLabel = computed(() => {
  const min = Number.parseInt(form.value.ageMinMonths, 10) || 6
  const maxText = form.value.ageMaxMonths.trim()
  if (!maxText) {
    return `${min}个月+`
  }

  const max = Number.parseInt(maxText, 10)
  if (!Number.isFinite(max) || max <= 0) {
    return `${min}个月+`
  }

  if (min === max) {
    return `${min}个月`
  }

  return `${Math.min(min, max)}-${Math.max(min, max)}个月`
})

const statusLabel = computed(() => statusOptions.find((item) => item.value === form.value.contentStatus)?.label ?? '草稿')
const tagList = computed(() => form.value.tagsText.split(/[，,]/).map((item) => item.trim()).filter(Boolean))
const availableSuggestedTags = computed(() => suggestedTags.value.filter((tag) => !tagList.value.includes(tag)).slice(0, 12))

async function ensureAdminAccess() {
  const session = readAuthSession()
  if (!session?.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }

  if (session.canAppAdmin) {
    return true
  }

  const refreshedSession = await syncAppSession()
  if (!refreshedSession) {
    uni.showToast({ title: '权限校验失败，请稍后重试', icon: 'none' })
    return false
  }

  if (refreshedSession.canAppAdmin) {
    return true
  }

  uni.showToast({ title: '当前账号无内容管理权限', icon: 'none' })
  uni.navigateBack({ delta: 1 })
  return false
}

function createEmptyIngredient(): EditableIngredient {
  return { name: '', amount: '', unit: '' }
}

function createEmptyStep(): EditableStep {
  return { title: '', description: '', imageUrl: '', imagePreview: '' }
}

async function loadSuggestedTags() {
  try {
    const rows = await getAppAdminRecipes()
    const counts = new Map<string, number>()
    rows.forEach((row) => {
      row.tags.forEach((tag) => {
        const normalized = tag.trim()
        if (!normalized) return
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
      })
    })
    suggestedTags.value = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .map(([tag]) => tag)
  } catch {
    suggestedTags.value = []
  }
}

function syncTags(tags: string[]) {
  form.value.tagsText = [...new Set(tags.map((item) => item.trim()).filter(Boolean))].join('，')
}

function addTag(rawTag?: string) {
  const nextTag = (rawTag ?? tagInput.value).trim()
  if (!nextTag) {
    return
  }
  if (tagList.value.includes(nextTag)) {
    tagInput.value = ''
    return
  }
  syncTags([...tagList.value, nextTag])
  tagInput.value = ''
}

function removeTag(tag: string) {
  syncTags(tagList.value.filter((item) => item !== tag))
}

async function chooseAndUploadImage(onPreview: (value: string) => void, onUploaded: (value: string) => void) {
  try {
    const result = await uni.chooseImage({ count: 1 })
    const filePath = result.tempFilePaths?.[0]
    if (!filePath) return
    onPreview(filePath)
    uni.showLoading({ title: '上传中...' })
    const uploadedUrl = await uploadAdminImage(filePath)
    onUploaded(uploadedUrl)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '上传失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function addIngredient() {
  form.value.ingredients.push(createEmptyIngredient())
}

function removeIngredient(index: number) {
  if (form.value.ingredients.length === 1) {
    form.value.ingredients[0] = createEmptyIngredient()
    return
  }
  form.value.ingredients.splice(index, 1)
}

function addStep() {
  form.value.steps.push(createEmptyStep())
}

function removeStep(index: number) {
  if (form.value.steps.length === 1) {
    form.value.steps[0] = createEmptyStep()
    return
  }
  form.value.steps.splice(index, 1)
}

function moveStep(index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= form.value.steps.length) {
    return
  }

  const steps = [...form.value.steps]
  const current = steps[index]
  steps[index] = steps[targetIndex]
  steps[targetIndex] = current
  form.value.steps = steps
}

function uploadCoverImage() {
  void chooseAndUploadImage(
    (preview) => {
      form.value.coverPreview = preview
    },
    (uploadedUrl) => {
      form.value.coverImage = uploadedUrl
      form.value.coverPreview = uploadedUrl
    }
  )
}

function uploadStepImage(index: number) {
  void chooseAndUploadImage(
    (preview) => {
      form.value.steps[index].imagePreview = preview
    },
    (uploadedUrl) => {
      form.value.steps[index].imageUrl = uploadedUrl
      form.value.steps[index].imagePreview = uploadedUrl
    }
  )
}

function clearStepImage(index: number) {
  form.value.steps[index].imageUrl = ''
  form.value.steps[index].imagePreview = ''
}

function normalizeIngredients() {
  return form.value.ingredients
    .map((item) => ({
      name: item.name.trim(),
      amount: item.amount.trim(),
      unit: item.unit.trim()
    }))
    .filter((item) => item.name || item.amount || item.unit)
}

function normalizeSteps() {
  return form.value.steps
    .map((item, index) => ({
      stepNo: index + 1,
      title: item.title.trim() || `步骤${index + 1}`,
      description: item.description.trim(),
      imageUrl: item.imageUrl.trim() || undefined
    }))
    .filter((item) => item.description)
}

function buildPayload(): AdminRecipeUpsertPayload {
  const ingredients = normalizeIngredients()
  const steps = normalizeSteps()
  const minMonths = Number.parseInt(form.value.ageMinMonths, 10) || 6
  const maxText = form.value.ageMaxMonths.trim()
  const parsedMax = maxText ? Number.parseInt(maxText, 10) : null
  const ageMaxMonths = parsedMax && parsedMax > 0 ? parsedMax : null

  return {
    title: form.value.title.trim(),
    summary: form.value.summary.trim(),
    coverImage: form.value.coverImage.trim(),
    ageMinMonths: minMonths,
    ageMaxMonths,
    durationLabel: form.value.durationLabel.trim(),
    difficultyLabel: form.value.difficultyLabel.trim(),
    contentStatus: form.value.contentStatus,
    tags: tagList.value,
    ingredients,
    steps
  }
}

function buildPreviewPayload(savedId: string): RecipeDetail {
  const payload = buildPayload()

  return {
    id: savedId,
    title: payload.title,
    image: form.value.coverPreview || payload.coverImage || '',
    heroImage: form.value.coverPreview || payload.coverImage || '',
    ageLabel: ageLabel.value,
    ageMinMonths: payload.ageMinMonths,
    ageMaxMonths: payload.ageMaxMonths ?? null,
    durationLabel: payload.durationLabel,
    difficultyLabel: payload.difficultyLabel,
    tags: payload.tags,
    description: payload.summary,
    nutritionTips: payload.tags.length ? payload.tags.map((tag) => `可关注：${tag}`) : ['根据宝宝月龄调整软烂度与颗粒度。'],
    ingredients: payload.ingredients.map((item, index) => ({
      id: `${savedId}-ingredient-${index}`,
      name: item.name,
      amount: item.unit ? `${item.amount}${item.unit}` : item.amount
    })),
    steps: payload.steps.map((item) => ({
      stepNo: item.stepNo,
      title: item.title,
      description: item.description,
      image: form.value.steps[item.stepNo - 1]?.imagePreview || item.imageUrl
    })),
    relatedRecipes: []
  }
}

async function loadDetail() {
  if (!recipeId.value) return
  loading.value = true
  try {
    const detail = await getAppAdminRecipeDetail(recipeId.value)
    form.value = {
      title: detail.title,
      summary: detail.summary,
      coverImage: detail.coverImage,
      coverPreview: detail.coverImage,
      ageMinMonths: String(detail.ageMinMonths ?? 6),
      ageMaxMonths: detail.ageMaxMonths == null ? '' : String(detail.ageMaxMonths),
      durationLabel: detail.durationLabel,
      difficultyLabel: detail.difficultyLabel,
      tagsText: detail.tags.join('，'),
      contentStatus: detail.contentStatus,
      ingredients: detail.ingredients.length
        ? detail.ingredients.map((item) => ({ name: item.name, amount: item.amount, unit: item.unit }))
        : [createEmptyIngredient()],
      steps: detail.steps.length
        ? detail.steps.map((item) => ({
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl ?? '',
            imagePreview: item.imageUrl ?? ''
          }))
        : [createEmptyStep()]
    }
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '食谱详情读取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function validateForm() {
  const payload = buildPayload()

  if (!payload.title.trim()) {
    uni.showToast({ title: '请填写食谱标题', icon: 'none' })
    return false
  }

  if (!payload.coverImage?.trim()) {
    uni.showToast({ title: '请先上传封面图', icon: 'none' })
    return false
  }

  if (!payload.ingredients.length) {
    uni.showToast({ title: '请至少填写一项食材', icon: 'none' })
    return false
  }

  if (!payload.steps.length) {
    uni.showToast({ title: '请至少填写一个步骤', icon: 'none' })
    return false
  }

  return true
}

async function persistRecipe(openPreview = false) {
  if (!await ensureAdminAccess()) return
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = buildPayload()
    if (recipeId.value) {
      await updateAppAdminRecipe(recipeId.value, payload)
    } else {
      const created = await createAppAdminRecipe(payload)
      recipeId.value = created.id
    }

    uni.showToast({ title: '保存成功', icon: 'success' })

    if (openPreview) {
      uni.setStorageSync(PREVIEW_STORAGE_KEY, buildPreviewPayload(recipeId.value))
      uni.navigateTo({ url: '/pages/recipe-detail/index?preview=admin' })
    }
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

onLoad((query) => {
  void (async () => {
    if (!await ensureAdminAccess()) return
    recipeId.value = typeof query?.id === 'string' ? query.id : ''
    await Promise.all([loadSuggestedTags(), loadDetail()])
  })()
})
</script>

<template>
  <view class="page-shell admin-editor-page">
    <AppNavBar :title="recipeId ? '编辑食谱' : '新建食谱'" subtitle="结构化编辑与正式详情预览" :show-back="true" />

    <view class="hero-card soft-card">
      <text class="hero-kicker">食谱运营</text>
      <text class="hero-title">先编辑结构，再切到正式详情页看效果</text>
      <view class="hero-meta-row">
        <TagChip :text="ageLabel" accent="secondary" />
        <TagChip :text="statusLabel" accent="primary" />
      </view>
    </view>

    <view v-if="loading" class="soft-card state-card">加载中...</view>

    <view v-else class="form-wrap">
      <view class="card form-card">
        <text class="card-title">基础信息</text>
        <input v-model="form.title" class="ghost-input mini-input" placeholder="食谱标题" />
        <textarea v-model="form.summary" class="mini-textarea" placeholder="一句话简介，方便列表与预览展示" maxlength="300" />

        <view class="grid-row">
          <view class="field-block">
            <text class="field-label">最小月龄</text>
            <input v-model="form.ageMinMonths" class="ghost-input mini-input" type="number" placeholder="6" />
          </view>
          <view class="field-block">
            <text class="field-label">最大月龄</text>
            <input v-model="form.ageMaxMonths" class="ghost-input mini-input" type="number" placeholder="不填表示 个月+" />
          </view>
        </view>

        <view class="chip-preview-row">
          <TagChip :text="ageLabel" accent="secondary" />
        </view>

        <view class="grid-row">
          <view class="field-block">
            <text class="field-label">制作时长</text>
            <input v-model="form.durationLabel" class="ghost-input mini-input" placeholder="20分钟" />
          </view>
          <view class="field-block">
            <text class="field-label">难度</text>
            <picker :range="difficultyOptions" @change="(e) => form.difficultyLabel = difficultyOptions[Number(e.detail.value)] || '简单'">
              <view class="picker-cell">{{ form.difficultyLabel }}</view>
            </picker>
          </view>
        </view>
      </view>

      <view class="card form-card">
        <text class="card-title">封面与标签</text>
        <view class="cover-shell">
          <image v-if="form.coverPreview || form.coverImage" class="cover-image" :src="normalizeAppImageUrl(form.coverPreview || form.coverImage)" mode="aspectFill" />
          <view v-else class="cover-placeholder">上传封面图</view>
        </view>
        <view class="action-row">
          <view class="outline-chip primary-chip" @tap="uploadCoverImage">上传封面</view>
        </view>
        <text class="upload-hint">{{ form.coverImage ? '封面已上传，地址已自动保存。' : '上传后会自动保存封面地址。' }}</text>
        <view class="tag-input-row">
          <input v-model="tagInput" class="ghost-input mini-input" placeholder="输入自定义标签后点击添加" confirm-type="done" @confirm="addTag()" />
          <view class="outline-chip secondary-chip" @tap="addTag()">添加标签</view>
        </view>
        <view v-if="tagList.length" class="tag-list removable-wrap">
          <view v-for="tag in tagList" :key="tag" class="removable-tag" @tap="removeTag(tag)">
            <TagChip :text="tag" accent="primary" />
            <text class="tag-remove">×</text>
          </view>
        </view>
        <view v-if="availableSuggestedTags.length" class="suggested-wrap">
          <text class="field-label">历史标签</text>
          <view class="tag-list">
            <view v-for="tag in availableSuggestedTags" :key="tag" class="outline-chip light-chip" @tap="addTag(tag)">{{ tag }}</view>
          </view>
        </view>
      </view>

      <view class="card form-card">
        <view class="section-head">
          <text class="card-title">食材清单</text>
          <view class="outline-chip secondary-chip" @tap="addIngredient">+ 添加食材</view>
        </view>
        <view v-for="(ingredient, index) in form.ingredients" :key="`ingredient-${index}`" class="editor-row soft-card">
          <input v-model="ingredient.name" class="ghost-input mini-input" placeholder="食材名称" />
          <view class="grid-row">
            <input v-model="ingredient.amount" class="ghost-input mini-input" placeholder="数量" />
            <input v-model="ingredient.unit" class="ghost-input mini-input" placeholder="单位" />
          </view>
          <view class="mini-link danger" @tap="removeIngredient(index)">{{ form.ingredients.length === 1 ? '清空' : '删除' }}</view>
        </view>
      </view>

      <view class="card form-card">
        <view class="section-head">
          <text class="card-title">制作步骤</text>
          <view class="outline-chip secondary-chip" @tap="addStep">+ 添加步骤</view>
        </view>
        <view v-for="(step, index) in form.steps" :key="`step-${index}`" class="step-card soft-card">
          <view class="step-head">
            <text class="step-index">步骤 {{ index + 1 }}</text>
            <view class="step-actions">
              <view class="mini-link" :class="{ disabled: index === 0 }" @tap="moveStep(index, -1)">上移</view>
              <view class="mini-link" :class="{ disabled: index === form.steps.length - 1 }" @tap="moveStep(index, 1)">下移</view>
              <view class="mini-link danger" @tap="removeStep(index)">{{ form.steps.length === 1 ? '清空' : '删除' }}</view>
            </view>
          </view>
          <input v-model="step.title" class="ghost-input mini-input" placeholder="步骤标题，如：蒸熟压泥" />
          <textarea v-model="step.description" class="mini-textarea small" placeholder="步骤描述" />
          <view class="step-image-shell">
            <image v-if="step.imagePreview || step.imageUrl" class="step-image" :src="normalizeAppImageUrl(step.imagePreview || step.imageUrl)" mode="aspectFill" />
            <view v-else class="step-image placeholder">步骤配图</view>
          </view>
          <view class="action-row">
            <view class="outline-chip primary-chip" @tap="uploadStepImage(index)">{{ step.imageUrl ? '更换配图' : '上传配图' }}</view>
            <view v-if="step.imageUrl || step.imagePreview" class="mini-link danger" @tap="clearStepImage(index)">移除图片</view>
          </view>
        </view>
      </view>

      <view class="card form-card">
        <text class="card-title">发布状态</text>
        <picker :range="statusOptions.map((item) => item.label)" @change="(e) => form.contentStatus = statusOptions[Number(e.detail.value)]?.value || 'draft'">
          <view class="picker-cell">{{ statusLabel }}</view>
        </picker>
      </view>
    </view>

    <view class="fixed-bottom-actions admin-actions">
      <view class="outline-button editor-secondary-button" @tap="persistRecipe(false)">{{ saving ? '保存中...' : '保存内容' }}</view>
      <view class="primary-button editor-primary-button" @tap="persistRecipe(true)">{{ saving ? '保存中...' : '查看效果' }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.admin-editor-page {
  padding-bottom: 260rpx;
}

.hero-card {
  margin-top: 18rpx;
  padding: 28rpx;
}

.hero-kicker,
.field-label,
.mini-link,
.cover-placeholder,
.state-card,
.upload-hint {
  color: var(--mini-text-muted);
}

.hero-kicker,
.field-label,
.card-title,
.step-index {
  font-weight: 700;
}

.hero-kicker,
.field-label,
.mini-link {
  font-size: 22rpx;
}

.hero-title {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  line-height: 1.5;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-meta-row,
.action-row,
.section-head,
.step-head,
.step-actions,
.tag-list {
  display: flex;
  align-items: center;
}

.action-row {
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.hero-meta-row,
.tag-list {
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.tag-input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tag-input-row .mini-input {
  flex: 1;
}

.removable-wrap {
  gap: 12rpx;
}

.removable-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding-right: 6rpx;
}

.tag-remove {
  font-size: 22rpx;
  color: var(--mini-danger);
}

.suggested-wrap {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.form-card {
  padding: 26rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.card-title {
  font-size: 30rpx;
  color: var(--mini-text);
}

.mini-input {
  margin: 0;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.chip-preview-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.cover-shell,
.step-image-shell {
  overflow: hidden;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
}

.cover-image,
.cover-placeholder {
  width: 100%;
  height: 320rpx;
}

.cover-placeholder,
.step-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 179, 102, 0.12);
  font-size: 26rpx;
}

.outline-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180rpx;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 10rpx 24rpx rgba(138, 81, 8, 0.12);
}

.primary-chip {
  background: linear-gradient(135deg, #ff9a47, #ffbc74);
  color: #fff;
}

.secondary-chip {
  background: rgba(168, 230, 207, 0.34);
  color: var(--mini-secondary-deep);
}

.light-chip {
  min-width: auto;
  background: rgba(255, 255, 255, 0.98);
  color: var(--mini-text-muted);
  box-shadow: none;
}

.editor-row,
.step-card {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.section-head,
.step-head {
  justify-content: space-between;
  gap: 14rpx;
}

.step-actions {
  gap: 18rpx;
}

.step-image {
  width: 100%;
  height: 240rpx;
  display: block;
}

.upload-hint {
  font-size: 22rpx;
  line-height: 1.6;
}

.mini-textarea {
  width: 100%;
  min-height: 200rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  padding: 18rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  line-height: 1.7;
}

.mini-textarea.small {
  min-height: 160rpx;
}

.picker-cell {
  padding: 18rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  font-size: 24rpx;
}

.mini-link.danger {
  color: var(--mini-danger);
}

.mini-link.disabled {
  opacity: 0.35;
}

.state-card {
  margin-top: 20rpx;
  padding: 30rpx;
  text-align: center;
  font-size: 24rpx;
}

.admin-actions {
  z-index: 10;
  align-items: center;
  justify-content: center;
}

.editor-secondary-button,
.editor-primary-button {
  flex: 1;
  max-width: 300rpx;
  height: 90rpx;
  border-radius: 28rpx;
  font-size: 28rpx;
}

.editor-secondary-button {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(249, 239, 226, 0.98));
  box-shadow: 0 10rpx 24rpx rgba(138, 81, 8, 0.08);
}

.editor-primary-button {
  background: linear-gradient(135deg, #ff9950, #ffb96f);
  box-shadow: 0 12rpx 28rpx rgba(255, 153, 80, 0.24);
}
</style>
