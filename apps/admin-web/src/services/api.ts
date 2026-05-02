import type {
  DashboardMetric,
  DashboardTrendPoint,
  ImportJob,
  RecipeAdminRow,
  ReviewQueueItem,
  SystemSettingGroup,
  UserAdminRow,
  ContentStatus,
  ReviewStatus
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

export function getDashboardOverview() {
  return request<DashboardOverviewData>('/admin/dashboard/overview')
}

export function getRecipeList() {
  return request<RecipeAdminRow[]>('/admin/recipes')
}

export function getRecipeDetail(recipeId: string) {
  return request<RecipeEditorDetail>(`/admin/recipes/${recipeId}`)
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

export function getSystemSettings() {
  return request<SystemSettingGroup[]>('/admin/settings/system')
}

export function createRecipe(payload: RecipeEditorDetail) {
  return request<{ id: string }>('/admin/recipes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function updateRecipe(recipeId: string, payload: RecipeEditorDetail) {
  return request<{ id: string }>(`/admin/recipes/${recipeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
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
export interface KnowledgeArticleRow {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: 'article' | 'guide' | 'taboo'
  isFeatured: boolean
  contentStatus: string
  updatedAt: string
}

export interface KnowledgeArticleDetail {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: 'article' | 'guide' | 'taboo'
  content: string
  isFeatured: boolean
  contentStatus: string
  sections: Array<{
    id?: string
    title: string
    content: string
    images: string[]
    sortOrder: number
  }>
}

export function getKnowledgeList(categoryKey?: string) {
  const query = categoryKey ? `?categoryKey=${categoryKey}` : ''
  return request<KnowledgeArticleRow[]>(`/admin/knowledge${query}`)
}

export function getKnowledgeDetail(articleId: string) {
  return request<KnowledgeArticleDetail>(`/admin/knowledge/${articleId}`)
}

export function createKnowledge(payload: KnowledgeArticleDetail) {
  return request<{ id: string }>('/admin/knowledge', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function updateKnowledge(articleId: string, payload: KnowledgeArticleDetail) {
  return request<{ id: string }>(`/admin/knowledge/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export function deleteKnowledge(articleId: string) {
  return request<null>(`/admin/knowledge/${articleId}`, {
    method: 'DELETE'
  })
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
