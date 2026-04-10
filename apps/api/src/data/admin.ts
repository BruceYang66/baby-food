import { prisma } from '../db/prisma.js'

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
        { label: '系统名称', value: settingMap.app_name ?? '宝宝辅食智囊' },
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
