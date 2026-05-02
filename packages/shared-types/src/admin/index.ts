export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'offline' | 'trash'
export type ReviewStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type ImportStatus = 'waiting' | 'validating' | 'completed' | 'failed'

export interface DashboardMetric {
  key: string
  label: string
  value: string
  trend: string
  accent: 'primary' | 'secondary' | 'warning' | 'danger'
}

export interface DashboardTrendPoint {
  label: string
  value: number
}

export interface RecipeAdminRow {
  id: string
  title: string
  cover: string
  ageLabel: string
  ageMinMonths?: number
  ageMaxMonths?: number | null
  source: string
  creator: string
  tags: string[]
  favorites: number
  contentStatus: ContentStatus
  reviewStatus: ReviewStatus
  updatedAt: string
}

export interface ReviewQueueItem {
  id: string
  title: string
  source: string
  submittedBy: string
  submittedAt: string
  focus: string
}

export interface ImportJob {
  id: string
  fileName: string
  operator: string
  total: number
  success: number
  failed: number
  status: ImportStatus
  createdAt: string
}

export interface OptimizationTask {
  id: string
  recipeTitle: string
  issueType: string
  severity: '高' | '中' | '低'
  suggestion: string
  status: string
}

export interface UserAdminRow {
  id: string
  nickname: string
  avatar: string
  registerAt: string
  babyCount: number
  activity: string
  status: string
}

export interface SystemSettingGroup {
  title: string
  description: string
  items: Array<{ label: string; value: string; hint?: string }>
}
