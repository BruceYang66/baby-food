import { prisma } from '../db/prisma.js'

const homeFeatures = [
  { key: 'generate', title: '生成今日辅食', subtitle: '根据月龄与需求一键生成', icon: '🍚', accent: 'primary', route: '/pages/generate/index' },
  { key: 'plan', title: '本周计划', subtitle: '一周安排清晰不重样', icon: '📅', accent: 'neutral', route: '/pages/plan/index' },
  { key: 'taboo', title: '生病忌口查询', subtitle: '不舒服时快速查能吃什么', icon: '🏥', accent: 'secondary', route: '/pages/taboo/index' },
  { key: 'guide', title: '月龄饮食指南', subtitle: '各月龄吃什么一查便知', icon: '📚', accent: 'neutral', route: '/pages/guide/index' }
] as const

async function buildHomeShortcuts(userId: string) {
  const recentPlan = await prisma.mealPlan.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    },
    orderBy: { planDate: 'desc' }
  })

  const shortcuts = []

  if (recentPlan) {
    shortcuts.push({
      title: '继续上次计划',
      description: `${recentPlan.dateLabel} · ${recentPlan.items.length}餐安排`,
      icon: '↩︎',
      actionKey: 'recent-plan' as const,
      planPreview: buildDailyMealPlan(recentPlan)
    })
  }

  shortcuts.push(
    { title: '收藏有更新', description: '新增 3 道高铁食谱', icon: '♡', actionKey: 'favorites' as const },
    { title: '温馨提示', description: '本周注意增加深绿叶菜摄入', icon: '☀︎', actionKey: 'message' as const }
  )

  return shortcuts
}

const ingredientHighlights = [
  { id: 'ing-1', name: '有机胡萝卜', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=500&q=80' },
  { id: 'ing-2', name: '铁棍山药', image: 'https://images.unsplash.com/photo-1615485925873-8c6d2437cf7d?auto=format&fit=crop&w=500&q=80' },
  { id: 'ing-3', name: '贝贝南瓜', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=500&q=80' }
] as const

const nutritionGoals = ['补铁', '补钙', 'DHA', '通便', '开胃', '挑食', '免疫力', '手抓食', '补钙补锌', '病期适用']
const mealSlots = [
  { slot: 'breakfast', time: '08:00' },
  { slot: 'lunch', time: '12:00' },
  { slot: 'dinner', time: '18:00' }
] as const

function getMonthAge(birthDate: Date) {
  const today = new Date()
  return Math.max(0, (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth()))
}

function getStageLabelFromBirthDate(birthDate: Date) {
  const monthAge = getMonthAge(birthDate)

  if (monthAge < 6) {
    return '泥糊状辅食阶段'
  }

  if (monthAge < 8) {
    return '碎末状辅食阶段'
  }

  if (monthAge < 10) {
    return '软烂颗粒阶段'
  }

  if (monthAge < 12) {
    return '手抓食过渡阶段'
  }

  return '软饭阶段'
}

function formatBabyProfile(baby: {
  id: string
  nickname: string
  birthDate: Date
  stageLabel: string
  avatarUrl?: string | null
  user?: { avatarUrl: string | null }
  allergens: Array<{ name: string }>
}) {
  return {
    id: baby.id,
    nickname: baby.nickname,
    monthAgeLabel: `${getMonthAge(baby.birthDate)}个月`,
    stageLabel: baby.stageLabel,
    birthDate: baby.birthDate.toISOString().slice(0, 10),
    avatar: baby.avatarUrl ?? baby.user?.avatarUrl ?? '',
    allergens: baby.allergens.map((item) => item.name)
  }
}

function formatAppUser(user: { id: string; nickname: string; avatarUrl: string | null }) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl ?? ''
  }
}

function normalizeAllergens(allergens: string[]) {
  return [...new Set(allergens.map((item) => item.trim()).filter(Boolean))]
}

function parseBirthDate(value: string) {
  const birthDate = new Date(value)

  if (Number.isNaN(birthDate.getTime())) {
    throw new Error('宝宝生日格式不正确')
  }

  return birthDate
}

function getToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatPlanDateLabel(date: Date, options: { isToday?: boolean } = {}) {
  if (options.isToday) {
    return `今天 · ${date.getMonth() + 1}月${date.getDate()}日`
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function parsePlanDate(value?: string) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(base: Date, days: number) {
  const nextDate = new Date(base)
  nextDate.setDate(nextDate.getDate() + days)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function getWeekRange(base = getToday()) {
  const start = addDays(base, -(base.getDay() + 6) % 7)
  const end = addDays(start, 6)
  return { start, end }
}

function getDayLabel(date: Date, today = getToday()) {
  if (formatDateKey(date) === formatDateKey(today)) {
    return '今天'
  }

  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()] ?? ''
}

function getTodayDateLabel() {
  return formatPlanDateLabel(getToday(), { isToday: true })
}

function getWaterSuggestion(monthAge: number) {
  if (monthAge < 8) {
    return '420ml'
  }

  if (monthAge < 12) {
    return '450ml'
  }

  return '500ml'
}

async function getCurrentBaby(userId: string) {
  let activeBabyId: string | null = null

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { activeBabyId: true } as any })
    activeBabyId = (user as any)?.activeBabyId ?? null
  } catch {
    // Prisma client not regenerated yet — fall back to raw SQL
    const rows = await prisma.$queryRaw<Array<{ active_baby_id: string | null }>>`
      SELECT active_baby_id FROM users WHERE id = ${userId} LIMIT 1
    `
    activeBabyId = rows[0]?.active_baby_id ?? null
  }

  return prisma.baby.findFirst({
    where: activeBabyId ? { id: activeBabyId, userId } : { userId },
    include: {
      allergens: true
    },
    orderBy: {
      birthDate: 'asc'
    }
  })
}

async function ensureCurrentBaby(userId: string) {
  const baby = await getCurrentBaby(userId)

  if (!baby) {
    throw new Error('请先完善宝宝档案')
  }

  return baby
}

async function ensureCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('未找到当前登录用户')
  }

  return user
}

async function getMealPlanRecipes(limit = 3, goals: string[] = [], excludeIds: string[] = []) {
  // Build tag-based filter when goals are specified
  const tagFilter = goals.length
    ? { tags: { some: { name: { in: goals } } } }
    : {}

  const publishedRecipes = await prisma.recipe.findMany({
    where: {
      contentStatus: 'published',
      id: { notIn: excludeIds },
      ...tagFilter
    },
    include: { tags: true },
    orderBy: { favorites: 'desc' },
    take: limit
  })

  if (publishedRecipes.length >= limit) {
    return publishedRecipes
  }

  // Fallback: relax tag filter, just exclude already-used recipes
  const fallbackRecipes = await prisma.recipe.findMany({
    where: {
      contentStatus: 'published',
      id: { notIn: [...excludeIds, ...publishedRecipes.map((r) => r.id)] }
    },
    include: { tags: true },
    orderBy: { favorites: 'desc' },
    take: limit - publishedRecipes.length
  })

  const combined = [...publishedRecipes, ...fallbackRecipes]

  if (combined.length >= limit) {
    return combined
  }

  // Final fallback: any recipe
  const anyRecipes = await prisma.recipe.findMany({
    include: { tags: true },
    orderBy: { favorites: 'desc' },
    take: limit
  })

  if (!anyRecipes.length) {
    throw new Error('数据库中没有可用食谱数据')
  }

  return anyRecipes
}

async function createTodayMealPlan(userId: string, baby: { birthDate: Date }, goals: string[] = []) {
  const recipes = await getMealPlanRecipes(3, goals)
  const monthAge = getMonthAge(baby.birthDate)
  const today = getToday()

  return prisma.mealPlan.create({
    data: {
      userId,
      title: '今日辅食计划',
      planDate: today,
      dateLabel: formatPlanDateLabel(today, { isToday: true }),
      nutritionScore: 92,
      waterSuggestion: getWaterSuggestion(monthAge),
      items: {
        create: recipes.map((recipe, index) => ({
          recipeId: recipe.id,
          slot: mealSlots[index]?.slot ?? 'dinner',
          time: mealSlots[index]?.time ?? '18:00',
          title: recipe.title,
          focus: recipe.reviewFocus ?? '均衡搭配'
        }))
      }
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: {
          time: 'asc'
        }
      }
    }
  })
}

async function ensureTodayMealPlan(userId: string, baby: { birthDate: Date }) {
  const today = getToday()
  const existingMealPlan = await prisma.mealPlan.findFirst({
    where: {
      userId,
      planDate: today
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: {
          time: 'asc'
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  })

  if (existingMealPlan) {
    return existingMealPlan
  }

  return createTodayMealPlan(userId, baby)
}

function getCurrentMealPlan<T extends { planDate: Date }>(mealPlans: T[]) {
  const todayKey = formatDateKey(getToday())
  return mealPlans.find((plan) => formatDateKey(plan.planDate) === todayKey) ?? mealPlans[0]
}

function buildMealEntries(items: Array<{
  id: string
  recipeId: string | null
  slot: string
  time: string
  title: string
  focus: string | null
  recipe: { coverImage: string | null; tags: Array<{ name: string }> } | null
}>) {
  return items.map((item) => ({
    id: item.id,
    recipeId: item.recipeId ?? undefined,
    slot: item.slot,
    time: item.time,
    title: item.title,
    image: item.recipe?.coverImage ?? '',
    tags: item.recipe?.tags.map((tag) => tag.name) ?? [],
    focus: item.focus ?? '均衡搭配'
  }))
}

function buildDailyMealPlan(mealPlan: {
  id: string
  title: string
  planDate: Date
  dateLabel: string
  nutritionScore: number
  waterSuggestion: string | null
  items: Array<{
    id: string
    recipeId: string | null
    slot: string
    time: string
    title: string
    focus: string | null
    recipe: { coverImage: string | null; tags: Array<{ name: string }> } | null
  }>
}) {
  return {
    id: mealPlan.id,
    title: mealPlan.title,
    planDate: formatDateKey(mealPlan.planDate),
    dateLabel: mealPlan.dateLabel,
    nutritionScore: mealPlan.nutritionScore,
    waterSuggestion: mealPlan.waterSuggestion ?? '',
    entries: buildMealEntries(mealPlan.items)
  }
}

function getDayLabelFromDateLabel(dateLabel: string) {
  if (dateLabel.includes('今天')) {
    return '今天'
  }

  return dateLabel.replace(/^\d{4}年/, '')
}

async function getRecipeMap(recipeIds: string[]) {
  const uniqueIds = [...new Set(recipeIds.filter(Boolean))]

  if (!uniqueIds.length) {
    return new Map<string, {
      id: string
      title: string
      coverImage: string | null
      reviewFocus: string | null
      tags: Array<{ name: string }>
    }>()
  }

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: uniqueIds } },
    include: { tags: true }
  })

  return new Map(recipes.map((recipe) => [recipe.id, recipe]))
}

function normalizeMealPlanEntries(entries: Array<{
  recipeId?: string
  slot: string
  time: string
  title: string
  focus: string
}>) {
  return entries
    .map((entry) => ({
      recipeId: entry.recipeId,
      slot: entry.slot,
      time: entry.time,
      title: entry.title.trim(),
      focus: entry.focus.trim()
    }))
    .filter((entry) => entry.title)
}

export async function findOrCreateWechatUser(wechatOpenId: string) {
  return prisma.user.upsert({
    where: { wechatOpenId },
    update: {},
    create: {
      nickname: `微信用户${wechatOpenId.slice(-4)}`,
      avatarUrl: '',
      wechatOpenId,
      activityLabel: '新用户',
      statusLabel: '正常'
    }
  })
}

export async function getAppAuthState(userId: string) {
  const [user, baby] = await Promise.all([
    ensureCurrentUser(userId),
    getCurrentBaby(userId)
  ])

  return {
    user: formatAppUser(user),
    hasBaby: Boolean(baby),
    babyProfile: baby ? formatBabyProfile(baby) : null
  }
}

export async function updateUserProfile(userId: string, payload: {
  nickname?: string
  avatarUrl?: string
}) {
  const data: Record<string, string> = {}

  if (payload.nickname?.trim()) {
    data.nickname = payload.nickname.trim()
  }

  if (payload.avatarUrl) {
    data.avatarUrl = payload.avatarUrl
  }

  if (!Object.keys(data).length) {
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data
  })
}

export async function createBabyProfile(userId: string, payload: {
  nickname: string
  birthDate: string
  allergens: string[]
  avatarUrl?: string
}) {
  const nickname = payload.nickname.trim()

  if (!nickname) {
    throw new Error('请填写宝宝昵称')
  }

  const birthDate = parseBirthDate(payload.birthDate)
  const stageLabel = getStageLabelFromBirthDate(birthDate)
  const allergens = normalizeAllergens(payload.allergens)

  const baby = await prisma.baby.create({
    data: {
      userId,
      nickname,
      birthDate,
      stageLabel,
      allergens: {
        create: allergens.map((name) => ({ name }))
      }
    },
    include: {
      allergens: true
    }
  })

  // Store avatar on baby — raw SQL fallback for Prisma client not regenerated yet
  if (payload.avatarUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.baby.update({ where: { id: baby.id }, data: { avatarUrl: payload.avatarUrl } as any })
    } catch {
      await prisma.$executeRaw`UPDATE babies SET avatar_url = ${payload.avatarUrl} WHERE id = ${baby.id}`
    }
  }

  // Set as active baby (automatically activate the newly created baby)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.update({ where: { id: userId }, data: { activeBabyId: baby.id } as any })
  } catch {
    await prisma.$executeRaw`UPDATE users SET active_baby_id = ${baby.id} WHERE id = ${userId}`
  }

  return {
    babyProfile: formatBabyProfile({ ...baby, avatarUrl: payload.avatarUrl || null })
  }
}

export async function updateBabyProfile(userId: string, babyId: string, payload: {
  nickname: string
  birthDate: string
  allergens: string[]
  avatarUrl?: string
}) {
  const nickname = payload.nickname.trim()

  if (!nickname) {
    throw new Error('请填写宝宝昵称')
  }

  const birthDate = parseBirthDate(payload.birthDate)
  const stageLabel = getStageLabelFromBirthDate(birthDate)
  const allergens = normalizeAllergens(payload.allergens)
  const existingBaby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      userId
    }
  })

  if (!existingBaby) {
    throw new Error('未找到可编辑的宝宝档案')
  }

  // Read existing avatar via raw SQL (Prisma client may not know avatarUrl yet)
  let existingAvatarUrl: string | null = null
  try {
    const rows = await prisma.$queryRaw<Array<{ avatar_url: string | null }>>`
      SELECT avatar_url FROM babies WHERE id = ${babyId} LIMIT 1
    `
    existingAvatarUrl = rows[0]?.avatar_url ?? null
  } catch {
    // ignore
  }

  const baby = await prisma.baby.update({
    where: { id: babyId },
    data: {
      nickname,
      birthDate,
      stageLabel,
      allergens: {
        deleteMany: {},
        create: allergens.map((name) => ({ name }))
      }
    },
    include: {
      allergens: true
    }
  })

  // Store avatar — raw SQL fallback for Prisma client not regenerated yet
  if (payload.avatarUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.baby.update({ where: { id: babyId }, data: { avatarUrl: payload.avatarUrl } as any })
    } catch {
      await prisma.$executeRaw`UPDATE babies SET avatar_url = ${payload.avatarUrl} WHERE id = ${babyId}`
    }
  }

  return {
    babyProfile: formatBabyProfile({ ...baby, avatarUrl: payload.avatarUrl || existingAvatarUrl })
  }
}

export async function listBabyProfiles(userId: string) {
  const babies = await prisma.baby.findMany({
    where: { userId },
    include: { allergens: true },
    orderBy: { birthDate: 'asc' }
  })

  let activeBabyId: string | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { activeBabyId: true } as any })
    activeBabyId = (user as any)?.activeBabyId ?? null
  } catch {
    const rows = await prisma.$queryRaw<Array<{ active_baby_id: string | null }>>`
      SELECT active_baby_id FROM users WHERE id = ${userId} LIMIT 1
    `
    activeBabyId = rows[0]?.active_baby_id ?? null
  }

  return {
    babies: babies.map((b) => ({ ...formatBabyProfile(b), isActive: b.id === activeBabyId }))
  }
}

export async function setActiveBaby(userId: string, babyId: string) {
  const baby = await prisma.baby.findFirst({ where: { id: babyId, userId }, include: { allergens: true } })
  if (!baby) {
    throw new Error('未找到可编辑的宝宝档案')
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.update({ where: { id: userId }, data: { activeBabyId: babyId } as any })
  } catch {
    await prisma.$executeRaw`UPDATE users SET active_baby_id = ${babyId} WHERE id = ${userId}`
  }
  return { babyProfile: formatBabyProfile(baby) }
}

export async function getHomePageData(userId: string) {
  const baby = await ensureCurrentBaby(userId)

  return {
    babyProfile: formatBabyProfile(baby),
    homeFeatures,
    homeShortcuts: await buildHomeShortcuts(userId),
    ingredientHighlights
  }
}

export async function getGeneratePageData(userId: string, mealCount = '3餐', goals: string[] = []) {
  const baby = await ensureCurrentBaby(userId)
  const monthAge = getMonthAge(baby.birthDate)
  const selectedGoals = goals.length ? goals : ['补钙']
  const allergenNames = baby.allergens.map((a) => a.name)

  // Always pick fresh recipes based on goals — exclude allergens from focus
  const slotCount = mealCount === '2餐' ? 2 : 3
  const recipes = await getMealPlanRecipes(slotCount, selectedGoals, [])

  // Filter out recipes whose tags/title strongly relate to allergens
  const safeRecipes = recipes.filter((r) =>
    !allergenNames.some((allergen) => r.title.includes(allergen) || r.tags.some((t) => t.name.includes(allergen)))
  )
  const finalRecipes = safeRecipes.length >= slotCount ? safeRecipes : recipes

  const today = getToday()
  const entries = finalRecipes.slice(0, slotCount).map((recipe, index) => ({
    id: `generated-${recipe.id}-${index}`,
    recipeId: recipe.id,
    slot: mealSlots[index]?.slot ?? 'dinner',
    time: mealSlots[index]?.time ?? '18:00',
    title: recipe.title,
    image: recipe.coverImage ?? '',
    tags: recipe.tags.map((t) => t.name),
    focus: recipe.reviewFocus ?? selectedGoals[0] ?? '均衡搭配'
  }))

  if (mealCount === '3餐+点心') {
    // Pick a snack recipe with energy-related tags
    const snackCandidates = await getMealPlanRecipes(1, ['能量加餐', '手抓点心', '加餐'], finalRecipes.map((r) => r.id))
    const snackRecipe = snackCandidates[0]
    if (snackRecipe) {
      entries.push({
        id: `generated-snack-${snackRecipe.id}`,
        recipeId: snackRecipe.id,
        slot: 'snack',
        time: '15:30',
        title: snackRecipe.title,
        image: snackRecipe.coverImage ?? '',
        tags: snackRecipe.tags.map((t) => t.name),
        focus: snackRecipe.reviewFocus ?? '午后加餐'
      })
    } else {
      entries.push({
        id: 'recommended-snack',
        recipeId: undefined,
        slot: 'snack',
        time: '15:30',
        title: '牛油果酸奶水果杯',
        image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80',
        tags: ['能量加餐', '顺滑易吞咽'],
        focus: '午后补能量'
      })
    }
  }

  // Also persist/update today's plan in DB for "上次计划" shortcut
  const existingToday = await prisma.mealPlan.findFirst({
    where: { userId, planDate: today },
    orderBy: { id: 'asc' }
  })

  if (!existingToday) {
    await prisma.mealPlan.create({
      data: {
        userId,
        title: '今日辅食计划',
        planDate: today,
        dateLabel: formatPlanDateLabel(today, { isToday: true }),
        nutritionScore: Math.min(100, 90 + selectedGoals.length),
        waterSuggestion: mealCount === '3餐+点心' ? '500ml' : getWaterSuggestion(monthAge),
        items: {
          create: finalRecipes.slice(0, slotCount).map((recipe, index) => ({
            recipeId: recipe.id,
            slot: mealSlots[index]?.slot ?? 'dinner',
            time: mealSlots[index]?.time ?? '18:00',
            title: recipe.title,
            focus: recipe.reviewFocus ?? selectedGoals[0] ?? '均衡搭配'
          }))
        }
      }
    })
  }

  return {
    babyProfile: formatBabyProfile(baby),
    todayMealPlan: {
      id: existingToday?.id ?? `generated-${formatDateKey(today)}`,
      planDate: formatDateKey(today),
      dateLabel: formatPlanDateLabel(today, { isToday: true }),
      nutritionScore: Math.min(100, 90 + selectedGoals.length),
      waterSuggestion: mealCount === '3餐+点心' ? '500ml' : getWaterSuggestion(monthAge),
      entries
    },
    nutritionGoals
  }
}

export async function getPlanPageData(userId: string) {
  const baby = await ensureCurrentBaby(userId)
  const todayPlan = await ensureTodayMealPlan(userId, baby)
  const { start, end } = getWeekRange()
  const mealPlans = await prisma.mealPlan.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    },
    orderBy: {
      planDate: 'desc'
    }
  })

  const currentPlan = getCurrentMealPlan(mealPlans.length ? mealPlans : [todayPlan])
  const historyPlans = mealPlans.filter((plan) => formatDateKey(plan.planDate) !== formatDateKey(getToday()))
  const weeklyPlans = mealPlans.filter((plan) => plan.planDate >= start && plan.planDate <= end)
  const weeklyMap = new Map(weeklyPlans.map((plan) => [formatDateKey(plan.planDate), plan]))
  const weeklyPlanDays = Array.from({ length: 7 }, (_, index) => {
    const planDate = addDays(start, index)
    const dateKey = formatDateKey(planDate)
    const existingPlan = weeklyMap.get(dateKey)

    if (existingPlan) {
      return {
        id: existingPlan.id,
        planDate: dateKey,
        dateLabel: formatPlanDateLabel(planDate, { isToday: dateKey === formatDateKey(getToday()) }).replace(/^今天 · /, ''),
        dayLabel: getDayLabel(planDate),
        summary: `${existingPlan.items.length} 餐安排`,
        recipeTitles: existingPlan.items.map((item) => item.title).slice(0, 3),
        recipeIds: existingPlan.items.map((item) => item.recipeId).filter((item): item is string => Boolean(item)).slice(0, 3),
        completionRate: existingPlan.nutritionScore,
        tagLabel: dateKey === formatDateKey(getToday()) ? '今日' : '已保存',
        isRecommended: false
      }
    }

    const recommendEntries = todayPlan.items.slice(0, 3)
    const recommendedPlan = {
      id: `recommended-${dateKey}`,
      title: `${formatPlanDateLabel(planDate).replace(/^\d{4}年/, '')}推荐计划`,
      planDate: planDate,
      dateLabel: formatPlanDateLabel(planDate, { isToday: dateKey === formatDateKey(getToday()) }),
      nutritionScore: Math.max(88, todayPlan.nutritionScore - 4 + (index % 3)),
      waterSuggestion: todayPlan.waterSuggestion ?? getWaterSuggestion(getMonthAge(baby.birthDate)),
      items: recommendEntries
    }

    return {
      id: `recommended-${dateKey}`,
      planDate: dateKey,
      dateLabel: formatPlanDateLabel(planDate).replace(/^\d{4}年/, ''),
      dayLabel: getDayLabel(planDate),
      summary: `推荐 ${recommendEntries.length} 餐安排`,
      recipeTitles: recommendEntries.map((item) => item.title).slice(0, 3),
      recipeIds: recommendEntries.map((item) => item.recipeId).filter((item): item is string => Boolean(item)).slice(0, 3),
      completionRate: Math.max(88, todayPlan.nutritionScore - 4 + (index % 3)),
      tagLabel: '推荐',
      isRecommended: true,
      mealPlan: buildDailyMealPlan(recommendedPlan)
    }
  })

  return {
    todayMealPlan: buildDailyMealPlan(currentPlan),
    historyMealPlans: historyPlans.map((plan) => ({
      id: plan.id,
      dateLabel: plan.dateLabel,
      summary: `${plan.items.map((item) => item.title).slice(0, 2).join(' / ') || '辅食安排'} · 完成度 ${plan.nutritionScore}%`,
      completionRate: plan.nutritionScore
    })),
    weeklyPlanDays
  }
}

export async function getMealPlanDetailData(userId: string, mealPlanId: string) {
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      userId
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    }
  })

  if (!mealPlan) {
    throw new Error('未找到对应计划')
  }

  return {
    mealPlan: buildDailyMealPlan(mealPlan)
  }
}

export async function saveMealPlan(userId: string, payload: {
  title?: string
  dateLabel?: string
  planDate?: string
  nutritionScore: number
  waterSuggestion: string
  entries: Array<{
    recipeId?: string
    slot: string
    time: string
    title: string
    focus: string
  }>
}) {
  const normalizedEntries = normalizeMealPlanEntries(payload.entries)
  const recipeMap = await getRecipeMap(normalizedEntries.map((entry) => entry.recipeId ?? ''))

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId,
      title: payload.title?.trim() || '已保存辅食计划',
      planDate: parsePlanDate(payload.planDate) ?? getToday(),
      dateLabel: payload.dateLabel?.trim() || getTodayDateLabel(),
      nutritionScore: payload.nutritionScore,
      waterSuggestion: payload.waterSuggestion,
      items: {
        create: normalizedEntries.map((entry) => ({
          recipeId: entry.recipeId,
          slot: entry.slot,
          time: entry.time,
          title: entry.title,
          focus: entry.focus
        }))
      }
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    }
  })

  return {
    mealPlan: buildDailyMealPlan({
      ...mealPlan,
      items: mealPlan.items.map((item) => ({
        ...item,
        recipe: item.recipe ?? (item.recipeId ? recipeMap.get(item.recipeId) ?? null : null)
      }))
    })
  }
}

export async function updateMealPlan(userId: string, mealPlanId: string, payload: {
  title?: string
  dateLabel?: string
  planDate?: string
  nutritionScore: number
  waterSuggestion: string
  entries: Array<{
    recipeId?: string
    slot: string
    time: string
    title: string
    focus: string
  }>
}) {
  const existingMealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      userId
    }
  })

  if (!existingMealPlan) {
    throw new Error('未找到可更新的计划')
  }

  const normalizedEntries = normalizeMealPlanEntries(payload.entries)
  const recipeMap = await getRecipeMap(normalizedEntries.map((entry) => entry.recipeId ?? ''))

  const mealPlan = await prisma.mealPlan.update({
    where: { id: mealPlanId },
    data: {
      title: payload.title?.trim() || existingMealPlan.title,
      planDate: parsePlanDate(payload.planDate) ?? existingMealPlan.planDate,
      dateLabel: payload.dateLabel?.trim() || existingMealPlan.dateLabel,
      nutritionScore: payload.nutritionScore,
      waterSuggestion: payload.waterSuggestion,
      items: {
        deleteMany: {},
        create: normalizedEntries.map((entry) => ({
          recipeId: entry.recipeId,
          slot: entry.slot,
          time: entry.time,
          title: entry.title,
          focus: entry.focus
        }))
      }
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    }
  })

  return {
    mealPlan: buildDailyMealPlan({
      ...mealPlan,
      items: mealPlan.items.map((item) => ({
        ...item,
        recipe: item.recipe ?? (item.recipeId ? recipeMap.get(item.recipeId) ?? null : null)
      }))
    })
  }
}

export async function swapMealPlanEntry(userId: string, mealPlanId: string, itemId: string) {
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      userId
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    }
  })

  if (!mealPlan) {
    throw new Error('未找到对应计划')
  }

  const targetItem = mealPlan.items.find((item) => item.id === itemId)

  if (!targetItem) {
    throw new Error('未找到可替换的餐次')
  }

  const usedRecipeIds = mealPlan.items
    .map((item) => item.recipeId)
    .filter((value): value is string => Boolean(value))

  const fallbackCandidates = await prisma.recipe.findMany({
    where: {
      contentStatus: 'published',
      id: {
        notIn: usedRecipeIds
      }
    },
    include: { tags: true },
    orderBy: { updatedAt: 'desc' },
    take: 1
  })

  const nextRecipe = fallbackCandidates[0] ?? await prisma.recipe.findFirst({
    where: {
      contentStatus: 'published',
      id: {
        not: targetItem.recipeId ?? undefined
      }
    },
    include: { tags: true },
    orderBy: { updatedAt: 'desc' }
  })

  if (!nextRecipe) {
    throw new Error('暂无可替换菜谱')
  }

  await prisma.mealPlanItem.update({
    where: { id: itemId },
    data: {
      recipeId: nextRecipe.id,
      title: nextRecipe.title,
      focus: nextRecipe.reviewFocus ?? '均衡搭配'
    }
  })

  const refreshedMealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      userId
    },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              tags: true
            }
          }
        },
        orderBy: { time: 'asc' }
      }
    }
  })

  if (!refreshedMealPlan) {
    throw new Error('计划刷新失败')
  }

  return {
    mealPlan: buildDailyMealPlan(refreshedMealPlan)
  }
}

export async function getBatchRecipeSummaries(recipeIds: string[]) {
  const recipes = await prisma.recipe.findMany({
    where: {
      id: {
        in: [...new Set(recipeIds.filter(Boolean))]
      }
    },
    include: { tags: true }
  })

  return {
    recipes: recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.coverImage ?? '',
      ageLabel: recipe.ageLabel,
      durationLabel: recipe.durationLabel,
      difficultyLabel: recipe.difficultyLabel,
      tags: recipe.tags.map((tag) => tag.name),
      description: recipe.summary ?? ''
    }))
  }
}

function buildGuideStage(stage: {
  key: string
  label: string
  title: string
  description: string
  rules: Array<{ type: string; title: string; foodsJson: string }>
}) {
  const recommendedFoods = stage.rules.find((rule) => rule.type === 'recommended')
    ? JSON.parse(stage.rules.find((rule) => rule.type === 'recommended')!.foodsJson) as string[]
    : []

  return {
    key: stage.key,
    label: stage.label,
    title: stage.title,
    description: stage.description,
    feedingTips: [
      `当前阶段重点：${stage.label} 宝宝逐步建立咀嚼与吞咽节奏。`,
      '新增食材建议单次少量，连续观察 3 天。',
      '优先选择软烂、易吞咽、无刺激的家庭辅食。'
    ],
    rules: stage.rules.map((rule) => ({
      type: rule.type,
      title: rule.title,
      foods: JSON.parse(rule.foodsJson) as string[],
      note: rule.type === 'cautious' ? '建议少量尝试并观察过敏与消化情况。' : undefined
    })),
    dailySchedule: [
      { time: '08:00', title: '早餐', description: recommendedFoods[0] ? `可尝试 ${recommendedFoods[0]} 等温和搭配。` : '以软烂主食和蔬菜搭配为主。' },
      { time: '12:00', title: '午餐', description: recommendedFoods[1] ? `午间可安排 ${recommendedFoods[1]} 等主食组合。` : '安排主食 + 蛋白 + 蔬菜。' },
      { time: '18:00', title: '晚餐', description: recommendedFoods[2] ? `晚餐优先考虑 ${recommendedFoods[2]} 等易消化食物。` : '保持清淡软烂，避免过度刺激。' }
    ]
  }
}

export async function getGuideStageData(stageKey: string) {
  const stage = await prisma.guideStage.findUnique({
    where: { key: stageKey },
    include: { rules: true }
  })

  if (!stage) {
    throw new Error('未找到对应月龄指南')
  }

  return buildGuideStage(stage)
}

export async function getTabooGuideData(symptom: string) {
  const guide = await prisma.symptomGuide.findUnique({
    where: { symptom },
    include: { rules: true }
  })

  const fallbackGuide = guide ?? await prisma.symptomGuide.findFirst({
    include: { rules: true },
    orderBy: { symptom: 'asc' }
  })

  if (!fallbackGuide) {
    throw new Error('数据库中没有病症饮食指导数据')
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { title: { contains: fallbackGuide.symptom } },
        { tags: { some: { name: { contains: fallbackGuide.symptom } } } }
      ]
    },
    include: { tags: true },
    take: 2,
    orderBy: { updatedAt: 'desc' }
  })

  const fallbackRecipes = recipes.length ? recipes : await prisma.recipe.findMany({
    include: { tags: true },
    take: 2,
    orderBy: { updatedAt: 'desc' }
  })

  return {
    symptom: fallbackGuide.symptom,
    title: fallbackGuide.title,
    avoid: fallbackGuide.rules
      .filter((rule) => rule.type === 'avoid')
      .map((rule) => ({ food: rule.food, reason: rule.reason })),
    recommended: fallbackGuide.rules
      .filter((rule) => rule.type === 'recommended')
      .map((rule) => rule.food),
    recipes: fallbackRecipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.coverImage ?? '',
      ageLabel: recipe.ageLabel,
      durationLabel: recipe.durationLabel,
      difficultyLabel: recipe.difficultyLabel,
      tags: recipe.tags.map((tag) => tag.name),
      description: recipe.summary ?? ''
    })),
    medicalTips: [
      '若宝宝持续发热、精神差或食欲明显下降，请及时就医。',
      '若伴随明显脱水、呕吐或血便，请尽快线下就诊。'
    ],
    matched: Boolean(guide),
    resolvedSymptom: fallbackGuide.symptom
  }
}

export async function getRecipeDetailData(recipeId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      tags: true,
      ingredients: true,
      steps: { orderBy: { stepNo: 'asc' } }
    }
  })

  if (!recipe) {
    throw new Error('未找到对应食谱')
  }

  const relatedRecipes = await prisma.recipe.findMany({
    where: {
      id: { not: recipe.id },
      ageLabel: recipe.ageLabel
    },
    include: { tags: true },
    take: 2,
    orderBy: { updatedAt: 'desc' }
  })

  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.coverImage ?? '',
    heroImage: recipe.coverImage ?? '',
    ageLabel: recipe.ageLabel,
    durationLabel: recipe.durationLabel,
    difficultyLabel: recipe.difficultyLabel,
    tags: recipe.tags.map((tag) => tag.name),
    description: recipe.summary ?? '',
    nutritionTips: [
      recipe.reviewFocus ?? '根据宝宝月龄调整颗粒度与软烂度。',
      '首次尝试新食材请少量添加并连续观察。',
      '出锅后先确认温度适宜再喂食。'
    ],
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      amount: ingredient.unit ? `${ingredient.amount}${ingredient.unit}` : ingredient.amount
    })),
    steps: recipe.steps.map((step) => ({
      stepNo: step.stepNo,
      title: step.title,
      description: step.description,
      image: step.imageUrl ?? recipe.coverImage ?? ''
    })),
    relatedRecipes: relatedRecipes.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.coverImage ?? '',
      ageLabel: item.ageLabel,
      durationLabel: item.durationLabel,
      difficultyLabel: item.difficultyLabel,
      tags: item.tags.map((tag) => tag.name),
      description: item.summary ?? ''
    }))
  }
}

export async function getProfilePageData(userId: string) {
  const baby = await getCurrentBaby(userId)
  const hasBaby = Boolean(baby)

  return {
    hasBaby,
    babyProfile: baby ? formatBabyProfile(baby) : null,
    profileMenus: [
      { key: 'baby', title: '宝宝档案', subtitle: hasBaby ? `当前：${baby?.nickname ?? ''} · ${baby?.allergens.length ?? 0} 项过敏原` : '添加宝宝昵称、生日与过敏原', icon: '👶' },
      { key: 'favorite', title: '我的收藏', subtitle: '保存喜欢的辅食与饮食指南', icon: '❤️' },
      { key: 'history', title: '历史记录', subtitle: '查看过往生成计划与查询记录', icon: '🕘' },
      { key: 'allergy', title: '过敏管理', subtitle: hasBaby ? `当前已记录 ${baby?.allergens.length ?? 0} 项过敏原` : '完善宝宝档案后管理过敏原', icon: '⚠️' },
      { key: 'message', title: '消息通知', subtitle: '每日提醒与系统通知', icon: '🔔' },
      { key: 'help', title: '帮助中心', subtitle: '常见问题、意见反馈、使用说明', icon: '💬' },
      { key: 'share', title: '推荐给朋友', subtitle: '一键分享给家人或宝妈群', icon: '🎁' },
      { key: 'logout', title: '退出登录', subtitle: '退出当前微信登录状态', icon: '🚪' }
    ],
    wechatEntries: [
      { key: 'subscribe', title: '订阅每日提醒', icon: '⏰' },
      { key: 'desktop', title: '添加到我的小程序', icon: '➕' },
      { key: 'share', title: '分享小程序', icon: '🔗' }
    ]
  }
}

export async function getRecipeList(options: { tag?: string; search?: string; page?: number } = {}) {
  const { tag, search, page = 1 } = options
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = { contentStatus: 'published' }
  if (tag) {
    where.tags = { some: { name: { contains: tag } } }
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } }
    ]
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: { tags: true },
      orderBy: { favorites: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.recipe.count({ where })
  ])

  return {
    recipes: recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.coverImage ?? '',
      ageLabel: recipe.ageLabel,
      durationLabel: recipe.durationLabel,
      difficultyLabel: recipe.difficultyLabel,
      tags: recipe.tags.map((t) => t.name),
      description: recipe.summary ?? ''
    })),
    total,
    page,
    pageSize,
    hasMore: skip + recipes.length < total
  }
}

export async function getUserFavoriteIds(userId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).userFavorite.findMany({
      where: { userId },
      select: { recipeId: true },
      orderBy: { createdAt: 'desc' }
    })
    return (rows as Array<{ recipeId: string }>).map((r) => r.recipeId)
  } catch {
    // Prisma client not regenerated yet — use raw SQL fallback
    const rows = await prisma.$queryRaw<Array<{ recipe_id: string }>>`
      SELECT recipe_id FROM user_favorites WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    return rows.map((r) => r.recipe_id)
  }
}

export async function addUserFavorite(userId: string, recipeId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).userFavorite.upsert({
      where: { userId_recipeId: { userId, recipeId } },
      update: {},
      create: { userId, recipeId }
    })
  } catch {
    await prisma.$executeRaw`
      INSERT INTO user_favorites (id, user_id, recipe_id, created_at)
      VALUES (concat('fav-', extract(epoch from now())::text, '-', floor(random()*1000000)::text), ${userId}, ${recipeId}, NOW())
      ON CONFLICT (user_id, recipe_id) DO NOTHING
    `
  }
}

export async function removeUserFavorite(userId: string, recipeId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).userFavorite.deleteMany({ where: { userId, recipeId } })
  } catch {
    await prisma.$executeRaw`DELETE FROM user_favorites WHERE user_id = ${userId} AND recipe_id = ${recipeId}`
  }
}

export async function submitUserFeedback(userId: string, content: string) {
  if (!content.trim()) {
    throw new Error('反馈内容不能为空')
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).userFeedback.create({
      data: { userId, content: content.trim() }
    })
  } catch {
    await prisma.$executeRaw`
      INSERT INTO user_feedback (id, user_id, content, created_at)
      VALUES (concat('fb-', extract(epoch from now())::text, '-', floor(random()*1000000)::text), ${userId}, ${content.trim()}, NOW())
    `
  }
}

export async function getAppMessages(userId: string) {
  const baby = await getCurrentBaby(userId)
  const messages: Array<{ title: string; desc: string }> = []

  messages.push({ title: '每日提醒', desc: '建议每天固定时间查看和调整宝宝辅食计划。' })

  if (baby?.allergens.length) {
    const names = baby.allergens.map((a) => a.name).join('、')
    messages.push({ title: '过敏提醒', desc: `${baby.nickname} 已记录 ${baby.allergens.length} 项过敏原（${names}），生成计划时自动规避。` })
  } else {
    messages.push({ title: '过敏提醒', desc: '若新增食材，请少量尝试并连续观察 3 天。' })
  }

  messages.push({ title: '温馨提示', desc: '生病期间可前往"忌口查询"查看适合的饮食建议。' })

  return messages
}
