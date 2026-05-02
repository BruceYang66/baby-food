import type {
  KnowledgeContentType,
  KnowledgeSectionImageItem,
  KnowledgeSectionLayout
} from '../app'

export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'offline' | 'trash'
export type ReviewStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type ImportStatus = 'waiting' | 'validating' | 'completed' | 'failed'
export type ImportEntityType = 'recipes' | 'knowledge'
export type ImportFileFormat = 'json' | 'csv'
export type ImportRowStatus = 'valid' | 'warning' | 'error'

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

export interface AdminRecipeIngredient {
  id?: string
  name: string
  amount: string
  unit: string
}

export interface AdminRecipeStep {
  id?: string
  stepNo: number
  title: string
  description: string
  imageUrl?: string
}

export interface AdminRecipeDetail {
  id: string
  title: string
  ageLabel: string
  ageMinMonths?: number
  ageMaxMonths?: number | null
  durationLabel: string
  difficultyLabel: string
  coverImage: string
  summary: string
  source: string
  creator: string
  tags: string[]
  allergens: string[]
  symptom: string
  contentStatus: ContentStatus
  reviewStatus: ReviewStatus
  ingredients: AdminRecipeIngredient[]
  steps: AdminRecipeStep[]
  preview: {
    title: string
    subtitle: string
  }
}

export interface AdminRecipeUpsertPayload {
  title: string
  summary?: string
  coverImage?: string
  ageLabel?: string
  ageMinMonths?: number
  ageMaxMonths?: number | null
  durationLabel: string
  difficultyLabel: string
  source?: string
  creator?: string
  contentStatus?: ContentStatus
  ingredients: Array<{
    name: string
    amount: string
    unit?: string
  }>
  steps: Array<{
    stepNo: number
    title: string
    description: string
    imageUrl?: string
  }>
  tags: string[]
}

export interface AdminKnowledgeArticleRow {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: KnowledgeContentType
  isFeatured: boolean
  contentStatus: ContentStatus
  updatedAt: string
}

export interface AdminKnowledgeSection {
  id?: string
  title: string
  content: string
  images: string[]
  imageItems?: KnowledgeSectionImageItem[]
  layout?: KnowledgeSectionLayout
  sortOrder: number
}

export interface AdminKnowledgeArticleDetail {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: KnowledgeContentType
  content: string
  isFeatured: boolean
  contentStatus: ContentStatus
  sections: AdminKnowledgeSection[]
}

export interface AdminKnowledgeArticleUpsertPayload {
  title: string
  subtitle: string
  summary: string
  coverImage?: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: KnowledgeContentType
  content: string
  isFeatured?: boolean
  contentStatus?: ContentStatus
  sections: Array<{
    title?: string
    content: string
    images: string[]
    imageItems?: KnowledgeSectionImageItem[]
    layout?: KnowledgeSectionLayout
    sortOrder: number
  }>
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

export interface ImportValidationIssue {
  field: string
  severity: 'warning' | 'error'
  message: string
}

export interface ImportPreviewRow {
  rowNumber: number
  title: string
  status: ImportRowStatus
  issues: ImportValidationIssue[]
}

export interface ImportPreviewSummary {
  total: number
  valid: number
  warnings: number
  errors: number
}

export interface ImportPreviewResponse {
  entity: ImportEntityType
  format: ImportFileFormat
  fileName: string
  summary: ImportPreviewSummary
  rows: ImportPreviewRow[]
}

export interface ImportCommitResponse {
  jobId: string
  total: number
  success: number
  failed: number
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
  canAppAdmin: boolean
}

export interface AdminFeedbackUser {
  id: string
  nickname: string
  avatarUrl: string
}

export interface AdminFeedbackRow {
  id: string
  content: string
  createdAt: string
  user: AdminFeedbackUser
}

export interface AdminFeedbackDetail {
  id: string
  content: string
  createdAt: string
  user: AdminFeedbackUser
}

export interface SystemSettingGroup {
  title: string
  description: string
  items: Array<{ label: string; value: string; hint?: string }>
}
