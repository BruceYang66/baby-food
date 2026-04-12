import { randomBytes } from 'node:crypto'
import { prisma } from '../db/prisma.js'

const homeFeatures = [
  { key: 'generate', title: '生成今日辅食', subtitle: '根据月龄与需求一键生成', icon: '🍚', accent: 'primary', route: '/pages/generate/index' },
  { key: 'plan', title: '本周计划', subtitle: '一周安排清晰不重样', icon: '📅', accent: 'neutral', route: '/pages/plan/index' },
  { key: 'taboo', title: '生病忌口查询', subtitle: '不舒服时快速查能吃什么', icon: '🏥', accent: 'secondary', route: '/pages/taboo/index' },
  { key: 'guide', title: '月龄饮食指南', subtitle: '各月龄吃什么一查便知', icon: '📚', accent: 'neutral', route: '/pages/guide/index' }
] as const

const mealPlanInclude = {
  items: {
    include: {
      recipe: {
        include: {
          tags: true
        }
      },
      customRecipe: true,
      feedingRecords: true
    },
    orderBy: { time: 'asc' as const }
  }
} as const

async function buildHomeShortcuts(babyId: string) {
  const recentPlan = await prisma.mealPlan.findFirst({
    where: { babyId },
    include: mealPlanInclude,
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

function formatMonthAgeLabel(birthDate: Date) {
  const today = new Date()
  const diffDays = Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)))
  const totalMonths = Math.floor(diffDays / 30.44)
  const remainDays = Math.floor(diffDays % 30.44)

  if (totalMonths < 12) {
    return `${totalMonths}个月${remainDays}天`
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return `${years}岁${months}个月${remainDays}天`
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
  userId?: string
  avatarUrl?: string | null
  user?: { avatarUrl: string | null }
  allergens: Array<{ name: string }>
  accessRole?: 'owner' | 'editor' | 'viewer'
  isOwner?: boolean
}) {
  return {
    id: baby.id,
    nickname: baby.nickname,
    monthAgeLabel: formatMonthAgeLabel(baby.birthDate),
    stageLabel: baby.stageLabel,
    birthDate: formatDateKey(baby.birthDate),
    avatar: baby.avatarUrl ?? baby.user?.avatarUrl ?? '',
    allergens: baby.allergens.map((item) => item.name),
    role: baby.accessRole,
    ownerUserId: baby.userId,
    isOwner: baby.isOwner
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

function normalizeTags(tags: string[] = []) {
  return [...new Set(tags.map((item) => item.trim()).filter(Boolean))]
}

function parseJsonStringArray(value?: string | null) {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? normalizeTags(parsed.filter((item): item is string => typeof item === 'string'))
      : []
  } catch {
    return []
  }
}

function parseBirthDate(value: string) {
  const birthDate = new Date(value)

  if (Number.isNaN(birthDate.getTime())) {
    throw new Error('宝宝生日格式不正确')
  }

  return birthDate
}

function createUtcDateOnly(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day))
}

function getToday() {
  const today = new Date()
  return createUtcDateOnly(today.getFullYear(), today.getMonth() + 1, today.getDate())
}

function formatDateKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatPlanDateLabel(date: Date, options: { isToday?: boolean } = {}) {
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  if (options.isToday) {
    return `今天 · ${month}月${day}日`
  }

  return `${date.getUTCFullYear()}年${month}月${day}日`
}

function parsePlanDate(value?: string) {
  if (!value) {
    return null
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = createUtcDateOnly(year, month, day)

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }

  return date
}

function addDays(base: Date, days: number) {
  const nextDate = new Date(base)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function getWeekRange(base = getToday()) {
  const start = addDays(base, -(base.getUTCDay() + 6) % 7)
  const end = addDays(start, 6)
  return { start, end }
}

function getDayLabel(date: Date, today = getToday()) {
  if (formatDateKey(date) === formatDateKey(today)) {
    return '今天'
  }

  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getUTCDay()] ?? ''
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

async function getBabyAccessRecords(userId: string) {
  const [ownedBabies, memberships] = await Promise.all([
    prisma.baby.findMany({
      where: { userId },
      include: { allergens: true },
      orderBy: { birthDate: 'asc' }
    }),
    prisma.babyMember.findMany({
      where: { userId },
      include: {
        baby: {
          include: {
            allergens: true,
            user: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  ])

  const accessMap = new Map<string, {
    baby: typeof ownedBabies[number]
    role: 'owner' | 'editor' | 'viewer'
    isOwner: boolean
  }>()

  for (const baby of ownedBabies) {
    accessMap.set(baby.id, {
      baby,
      role: 'owner',
      isOwner: true
    })
  }

  for (const membership of memberships) {
    const role = membership.role === 'owner'
      ? 'owner'
      : membership.role === 'viewer'
        ? 'viewer'
        : 'editor'
    const existing = accessMap.get(membership.babyId)

    if (existing?.isOwner) {
      continue
    }

    accessMap.set(membership.babyId, {
      baby: membership.baby,
      role,
      isOwner: role === 'owner'
    })
  }

  return Array.from(accessMap.values())
}

async function getAccessibleBabies(userId: string) {
  return (await getBabyAccessRecords(userId)).map(({ baby, role, isOwner }) => ({
    ...formatBabyProfile({
      ...baby,
      userId: baby.userId,
      accessRole: role,
      isOwner
    })
  }))
}

async function getActiveBabyId(userId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { activeBabyId: true } as any })
    return (user as any)?.activeBabyId ?? null
  } catch {
    const rows = await prisma.$queryRaw<Array<{ active_baby_id: string | null }>>`
      SELECT active_baby_id FROM users WHERE id = ${userId} LIMIT 1
    `
    return rows[0]?.active_baby_id ?? null
  }
}

async function setActiveBabyId(userId: string, babyId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.update({ where: { id: userId }, data: { activeBabyId: babyId } as any })
  } catch {
    await prisma.$executeRaw`UPDATE users SET active_baby_id = ${babyId} WHERE id = ${userId}`
  }
}

async function ensureBabyMembership(userId: string, babyId: string, options: { role?: 'owner' | 'editor' | 'viewer'; displayName?: string | null } = {}) {
  const role = options.role ?? 'owner'
  const displayName = options.displayName?.trim() || null

  const existing = await prisma.babyMember.findFirst({
    where: { babyId, userId }
  })

  if (existing) {
    await prisma.babyMember.update({
      where: { id: existing.id },
      data: {
        role: role === 'owner' ? 'owner' : role === 'viewer' ? 'viewer' : 'collaborator',
        displayName: displayName ?? existing.displayName ?? null
      }
    })
    return
  }

  await prisma.babyMember.create({
    data: {
      babyId,
      userId,
      role: role === 'owner' ? 'owner' : role === 'viewer' ? 'viewer' : 'collaborator',
      displayName
    }
  })
}

async function getCurrentBaby(userId: string) {
  const [activeBabyId, accessRecords] = await Promise.all([
    getActiveBabyId(userId),
    getBabyAccessRecords(userId)
  ])

  const preferred = activeBabyId
    ? accessRecords.find((record) => record.baby.id === activeBabyId)
    : undefined
  const current = preferred ?? accessRecords[0]

  if (!current) {
    return null
  }

  return {
    ...current.baby,
    accessRole: current.role,
    isOwner: current.isOwner
  }
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

function isSameDate(left: Date, right: Date) {
  return formatDateKey(left) === formatDateKey(right)
}

function getPlanDateLabel(planDate: Date, rawLabel?: string) {
  const explicitLabel = rawLabel?.trim()

  if (explicitLabel) {
    return explicitLabel
  }

  return formatPlanDateLabel(planDate, { isToday: isSameDate(planDate, getToday()) })
}

async function buildPreviewMealPlan(
  baby: { birthDate: Date; allergens: Array<{ name: string }> },
  options: { mealCount?: string; goals?: string[]; planDate?: Date } = {}
) {
  const mealCount = options.mealCount ?? '3餐'
  const selectedGoals = options.goals?.length ? options.goals : ['补钙']
  const planDate = options.planDate ?? getToday()
  const monthAge = getMonthAge(baby.birthDate)
  const allergenNames = baby.allergens.map((item) => item.name)
  const slotCount = mealCount === '2餐' ? 2 : 3
  const recipes = await getMealPlanRecipes(slotCount, selectedGoals, [])
  const safeRecipes = recipes.filter((recipe) =>
    !allergenNames.some((allergen) => recipe.title.includes(allergen) || recipe.tags.some((tag) => tag.name.includes(allergen)))
  )
  const finalRecipes = safeRecipes.length >= slotCount ? safeRecipes : recipes
  const entries: Array<{
    id: string
    recipeId?: string
    customRecipeId?: string
    isCustom?: boolean
    slot: string
    time: string
    title: string
    image: string
    tags: string[]
    focus: string
  }> = finalRecipes.slice(0, slotCount).map((recipe, index) => ({
    id: `generated-${formatDateKey(planDate)}-${recipe.id}-${index}`,
    recipeId: recipe.id,
    slot: mealSlots[index]?.slot ?? 'dinner',
    time: mealSlots[index]?.time ?? '18:00',
    title: recipe.title,
    image: recipe.coverImage ?? '',
    tags: recipe.tags.map((tag) => tag.name),
    focus: recipe.reviewFocus ?? selectedGoals[0] ?? '均衡搭配'
  }))

  if (mealCount === '3餐+点心') {
    const snackCandidates = await getMealPlanRecipes(1, ['能量加餐', '手抓点心', '加餐'], finalRecipes.map((recipe) => recipe.id))
    const snackRecipe = snackCandidates[0]

    if (snackRecipe) {
      entries.push({
        id: `generated-${formatDateKey(planDate)}-snack-${snackRecipe.id}`,
        recipeId: snackRecipe.id,
        slot: 'snack',
        time: '15:30',
        title: snackRecipe.title,
        image: snackRecipe.coverImage ?? '',
        tags: snackRecipe.tags.map((tag) => tag.name),
        focus: snackRecipe.reviewFocus ?? '午后加餐'
      })
    } else {
      entries.push({
        id: `generated-${formatDateKey(planDate)}-snack-fallback`,
        isCustom: true,
        slot: 'snack',
        time: '15:30',
        title: '牛油果酸奶水果杯',
        image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80',
        tags: ['能量加餐', '顺滑易吞咽'],
        focus: '午后补能量'
      })
    }
  }

  return {
    id: '',
    isSaved: false,
    title: isSameDate(planDate, getToday()) ? '今日辅食计划' : `${formatPlanDateLabel(planDate)}推荐计划`,
    planDate: formatDateKey(planDate),
    dateLabel: getPlanDateLabel(planDate),
    nutritionScore: Math.min(100, 90 + selectedGoals.length),
    waterSuggestion: mealCount === '3餐+点心' ? '500ml' : getWaterSuggestion(monthAge),
    entries
  }
}

function buildMealEntries(items: Array<{
  id: string
  recipeId: string | null
  customRecipeId: string | null
  slot: string
  time: string
  title: string
  focus: string | null
  snapshotTitle: string | null
  snapshotFocus: string | null
  snapshotImage: string | null
  snapshotTagsJson: string | null
  recipe: { coverImage: string | null; tags: Array<{ name: string }> } | null
  customRecipe: { coverImage: string | null; tagsJson: string } | null
  feedingRecords: Array<{
    id: string
    mealPlanId: string
    mealPlanItemId: string
    status: 'fed' | 'skipped'
    note: string | null
    fedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }>
}>) {
  return items.map((item) => {
    const image = item.recipe?.coverImage
      ?? item.snapshotImage
      ?? item.customRecipe?.coverImage
      ?? ''
    const tags = item.recipe
      ? item.recipe.tags.map((tag) => tag.name)
      : item.snapshotTagsJson
        ? parseJsonStringArray(item.snapshotTagsJson)
        : parseJsonStringArray(item.customRecipe?.tagsJson)
    const feedingRecord = item.feedingRecords[0]

    return {
      id: item.id,
      recipeId: item.recipeId ?? undefined,
      customRecipeId: item.customRecipeId ?? undefined,
      isCustom: !item.recipeId,
      slot: item.slot,
      time: item.time,
      title: item.snapshotTitle ?? item.title,
      image,
      tags,
      focus: item.snapshotFocus ?? item.focus ?? '均衡搭配',
      feedingRecord: feedingRecord
        ? {
            id: feedingRecord.id,
            mealPlanId: feedingRecord.mealPlanId,
            mealPlanItemId: feedingRecord.mealPlanItemId,
            status: feedingRecord.status,
            note: feedingRecord.note ?? undefined,
            fedAt: feedingRecord.fedAt?.toISOString(),
            createdAt: feedingRecord.createdAt.toISOString(),
            updatedAt: feedingRecord.updatedAt.toISOString()
          }
        : undefined
    }
  })
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
    customRecipeId: string | null
    slot: string
    time: string
    title: string
    focus: string | null
    snapshotTitle: string | null
    snapshotFocus: string | null
    snapshotImage: string | null
    snapshotTagsJson: string | null
    recipe: { coverImage: string | null; tags: Array<{ name: string }> } | null
    customRecipe: { coverImage: string | null; tagsJson: string } | null
    feedingRecords: Array<{
      id: string
      mealPlanId: string
      mealPlanItemId: string
      status: 'fed' | 'skipped'
      note: string | null
      fedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }>
  }>
}) {
  return {
    id: mealPlan.id,
    isSaved: true,
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
  customRecipeId?: string
  slot: string
  time: string
  title: string
  focus: string
  image?: string
  tags?: string[]
  isCustom?: boolean
}>) {
  return entries
    .map((entry) => ({
      recipeId: entry.recipeId,
      customRecipeId: entry.customRecipeId,
      slot: entry.slot,
      time: entry.time,
      title: entry.title.trim(),
      focus: entry.focus.trim(),
      image: entry.image?.trim() ?? '',
      tags: normalizeTags(entry.tags ?? []),
      isCustom: entry.isCustom ?? !entry.recipeId
    }))
    .filter((entry) => entry.title)
}

async function resolveMealPlanEntryCreates(
  babyId: string,
  entries: ReturnType<typeof normalizeMealPlanEntries>
) {
  return Promise.all(entries.map(async (entry) => {
    if (!entry.isCustom && entry.recipeId) {
      return {
        recipeId: entry.recipeId,
        customRecipeId: null,
        slot: entry.slot,
        time: entry.time,
        title: entry.title,
        focus: entry.focus,
        snapshotTitle: null,
        snapshotFocus: null,
        snapshotImage: null,
        snapshotTagsJson: null
      }
    }

    let customRecipeId = entry.customRecipeId ?? null

    if (customRecipeId) {
      const existing = await prisma.customRecipe.findFirst({
        where: { id: customRecipeId, babyId }
      })

      if (!existing) {
        customRecipeId = null
      }
    }

    if (customRecipeId) {
      await prisma.customRecipe.update({
        where: { id: customRecipeId },
        data: {
          title: entry.title,
          focus: entry.focus,
          coverImage: entry.image || null,
          tagsJson: JSON.stringify(entry.tags)
        }
      })
    } else {
      const customRecipe = await prisma.customRecipe.create({
        data: {
          babyId,
          title: entry.title,
          focus: entry.focus,
          coverImage: entry.image || null,
          tagsJson: JSON.stringify(entry.tags)
        }
      })
      customRecipeId = customRecipe.id
    }

    return {
      recipeId: null,
      customRecipeId,
      slot: entry.slot,
      time: entry.time,
      title: entry.title,
      focus: entry.focus,
      snapshotTitle: entry.title,
      snapshotFocus: entry.focus,
      snapshotImage: entry.image || null,
      snapshotTagsJson: JSON.stringify(entry.tags)
    }
  }))
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
    babyProfile: baby ? formatBabyProfile(baby) : null,
    accessibleBabies: await getAccessibleBabies(userId)
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

  await ensureBabyMembership(userId, baby.id, { role: 'owner' })
  await setActiveBabyId(userId, baby.id)

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
  const [babies, activeBabyId] = await Promise.all([
    getAccessibleBabies(userId),
    getActiveBabyId(userId)
  ])

  return {
    babies: babies.map((baby) => ({ ...baby, isActive: baby.id === activeBabyId }))
  }
}

export async function setActiveBaby(userId: string, babyId: string) {
  const babies = await getAccessibleBabies(userId)
  const baby = babies.find((item) => item.id === babyId)

  if (!baby) {
    throw new Error('未找到可编辑的宝宝档案')
  }

  await setActiveBabyId(userId, babyId)
  return { babyProfile: { ...baby, isActive: true } }
}

export async function getHomePageData(userId: string) {
  const baby = await ensureCurrentBaby(userId)
  const anyPlan = await prisma.mealPlan.findFirst({ where: { babyId: baby.id } })

  return {
    babyProfile: formatBabyProfile(baby),
    homeFeatures,
    homeShortcuts: await buildHomeShortcuts(baby.id),
    ingredientHighlights,
    hasAnyPlan: Boolean(anyPlan)
  }
}

export async function getGeneratePageData(userId: string, mealCount = '3餐', goals: string[] = []) {
  const baby = await ensureCurrentBaby(userId)
  const previewPlan = await buildPreviewMealPlan(baby, { mealCount, goals, planDate: getToday() })

  return {
    babyProfile: formatBabyProfile(baby),
    todayMealPlan: previewPlan,
    nutritionGoals
  }
}

export async function getPlanPageData(userId: string) {
  const baby = await ensureCurrentBaby(userId)
  const today = getToday()
  const todayKey = formatDateKey(today)
  const { start, end } = getWeekRange(today)
  const mealPlans = await prisma.mealPlan.findMany({
    where: { babyId: baby.id },
    include: mealPlanInclude,
    orderBy: {
      planDate: 'desc'
    }
  })

  const todaySavedPlan = mealPlans.find((plan) => isSameDate(plan.planDate, today))
  const currentPlan = todaySavedPlan ? buildDailyMealPlan(todaySavedPlan) : await buildPreviewMealPlan(baby, { planDate: today })
  const historyPlans = mealPlans
  const weeklyPlans = mealPlans.filter((plan) => plan.planDate >= start && plan.planDate <= end)
  const weeklyMap = new Map(weeklyPlans.map((plan) => [formatDateKey(plan.planDate), plan]))
  const fallbackPreview = currentPlan
  const weeklyPlanDays = await Promise.all(Array.from({ length: 7 }, async (_, index) => {
    const planDate = addDays(start, index)
    const dateKey = formatDateKey(planDate)
    const existingPlan = weeklyMap.get(dateKey)

    if (existingPlan) {
      return {
        id: existingPlan.id,
        planDate: dateKey,
        dateLabel: formatPlanDateLabel(planDate, { isToday: dateKey === todayKey }).replace(/^今天 · /, ''),
        dayLabel: getDayLabel(planDate, today),
        summary: `${existingPlan.items.length} 餐安排`,
        recipeTitles: existingPlan.items.map((item) => item.snapshotTitle ?? item.title).slice(0, 3),
        recipeIds: existingPlan.items.map((item) => item.recipeId).filter((item): item is string => Boolean(item)).slice(0, 3),
        completionRate: existingPlan.nutritionScore,
        tagLabel: dateKey === todayKey ? '今日' : '已保存',
        isRecommended: false,
        mealPlan: buildDailyMealPlan(existingPlan)
      }
    }

    const recommendedPlan = await buildPreviewMealPlan(baby, { planDate })
    const completionRate = Math.max(88, fallbackPreview.nutritionScore - 4 + (index % 3))

    return {
      id: `recommended-${dateKey}`,
      planDate: dateKey,
      dateLabel: formatPlanDateLabel(planDate, { isToday: dateKey === todayKey }).replace(/^今天 · /, ''),
      dayLabel: getDayLabel(planDate, today),
      summary: `推荐 ${recommendedPlan.entries.length} 餐安排`,
      recipeTitles: recommendedPlan.entries.map((item) => item.title).slice(0, 3),
      recipeIds: recommendedPlan.entries.map((item) => item.recipeId).filter((item): item is string => Boolean(item)).slice(0, 3),
      completionRate,
      tagLabel: '推荐',
      isRecommended: true,
      mealPlan: {
        ...recommendedPlan,
        id: `recommended-${dateKey}`,
        nutritionScore: completionRate
      }
    }
  }))

  return {
    todayMealPlan: currentPlan,
    historyMealPlans: historyPlans.map((plan) => {
      const detail = buildDailyMealPlan(plan)
      return {
        id: plan.id,
        planDate: formatDateKey(plan.planDate),
        dateLabel: plan.dateLabel,
        summary: `${detail.entries.map((item) => item.title).slice(0, 2).join(' / ') || '辅食安排'} · 完成度 ${plan.nutritionScore}%`,
        completionRate: plan.nutritionScore,
        firstFoodName: detail.entries[0]?.title ?? '',
        firstFoodEmoji: '🍚'
      }
    }),
    weeklyPlanDays
  }
}

export async function getMealPlanDetailData(userId: string, mealPlanId: string) {
  const baby = await ensureCurrentBaby(userId)
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      babyId: baby.id
    },
    include: mealPlanInclude
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
    customRecipeId?: string
    slot: string
    time: string
    title: string
    focus: string
    image?: string
    tags?: string[]
    isCustom?: boolean
  }>
}) {
  const baby = await ensureCurrentBaby(userId)
  const targetPlanDate = parsePlanDate(payload.planDate) ?? getToday()

  const existingMealPlan = await prisma.mealPlan.findFirst({
    where: {
      babyId: baby.id,
      planDate: targetPlanDate
    },
    orderBy: { id: 'asc' }
  })

  if (existingMealPlan) {
    return updateMealPlan(userId, existingMealPlan.id, {
      ...payload,
      planDate: formatDateKey(targetPlanDate)
    })
  }

  const normalizedEntries = normalizeMealPlanEntries(payload.entries)
  const entryCreates = await resolveMealPlanEntryCreates(baby.id, normalizedEntries)

  const mealPlan = await prisma.mealPlan.create({
    data: {
      babyId: baby.id,
      title: payload.title?.trim() || '已保存辅食计划',
      planDate: targetPlanDate,
      dateLabel: getPlanDateLabel(targetPlanDate, payload.dateLabel),
      nutritionScore: payload.nutritionScore,
      waterSuggestion: payload.waterSuggestion,
      items: {
        create: entryCreates
      }
    },
    include: mealPlanInclude
  })

  return {
    mealPlan: buildDailyMealPlan(mealPlan)
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
    customRecipeId?: string
    slot: string
    time: string
    title: string
    focus: string
    image?: string
    tags?: string[]
    isCustom?: boolean
  }>
}) {
  const baby = await ensureCurrentBaby(userId)
  const existingMealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      babyId: baby.id
    }
  })

  if (!existingMealPlan) {
    throw new Error('未找到可更新的计划')
  }

  const targetPlanDate = parsePlanDate(payload.planDate) ?? existingMealPlan.planDate
  const dateChanged = !isSameDate(targetPlanDate, existingMealPlan.planDate)

  if (dateChanged) {
    const conflictPlan = await prisma.mealPlan.findFirst({
      where: {
        babyId: baby.id,
        planDate: targetPlanDate,
        id: { not: mealPlanId }
      }
    })

    if (conflictPlan) {
      throw new Error('该日期已有计划，请直接编辑现有计划')
    }
  }

  const normalizedEntries = normalizeMealPlanEntries(payload.entries)
  const entryCreates = await resolveMealPlanEntryCreates(baby.id, normalizedEntries)

  const mealPlan = await prisma.mealPlan.update({
    where: { id: mealPlanId },
    data: {
      title: payload.title?.trim() || existingMealPlan.title,
      planDate: targetPlanDate,
      dateLabel: getPlanDateLabel(targetPlanDate, payload.dateLabel),
      nutritionScore: payload.nutritionScore,
      waterSuggestion: payload.waterSuggestion,
      items: {
        deleteMany: {},
        create: entryCreates
      }
    },
    include: mealPlanInclude
  })

  return {
    mealPlan: buildDailyMealPlan(mealPlan)
  }
}

export async function saveFeedingRecord(userId: string, mealPlanId: string, itemId: string, payload: {
  status: 'fed' | 'skipped'
  note?: string
  fedAt?: string
}) {
  const baby = await ensureCurrentBaby(userId)
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      babyId: baby.id
    },
    include: mealPlanInclude
  })

  if (!mealPlan) {
    throw new Error('未找到对应计划')
  }

  const targetItem = mealPlan.items.find((item) => item.id === itemId)

  if (!targetItem) {
    throw new Error('未找到可记录的餐次')
  }

  const status = payload.status === 'skipped' ? 'skipped' : 'fed'
  const note = payload.note?.trim() || null
  const fedAt = payload.fedAt ? new Date(payload.fedAt) : new Date()

  if (Number.isNaN(fedAt.getTime())) {
    throw new Error('喂养时间格式不正确')
  }

  const feedingRecord = await prisma.feedingRecord.upsert({
    where: {
      mealPlanItemId: itemId
    },
    create: {
      mealPlanId,
      mealPlanItemId: itemId,
      status,
      note,
      fedAt
    },
    update: {
      status,
      note,
      fedAt
    }
  })

  const refreshedMealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      babyId: baby.id
    },
    include: mealPlanInclude
  })

  if (!refreshedMealPlan) {
    throw new Error('计划刷新失败')
  }

  return {
    mealPlan: buildDailyMealPlan(refreshedMealPlan),
    feedingRecord: {
      id: feedingRecord.id,
      mealPlanId: feedingRecord.mealPlanId,
      mealPlanItemId: feedingRecord.mealPlanItemId,
      status: feedingRecord.status,
      note: feedingRecord.note ?? undefined,
      fedAt: feedingRecord.fedAt?.toISOString(),
      createdAt: feedingRecord.createdAt.toISOString(),
      updatedAt: feedingRecord.updatedAt.toISOString()
    }
  }
}

export async function swapMealPlanEntry(userId: string, mealPlanId: string, itemId: string) {
  const baby = await ensureCurrentBaby(userId)
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      babyId: baby.id
    },
    include: mealPlanInclude
  })

  if (!mealPlan) {
    throw new Error('未找到对应计划')
  }

  const targetItem = mealPlan.items.find((item) => item.id === itemId)

  if (!targetItem) {
    throw new Error('未找到可替换的餐次')
  }

  if (!targetItem.recipeId) {
    throw new Error('自定义菜品暂不支持一键替换，请手动编辑')
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
      customRecipeId: null,
      title: nextRecipe.title,
      focus: nextRecipe.reviewFocus ?? '均衡搭配',
      snapshotTitle: null,
      snapshotFocus: null,
      snapshotImage: null,
      snapshotTagsJson: null
    }
  })

  const refreshedMealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: mealPlanId,
      babyId: baby.id
    },
    include: mealPlanInclude
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

function toFamilyRole(role: 'owner' | 'collaborator' | 'caregiver' | 'viewer') {
  if (role === 'owner') {
    return 'owner' as const
  }

  if (role === 'viewer') {
    return 'viewer' as const
  }

  return 'editor' as const
}

function createInviteCode() {
  return randomBytes(4).toString('hex').toUpperCase()
}

function formatFamilyMember(member: {
  id: string
  userId: string
  role: 'owner' | 'collaborator' | 'caregiver' | 'viewer'
  createdAt: Date
  user: { id: string; nickname: string; avatarUrl: string | null }
}) {
  return {
    id: member.id,
    userId: member.userId,
    nickname: member.user.nickname,
    avatarUrl: member.user.avatarUrl ?? '',
    role: toFamilyRole(member.role),
    joinedAt: member.createdAt.toISOString(),
    isOwner: member.role === 'owner'
  }
}

function formatFamilyInvite(invite: {
  id: string
  babyId: string
  inviteCode: string
  role: 'owner' | 'collaborator' | 'caregiver' | 'viewer'
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired'
  expiresAt: Date | null
  createdAt: Date
  inviterUserId: string
  inviterUser: { nickname: string }
}) {
  return {
    id: invite.id,
    babyId: invite.babyId,
    inviteCode: invite.inviteCode,
    role: toFamilyRole(invite.role),
    status: invite.status === 'declined' ? 'revoked' : invite.status,
    invitedByUserId: invite.inviterUserId,
    invitedByName: invite.inviterUser.nickname,
    expiresAt: (invite.expiresAt ?? addDays(getToday(), 7)).toISOString(),
    createdAt: invite.createdAt.toISOString()
  }
}

async function ensureOwnerBaby(userId: string, babyId?: string) {
  const baby = babyId
    ? await prisma.baby.findFirst({ where: { id: babyId, userId }, include: { allergens: true, user: true } })
    : await ensureCurrentBaby(userId)

  if (!baby || baby.userId !== userId) {
    throw new Error('未找到可编辑的宝宝档案')
  }

  return baby
}

async function ensureAccessibleBaby(userId: string, babyId?: string) {
  if (!babyId) {
    return ensureCurrentBaby(userId)
  }

  const accessRecord = (await getBabyAccessRecords(userId)).find((record) => record.baby.id === babyId)

  if (!accessRecord) {
    throw new Error('未找到可访问的宝宝档案')
  }

  return {
    ...accessRecord.baby,
    accessRole: accessRecord.role,
    isOwner: accessRecord.isOwner
  }
}

export async function getFamilyMembers(userId: string, babyId?: string) {
  const baby = await ensureAccessibleBaby(userId, babyId)
  const members = await prisma.babyMember.findMany({
    where: { babyId: baby.id },
    include: { user: true },
    orderBy: [
      { role: 'asc' },
      { createdAt: 'asc' }
    ]
  })

  return {
    baby: formatBabyProfile(baby),
    members: members.map((member) => ({
      ...formatFamilyMember(member),
      isCurrentUser: member.userId === userId
    }))
  }
}

export async function createFamilyInvite(userId: string, payload: {
  babyId?: string
  role?: 'owner' | 'editor' | 'viewer'
}) {
  const baby = await ensureOwnerBaby(userId, payload.babyId)
  const invite = await prisma.babyInvite.create({
    data: {
      babyId: baby.id,
      inviterUserId: userId,
      role: payload.role === 'viewer' ? 'viewer' : payload.role === 'owner' ? 'owner' : 'collaborator',
      status: 'pending',
      inviteCode: createInviteCode(),
      expiresAt: addDays(getToday(), 7)
    },
    include: {
      inviterUser: {
        select: { nickname: true }
      }
    }
  })

  return {
    invite: formatFamilyInvite(invite)
  }
}

export async function getFamilyInvites(userId: string, babyId?: string) {
  const baby = await ensureAccessibleBaby(userId, babyId)

  if (baby.accessRole !== 'owner' && !baby.isOwner) {
    return {
      baby: formatBabyProfile(baby),
      invites: []
    }
  }

  const invites = await prisma.babyInvite.findMany({
    where: {
      babyId: baby.id,
      status: {
        in: ['pending', 'accepted', 'revoked', 'expired']
      }
    },
    include: {
      inviterUser: {
        select: { nickname: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    baby: formatBabyProfile({ ...baby, accessRole: 'owner', isOwner: true }),
    invites: invites.map((invite) => formatFamilyInvite(invite))
  }
}

export async function acceptFamilyInvite(userId: string, inviteCode: string) {
  const invite = await prisma.babyInvite.findFirst({
    where: { inviteCode },
    include: {
      inviterUser: {
        select: { nickname: true }
      }
    }
  })

  if (!invite || invite.status !== 'pending') {
    throw new Error('邀请不存在或已失效')
  }

  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    await prisma.babyInvite.update({
      where: { id: invite.id },
      data: { status: 'expired', respondedAt: new Date() }
    })
    throw new Error('邀请不存在或已失效')
  }

  await ensureBabyMembership(userId, invite.babyId, {
    role: toFamilyRole(invite.role),
    displayName: invite.inviteeNickname ?? null
  })
  await setActiveBabyId(userId, invite.babyId)

  await prisma.babyInvite.update({
    where: { id: invite.id },
    data: {
      status: 'accepted',
      inviteeUserId: userId,
      respondedAt: new Date()
    }
  })

  return getFamilyMembers(userId, invite.babyId)
}

function buildGuideStage(stage: {
  key: string
  label: string
  title: string
  description: string
  feedingTipsJson: string
  qaJson: string
  dailyScheduleJson: string
  rules: Array<{ type: string; title: string; foodsJson: string }>
}) {
  const feedingTips: string[] = (() => {
    try { return JSON.parse(stage.feedingTipsJson) } catch { return [] }
  })()

  const qaItems: Array<{ q: string; a: string }> = (() => {
    try { return JSON.parse(stage.qaJson) } catch { return [] }
  })()

  const dailySchedule: Array<{ time: string; title: string; description: string }> = (() => {
    try { return JSON.parse(stage.dailyScheduleJson) } catch { return [] }
  })()

  const defaultFeedingTips = feedingTips.length ? feedingTips : [
    `当前阶段重点：${stage.label} 宝宝逐步建立咀嚼与吞咽节奏。`,
    '新增食材建议单次少量，连续观察 3 天。',
    '优先选择软烂、易吞咽、无刺激的家庭辅食。'
  ]

  const recommendedFoods = stage.rules.find((rule) => rule.type === 'recommended')
    ? JSON.parse(stage.rules.find((rule) => rule.type === 'recommended')!.foodsJson) as string[]
    : []

  const defaultDailySchedule = dailySchedule.length ? dailySchedule : [
    { time: '08:00', title: '早餐', description: recommendedFoods[0] ? `可尝试 ${recommendedFoods[0]} 等温和搭配。` : '以软烂主食和蔬菜搭配为主。' },
    { time: '12:00', title: '午餐', description: recommendedFoods[1] ? `午间可安排 ${recommendedFoods[1]} 等主食组合。` : '安排主食 + 蛋白 + 蔬菜。' },
    { time: '18:00', title: '晚餐', description: recommendedFoods[2] ? `晚餐优先考虑 ${recommendedFoods[2]} 等易消化食物。` : '保持清淡软烂，避免过度刺激。' }
  ]

  return {
    key: stage.key,
    label: stage.label,
    title: stage.title,
    description: stage.description,
    feedingTips: defaultFeedingTips,
    qaItems,
    rules: stage.rules.map((rule) => ({
      type: rule.type,
      title: rule.title,
      foods: JSON.parse(rule.foodsJson) as string[],
      note: rule.type === 'cautious' ? '建议少量尝试并观察过敏与消化情况。' : undefined
    })),
    dailySchedule: defaultDailySchedule
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

  return buildGuideStage({
    ...stage,
    feedingTipsJson: (stage as any).feedingTipsJson ?? '[]',
    qaJson: (stage as any).qaJson ?? '[]',
    dailyScheduleJson: (stage as any).dailyScheduleJson ?? '[]'
  })
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
      { key: 'family', title: '家庭协作', subtitle: hasBaby ? baby?.isOwner ? '邀请家人共同查看计划与记录' : `当前身份：${baby?.accessRole === 'viewer' ? '只读成员' : baby?.accessRole === 'owner' ? '拥有者' : '协作成员'}` : '完善宝宝档案后邀请家人协作', icon: '🏠' },
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
