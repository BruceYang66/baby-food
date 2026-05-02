import { prisma } from '../db/prisma.js'
import type { ContentStatus } from '@prisma/client'

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

export async function getAdminRecipes() {
  const recipes = await prisma.recipe.findMany({
    include: {
      tags: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return recipes.map((recipe) => ({
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
    updatedAt: recipe.updatedAt.toISOString().slice(0, 16).replace('T', ' ')
  }))
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

  return {
    id: recipe.id,
    title: recipe.title,
    ageLabel: recipe.ageLabel,
    ageMinMonths: recipe.ageMinMonths,
    ageMaxMonths: recipe.ageMaxMonths,
    durationLabel: recipe.durationLabel,
    difficultyLabel: recipe.difficultyLabel,
    cover: recipe.coverImage ?? '',
    description: recipe.summary ?? '',
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
      description: step.description,
      image: step.imageUrl ?? recipe.coverImage ?? ''
    })),
    preview: {
      title: recipe.title,
      subtitle: recipe.summary ?? ''
    }
  }
}

export async function getAdminDashboardOverview() {
  const [recipeCount, publishedCount, pendingCount, userCount, reviewQueue] = await Promise.all([
    prisma.recipe.count(),
    prisma.recipe.count({ where: { contentStatus: 'published' } }),
    prisma.recipe.count({ where: { reviewStatus: 'pending' } }),
    prisma.user.count(),
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
      { key: 'coverage', label: '月龄覆盖度', value: '91%', trend: '静态指标待细化', accent: 'warning' },
      { key: 'feedback', label: '负反馈预警', value: '7', trend: '静态指标待细化', accent: 'danger' }
    ],
    userTrend: [
      { label: '周一', value: 320 },
      { label: '周二', value: 410 },
      { label: '周三', value: 390 },
      { label: '周四', value: 470 },
      { label: '周五', value: 520 },
      { label: '周六', value: 610 },
      { label: '周日', value: 660 }
    ],
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

  return users.map((user) => ({
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatarUrl ?? '',
    registerAt: user.createdAt.toISOString().slice(0, 16).replace('T', ' '),
    babyCount: user.babies.length,
    activity: user.activityLabel ?? '普通',
    status: user.statusLabel ?? '正常'
  }))
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
type RecipeCreatePayload = {
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
  ingredients: Array<{ name: string; amount: string; unit?: string }>
  steps: Array<{ stepNo: number; title: string; description: string; imageUrl?: string }>
  tags: string[]
}

type RecipeUpdatePayload = Partial<RecipeCreatePayload>

export async function createRecipe(payload: RecipeCreatePayload) {
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
    data: { contentStatus: contentStatus as ContentStatus }
  })
}

export async function deleteRecipe(recipeId: string) {
  await prisma.recipe.delete({ where: { id: recipeId } })
}

// 干货管理
type KnowledgeArticleCreatePayload = {
  title: string
  subtitle: string
  summary: string
  coverImage?: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: 'article' | 'guide' | 'taboo'
  content: string
  isFeatured?: boolean
  contentStatus?: ContentStatus
  sections: Array<{ title?: string; content: string; images: string[]; sortOrder: number }>
}

type KnowledgeArticleUpdatePayload = Partial<KnowledgeArticleCreatePayload>

export async function getAdminKnowledgeArticles(categoryKey?: string) {
  const articles = await prisma.knowledgeArticle.findMany({
    where: categoryKey ? { categoryKey } : undefined,
    orderBy: { updatedAt: 'desc' }
  })

  return articles.map((article) => ({
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
    updatedAt: article.updatedAt.toISOString().slice(0, 16).replace('T', ' ')
  }))
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
    sections: article.sections.map((section) => ({
      id: section.id,
      title: section.title ?? '',
      content: section.content,
      images: JSON.parse(section.imagesJson) as string[],
      sortOrder: section.sortOrder
    }))
  }
}

export async function createKnowledgeArticle(payload: KnowledgeArticleCreatePayload) {
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
          imagesJson: JSON.stringify(section.images),
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
            imagesJson: JSON.stringify(section.images),
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
