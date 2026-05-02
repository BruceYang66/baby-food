import type {
  AdminFeedbackDetail,
  AdminFeedbackRow,
  AdminKnowledgeArticleDetail,
  AdminKnowledgeArticleRow,
  AdminKnowledgeArticleUpsertPayload,
  AdminRecipeDetail,
  AdminRecipeUpsertPayload,
  ContentStatus,
  DashboardMetric,
  DashboardTrendPoint,
  ImportCommitResponse,
  ImportEntityType,
  ImportFileFormat,
  ImportJob,
  ImportPreviewResponse,
  RecipeAdminRow,
  ReviewQueueItem,
  ReviewStatus,
  SystemSettingGroup,
  UserAdminRow
} from '@baby-food/shared-types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:3000'

/**
 * 标准化图片URL
 * - 如果是完整URL（http/https开头），直接返回（兼容旧数据）
 * - 如果是相对路径，拼接UPLOAD_BASE_URL
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${UPLOAD_BASE_URL}${url}`
}

interface ApiResponse<T> {
  ok: boolean
  data: T
  message?: string
}

interface DashboardOverviewData {
  metrics: DashboardMetric[]
  userTrend: DashboardTrendPoint[]
  reviewQueue: ReviewQueueItem[]
}

interface RecipeEditorIngredient {
  id: string
  name: string
  amount: string
  unit: string
}

interface RecipeEditorStep {
  id: string
  description: string
  image: string
}

export interface RecipeEditorDetail {
  id: string
  title: string
  ageLabel: string
  ageMinMonths?: number
  ageMaxMonths?: number | null
  durationLabel: string
  difficultyLabel: string
  cover: string
  description: string
  tags: string[]
  allergens: string[]
  symptom: string
  contentStatus: ContentStatus
  reviewStatus: ReviewStatus
  ingredients: RecipeEditorIngredient[]
  steps: RecipeEditorStep[]
  preview: {
    title: string
    subtitle: string
  }
}

export type KnowledgeArticleRow = AdminKnowledgeArticleRow
export type KnowledgeArticleDetail = AdminKnowledgeArticleDetail

function mapAdminRecipeDetailToEditor(detail: AdminRecipeDetail): RecipeEditorDetail {
  return {
    id: detail.id,
    title: detail.title,
    ageLabel: detail.ageLabel,
    ageMinMonths: detail.ageMinMonths,
    ageMaxMonths: detail.ageMaxMonths,
    durationLabel: detail.durationLabel,
    difficultyLabel: detail.difficultyLabel,
    cover: detail.coverImage,
    description: detail.summary,
    tags: [...detail.tags],
    allergens: [...detail.allergens],
    symptom: detail.symptom,
    contentStatus: detail.contentStatus,
    reviewStatus: detail.reviewStatus,
    ingredients: detail.ingredients.map((ingredient) => ({
      id: ingredient.id ?? '',
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit
    })),
    steps: detail.steps.map((step) => ({
      id: step.id ?? '',
      description: step.description,
      image: step.imageUrl ?? ''
    })),
    preview: {
      title: detail.preview.title,
      subtitle: detail.preview.subtitle
    }
  }
}

function mapRecipeEditorDetailToPayload(detail: RecipeEditorDetail): AdminRecipeUpsertPayload {
  return {
    title: detail.title,
    ageLabel: detail.ageLabel,
    ageMinMonths: detail.ageMinMonths ?? 6,
    ageMaxMonths: detail.ageMaxMonths ?? null,
    durationLabel: detail.durationLabel,
    difficultyLabel: detail.difficultyLabel,
    coverImage: detail.cover,
    summary: detail.description,
    tags: [...detail.tags],
    contentStatus: detail.contentStatus,
    ingredients: detail.ingredients.map((ingredient) => ({
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit || ''
    })),
    steps: detail.steps.map((step, index) => ({
      stepNo: index + 1,
      title: `步骤${index + 1}`,
      description: step.description,
      imageUrl: step.image || ''
    }))
  }
}

function mapKnowledgeArticleDetailToPayload(detail: KnowledgeArticleDetail): AdminKnowledgeArticleUpsertPayload {
  return {
    title: detail.title,
    subtitle: detail.subtitle,
    summary: detail.summary,
    coverImage: detail.coverImage,
    categoryKey: detail.categoryKey,
    categoryLabel: detail.categoryLabel,
    tags: [...detail.tags],
    contentType: detail.contentType,
    content: detail.content,
    isFeatured: detail.isFeatured,
    contentStatus: detail.contentStatus,
    sections: detail.sections.map((section) => ({
      title: section.title,
      content: section.content,
      images: [...section.images],
      imageItems: section.imageItems?.map((item) => ({ ...item })),
      layout: section.layout ? { ...section.layout } : undefined,
      sortOrder: section.sortOrder
    }))
  }
}

function request<T>(path: string, options: Partial<RequestInit> = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    body: options.body
  })
    .then(async (response) => {
      const payload = (await response.json()) as ApiResponse<T>

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? '接口请求失败')
      }

      return payload.data
    })
}

type DashboardTrendRange = 'week' | 'month' | 'year' | 'all'

export function getDashboardOverview(range: DashboardTrendRange = 'week') {
  return request<DashboardOverviewData>(`/admin/dashboard/overview?range=${range}`)
}

export function getDashboardFeedbackTrend(range: DashboardTrendRange = 'week') {
  return request<DashboardTrendPoint[]>(`/admin/dashboard/feedback-trend?range=${range}`)
}

export function getRecipeList() {
  return request<RecipeAdminRow[]>('/admin/recipes')
}

export function getRecipeDetail(recipeId: string) {
  return request<AdminRecipeDetail>(`/admin/recipes/${recipeId}`).then(mapAdminRecipeDetailToEditor)
}

export function getReviewQueue() {
  return request<ReviewQueueItem[]>('/admin/reviews/pending')
}

export function getImportJobs() {
  return request<ImportJob[]>('/admin/imports')
}

export function getUsers() {
  return request<UserAdminRow[]>('/admin/users')
}

export function updateUserPermissions(userId: string, payload: { canAppAdmin: boolean }) {
  return request<null>(`/admin/users/${userId}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

export function getFeedbackList(keyword?: string) {
  const query = keyword?.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ''
  return request<AdminFeedbackRow[]>(`/admin/feedback${query}`)
}

export function getFeedbackDetail(feedbackId: string) {
  return request<AdminFeedbackDetail>(`/admin/feedback/${feedbackId}`)
}

export function getSystemSettings() {
  return request<SystemSettingGroup[]>('/admin/settings/system')
}

export function createRecipe(payload: RecipeEditorDetail) {
  return request<{ id: string }>('/admin/recipes', {
    method: 'POST',
    body: JSON.stringify(mapRecipeEditorDetailToPayload(payload))
  })
}

export function updateRecipe(recipeId: string, payload: RecipeEditorDetail) {
  return request<{ id: string }>(`/admin/recipes/${recipeId}`, {
    method: 'PUT',
    body: JSON.stringify(mapRecipeEditorDetailToPayload(payload))
  })
}

export function deleteRecipe(recipeId: string) {
  return request<null>(`/admin/recipes/${recipeId}`, {
    method: 'DELETE'
  })
}

export function batchUpdateRecipeStatus(recipeIds: string[], contentStatus: string) {
  return request<null>('/admin/recipes/batch-update-status', {
    method: 'POST',
    body: JSON.stringify({ recipeIds, contentStatus })
  })
}

// 干货管理接口
export function getKnowledgeList(categoryKey?: string) {
  const query = categoryKey ? `?categoryKey=${categoryKey}` : ''
  return request<AdminKnowledgeArticleRow[]>(`/admin/knowledge${query}`)
}

export function getKnowledgeDetail(articleId: string) {
  return request<AdminKnowledgeArticleDetail>(`/admin/knowledge/${articleId}`)
}

export function createKnowledge(payload: KnowledgeArticleDetail) {
  return request<{ id: string }>('/admin/knowledge', {
    method: 'POST',
    body: JSON.stringify(mapKnowledgeArticleDetailToPayload(payload))
  })
}

export function updateKnowledge(articleId: string, payload: KnowledgeArticleDetail) {
  return request<{ id: string }>(`/admin/knowledge/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify(mapKnowledgeArticleDetailToPayload(payload))
  })
}

export function deleteKnowledge(articleId: string) {
  return request<null>(`/admin/knowledge/${articleId}`, {
    method: 'DELETE'
  })
}

export interface ImportUploadPayload {
  fileName: string
  format: ImportFileFormat
  content: string
}

export function previewImport(entity: ImportEntityType, payload: ImportUploadPayload) {
  return request<ImportPreviewResponse>(`/admin/imports/${entity}/preview`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function commitImport(entity: ImportEntityType, payload: ImportUploadPayload) {
  return request<ImportCommitResponse>(`/admin/imports/${entity}/commit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function downloadExport(entity: ImportEntityType, format: ImportFileFormat) {
  const response = await fetch(`${API_BASE_URL}/admin/exports/${entity}?format=${format}`)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: '导出失败' })) as { message?: string }
    throw new Error(payload.message ?? '导出失败')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  return {
    blob,
    fileName: match?.[1] ?? `${entity}-export.${format}`
  }
}

// 审核管理接口
export function submitRecipeForReview(recipeId: string) {
  return request<null>(`/admin/recipes/${recipeId}/submit-review`, {
    method: 'POST'
  })
}

export function approveRecipe(recipeId: string, comment?: string) {
  return request<null>(`/admin/reviews/${recipeId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  })
}

export function rejectRecipe(recipeId: string, comment: string) {
  return request<null>(`/admin/reviews/${recipeId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  })
}

export function publishRecipe(recipeId: string) {
  return request<null>(`/admin/recipes/${recipeId}/publish`, {
    method: 'POST'
  })
}

export function offlineRecipe(recipeId: string) {
  return request<null>(`/admin/recipes/${recipeId}/offline`, {
    method: 'POST'
  })
}

export function restoreRecipe(recipeId: string) {
  return request<null>(`/admin/recipes/${recipeId}/restore`, {
    method: 'POST'
  })
}
