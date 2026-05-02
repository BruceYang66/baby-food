<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type {
  AdminKnowledgeArticleUpsertPayload,
  ContentStatus,
  KnowledgeArticleDetail,
  KnowledgeContentType,
  KnowledgeSectionImageAspectRatio,
  KnowledgeSectionImageItem,
  KnowledgeSectionLayout
} from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import TagChip from '@/components/common/TagChip.vue'
import {
  createAppAdminKnowledge,
  getAppAdminKnowledgeDetail,
  getAppAdminKnowledgeList,
  readAuthSession,
  syncAppSession,
  updateAppAdminKnowledge,
  uploadAdminImage,
  normalizeAppImageUrl
} from '@/services/api'

const PREVIEW_STORAGE_KEY = 'adminKnowledgePreview'

type EditableSection = {
  title: string
  content: string
  imageItems: KnowledgeSectionImageItem[]
  layout: KnowledgeSectionLayout
}

const articleId = ref('')
const loading = ref(false)
const saving = ref(false)
const tagInput = ref('')
const suggestedTags = ref<string[]>([])

const categories = [
  { key: 'feeding', label: '月龄喂养' },
  { key: 'health', label: '健康护理' },
  { key: 'nutrition', label: '营养知识' },
  { key: 'development', label: '成长发育' },
  { key: 'safety', label: '安全防护' }
]

const contentTypes: Array<{ value: KnowledgeContentType; label: string }> = [
  { value: 'article', label: '文章' },
  { value: 'guide', label: '指南' },
  { value: 'taboo', label: '忌口' }
]

const layoutOptions: Array<{ value: KnowledgeSectionLayout['type']; label: string }> = [
  { value: 'stack', label: '纵向堆叠' },
  { value: 'grid', label: '网格排版' },
  { value: 'carousel', label: '横向滑动' }
]

const aspectRatioOptions: Array<{ value: KnowledgeSectionImageAspectRatio; label: string }> = [
  { value: 'wide', label: '横图' },
  { value: 'square', label: '方图' },
  { value: 'portrait', label: '竖图' }
]

const statusOptions: Array<{ value: ContentStatus; label: string }> = [
  { value: 'draft', label: '草稿' },
  { value: 'pending_review', label: '待审核' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下架' },
  { value: 'trash', label: '已删除' }
]

const form = ref({
  title: '',
  subtitle: '',
  summary: '',
  coverImage: '',
  coverPreview: '',
  categoryKey: 'feeding',
  categoryLabel: '月龄喂养',
  tagsText: '',
  contentType: 'article' as KnowledgeContentType,
  content: '',
  isFeatured: false,
  contentStatus: 'draft' as ContentStatus,
  sections: [createEmptySection()] as EditableSection[]
})

const statusLabel = computed(() => statusOptions.find((item) => item.value === form.value.contentStatus)?.label ?? '草稿')
const contentTypeLabel = computed(() => contentTypes.find((item) => item.value === form.value.contentType)?.label ?? '文章')
const tagList = computed(() => form.value.tagsText.split(/[，,]/).map((item) => item.trim()).filter(Boolean))
const availableSuggestedTags = computed(() => suggestedTags.value.filter((tag) => !tagList.value.includes(tag)).slice(0, 12))

function createEmptySection(): EditableSection {
  return {
    title: '',
    content: '',
    imageItems: [],
    layout: { type: 'stack', columns: 1 }
  }
}

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

function syncCategoryLabel() {
  form.value.categoryLabel = categories.find((item) => item.key === form.value.categoryKey)?.label ?? form.value.categoryKey
}

async function loadSuggestedTags() {
  try {
    const rows = await getAppAdminKnowledgeList()
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

function addSection() {
  form.value.sections.push(createEmptySection())
}

function removeSection(index: number) {
  if (form.value.sections.length === 1) {
    form.value.sections[0] = createEmptySection()
    return
  }
  form.value.sections.splice(index, 1)
}

function moveSection(index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= form.value.sections.length) {
    return
  }

  const sections = [...form.value.sections]
  const current = sections[index]
  sections[index] = sections[targetIndex]
  sections[targetIndex] = current
  form.value.sections = sections
}

function uploadSectionImage(sectionIndex: number) {
  void chooseAndUploadImage(
    () => {},
    (uploadedUrl) => {
      form.value.sections[sectionIndex].imageItems.push({
        url: uploadedUrl,
        style: 'rounded',
        aspectRatio: 'wide'
      })
    }
  )
}

function removeSectionImage(sectionIndex: number, imageIndex: number) {
  form.value.sections[sectionIndex].imageItems.splice(imageIndex, 1)
}

function updateSectionLayout(sectionIndex: number, type: KnowledgeSectionLayout['type']) {
  form.value.sections[sectionIndex].layout = {
    type,
    columns: type === 'grid' ? (form.value.sections[sectionIndex].layout.columns === 3 ? 3 : 2) : 1
  }
}

function updateSectionColumns(sectionIndex: number, columns: 2 | 3) {
  form.value.sections[sectionIndex].layout = {
    ...form.value.sections[sectionIndex].layout,
    type: 'grid',
    columns
  }
}

function updateSectionAspectRatio(sectionIndex: number, imageIndex: number, aspectRatio: KnowledgeSectionImageAspectRatio) {
  form.value.sections[sectionIndex].imageItems[imageIndex] = {
    ...form.value.sections[sectionIndex].imageItems[imageIndex],
    aspectRatio
  }
}

function normalizeSections() {
  return form.value.sections
    .map((section, index) => ({
      title: section.title.trim() || undefined,
      content: section.content.trim(),
      images: section.imageItems.map((item) => item.url).filter(Boolean),
      imageItems: section.imageItems
        .filter((item) => item.url)
        .map((item) => ({
          url: item.url,
          style: item.style ?? 'rounded',
          aspectRatio: item.aspectRatio ?? 'wide'
        })),
      layout: section.layout,
      sortOrder: index
    }))
    .filter((section) => section.content || section.images.length)
}

function buildPayload(): AdminKnowledgeArticleUpsertPayload {
  syncCategoryLabel()

  return {
    title: form.value.title.trim(),
    subtitle: form.value.subtitle.trim(),
    summary: form.value.summary.trim(),
    coverImage: form.value.coverImage.trim(),
    categoryKey: form.value.categoryKey,
    categoryLabel: form.value.categoryLabel,
    tags: tagList.value,
    contentType: form.value.contentType,
    content: form.value.content.trim(),
    isFeatured: form.value.isFeatured,
    contentStatus: form.value.contentStatus,
    sections: normalizeSections()
  }
}

function buildPreviewPayload(savedId: string): KnowledgeArticleDetail {
  const payload = buildPayload()

  return {
    id: savedId,
    title: payload.title,
    subtitle: payload.subtitle,
    summary: payload.summary,
    image: form.value.coverPreview || payload.coverImage || undefined,
    categoryKey: payload.categoryKey,
    categoryLabel: payload.categoryLabel,
    tags: payload.tags,
    contentType: payload.contentType,
    route: '/pages/knowledge/detail',
    content: payload.content,
    sections: payload.sections.map((section, index) => ({
      id: `${savedId}-section-${index}`,
      title: section.title,
      content: section.content,
      images: section.images,
      imageItems: section.imageItems,
      layout: section.layout,
      sortOrder: section.sortOrder
    })),
    relatedArticles: []
  }
}

async function loadDetail() {
  if (!articleId.value) return
  loading.value = true
  try {
    const detail = await getAppAdminKnowledgeDetail(articleId.value)
    form.value = {
      title: detail.title,
      subtitle: detail.subtitle,
      summary: detail.summary,
      coverImage: detail.coverImage,
      coverPreview: detail.coverImage,
      categoryKey: detail.categoryKey,
      categoryLabel: detail.categoryLabel,
      tagsText: detail.tags.join('，'),
      contentType: detail.contentType,
      content: detail.content,
      isFeatured: detail.isFeatured,
      contentStatus: detail.contentStatus,
      sections: detail.sections.length
        ? detail.sections.map((section) => ({
            title: section.title || '',
            content: section.content,
            imageItems: section.imageItems?.length
              ? section.imageItems.map((item) => ({
                  url: item.url,
                  style: item.style ?? 'rounded',
                  aspectRatio: item.aspectRatio ?? 'wide'
                }))
              : section.images.map((url) => ({ url, style: 'rounded', aspectRatio: 'wide' })),
            layout: section.layout ?? { type: 'stack', columns: 1 }
          }))
        : [createEmptySection()]
    }
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '干货详情读取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function validateForm() {
  const payload = buildPayload()

  if (!payload.title.trim()) {
    uni.showToast({ title: '请填写干货标题', icon: 'none' })
    return false
  }

  if (!payload.subtitle.trim()) {
    uni.showToast({ title: '请填写副标题', icon: 'none' })
    return false
  }

  if (!payload.summary.trim()) {
    uni.showToast({ title: '请填写摘要', icon: 'none' })
    return false
  }

  if (!payload.coverImage?.trim()) {
    uni.showToast({ title: '请先上传封面图', icon: 'none' })
    return false
  }

  if (!payload.content.trim() && !payload.sections.length) {
    uni.showToast({ title: '请填写正文或至少一个段落', icon: 'none' })
    return false
  }

  return true
}

async function persistArticle(openPreview = false) {
  if (!await ensureAdminAccess()) return
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = buildPayload()
    if (articleId.value) {
      await updateAppAdminKnowledge(articleId.value, payload)
    } else {
      const created = await createAppAdminKnowledge(payload)
      articleId.value = created.id
    }

    uni.showToast({ title: '保存成功', icon: 'success' })

    if (openPreview) {
      uni.setStorageSync(PREVIEW_STORAGE_KEY, buildPreviewPayload(articleId.value))
      uni.navigateTo({ url: '/pages/knowledge/detail?preview=admin' })
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
    articleId.value = typeof query?.id === 'string' ? query.id : ''
    const categoryKey = typeof query?.categoryKey === 'string' ? query.categoryKey : ''
    if (!articleId.value && categoryKey) {
      form.value.categoryKey = categoryKey
      syncCategoryLabel()
    }
    await Promise.all([loadSuggestedTags(), loadDetail()])
  })()
})
</script>

<template>
  <view class="page-shell admin-editor-page">
    <AppNavBar :title="articleId ? '编辑干货' : '新建干货'" subtitle="结构化段落与正式详情预览" :show-back="true" />

    <view class="hero-card soft-card">
      <text class="hero-kicker">内容运营</text>
      <text class="hero-title">分段组织正文、多图排版，保存后直接看正式详情效果</text>
      <view class="hero-meta-row">
        <TagChip :text="form.categoryLabel" accent="secondary" />
        <TagChip :text="contentTypeLabel" accent="primary" />
      </view>
    </view>

    <view v-if="loading" class="soft-card state-card">加载中...</view>

    <view v-else class="form-wrap">
      <view class="card form-card">
        <text class="card-title">基础信息</text>
        <input v-model="form.title" class="ghost-input mini-input" placeholder="干货标题" />
        <input v-model="form.subtitle" class="ghost-input mini-input" placeholder="副标题" />
        <textarea v-model="form.summary" class="mini-textarea small" placeholder="摘要，列表页和详情页顶部都会使用" maxlength="300" />
      </view>

      <view class="card form-card">
        <text class="card-title">封面与分类</text>
        <view class="cover-shell">
          <image v-if="form.coverPreview || form.coverImage" class="cover-image" :src="normalizeAppImageUrl(form.coverPreview || form.coverImage)" mode="aspectFill" />
          <view v-else class="cover-placeholder">上传封面图</view>
        </view>
        <view class="action-row">
          <view class="outline-chip primary-chip" @tap="uploadCoverImage">上传封面</view>
        </view>
        <text class="upload-hint">{{ form.coverImage ? '封面已上传，地址已自动保存。' : '上传后会自动保存封面地址。' }}</text>
        <picker :range="categories.map((item) => item.label)" @change="(e) => { const idx = Number(e.detail.value); form.categoryKey = categories[idx]?.key || 'feeding'; syncCategoryLabel() }">
          <view class="picker-cell">{{ form.categoryLabel }}</view>
        </picker>
        <picker :range="contentTypes.map((item) => item.label)" @change="(e) => form.contentType = contentTypes[Number(e.detail.value)]?.value || 'article'">
          <view class="picker-cell">{{ contentTypeLabel }}</view>
        </picker>
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
        <text class="card-title">正文摘要</text>
        <textarea v-model="form.content" class="mini-textarea" placeholder="正文导语或全文概述" />
      </view>

      <view class="card form-card">
        <view class="section-head">
          <text class="card-title">段落内容</text>
          <view class="outline-chip secondary-chip" @tap="addSection">+ 添加段落</view>
        </view>
        <view v-for="(section, index) in form.sections" :key="`section-${index}`" class="section-card soft-card">
          <view class="section-header-row">
            <text class="section-index">段落 {{ index + 1 }}</text>
            <view class="section-actions">
              <view class="mini-link" :class="{ disabled: index === 0 }" @tap="moveSection(index, -1)">上移</view>
              <view class="mini-link" :class="{ disabled: index === form.sections.length - 1 }" @tap="moveSection(index, 1)">下移</view>
              <view class="mini-link danger" @tap="removeSection(index)">{{ form.sections.length === 1 ? '清空' : '删除' }}</view>
            </view>
          </view>
          <input v-model="section.title" class="ghost-input mini-input" placeholder="段落标题（可选）" />
          <textarea v-model="section.content" class="mini-textarea small" placeholder="段落内容" />

          <view class="grid-row">
            <view class="field-block">
              <text class="field-label">布局</text>
              <picker :range="layoutOptions.map((item) => item.label)" @change="(e) => updateSectionLayout(index, layoutOptions[Number(e.detail.value)]?.value || 'stack')">
                <view class="picker-cell">{{ layoutOptions.find((item) => item.value === section.layout.type)?.label || '纵向堆叠' }}</view>
              </picker>
            </view>
            <view v-if="section.layout.type === 'grid'" class="field-block">
              <text class="field-label">列数</text>
              <picker :range="['2 列', '3 列']" @change="(e) => updateSectionColumns(index, Number(e.detail.value) === 1 ? 3 : 2)">
                <view class="picker-cell">{{ section.layout.columns === 3 ? '3 列' : '2 列' }}</view>
              </picker>
            </view>
          </view>

          <view v-if="section.imageItems.length" class="image-list">
            <view v-for="(image, imageIndex) in section.imageItems" :key="`image-${imageIndex}`" class="image-card card">
              <image class="section-image" :src="normalizeAppImageUrl(image.url)" mode="aspectFill" />
              <picker :range="aspectRatioOptions.map((item) => item.label)" @change="(e) => updateSectionAspectRatio(index, imageIndex, aspectRatioOptions[Number(e.detail.value)]?.value || 'wide')">
                <view class="picker-cell small-cell">{{ aspectRatioOptions.find((item) => item.value === image.aspectRatio)?.label || '横图' }}</view>
              </picker>
              <view class="mini-link danger" @tap="removeSectionImage(index, imageIndex)">删除图片</view>
            </view>
          </view>

          <view class="action-row">
            <view class="outline-chip primary-chip" @tap="uploadSectionImage(index)">上传段落图片</view>
          </view>
        </view>
      </view>

      <view class="card form-card">
        <text class="card-title">发布状态</text>
        <view class="switch-row">
          <text class="field-label">设为精选</text>
          <switch :checked="form.isFeatured" @change="(e) => form.isFeatured = !!e.detail.value" />
        </view>
        <picker :range="statusOptions.map((item) => item.label)" @change="(e) => form.contentStatus = statusOptions[Number(e.detail.value)]?.value || 'draft'">
          <view class="picker-cell">{{ statusLabel }}</view>
        </picker>
      </view>
    </view>

    <view class="fixed-bottom-actions admin-actions">
      <view class="outline-button editor-secondary-button" @tap="persistArticle(false)">{{ saving ? '保存中...' : '保存内容' }}</view>
      <view class="primary-button editor-primary-button" @tap="persistArticle(true)">{{ saving ? '保存中...' : '查看效果' }}</view>
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
.section-index {
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
.section-header-row,
.section-actions,
.tag-list,
.switch-row {
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

.cover-shell {
  overflow: hidden;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
}

.cover-image,
.cover-placeholder {
  width: 100%;
  height: 320rpx;
}

.cover-placeholder {
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

.upload-hint {
  font-size: 22rpx;
  line-height: 1.6;
}

.mini-textarea {
  width: 100%;
  min-height: 220rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  padding: 18rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  line-height: 1.7;
}

.mini-textarea.small {
  min-height: 170rpx;
}

.section-card {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.section-head,
.section-header-row,
.switch-row {
  justify-content: space-between;
  gap: 14rpx;
}

.section-actions {
  gap: 18rpx;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.image-card {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.section-image {
  width: 100%;
  height: 240rpx;
  border-radius: 20rpx;
}

.picker-cell {
  padding: 18rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  font-size: 24rpx;
}

.small-cell {
  padding: 14rpx 18rpx;
  font-size: 22rpx;
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
