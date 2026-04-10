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

const API_BASE_URL = 'http://localhost:3000/api'

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
