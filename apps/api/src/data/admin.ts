import { prisma } from '../db/prisma.js'
import type { ContentStatus as PrismaContentStatus } from '@prisma/client'
import { parseKnowledgeSectionMedia, stringifyKnowledgeSectionMedia } from './knowledgeSectionMedia.js'

type AdminContentStatus = 'draft' | 'pending_review' | 'published' | 'offline' | 'trash'
type AdminReviewStatus = 'none' | 'pending' | 'approved' | 'rejected'
type AdminKnowledgeContentType = 'article' | 'guide' | 'taboo'

type RecipeAdminRow = {
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
  contentStatus: AdminContentStatus
  reviewStatus: AdminReviewStatus
  updatedAt: string
}

type AdminRecipeDetail = {
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
  contentStatus: AdminContentStatus
  reviewStatus: AdminReviewStatus
  ingredients: Array<{ id?: string; name: string; amount: string; unit: string }>
  steps: Array<{ id?: string; stepNo: number; title: string; description: string; imageUrl?: string }>
  preview: {
    title: string
    subtitle: string
  }
}

type AdminRecipeUpsertPayload = {
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
  contentStatus?: AdminContentStatus
  ingredients: Array<{ name: string; amount: string; unit?: string }>
  steps: Array<{ stepNo: number; title: string; description: string; imageUrl?: string }>
  tags: string[]
}

type AdminKnowledgeArticleRow = {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: AdminKnowledgeContentType
  isFeatured: boolean
  contentStatus: AdminContentStatus
  updatedAt: string
}

type AdminKnowledgeSection = {
  id?: string
  title: string
  content: string
  images: string[]
  imageItems?: Array<{ url: string; style?: 'rounded' | 'square'; aspectRatio?: 'wide' | 'square' | 'portrait' }>
  layout?: { type: 'stack' | 'grid' | 'carousel'; columns?: 1 | 2 | 3 }
  sortOrder: number
}

type AdminKnowledgeArticleDetail = {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: AdminKnowledgeContentType
  content: string
  isFeatured: boolean
  contentStatus: AdminContentStatus
  sections: AdminKnowledgeSection[]
}

type AdminKnowledgeArticleUpsertPayload = {
  title: string
  subtitle: string
  summary: string
  coverImage?: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: AdminKnowledgeContentType
  content: string
  isFeatured?: boolean
  contentStatus?: AdminContentStatus
  sections: Array<{
    title?: string
    content: string
    images: string[]
    imageItems?: Array<{ url: string; style?: string; aspectRatio?: string }>
    layout?: { type?: string; columns?: number }
    sortOrder: number
  }>
}

type MonthRange = { minMonths: number; maxMonths: number | null }

function parseAgeLabelToMonthRange(ageLabel?: string | null): MonthRange | null {
  if (!ageLabel) {
    return null
  }

  const normalized = ageLabel.replace(/\s+/g, '')
  let match = normalized.match(/^(\d+)-(\d+)月(?:龄)?$/)
  if (match) {
    const start = Number(match[1])
    const end = Number(match[2])
    return { minMonths: Math.min(start, end), maxMonths: Math.max(start, end) }
  }

  match = normalized.match(/^(\d+)-(\d+)岁$/)
  if (match) {
    const start = Number(match[1]) * 12
    const end = Number(match[2]) * 12
    return { minMonths: Math.min(start, end), maxMonths: Math.max(start, end) }
  }

  match = normalized.match(/^(\d+)个月\+$/)
  if (match) {
    return { minMonths: Number(match[1]), maxMonths: null }
  }

  match = normalized.match(/^(\d+)月龄\+$/)
  if (match) {
    return { minMonths: Number(match[1]), maxMonths: null }
  }

  match = normalized.match(/^(\d+)岁\+$/)
  if (match) {
    return { minMonths: Number(match[1]) * 12, maxMonths: null }
  }

  match = normalized.match(/^(\d+)个月$/)
  if (match) {
    const value = Number(match[1])
    return { minMonths: value, maxMonths: value }
  }

  match = normalized.match(/^(\d+)月龄$/)
  if (match) {
    const value = Number(match[1])
    return { minMonths: value, maxMonths: value }
  }

  match = normalized.match(/^(\d+)岁(\d+)个月$/)
  if (match) {
    const value = Number(match[1]) * 12 + Number(match[2])
    return { minMonths: value, maxMonths: value }
  }

  match = normalized.match(/^(\d+)岁$/)
  if (match) {
    const minMonths = Number(match[1]) * 12
    return { minMonths, maxMonths: minMonths + 11 }
  }

  return null
}

function formatAgeLabelFromMonthRange(minMonths: number, maxMonths: number | null): string {
  if (maxMonths === null) {
    return `${minMonths}个月+`
  }

  if (minMonths === maxMonths) {
    return `${minMonths}个月`
  }

  return `${minMonths}-${maxMonths}月`
}

function resolveRecipeAgeRange(payload: { ageMinMonths?: number; ageMaxMonths?: number | null; ageLabel?: string }) {
  if (typeof payload.ageMinMonths === 'number') {
    return {
      ageMinMonths: payload.ageMinMonths,
      ageMaxMonths: payload.ageMaxMonths ?? null,
      ageLabel: formatAgeLabelFromMonthRange(payload.ageMinMonths, payload.ageMaxMonths ?? null)
    }
  }

  const parsed = parseAgeLabelToMonthRange(payload.ageLabel)
  if (!parsed) {
    throw new Error('请提供有效的月龄范围')
  }

  return {
    ageMinMonths: parsed.minMonths,
    ageMaxMonths: parsed.maxMonths,
    ageLabel: formatAgeLabelFromMonthRange(parsed.minMonths, parsed.maxMonths)
  }
}

function formatAdminDateTime(value: Date) {
  return value.toISOString().slice(0, 16).replace('T', ' ')
}

function mapRecipeToAdminRow(recipe: {
  id: string
  title: string
  coverImage: string | null
  ageLabel: string
  ageMinMonths: number
  ageMaxMonths: number | null
  source: string | null
  creator: string | null
  favorites: number
  contentStatus: RecipeAdminRow['contentStatus']
  reviewStatus: RecipeAdminRow['reviewStatus']
  updatedAt: Date
  tags: Array<{ name: string }>
}): RecipeAdminRow {
  return {
    id: recipe.id,
    title: recipe.title,
    cover: recipe.coverImage ?? '',
    ageLabel: recipe.ageLabel,
    ageMinMonths: recipe.ageMinMonths,
    ageMaxMonths: recipe.ageMaxMonths,
    source: recipe.source ?? '未标注',
    creator: recipe.creator ?? '系统',
    tags: recipe.tags.map((tag) => tag.name),
    favorites: recipe.favorites,
    contentStatus: recipe.contentStatus,
    reviewStatus: recipe.reviewStatus,
    updatedAt: formatAdminDateTime(recipe.updatedAt)
  }
}

function mapRecipeToAdminDetail(recipe: {
  id: string
  title: string
  ageLabel: string
  ageMinMonths: number
  ageMaxMonths: number | null
  durationLabel: string
  difficultyLabel: string
  coverImage: string | null
  summary: string | null
  source: string | null
  creator: string | null
  contentStatus: AdminRecipeDetail['contentStatus']
  reviewStatus: AdminRecipeDetail['reviewStatus']
  ingredients: Array<{ id: string; name: string; amount: string; unit: string | null }>
  steps: Array<{ id: string; stepNo: number; title: string; description: string; imageUrl: string | null }>
  tags: Array<{ name: string }>
}): AdminRecipeDetail {
  return {
    id: recipe.id,
    title: recipe.title,
    ageLabel: recipe.ageLabel,
    ageMinMonths: recipe.ageMinMonths,
    ageMaxMonths: recipe.ageMaxMonths,
    durationLabel: recipe.durationLabel,
    difficultyLabel: recipe.difficultyLabel,
    coverImage: recipe.coverImage ?? '',
    summary: recipe.summary ?? '',
    source: recipe.source ?? '未标注',
    creator: recipe.creator ?? '系统',
    tags: recipe.tags.map((tag) => tag.name),
    allergens: ['鸡蛋'],
    symptom: '腹泻',
    contentStatus: recipe.contentStatus,
    reviewStatus: recipe.reviewStatus,
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit ?? '份'
    })),
    steps: recipe.steps.map((step) => ({
      id: step.id,
      stepNo: step.stepNo,
      title: step.title,
      description: step.description,
      imageUrl: step.imageUrl ?? recipe.coverImage ?? ''
    })),
    preview: {
      title: recipe.title,
      subtitle: recipe.summary ?? ''
    }
  }
}

function mapKnowledgeArticleToAdminRow(article: {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string | null
  categoryKey: string
  categoryLabel: string
  tagsJson: string
  contentType: AdminKnowledgeArticleRow['contentType']
  isFeatured: boolean
  contentStatus: AdminKnowledgeArticleRow['contentStatus']
  updatedAt: Date
}): AdminKnowledgeArticleRow {
  return {
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    coverImage: article.coverImage ?? '',
    categoryKey: article.categoryKey,
    categoryLabel: article.categoryLabel,
    tags: JSON.parse(article.tagsJson) as string[],
    contentType: article.contentType,
    isFeatured: article.isFeatured,
    contentStatus: article.contentStatus,
    updatedAt: formatAdminDateTime(article.updatedAt)
  }
}

function mapKnowledgeArticleToAdminDetail(article: {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string | null
  categoryKey: string
  categoryLabel: string
  tagsJson: string
  contentType: AdminKnowledgeArticleDetail['contentType']
  content: string
  isFeatured: boolean
  contentStatus: AdminKnowledgeArticleDetail['contentStatus']
  sections: Array<{ id: string; title: string | null; content: string; imagesJson: string; sortOrder: number }>
}): AdminKnowledgeArticleDetail {
  return {
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    coverImage: article.coverImage ?? '',
    categoryKey: article.categoryKey,
    categoryLabel: article.categoryLabel,
    tags: JSON.parse(article.tagsJson) as string[],
    contentType: article.contentType,
    content: article.content,
    isFeatured: article.isFeatured,
    contentStatus: article.contentStatus,
    sections: article.sections.map((section) => {
      const media = parseKnowledgeSectionMedia(section.imagesJson)
      return {
        id: section.id,
        title: section.title ?? '',
        content: section.content,
        images: media.images,
        imageItems: media.imageItems,
        layout: media.layout,
        sortOrder: section.sortOrder
      }
    })
  }
}

export async function getAdminRecipes() {
  const recipes = await prisma.recipe.findMany({
    include: {
      tags: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return recipes.map(mapRecipeToAdminRow)
}

export async function getAdminRecipeDetail(recipeId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: true,
      steps: {
        orderBy: {
          stepNo: 'asc'
        }
      },
      tags: true
    }
  })

  if (!recipe) {
    throw new Error('未找到对应食谱')
  }

  return mapRecipeToAdminDetail(recipe)
}

type DashboardTrendRange = 'week' | 'month' | 'year' | 'all'

function formatDashboardDayKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDashboardMonthKey(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function formatDashboardWeekdayLabel(dayKey: string) {
  const [year, month, day] = dayKey.split('-').map(Number)
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(year, month - 1, day).getDay()]
}

function formatDashboardShortDateLabel(dayKey: string) {
  const [, month, day] = dayKey.split('-').map(Number)
  return `${month}/${day}`
}

function formatDashboardMonthLabel(monthKey: string, includeYear = false) {
  const [year, month] = monthKey.split('-').map(Number)
  if (includeYear) {
    return `${String(year).slice(-2)}/${String(month).padStart(2, '0')}`
  }

  return `${month}月`
}

function getDashboardMonthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function getDashboardDayStart(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

async function getAdminFeedbackCount() {
  try {
    const prismaWithFeedback = prisma as typeof prisma & {
      userFeedback?: {
        count: () => Promise<number>
      }
    }

    if (!prismaWithFeedback.userFeedback) {
      throw new Error('userFeedback model unavailable')
    }

    return await prismaWithFeedback.userFeedback.count()
  } catch {
    const rows = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
      SELECT COUNT(*)::int AS count
      FROM user_feedback
    `

    return Number(rows[0]?.count ?? 0)
  }
}

async function getWeekUserTrend() {
  const startDate = getDashboardDayStart(new Date())
  startDate.setDate(startDate.getDate() - 6)

  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS bucket, COUNT(*)::int AS value
    FROM users
    WHERE created_at >= ${startDate}
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + index)
    const bucket = formatDashboardDayKey(currentDate)

    return {
      label: formatDashboardWeekdayLabel(bucket),
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getMonthUserTrend() {
  const startDate = getDashboardDayStart(new Date())
  startDate.setDate(startDate.getDate() - 29)

  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS bucket, COUNT(*)::int AS value
    FROM users
    WHERE created_at >= ${startDate}
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: 30 }, (_, index) => {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + index)
    const bucket = formatDashboardDayKey(currentDate)

    return {
      label: formatDashboardShortDateLabel(bucket),
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getYearUserTrend() {
  const currentDate = new Date()
  const startMonth = new Date(currentDate.getFullYear(), 0, 1)
  const monthCount = currentDate.getMonth() + 1

  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS bucket, COUNT(*)::int AS value
    FROM users
    WHERE created_at >= ${startMonth}
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1)
    const bucket = formatDashboardMonthKey(monthDate)

    return {
      label: formatDashboardMonthLabel(bucket),
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getAllUserTrend() {
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true }
  })

  if (!firstUser) {
    return []
  }

  const startMonth = getDashboardMonthStart(firstUser.createdAt)
  const currentMonth = getDashboardMonthStart(new Date())
  const totalMonths = (currentMonth.getFullYear() - startMonth.getFullYear()) * 12 + currentMonth.getMonth() - startMonth.getMonth() + 1

  if (totalMonths <= 24) {
    const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS bucket, COUNT(*)::int AS value
      FROM users
      GROUP BY 1
      ORDER BY 1
    `

    const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

    return Array.from({ length: totalMonths }, (_, index) => {
      const currentDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1)
      const bucket = formatDashboardMonthKey(currentDate)

      return {
        label: formatDashboardMonthLabel(bucket, true),
        value: trendMap.get(bucket) ?? 0
      }
    })
  }

  const startYear = startMonth.getFullYear()
  const currentYear = currentMonth.getFullYear()
  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(DATE_TRUNC('year', created_at), 'YYYY') AS bucket, COUNT(*)::int AS value
    FROM users
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
    const bucket = String(startYear + index)

    return {
      label: `${bucket}年`,
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getRecentUserTrend(range: DashboardTrendRange) {
  switch (range) {
    case 'month':
      return getMonthUserTrend()
    case 'year':
      return getYearUserTrend()
    case 'all':
      return getAllUserTrend()
    case 'week':
    default:
      return getWeekUserTrend()
  }
}

async function getWeekFeedbackTrend() {
  const startDate = getDashboardDayStart(new Date())
  startDate.setDate(startDate.getDate() - 6)

  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS bucket, COUNT(*)::int AS value
    FROM user_feedback
    WHERE created_at >= ${startDate}
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + index)
    const bucket = formatDashboardDayKey(currentDate)

    return {
      label: formatDashboardWeekdayLabel(bucket),
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getMonthFeedbackTrend() {
  const startDate = getDashboardDayStart(new Date())
  startDate.setDate(startDate.getDate() - 29)

  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS bucket, COUNT(*)::int AS value
    FROM user_feedback
    WHERE created_at >= ${startDate}
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: 30 }, (_, index) => {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + index)
    const bucket = formatDashboardDayKey(currentDate)

    return {
      label: formatDashboardShortDateLabel(bucket),
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getYearFeedbackTrend() {
  const currentDate = new Date()
  const startMonth = new Date(currentDate.getFullYear(), 0, 1)
  const monthCount = currentDate.getMonth() + 1

  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS bucket, COUNT(*)::int AS value
    FROM user_feedback
    WHERE created_at >= ${startMonth}
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1)
    const bucket = formatDashboardMonthKey(monthDate)

    return {
      label: formatDashboardMonthLabel(bucket),
      value: trendMap.get(bucket) ?? 0
    }
  })
}

async function getAllFeedbackTrend() {
  const firstRows = await prisma.$queryRaw<Array<{ createdAt: Date }>>`
    SELECT created_at AS "createdAt"
    FROM user_feedback
    ORDER BY created_at ASC
    LIMIT 1
  `

  const firstFeedback = firstRows[0]
  if (!firstFeedback) {
    return []
  }

  const startMonth = getDashboardMonthStart(firstFeedback.createdAt)
  const currentMonth = getDashboardMonthStart(new Date())
  const totalMonths = (currentMonth.getFullYear() - startMonth.getFullYear()) * 12 + currentMonth.getMonth() - startMonth.getMonth() + 1

  if (totalMonths <= 24) {
    const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS bucket, COUNT(*)::int AS value
      FROM user_feedback
      GROUP BY 1
      ORDER BY 1
    `

    const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

    return Array.from({ length: totalMonths }, (_, index) => {
      const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1)
      const bucket = formatDashboardMonthKey(monthDate)

      return {
        label: formatDashboardMonthLabel(bucket, true),
        value: trendMap.get(bucket) ?? 0
      }
    })
  }

  const startYear = startMonth.getFullYear()
  const currentYear = currentMonth.getFullYear()
  const rows = await prisma.$queryRaw<Array<{ bucket: string; value: number | bigint }>>`
    SELECT TO_CHAR(DATE_TRUNC('year', created_at), 'YYYY') AS bucket, COUNT(*)::int AS value
    FROM user_feedback
    GROUP BY 1
    ORDER BY 1
  `

  const trendMap = new Map(rows.map((row) => [row.bucket, Number(row.value)]))

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
    const bucket = String(startYear + index)

    return {
      label: `${bucket}年`,
      value: trendMap.get(bucket) ?? 0
    }
  })
}

export async function getAdminFeedbackTrend(trendRange: DashboardTrendRange = 'week') {
  switch (trendRange) {
    case 'month':
      return getMonthFeedbackTrend()
    case 'year':
      return getYearFeedbackTrend()
    case 'all':
      return getAllFeedbackTrend()
    case 'week':
    default:
      return getWeekFeedbackTrend()
  }
}

export async function getAdminDashboardOverview(trendRange: DashboardTrendRange = 'week') {
  const [recipeCount, publishedCount, pendingCount, userCount, knowledgePublishedCount, feedbackCount, userTrend, reviewQueue] = await Promise.all([
    prisma.recipe.count(),
    prisma.recipe.count({ where: { contentStatus: 'published' } }),
    prisma.recipe.count({ where: { reviewStatus: 'pending' } }),
    prisma.user.count(),
    prisma.knowledgeArticle.count({ where: { contentStatus: 'published' } }),
    getAdminFeedbackCount(),
    getRecentUserTrend(trendRange),
    prisma.recipe.findMany({
      where: { reviewStatus: 'pending' },
      take: 3,
      orderBy: { updatedAt: 'desc' }
    })
  ])

  return {
    metrics: [
      { key: 'users', label: '总用户数', value: String(userCount), trend: '数据库实时统计', accent: 'primary' },
      { key: 'recipes', label: '食谱总数', value: String(recipeCount), trend: '数据库实时统计', accent: 'secondary' },
      { key: 'pending', label: '待审核', value: String(pendingCount), trend: '待人工处理', accent: 'warning' },
      { key: 'published', label: '已上线', value: String(publishedCount), trend: '当前可见内容', accent: 'primary' },
      { key: 'knowledgePublished', label: '已发布干货', value: String(knowledgePublishedCount), trend: '知识库实时统计', accent: 'warning' },
      { key: 'feedback', label: '用户反馈', value: String(feedbackCount), trend: '反馈中心实时汇总', accent: 'danger' }
    ],
    userTrend,
    reviewQueue: reviewQueue.map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source ?? '未标注',
      submittedBy: item.creator ?? '系统',
      submittedAt: item.updatedAt.toISOString().slice(0, 16).replace('T', ' '),
      focus: item.reviewFocus ?? '待补充审核重点'
    }))
  }
}

export async function getAdminImportJobs() {
  const jobs = await prisma.importJob.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return jobs.map((job) => ({
    id: job.id,
    fileName: job.fileName,
    operator: job.operator,
    total: job.total,
    success: job.success,
    failed: job.failed,
    status: job.status,
    createdAt: job.createdAt.toISOString().slice(0, 16).replace('T', ' ')
  }))
}

export async function getAdminReviewQueue() {
  const reviews = await prisma.recipe.findMany({
    where: { reviewStatus: 'pending' },
    orderBy: { updatedAt: 'desc' }
  })

  return reviews.map((item) => ({
    id: item.id,
    title: item.title,
    source: item.source ?? '未标注',
    submittedBy: item.creator ?? '系统',
    submittedAt: item.updatedAt.toISOString().slice(0, 16).replace('T', ' '),
    focus: item.reviewFocus ?? '待补充审核重点'
  }))
}

export async function getAdminUsers() {
  const users = await prisma.user.findMany({
    include: {
      babies: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const permissionMap = new Map<string, boolean>()
  try {
    const permissionRows = await prisma.$queryRaw<Array<{ id: string; can_app_admin: boolean | null }>>`
      SELECT id, can_app_admin
      FROM users
    `
    permissionRows.forEach((row) => {
      permissionMap.set(row.id, Boolean(row.can_app_admin))
    })
  } catch {
  }

  return users.map((user) => {
    const userRecord = user as { canAppAdmin?: boolean }

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatarUrl ?? '',
      registerAt: user.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      babyCount: user.babies.length,
      activity: user.activityLabel ?? '普通',
      status: user.statusLabel ?? '正常',
      canAppAdmin: typeof userRecord.canAppAdmin === 'boolean'
        ? userRecord.canAppAdmin
        : (permissionMap.get(user.id) ?? false)
    }
  })
}

export async function setUserAppAdminPermission(userId: string, canAppAdmin: boolean) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!user) {
    throw new Error('未找到对应用户')
  }

  try {
    await prisma.$executeRaw`
      UPDATE users
      SET can_app_admin = ${canAppAdmin}
      WHERE id = ${userId}
    `
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('can_app_admin')) {
      throw new Error('数据库缺少 can_app_admin 字段，请先执行 db:online:init')
    }
    throw error
  }
}

type AdminFeedbackUser = {
  id: string
  nickname: string
  avatarUrl: string
}

type AdminFeedbackRow = {
  id: string
  content: string
  createdAt: string
  user: AdminFeedbackUser
}

type AdminFeedbackDetail = {
  id: string
  content: string
  createdAt: string
  user: AdminFeedbackUser
}

function getAnonymousFeedbackUser(): AdminFeedbackUser {
  return {
    id: '',
    nickname: '未知用户',
    avatarUrl: ''
  }
}

export async function getAdminFeedbackList(keyword?: string) {
  const normalizedKeyword = keyword?.trim()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).userFeedback.findMany({
      where: normalizedKeyword
        ? {
            OR: [
              {
                content: {
                  contains: normalizedKeyword,
                  mode: 'insensitive'
                }
              },
              {
                userId: {
                  in: await prisma.user.findMany({
                    where: {
                      nickname: {
                        contains: normalizedKeyword,
                        mode: 'insensitive'
                      }
                    },
                    select: { id: true }
                  }).then((users) => users.map((user) => user.id))
                }
              }
            ]
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true
      }
    }) as Array<{ id: string; userId: string | null; content: string; createdAt: Date }>

    const userIds = rows
      .map((row) => row.userId)
      .filter((value): value is string => typeof value === 'string' && value.length > 0)

    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, nickname: true, avatarUrl: true }
        })
      : []

    const userMap = new Map(users.map((user) => [
      user.id,
      {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl ?? ''
      }
    ]))

    return rows.map((row): AdminFeedbackRow => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      user: row.userId ? userMap.get(row.userId) ?? getAnonymousFeedbackUser() : getAnonymousFeedbackUser()
    }))
  } catch {
    const rows = await prisma.$queryRaw<Array<{
      id: string
      content: string
      createdAt: Date
      userId: string | null
      nickname: string | null
      avatarUrl: string | null
    }>>`
      SELECT
        uf.id,
        uf.content,
        uf.created_at AS "createdAt",
        uf.user_id AS "userId",
        u.nickname,
        u.avatar_url AS "avatarUrl"
      FROM user_feedback uf
      LEFT JOIN users u ON u.id = uf.user_id
      ORDER BY uf.created_at DESC
    `

    const filtered = normalizedKeyword
      ? rows.filter((row) =>
          row.content.includes(normalizedKeyword)
          || (row.nickname ?? '').includes(normalizedKeyword)
        )
      : rows

    return filtered.map((row): AdminFeedbackRow => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      user: row.userId
        ? {
            id: row.userId,
            nickname: row.nickname ?? '未知用户',
            avatarUrl: row.avatarUrl ?? ''
          }
        : getAnonymousFeedbackUser()
    }))
  }
}

export async function getAdminFeedbackDetail(id: string) {
  const feedbackId = id.trim()
  if (!feedbackId) {
    throw new Error('未找到对应反馈')
  }

  const rows = await getAdminFeedbackList()
  const detail = rows.find((item) => item.id === feedbackId)

  if (!detail) {
    throw new Error('未找到对应反馈')
  }

  return detail as AdminFeedbackDetail
}

export async function getAdminSystemSettings() {
  const settings = await prisma.systemSetting.findMany()
  const settingMap = Object.fromEntries(settings.map((item) => [item.settingKey, item.settingVal]))

  return [
    {
      title: '基础设置',
      description: '品牌名称、Logo、分享文案与默认入口。',
      items: [
        { label: '系统名称', value: settingMap.app_name ?? '养娃小管家' },
        { label: '分享文案', value: settingMap.share_slogan ?? '科学辅食，悦享成长' },
        { label: '首页引导语', value: settingMap.home_hero_text ?? '根据宝宝成长阶段生成今日辅食' }
      ]
    },
    {
      title: '内容模板',
      description: '默认食谱结构、审核标签、营养参考值。',
      items: [
        { label: '默认步骤模板', value: '食材处理 / 蒸煮 / 打泥 / 出锅' },
        { label: '审核标签', value: '高铁 / 高钙 / 易消化 / 病期适用' },
        { label: '营养标准', value: '按月龄维度维护参考值' }
      ]
    },
    {
      title: '推送与权限',
      description: '微信提醒、导出权限、角色矩阵。',
      items: [
        { label: '每日提醒', value: settingMap.daily_reminder ?? '08:00 自动推送' },
        { label: '导出权限', value: settingMap.export_permission ?? '运营经理以上可导出' },
        { label: '账号角色', value: settingMap.account_roles ?? '管理员 / 运营 / 营养师 / 审核员' }
      ]
    }
  ]
}

// 食谱管理
type RecipeUpdatePayload = Partial<AdminRecipeUpsertPayload>

export async function createRecipe(payload: AdminRecipeUpsertPayload) {
  const ageRange = resolveRecipeAgeRange(payload)
  const recipe = await prisma.recipe.create({
    data: {
      title: payload.title,
      summary: payload.summary,
      coverImage: payload.coverImage,
      ageLabel: ageRange.ageLabel,
      ageMinMonths: ageRange.ageMinMonths,
      ageMaxMonths: ageRange.ageMaxMonths,
      durationLabel: payload.durationLabel,
      difficultyLabel: payload.difficultyLabel,
      source: payload.source,
      creator: payload.creator,
      contentStatus: payload.contentStatus ?? 'draft',
      ingredients: {
        create: payload.ingredients.map((ing) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit
        }))
      },
      steps: {
        create: payload.steps.map((step) => ({
          stepNo: step.stepNo,
          title: step.title,
          description: step.description,
          imageUrl: step.imageUrl
        }))
      },
      tags: {
        create: payload.tags.map((tag) => ({ name: tag }))
      }
    },
    include: {
      ingredients: true,
      steps: true,
      tags: true
    }
  })

  return { id: recipe.id }
}

export async function updateRecipe(recipeId: string, payload: RecipeUpdatePayload) {
  const ageRange = (typeof payload.ageMinMonths === 'number' || typeof payload.ageLabel === 'string')
    ? resolveRecipeAgeRange(payload)
    : null

  // 删除旧的关联数据
  await prisma.recipeIngredient.deleteMany({ where: { recipeId } })
  await prisma.recipeStep.deleteMany({ where: { recipeId } })
  await prisma.recipeTag.deleteMany({ where: { recipeId } })

  // 更新食谱及关联数据
  const recipe = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.summary !== undefined && { summary: payload.summary }),
      ...(payload.coverImage !== undefined && { coverImage: payload.coverImage }),
      ...(ageRange && {
        ageLabel: ageRange.ageLabel,
        ageMinMonths: ageRange.ageMinMonths,
        ageMaxMonths: ageRange.ageMaxMonths
      }),
      ...(payload.durationLabel && { durationLabel: payload.durationLabel }),
      ...(payload.difficultyLabel && { difficultyLabel: payload.difficultyLabel }),
      ...(payload.source !== undefined && { source: payload.source }),
      ...(payload.creator !== undefined && { creator: payload.creator }),
      ...(payload.contentStatus && { contentStatus: payload.contentStatus }),
      ...(payload.ingredients && {
        ingredients: {
          create: payload.ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit
          }))
        }
      }),
      ...(payload.steps && {
        steps: {
          create: payload.steps.map((step) => ({
            stepNo: step.stepNo,
            title: step.title,
            description: step.description,
            imageUrl: step.imageUrl
          }))
        }
      }),
      ...(payload.tags && {
        tags: {
          create: payload.tags.map((tag) => ({ name: tag }))
        }
      })
    }
  })

  return { id: recipe.id }
}

export async function batchUpdateRecipeStatus(recipeIds: string[], contentStatus: string) {
  await prisma.recipe.updateMany({
    where: { id: { in: recipeIds } },
    data: { contentStatus: contentStatus as PrismaContentStatus }
  })
}

export async function deleteRecipe(recipeId: string) {
  await prisma.recipe.delete({ where: { id: recipeId } })
}

// 干货管理
type KnowledgeArticleUpdatePayload = Partial<AdminKnowledgeArticleUpsertPayload>

export async function getAdminKnowledgeArticles(categoryKey?: string) {
  const articles = await prisma.knowledgeArticle.findMany({
    where: categoryKey ? { categoryKey } : undefined,
    orderBy: { updatedAt: 'desc' }
  })

  return articles.map(mapKnowledgeArticleToAdminRow)
}

export async function getAdminKnowledgeDetail(articleId: string) {
  const article = await prisma.knowledgeArticle.findUnique({
    where: { id: articleId },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!article) {
    throw new Error('未找到对应干货文章')
  }

  return mapKnowledgeArticleToAdminDetail(article)
}

export async function createKnowledgeArticle(payload: AdminKnowledgeArticleUpsertPayload) {
  const article = await prisma.knowledgeArticle.create({
    data: {
      title: payload.title,
      subtitle: payload.subtitle,
      summary: payload.summary,
      coverImage: payload.coverImage,
      categoryKey: payload.categoryKey,
      categoryLabel: payload.categoryLabel,
      tagsJson: JSON.stringify(payload.tags),
      contentType: payload.contentType,
      content: payload.content,
      isFeatured: payload.isFeatured ?? false,
      contentStatus: payload.contentStatus ?? 'published',
      sections: {
        create: payload.sections.map((section) => ({
          title: section.title,
          content: section.content,
          imagesJson: stringifyKnowledgeSectionMedia(section),
          sortOrder: section.sortOrder
        }))
      }
    }
  })

  return { id: article.id }
}

export async function updateKnowledgeArticle(articleId: string, payload: KnowledgeArticleUpdatePayload) {
  // 删除旧的段落
  if (payload.sections) {
    await prisma.knowledgeArticleSection.deleteMany({ where: { articleId } })
  }

  const article = await prisma.knowledgeArticle.update({
    where: { id: articleId },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.subtitle && { subtitle: payload.subtitle }),
      ...(payload.summary && { summary: payload.summary }),
      ...(payload.coverImage !== undefined && { coverImage: payload.coverImage }),
      ...(payload.categoryKey && { categoryKey: payload.categoryKey }),
      ...(payload.categoryLabel && { categoryLabel: payload.categoryLabel }),
      ...(payload.tags && { tagsJson: JSON.stringify(payload.tags) }),
      ...(payload.contentType && { contentType: payload.contentType }),
      ...(payload.content && { content: payload.content }),
      ...(payload.isFeatured !== undefined && { isFeatured: payload.isFeatured }),
      ...(payload.contentStatus && { contentStatus: payload.contentStatus }),
      ...(payload.sections && {
        sections: {
          create: payload.sections.map((section) => ({
            title: section.title,
            content: section.content,
            imagesJson: stringifyKnowledgeSectionMedia(section),
            sortOrder: section.sortOrder
          }))
        }
      })
    }
  })

  return { id: article.id }
}

export async function deleteKnowledgeArticle(articleId: string) {
  await prisma.knowledgeArticle.delete({ where: { id: articleId } })
}
