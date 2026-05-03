import { randomBytes } from 'node:crypto'
import { prisma } from '../db/prisma.js'
import { parseKnowledgeSectionMedia } from './knowledgeSectionMedia.js'

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
  backgroundImageUrl?: string | null
  relationshipLabel?: string | null
  gender?: string | null
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
    backgroundImageUrl: baby.backgroundImageUrl ?? undefined,
    relationshipLabel: normalizeBabyRelationshipLabel(baby.relationshipLabel),
    gender: normalizeBabyGender(baby.gender),
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

function normalizeBabyRelationshipLabel(value?: string | null) {
  const normalized = value?.trim().slice(0, 12) ?? ''
  return normalized || undefined
}

function normalizeBabyGender(value?: string | null): 'boy' | 'girl' | undefined {
  return value === 'boy' || value === 'girl' ? value : undefined
}

let ensureBabyProfileColumnsPromise: Promise<void> | null = null

async function ensureBabyProfileColumns() {
  if (!ensureBabyProfileColumnsPromise) {
    ensureBabyProfileColumnsPromise = prisma.$executeRawUnsafe(`
      ALTER TABLE babies
        ADD COLUMN IF NOT EXISTS background_image_url TEXT,
        ADD COLUMN IF NOT EXISTS relationship_label TEXT,
        ADD COLUMN IF NOT EXISTS gender TEXT
    `)
      .then(() => undefined)
      .catch((error) => {
        ensureBabyProfileColumnsPromise = null
        throw error
      })
  }

  await ensureBabyProfileColumnsPromise
}

const generatedUserNicknameSeeds = ['小饭团', '小米粒', '小南瓜', '小月芽', '小奶瓶', '小云朵'] as const
const nicknameCodeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const generatedUserNicknamePattern = /^(小饭团|小米粒|小南瓜|小月芽|小奶瓶|小云朵)(家长)?[A-Z0-9]{4}$/

function pickRandomItem<T>(items: readonly T[]) {
  return items[randomBytes(1)[0] % items.length]
}

function generateNicknameCode(length = 4) {
  return Array.from(randomBytes(length), (byte) => nicknameCodeChars[byte % nicknameCodeChars.length]).join('')
}

function normalizeNicknameSeed(value: string, fallback = '宝宝') {
  const normalized = value.trim().replace(/\s+/g, '').slice(0, 8)
  return normalized || fallback
}

function generateSystemUserNickname() {
  return `${pickRandomItem(generatedUserNicknameSeeds)}${generateNicknameCode()}`
}

function generateBabyBasedUserNickname(babyName: string) {
  return `${normalizeNicknameSeed(babyName)}真可爱${generateNicknameCode()}`
}

function isAutoGeneratedUserNickname(nickname: string) {
  return isWechatPlaceholderNickname(nickname) || generatedUserNicknamePattern.test(nickname)
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

function parseJsonObject<T>(value?: string | null) {
  if (!value) {
    return undefined
  }

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as T : undefined
  } catch {
    return undefined
  }
}

const reminderRepeatTypeMap = {
  once: 'once',
  daily: 'daily',
  'alternate-day': 'alternate_day',
  weekly: 'weekly',
  monthly: 'monthly'
} as const

const reminderCategorySet = new Set(['supplement', 'vaccine', 'growth', 'feeding', 'outing', 'custom'])
const reminderStatusSet = new Set(['pending', 'done'])
const reminderSourceSet = new Set(['local', 'manual', 'system'])
const feedingJournalTypeMap = {
  breast: 'breast',
  formula: 'formula',
  'bottle-breast': 'bottle_breast',
  sleep: 'sleep',
  diaper: 'diaper',
  pump: 'pump',
  solid: 'solid',
  bath: 'bath',
  play: 'play',
  swim: 'swim',
  water: 'water',
  supplement: 'supplement',
  other: 'other'
} as const
const feedingJournalTypeReverseMap = {
  breast: 'breast',
  formula: 'formula',
  bottle_breast: 'bottle-breast',
  sleep: 'sleep',
  diaper: 'diaper',
  pump: 'pump',
  solid: 'solid',
  bath: 'bath',
  play: 'play',
  swim: 'swim',
  water: 'water',
  supplement: 'supplement',
  other: 'other'
} as const

function parseReminderRepeatType(value?: string) {
  if (!value || !(value in reminderRepeatTypeMap)) {
    throw new Error('提醒重复方式不正确')
  }

  return reminderRepeatTypeMap[value as keyof typeof reminderRepeatTypeMap]
}

function formatReminderRepeatType(value: string) {
  return value === 'alternate_day' ? 'alternate-day' : value
}

function toReminderRepeatTypeDbValue(value: string) {
  return value === 'alternate_day' ? 'alternate-day' : value
}

function parseReminderCategory(value?: string) {
  if (!value || !reminderCategorySet.has(value)) {
    throw new Error('提醒分类不正确')
  }

  return value as 'supplement' | 'vaccine' | 'growth' | 'feeding' | 'outing' | 'custom'
}

function parseReminderStatus(value?: string) {
  if (!value || !reminderStatusSet.has(value)) {
    throw new Error('提醒状态不正确')
  }

  return value as 'pending' | 'done'
}

function normalizeReminderSource(value?: string | null) {
  if (!value || !reminderSourceSet.has(value)) {
    return 'manual'
  }

  return value
}

function parseFeedingJournalType(value?: string) {
  if (!value || !(value in feedingJournalTypeMap)) {
    throw new Error('喂养记录类型不正确')
  }

  return feedingJournalTypeMap[value as keyof typeof feedingJournalTypeMap]
}

function formatFeedingJournalType(value: string) {
  return feedingJournalTypeReverseMap[value as keyof typeof feedingJournalTypeReverseMap] ?? value
}

function parseTimeLabel(value?: string | null, options: { required?: boolean; errorMessage?: string } = {}) {
  const normalized = value?.trim() ?? ''

  if (!normalized) {
    if (options.required) {
      throw new Error(options.errorMessage || '时间格式不正确')
    }

    return null
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(normalized)) {
    throw new Error(options.errorMessage || '时间格式不正确')
  }

  return normalized
}

function parseNumberValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function getMonthRange(base = getToday()) {
  const start = createUtcDateOnly(base.getUTCFullYear(), base.getUTCMonth() + 1, 1)
  const end = createUtcDateOnly(base.getUTCFullYear(), base.getUTCMonth() + 2, 0)
  return { start, end }
}

type VaccineScheduleRow = {
  id: string
  name: string
  disease: string
  stageLabel: string
  recommendedAgeLabel: string
  category: 'free' | 'optional'
  description: string | null
  precautionsJson: string | null
  sortOrder: number
}

type VaccineRecordRow = {
  id: string
  babyId: string
  scheduleId: string
  status: 'pending' | 'completed' | 'optional'
  vaccinatedAt: Date | null
  note: string | null
  createdAt: Date
  updatedAt: Date
}

type KnowledgeArticleRow = {
  id: string
  title: string
  subtitle: string
  summary: string
  coverImage: string | null
  categoryKey: string
  categoryLabel: string
  tagsJson: string | null
  contentType: 'article' | 'guide' | 'taboo'
  content: string
  isFeatured: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const vaccineTips = [
  {
    title: '接种前先确认宝宝状态',
    description: '发热、急性腹泻或医生明确建议暂缓时，先和门诊沟通再安排接种。'
  },
  {
    title: '带好接种本与既往记录',
    description: '家庭成员代为陪同也能快速确认上一针时间，避免漏种或重复预约。'
  },
  {
    title: '接种后观察 30 分钟',
    description: '若出现持续高热、精神差或明显皮疹，请及时联系接种门诊或就医。'
  }
] as const

function buildRecipeSummary(recipe: {
  id: string
  title: string
  coverImage: string | null
  ageLabel: string
  ageMinMonths?: number | null
  ageMaxMonths?: number | null
  durationLabel: string
  difficultyLabel: string
  summary: string | null
  tags: Array<{ name: string }>
}) {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.coverImage ?? '',
    ageLabel: getRecipeAgeLabel(recipe),
    ageMinMonths: typeof recipe.ageMinMonths === 'number' ? recipe.ageMinMonths : undefined,
    ageMaxMonths: typeof recipe.ageMaxMonths === 'number' ? recipe.ageMaxMonths : null,
    durationLabel: recipe.durationLabel,
    difficultyLabel: recipe.difficultyLabel,
    tags: recipe.tags.map((tag) => tag.name),
    description: recipe.summary ?? ''
  }
}

function buildKnowledgeRoute(article: Pick<KnowledgeArticleRow, 'contentType'>) {
  if (article.contentType === 'guide') {
    return '/pages/guide/index'
  }

  if (article.contentType === 'taboo') {
    return '/pages/taboo/index'
  }

  return '/pages/knowledge/index'
}

function buildKnowledgeArticleSummary(article: Pick<KnowledgeArticleRow, 'id' | 'title' | 'subtitle' | 'summary' | 'coverImage' | 'categoryKey' | 'categoryLabel' | 'tagsJson' | 'contentType'>) {
  return {
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    image: article.coverImage ?? undefined,
    categoryKey: article.categoryKey,
    categoryLabel: article.categoryLabel,
    tags: parseJsonStringArray(article.tagsJson),
    contentType: article.contentType,
    route: buildKnowledgeRoute(article)
  }
}

async function getVaccineScheduleRows() {
  try {
    return await (prisma as any).vaccineSchedule.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { recommendedAgeLabel: 'asc' }
      ]
    }) as VaccineScheduleRow[]
  } catch {
    return prisma.$queryRaw<VaccineScheduleRow[]>`
      SELECT
        id,
        name,
        disease,
        stage_label AS "stageLabel",
        recommended_age_label AS "recommendedAgeLabel",
        category,
        description,
        precautions_json AS "precautionsJson",
        sort_order AS "sortOrder"
      FROM vaccine_schedules
      ORDER BY sort_order ASC, recommended_age_label ASC
    `
  }
}

async function getVaccineScheduleRow(scheduleId: string) {
  try {
    return await (prisma as any).vaccineSchedule.findUnique({
      where: { id: scheduleId }
    }) as VaccineScheduleRow | null
  } catch {
    const rows = await prisma.$queryRaw<VaccineScheduleRow[]>`
      SELECT
        id,
        name,
        disease,
        stage_label AS "stageLabel",
        recommended_age_label AS "recommendedAgeLabel",
        category,
        description,
        precautions_json AS "precautionsJson",
        sort_order AS "sortOrder"
      FROM vaccine_schedules
      WHERE id = ${scheduleId}
      LIMIT 1
    `
    return rows[0] ?? null
  }
}

async function getVaccineRecordRows(babyId: string) {
  try {
    return await (prisma as any).vaccineRecord.findMany({
      where: { babyId },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    }) as VaccineRecordRow[]
  } catch {
    return prisma.$queryRaw<VaccineRecordRow[]>`
      SELECT
        id,
        baby_id AS "babyId",
        schedule_id AS "scheduleId",
        status,
        vaccinated_at AS "vaccinatedAt",
        note,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM vaccine_records
      WHERE baby_id = ${babyId}
      ORDER BY updated_at DESC, created_at DESC
    `
  }
}

async function getPublishedKnowledgeArticles() {
  try {
    return await (prisma as any).knowledgeArticle.findMany({
      where: { contentStatus: 'published' },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { updatedAt: 'desc' }
      ]
    }) as KnowledgeArticleRow[]
  } catch {
    return prisma.$queryRaw<KnowledgeArticleRow[]>`
      SELECT
        id,
        title,
        subtitle,
        summary,
        cover_image AS "coverImage",
        category_key AS "categoryKey",
        category_label AS "categoryLabel",
        tags_json AS "tagsJson",
        content_type AS "contentType",
        content,
        is_featured AS "isFeatured",
        sort_order AS "sortOrder",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM knowledge_articles
      WHERE content_status = 'published'
      ORDER BY is_featured DESC, sort_order ASC, updated_at DESC
    `
  }
}

async function getKnowledgeArticleRow(articleId: string) {
  try {
    return await (prisma as any).knowledgeArticle.findFirst({
      where: { id: articleId, contentStatus: 'published' }
    }) as KnowledgeArticleRow | null
  } catch {
    const rows = await prisma.$queryRaw<KnowledgeArticleRow[]>`
      SELECT
        id,
        title,
        subtitle,
        summary,
        cover_image AS "coverImage",
        category_key AS "categoryKey",
        category_label AS "categoryLabel",
        tags_json AS "tagsJson",
        content_type AS "contentType",
        content,
        is_featured AS "isFeatured",
        sort_order AS "sortOrder",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM knowledge_articles
      WHERE id = ${articleId} AND content_status = 'published'
      LIMIT 1
    `
    return rows[0] ?? null
  }
}

async function getUserKnowledgeFavoriteArticleIds(userId: string) {
  try {
    const rows = await (prisma as any).userKnowledgeFavorite.findMany({
      where: { userId },
      select: { articleId: true },
      orderBy: { createdAt: 'desc' }
    }) as Array<{ articleId: string }>
    return rows.map((row) => row.articleId)
  } catch {
    const rows = await prisma.$queryRaw<Array<{ articleId: string }>>`
      SELECT article_id AS "articleId"
      FROM user_knowledge_favorites
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return rows.map((row) => row.articleId)
  }
}

function parseOptionalDate(value?: string) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  const parsed = parsePlanDate(normalized)

  if (!parsed) {
    throw new Error('接种日期格式不正确')
  }

  return parsed
}

function buildVaccineRecordItem(schedule: VaccineScheduleRow, record?: VaccineRecordRow) {
  return {
    id: record?.id ?? schedule.id,
    name: schedule.name,
    disease: schedule.disease,
    stageLabel: schedule.stageLabel,
    recommendedAgeLabel: schedule.recommendedAgeLabel,
    category: schedule.category,
    description: schedule.description ?? undefined,
    precautions: parseJsonStringArray(schedule.precautionsJson),
    status: record?.status ?? (schedule.category === 'optional' ? 'optional' : 'pending'),
    vaccinatedAt: record?.vaccinatedAt ? formatDateKey(record.vaccinatedAt) : undefined,
    note: record?.note ?? undefined
  }
}

function buildKnowledgeCategories(articles: Array<Pick<KnowledgeArticleRow, 'categoryKey' | 'categoryLabel'>>) {
  const categories = [{ key: 'all', label: '全部' }]
  const categoryMap = new Map<string, string>()

  for (const article of articles) {
    if (!categoryMap.has(article.categoryKey)) {
      categoryMap.set(article.categoryKey, article.categoryLabel)
      categories.push({ key: article.categoryKey, label: article.categoryLabel })
    }
  }

  return categories
}

function buildKnowledgeArticleDetail(
  article: KnowledgeArticleRow,
  options: { isFavorite: boolean; relatedArticles: KnowledgeArticleRow[] }
) {
  return {
    ...buildKnowledgeArticleSummary(article),
    content: article.content,
    isFavorite: options.isFavorite,
    relatedArticles: options.relatedArticles.map((item) => buildKnowledgeArticleSummary(item))
  }
}

function parseKnowledgeRouteId(route: string) {
  const matched = route.match(/[?&]id=([^&]+)/)
  return matched ? decodeURIComponent(matched[1]) : ''
}

function ensureKnowledgeArticleExists(articleId: string) {
  if (!articleId.trim()) {
    throw new Error('未找到对应知识内容')
  }

  return articleId.trim()
}

function buildKnowledgeArticleRouteWithId(article: Pick<KnowledgeArticleRow, 'id' | 'contentType'>) {
  if (article.contentType === 'article') {
    return `/pages/knowledge/index?id=${article.id}`
  }

  return buildKnowledgeRoute(article)
}

function buildKnowledgeArticleSummaryWithDetailRoute(article: Pick<KnowledgeArticleRow, 'id' | 'title' | 'subtitle' | 'summary' | 'coverImage' | 'categoryKey' | 'categoryLabel' | 'tagsJson' | 'contentType'>) {
  return {
    ...buildKnowledgeArticleSummary(article),
    route: buildKnowledgeArticleRouteWithId(article)
  }
}

function buildKnowledgeArticleDetailResponse(
  article: KnowledgeArticleRow,
  isFavorite: boolean,
  relatedArticles: KnowledgeArticleRow[]
) {
  return {
    ...buildKnowledgeArticleSummaryWithDetailRoute(article),
    content: article.content,
    isFavorite,
    relatedArticles: relatedArticles.map((item) => buildKnowledgeArticleSummaryWithDetailRoute(item))
  }
}

function buildKnowledgePageArticleSummary(article: Pick<KnowledgeArticleRow, 'id' | 'title' | 'subtitle' | 'summary' | 'coverImage' | 'categoryKey' | 'categoryLabel' | 'tagsJson' | 'contentType'>) {
  if (article.contentType === 'article') {
    return buildKnowledgeArticleSummaryWithDetailRoute(article)
  }

  return buildKnowledgeArticleSummary(article)
}

function buildKnowledgePageArticleList(articles: KnowledgeArticleRow[]) {
  return articles.map((article) => buildKnowledgePageArticleSummary(article))
}

function buildFeaturedKnowledgeArticle(article: KnowledgeArticleRow | null) {
  if (!article) {
    return null
  }

  return buildKnowledgePageArticleSummary(article)
}

function buildRelatedKnowledgeArticles(article: KnowledgeArticleRow, allArticles: KnowledgeArticleRow[]) {
  return allArticles
    .filter((item) => item.id !== article.id)
    .sort((left, right) => {
      const leftScore = Number(left.categoryKey === article.categoryKey) + Number(left.contentType === article.contentType)
      const rightScore = Number(right.categoryKey === article.categoryKey) + Number(right.contentType === article.contentType)
      return rightScore - leftScore
    })
    .slice(0, 2)
}

function buildFavoriteKnowledgeItems(
  articles: KnowledgeArticleRow[],
  favoriteIds: string[],
  createdAtMap: Map<string, string>
) {
  return favoriteIds
    .map((articleId) => articles.find((article) => article.id === articleId))
    .filter((article): article is KnowledgeArticleRow => Boolean(article))
    .map((article) => ({
      id: article.id,
      savedAt: createdAtMap.get(article.id) ?? '',
      article: buildKnowledgePageArticleSummary(article)
    }))
}

async function getUserKnowledgeFavoriteCreatedAtMap(userId: string) {
  try {
    const rows = await (prisma as any).userKnowledgeFavorite.findMany({
      where: { userId },
      select: { articleId: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    }) as Array<{ articleId: string; createdAt: Date }>
    return new Map(rows.map((row) => [row.articleId, row.createdAt.toISOString()]))
  } catch {
    const rows = await prisma.$queryRaw<Array<{ articleId: string; createdAt: Date }>>`
      SELECT article_id AS "articleId", created_at AS "createdAt"
      FROM user_knowledge_favorites
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return new Map(rows.map((row) => [row.articleId, row.createdAt.toISOString()]))
  }
}

async function getUserFavoriteRows(userId: string) {
  try {
    const rows = await (prisma as any).userFavorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: { tags: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as Array<{
      id: string
      recipeId: string
      createdAt: Date
      recipe: {
        id: string
        title: string
        coverImage: string | null
        ageLabel: string
        durationLabel: string
        difficultyLabel: string
        summary: string | null
        tags: Array<{ name: string }>
      }
    }>
    return rows
  } catch {
    const rows = await prisma.$queryRaw<Array<{
      id: string
      recipeId: string
      createdAt: Date
      recipeTitle: string
      recipeImage: string | null
      ageLabel: string
      durationLabel: string
      difficultyLabel: string
      recipeSummary: string | null
      recipeTagsJson: string | null
    }>>`
      SELECT
        uf.id,
        uf.recipe_id AS "recipeId",
        uf.created_at AS "createdAt",
        r.title AS "recipeTitle",
        r.cover_image AS "recipeImage",
        r.age_label AS "ageLabel",
        r.duration_label AS "durationLabel",
        r.difficulty_label AS "difficultyLabel",
        r.summary AS "recipeSummary",
        COALESCE(json_agg(rt.name ORDER BY rt.name) FILTER (WHERE rt.name IS NOT NULL), '[]'::json)::text AS "recipeTagsJson"
      FROM user_favorites uf
      JOIN recipes r ON r.id = uf.recipe_id
      LEFT JOIN recipe_tags_map rtm ON rtm.recipe_id = r.id
      LEFT JOIN recipe_tags rt ON rt.id = rtm.tag_id
      WHERE uf.user_id = ${userId}
      GROUP BY uf.id, uf.recipe_id, uf.created_at, r.title, r.cover_image, r.age_label, r.duration_label, r.difficulty_label, r.summary
      ORDER BY uf.created_at DESC
    `

    return rows.map((row) => ({
      id: row.id,
      recipeId: row.recipeId,
      createdAt: row.createdAt,
      recipe: {
        id: row.recipeId,
        title: row.recipeTitle,
        coverImage: row.recipeImage,
        ageLabel: row.ageLabel,
        durationLabel: row.durationLabel,
        difficultyLabel: row.difficultyLabel,
        summary: row.recipeSummary,
        tags: parseJsonStringArray(row.recipeTagsJson).map((name) => ({ name }))
      }
    }))
  }
}

function parseFavoriteRecipeItems(rows: Array<{
  id: string
  recipeId: string
  createdAt: Date
  recipe: {
    id: string
    title: string
    coverImage: string | null
    ageLabel: string
    durationLabel: string
    difficultyLabel: string
    summary: string | null
    tags: Array<{ name: string }>
  }
}>) {
  return rows.map((row) => ({
    id: row.id,
    savedAt: row.createdAt.toISOString(),
    recipe: buildRecipeSummary(row.recipe)
  }))
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

function formatTimeKey(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
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

type MonthRange = {
  min: number
  max: number | null
}

function parseAgeLabelToMonthRange(label: string): MonthRange | null {
  const normalized = label.trim().replace(/\s+/g, '')

  if (!normalized) {
    return null
  }

  let match = normalized.match(/^(\d+)-(\d+)月(?:龄)?$/)
  if (match) {
    const min = Number(match[1])
    const max = Number(match[2])
    return { min: Math.min(min, max), max: Math.max(min, max) }
  }

  match = normalized.match(/^(\d+)-(\d+)岁$/)
  if (match) {
    const min = Number(match[1]) * 12
    const max = Number(match[2]) * 12
    return { min: Math.min(min, max), max: Math.max(min, max) }
  }

  match = normalized.match(/^(\d+)个月\+$/)
  if (match) {
    return { min: Number(match[1]), max: null }
  }

  match = normalized.match(/^(\d+)月龄\+$/)
  if (match) {
    return { min: Number(match[1]), max: null }
  }

  match = normalized.match(/^(\d+)岁\+$/)
  if (match) {
    return { min: Number(match[1]) * 12, max: null }
  }

  match = normalized.match(/^(\d+)个月$/)
  if (match) {
    const month = Number(match[1])
    return { min: month, max: month }
  }

  match = normalized.match(/^(\d+)月龄$/)
  if (match) {
    const month = Number(match[1])
    return { min: month, max: month }
  }

  match = normalized.match(/^(\d+)岁(\d+)个月$/)
  if (match) {
    const month = Number(match[1]) * 12 + Number(match[2])
    return { min: month, max: month }
  }

  match = normalized.match(/^(\d+)岁$/)
  if (match) {
    const year = Number(match[1])
    return { min: year * 12, max: year * 12 + 11 }
  }

  return null
}

function formatMonthsAsChinese(totalMonths: number) {
  if (totalMonths < 12) {
    return `${totalMonths}个月`
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (months === 0) {
    return `${years}岁`
  }

  return `${years}岁${months}个月`
}

function formatAgeLabelFromMonthRange(range: MonthRange) {
  if (range.max === null) {
    return `${formatMonthsAsChinese(range.min)}+`
  }

  if (range.min === range.max) {
    return formatMonthsAsChinese(range.min)
  }

  return `${formatMonthsAsChinese(range.min)}-${formatMonthsAsChinese(range.max)}`
}

function fisherYatesShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  // Use a seeded LCG (linear congruential generator) for deterministic but high-entropy shuffle
  let s = (seed >>> 0) || 1
  const next = () => {
    s = Math.imul(1664525, s) + 1013904223
    return (s >>> 0) / 0x100000000
  }
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function isMonthRangeOverlap(left: MonthRange, right: MonthRange) {
  const leftMax = left.max ?? Number.POSITIVE_INFINITY
  const rightMax = right.max ?? Number.POSITIVE_INFINITY

  return left.min <= rightMax && right.min <= leftMax
}

function buildRecipeMonthRange(recipe: { ageMinMonths?: number | null; ageMaxMonths?: number | null; ageLabel: string }): MonthRange | null {
  if (typeof recipe.ageMinMonths === 'number') {
    return {
      min: recipe.ageMinMonths,
      max: typeof recipe.ageMaxMonths === 'number' ? recipe.ageMaxMonths : null
    }
  }

  return parseAgeLabelToMonthRange(recipe.ageLabel)
}

function getRecipeAgeLabel(recipe: { ageLabel: string; ageMinMonths?: number | null; ageMaxMonths?: number | null }) {
  const range = buildRecipeMonthRange(recipe)
  return range ? formatAgeLabelFromMonthRange(range) : recipe.ageLabel
}

function matchRecipeAgeRange(recipeAgeLabel: string, selectedAgeRange: MonthRange | null, recipeAgeMinMonths?: number | null, recipeAgeMaxMonths?: number | null) {
  if (!selectedAgeRange) {
    return true
  }

  const recipeAgeRange = typeof recipeAgeMinMonths === 'number'
    ? { min: recipeAgeMinMonths, max: typeof recipeAgeMaxMonths === 'number' ? recipeAgeMaxMonths : null }
    : parseAgeLabelToMonthRange(recipeAgeLabel)

  if (!recipeAgeRange) {
    return false
  }

  return isMonthRangeOverlap(recipeAgeRange, selectedAgeRange)
}

async function getBabyAccessRecords(userId: string) {
  await ensureBabyProfileColumns()

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

async function setActiveBabyId(userId: string, babyId: string | null) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.update({ where: { id: userId }, data: { activeBabyId: babyId } as any })
  } catch {
    await prisma.$executeRaw`UPDATE users SET active_baby_id = ${babyId} WHERE id = ${userId}`
  }
}

async function syncUserActiveBabyAfterAccessChange(userId: string) {
  const [activeBabyId, accessRecords] = await Promise.all([
    getActiveBabyId(userId),
    getBabyAccessRecords(userId)
  ])

  if (activeBabyId && accessRecords.some((record) => record.baby.id === activeBabyId)) {
    return
  }

  await setActiveBabyId(userId, accessRecords[0]?.baby.id ?? null)
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

async function getUserCanAppAdmin(userId: string) {
  const rows = await prisma.$queryRaw<Array<{ can_app_admin: boolean | null }>>`
    SELECT can_app_admin
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `

  return Boolean(rows[0]?.can_app_admin)
}

async function getMealPlanRecipes(
  limit = 3,
  goals: string[] = [],
  excludeIds: string[] = [],
  randomSeed = 0,
  options: {
    ageRange?: MonthRange
    excludeTags?: string[]
  } = {}
) {
  // Build tag-based filter when goals are specified
  const tagFilter = goals.length
    ? { tags: { some: { name: { in: goals } } } }
    : {}

  const selectedAgeRange = options.ageRange ?? null

  // Build exclude tags filter (NOT condition)
  const excludeTagsFilter = options.excludeTags?.length
    ? { tags: { none: { name: { in: options.excludeTags } } } }
    : {}

  // 添加随机排序以避免每次返回相同的食谱
  const publishedRecipes = await prisma.recipe.findMany({
    where: {
      contentStatus: 'published',
      id: { notIn: excludeIds },
      ...tagFilter,
      ...excludeTagsFilter,
      ...(selectedAgeRange
        ? {
            ageMinMonths: { lte: selectedAgeRange.max ?? 9999 },
            OR: [
              { ageMaxMonths: null },
              { ageMaxMonths: { gte: selectedAgeRange.min } }
            ]
          }
        : {})
    },
    include: { tags: true },
    orderBy: [
      { favorites: 'desc' }
    ],
    take: selectedAgeRange ? limit * 20 : limit * 5
  })

  const ageMatchedRecipes = selectedAgeRange
    ? publishedRecipes.filter((recipe) => matchRecipeAgeRange(recipe.ageLabel, selectedAgeRange, (recipe as any).ageMinMonths, (recipe as any).ageMaxMonths))
    : publishedRecipes

  const shuffled = fisherYatesShuffle(ageMatchedRecipes, randomSeed).slice(0, limit)

  if (shuffled.length >= limit) {
    return shuffled
  }

  // Fallback: relax tag filter, only use age-matched recipes when ageRange is set
  const fallbackRecipes = await prisma.recipe.findMany({
    where: {
      contentStatus: 'published',
      id: { notIn: [...excludeIds, ...shuffled.map((r) => r.id)] },
      ...excludeTagsFilter,
      ...(selectedAgeRange
        ? {
            ageMinMonths: { lte: selectedAgeRange.max ?? 9999 },
            OR: [
              { ageMaxMonths: null },
              { ageMaxMonths: { gte: selectedAgeRange.min } }
            ]
          }
        : {})
    },
    include: { tags: true },
    orderBy: { favorites: 'desc' },
    take: (limit - shuffled.length) * 8
  })

  const fallbackAgeMatched = selectedAgeRange
    ? fallbackRecipes.filter((recipe) => matchRecipeAgeRange(recipe.ageLabel, selectedAgeRange, (recipe as any).ageMinMonths, (recipe as any).ageMaxMonths))
    : fallbackRecipes

  const shuffledFallback = fisherYatesShuffle(fallbackAgeMatched, randomSeed + 1000)

  return [...shuffled, ...shuffledFallback.slice(0, limit - shuffled.length)]
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
  baby: { id: string; birthDate: Date; allergens: Array<{ name: string }> },
  options: {
    mealCount?: string
    goals?: string[]
    planDate?: Date
    ageRange?: MonthRange
    excludeTags?: string[]
    avoidRepeat?: string
  } = {}
) {
  const mealCount = options.mealCount ?? '3餐'
  const selectedGoals = options.goals?.length ? options.goals : ['补钙']
  const planDate = options.planDate ?? getToday()
  const monthAge = getMonthAge(baby.birthDate)
  const allergenNames = baby.allergens.map((item) => item.name)
  const slotCount = mealCount === '2餐' ? 2 : 3

  // 获取历史记录中的食谱ID，用于避免重复
  let historyExcludeIds: string[] = []
  if (options.avoidRepeat && options.avoidRepeat !== '不限制') {
    const daysToCheck = options.avoidRepeat === '近一周' ? 7 : 30
    const startDate = addDays(getToday(), -daysToCheck)

    const historyPlans = await prisma.mealPlan.findMany({
      where: {
        babyId: baby.id,
        planDate: { gte: startDate }
      },
      include: {
        items: {
          select: { recipeId: true }
        }
      }
    })

    historyExcludeIds = historyPlans
      .flatMap(plan => plan.items.map(item => item.recipeId))
      .filter((id): id is string => Boolean(id))
  }

  // 添加时间戳作为随机种子，确保每次调用返回不同结果
  const randomSeed = Date.now()
  const recipes = await getMealPlanRecipes(slotCount, selectedGoals, historyExcludeIds, randomSeed, {
    ageRange: options.ageRange,
    excludeTags: options.excludeTags
  })

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
    id: `generated-${formatDateKey(planDate)}-${recipe.id}-${index}-${randomSeed}`,
    recipeId: recipe.id,
    slot: mealSlots[index]?.slot ?? 'dinner',
    time: mealSlots[index]?.time ?? '18:00',
    title: recipe.title,
    image: recipe.coverImage ?? '',
    tags: recipe.tags.map((tag) => tag.name),
    focus: recipe.reviewFocus ?? selectedGoals[0] ?? '均衡搭配'
  }))

  if (mealCount === '3餐+点心') {
    const snackCandidates = await getMealPlanRecipes(1, ['能量加餐', '手抓点心', '加餐'], [...historyExcludeIds, ...finalRecipes.map((recipe) => recipe.id)], randomSeed + 1, {
      ageRange: options.ageRange,
      excludeTags: options.excludeTags
    })
    const snackRecipe = snackCandidates[0]

    if (snackRecipe) {
      entries.push({
        id: `generated-${formatDateKey(planDate)}-snack-${snackRecipe.id}-${randomSeed}`,
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

type ResolvedMealPlanEntry = Awaited<ReturnType<typeof resolveMealPlanEntryCreates>>[number]

function buildMealPlanItemMutationData(entry: ResolvedMealPlanEntry) {
  return {
    recipeId: entry.recipeId,
    customRecipeId: entry.customRecipeId,
    slot: entry.slot,
    time: entry.time,
    title: entry.title,
    focus: entry.focus,
    snapshotTitle: entry.snapshotTitle,
    snapshotFocus: entry.snapshotFocus,
    snapshotImage: entry.snapshotImage,
    snapshotTagsJson: entry.snapshotTagsJson
  }
}

function formatMealSlotLabel(slot: string) {
  if (slot === 'breakfast') {
    return '早餐'
  }

  if (slot === 'lunch') {
    return '午餐'
  }

  if (slot === 'dinner') {
    return '晚餐'
  }

  return '加餐'
}

function hasMeaningfulMealPlanItemChange(
  item: {
    recipeId: string | null
    customRecipeId: string | null
    slot: string
    time: string
    title: string
    focus: string | null
    snapshotTitle: string | null
    snapshotFocus: string | null
  },
  nextEntry: ResolvedMealPlanEntry
) {
  const currentTitle = item.snapshotTitle ?? item.title
  const currentFocus = item.snapshotFocus ?? item.focus ?? '均衡搭配'
  const nextTitle = nextEntry.snapshotTitle ?? nextEntry.title
  const nextFocus = nextEntry.snapshotFocus ?? nextEntry.focus ?? '均衡搭配'

  return item.recipeId !== nextEntry.recipeId
    || item.customRecipeId !== nextEntry.customRecipeId
    || item.slot !== nextEntry.slot
    || item.time !== nextEntry.time
    || currentTitle !== nextTitle
    || currentFocus !== nextFocus
}

function isWechatPlaceholderNickname(nickname: string) {
  return nickname.startsWith('微信用户') || /^wechat\s*user/i.test(nickname)
}

export async function findOrCreateWechatUser(
  wechatOpenId: string,
  userInfo?: {
    nickname?: string
    avatarUrl?: string
  },
  loginMeta?: {
    ipAddress?: string
    userAgent?: string
  }
) {
  const nicknameInput = userInfo?.nickname?.trim()
  const nickname = nicknameInput && !isWechatPlaceholderNickname(nicknameInput)
    ? nicknameInput
    : undefined
  const avatarUrl = userInfo?.avatarUrl?.trim()

  const user = await prisma.user.upsert({
    where: { wechatOpenId },
    update: {
      ...(nickname ? { nickname } : {}),
      ...(avatarUrl ? { avatarUrl } : {})
    },
    create: {
      nickname: nickname || generateSystemUserNickname(),
      avatarUrl: avatarUrl || '',
      wechatOpenId,
      activityLabel: '新用户',
      statusLabel: '正常'
    }
  })

  // 记录登录日志
  await prisma.$executeRaw`
    INSERT INTO user_login_logs (id, user_id, nickname, avatar_url, login_at, ip_address, user_agent)
    VALUES (
      ${randomBytes(16).toString('hex')},
      ${user.id},
      ${user.nickname},
      ${user.avatarUrl},
      NOW(),
      ${loginMeta?.ipAddress || null},
      ${loginMeta?.userAgent || null}
    )
  `

  return user
}

export async function getAppAuthState(userId: string) {
  const [user, baby, canAppAdmin, accessibleBabies] = await Promise.all([
    ensureCurrentUser(userId),
    getCurrentBaby(userId),
    getUserCanAppAdmin(userId),
    getAccessibleBabies(userId)
  ])

  return {
    user: formatAppUser(user),
    hasBaby: Boolean(baby),
    canAppAdmin,
    babyProfile: baby ? formatBabyProfile(baby) : null,
    accessibleBabies
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
  backgroundImageUrl?: string
  relationshipLabel?: string
  gender?: 'boy' | 'girl'
}) {
  await ensureBabyProfileColumns()

  const nickname = payload.nickname.trim()

  if (!nickname) {
    throw new Error('请填写宝宝昵称')
  }

  const birthDate = parseBirthDate(payload.birthDate)
  const stageLabel = getStageLabelFromBirthDate(birthDate)
  const allergens = normalizeAllergens(payload.allergens)
  const avatarUrl = payload.avatarUrl?.trim() || undefined
  const backgroundImageUrl = payload.backgroundImageUrl?.trim() || undefined
  const relationshipLabel = normalizeBabyRelationshipLabel(payload.relationshipLabel)
  const gender = normalizeBabyGender(payload.gender)
  const [ownedBabyCount, currentUser] = await Promise.all([
    prisma.baby.count({ where: { userId } }),
    ensureCurrentUser(userId)
  ])
  const shouldUpgradeUserNickname = ownedBabyCount === 0 && isAutoGeneratedUserNickname(currentUser.nickname)

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

  if (avatarUrl) {
    await prisma.$executeRaw`UPDATE babies SET avatar_url = ${avatarUrl} WHERE id = ${baby.id}`
  }

  if (backgroundImageUrl) {
    await prisma.$executeRaw`UPDATE babies SET background_image_url = ${backgroundImageUrl} WHERE id = ${baby.id}`
  }

  if (relationshipLabel !== undefined) {
    await prisma.$executeRaw`UPDATE babies SET relationship_label = ${relationshipLabel} WHERE id = ${baby.id}`
  }

  if (gender !== undefined) {
    await prisma.$executeRaw`UPDATE babies SET gender = ${gender} WHERE id = ${baby.id}`
  }

  await ensureBabyMembership(userId, baby.id, { role: 'owner' })
  await setActiveBabyId(userId, baby.id)

  if (shouldUpgradeUserNickname) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        nickname: generateBabyBasedUserNickname(nickname)
      }
    })
  }

  return {
    babyProfile: formatBabyProfile({
      ...baby,
      avatarUrl: avatarUrl ?? null,
      backgroundImageUrl: backgroundImageUrl ?? null,
      relationshipLabel: relationshipLabel ?? null,
      gender: gender ?? null
    })
  }
}

export async function updateBabyProfile(userId: string, babyId: string, payload: {
  nickname: string
  birthDate: string
  allergens: string[]
  avatarUrl?: string
  backgroundImageUrl?: string
  relationshipLabel?: string
  gender?: 'boy' | 'girl'
}) {
  await ensureBabyProfileColumns()

  const nickname = payload.nickname.trim()

  if (!nickname) {
    throw new Error('请填写宝宝昵称')
  }

  const birthDate = parseBirthDate(payload.birthDate)
  const stageLabel = getStageLabelFromBirthDate(birthDate)
  const allergens = normalizeAllergens(payload.allergens)
  const avatarUrl = payload.avatarUrl?.trim() || undefined
  const backgroundImageUrl = payload.backgroundImageUrl?.trim() || undefined
  const relationshipLabel = normalizeBabyRelationshipLabel(payload.relationshipLabel)
  const gender = normalizeBabyGender(payload.gender)
  const shouldUpdateRelationshipLabel = payload.relationshipLabel !== undefined
  const shouldUpdateGender = payload.gender !== undefined
  const existingBaby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      userId
    }
  })

  if (!existingBaby) {
    throw new Error('未找到可编辑的宝宝档案')
  }

  let existingProfileFields = {
    avatar_url: null as string | null,
    background_image_url: null as string | null,
    relationship_label: null as string | null,
    gender: null as string | null
  }

  try {
    const rows = await prisma.$queryRaw<Array<{
      avatar_url: string | null
      background_image_url: string | null
      relationship_label: string | null
      gender: string | null
    }>>`
      SELECT avatar_url, background_image_url, relationship_label, gender
      FROM babies
      WHERE id = ${babyId}
      LIMIT 1
    `
    existingProfileFields = rows[0] ?? existingProfileFields
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

  if (avatarUrl) {
    await prisma.$executeRaw`UPDATE babies SET avatar_url = ${avatarUrl} WHERE id = ${babyId}`
  }

  if (backgroundImageUrl) {
    await prisma.$executeRaw`UPDATE babies SET background_image_url = ${backgroundImageUrl} WHERE id = ${babyId}`
  }

  if (shouldUpdateRelationshipLabel) {
    await prisma.$executeRaw`UPDATE babies SET relationship_label = ${relationshipLabel ?? null} WHERE id = ${babyId}`
  }

  if (shouldUpdateGender) {
    await prisma.$executeRaw`UPDATE babies SET gender = ${gender ?? null} WHERE id = ${babyId}`
  }

  return {
    babyProfile: formatBabyProfile({
      ...baby,
      avatarUrl: avatarUrl ?? existingProfileFields.avatar_url,
      backgroundImageUrl: backgroundImageUrl ?? existingProfileFields.background_image_url,
      relationshipLabel: shouldUpdateRelationshipLabel
        ? relationshipLabel ?? null
        : existingProfileFields.relationship_label,
      gender: shouldUpdateGender ? gender ?? null : existingProfileFields.gender
    })
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

async function normalizeAgeRange(input?: MonthRange | string): Promise<MonthRange | undefined> {
  if (!input) {
    return undefined
  }

  if (typeof input === 'string') {
    return parseAgeLabelToMonthRange(input) ?? undefined
  }

  if (typeof input.min === 'number') {
    return {
      min: input.min,
      max: typeof input.max === 'number' ? input.max : null
    }
  }

  return undefined
}

export async function getGeneratePageData(
  userId: string,
  mealCount = '3餐',
  goals: string[] = [],
  ageRange?: MonthRange | string,
  excludeTags?: string[],
  avoidRepeat?: string
) {
  const baby = await ensureCurrentBaby(userId)
  const normalizedAgeRange = await normalizeAgeRange(ageRange)
  const previewPlan = await buildPreviewMealPlan(baby, {
    mealCount,
    goals,
    planDate: getToday(),
    ageRange: normalizedAgeRange,
    excludeTags,
    avoidRepeat
  })

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
    },
    include: mealPlanInclude
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

  const mealPlan = await prisma.$transaction(async (tx) => {
    await tx.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        title: payload.title?.trim() || existingMealPlan.title,
        planDate: targetPlanDate,
        dateLabel: getPlanDateLabel(targetPlanDate, payload.dateLabel),
        nutritionScore: payload.nutritionScore,
        waterSuggestion: payload.waterSuggestion
      }
    })

    const matchedItemIds = new Set<string>()

    for (const entry of entryCreates) {
      const existingItem = existingMealPlan.items.find((item) => item.slot === entry.slot && !matchedItemIds.has(item.id))

      if (!existingItem) {
        await tx.mealPlanItem.create({
          data: {
            mealPlanId,
            ...buildMealPlanItemMutationData(entry)
          }
        })
        continue
      }

      matchedItemIds.add(existingItem.id)

      if (existingItem.feedingRecords.length > 0) {
        if (hasMeaningfulMealPlanItemChange(existingItem, entry)) {
          throw new Error(`已记录喂养的${formatMealSlotLabel(existingItem.slot)}不能修改，请到计划页查看`)
        }
        continue
      }

      await tx.mealPlanItem.update({
        where: { id: existingItem.id },
        data: buildMealPlanItemMutationData(entry)
      })
    }

    const removableItems = existingMealPlan.items.filter((item) => !matchedItemIds.has(item.id))
    const lockedRemovedItem = removableItems.find((item) => item.feedingRecords.length > 0)

    if (lockedRemovedItem) {
      throw new Error(`已记录喂养的${formatMealSlotLabel(lockedRemovedItem.slot)}不能删除，请到计划页查看`)
    }

    if (removableItems.length > 0) {
      await tx.mealPlanItem.deleteMany({
        where: {
          id: {
            in: removableItems.map((item) => item.id)
          }
        }
      })
    }

    const refreshedMealPlan = await tx.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        babyId: baby.id
      },
      include: mealPlanInclude
    })

    if (!refreshedMealPlan) {
      throw new Error('计划刷新失败')
    }

    return refreshedMealPlan
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

  const feedingRecord = await prisma.$transaction(async (tx) => {
    const savedRecord = await tx.feedingRecord.upsert({
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

    const detailMarker = `"mealPlanItemId":"${itemId}"`
    const existingJournal = await tx.feedingJournalEntry.findFirst({
      where: {
        babyId: baby.id,
        type: 'solid',
        detailJson: {
          contains: detailMarker
        }
      }
    })

    if (status === 'fed') {
      const journalData = {
        babyId: baby.id,
        entryDate: parsePlanDate(formatDateKey(fedAt))!,
        entryTime: formatTimeKey(fedAt),
        type: 'solid' as const,
        title: targetItem.title,
        description: `${targetItem.title} · 吃完`,
        amountValue: null,
        amountUnit: null,
        note,
        tagsJson: '[]',
        source: 'manual',
        sourceReminderIdsJson: '[]',
        detailJson: JSON.stringify({
          solid: {
            foodName: targetItem.title,
            intakeLevel: 'finished'
          },
          autoFromMealPlan: {
            mealPlanId,
            mealPlanItemId: itemId,
            slot: targetItem.slot
          }
        })
      }

      if (existingJournal) {
        await tx.feedingJournalEntry.update({
          where: { id: existingJournal.id },
          data: journalData
        })
      } else {
        await tx.feedingJournalEntry.create({
          data: journalData
        })
      }
    } else if (existingJournal) {
      await tx.feedingJournalEntry.delete({ where: { id: existingJournal.id } })
    }

    return savedRecord
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
      ageLabel: getRecipeAgeLabel(recipe),
      ageMinMonths: typeof (recipe as any).ageMinMonths === 'number' ? (recipe as any).ageMinMonths : undefined,
      ageMaxMonths: typeof (recipe as any).ageMaxMonths === 'number' ? (recipe as any).ageMaxMonths : null,
      durationLabel: recipe.durationLabel,
      difficultyLabel: recipe.difficultyLabel,
      tags: recipe.tags.map((tag) => tag.name),
      description: recipe.summary ?? ''
    }))
  }
}

function formatWheelHistoryItem(record: {
  id: string
  candidateId: string
  title: string
  category: string
  icon: string
  ageLabel: string
  ingredientsJson: string
  stepsJson: string
  nutritionTagsJson: string
  filterTagsJson: string
  selectedFiltersJson: string
  generatedAt: Date
}) {
  return {
    id: record.id,
    candidateId: record.candidateId,
    title: record.title,
    category: record.category,
    icon: record.icon,
    ageLabel: record.ageLabel,
    ingredients: parseJsonStringArray(record.ingredientsJson),
    steps: parseJsonStringArray(record.stepsJson),
    nutritionTags: parseJsonStringArray(record.nutritionTagsJson),
    filterTags: parseJsonStringArray(record.filterTagsJson),
    selectedFilters: parseJsonStringArray(record.selectedFiltersJson),
    generatedAt: record.generatedAt.toISOString()
  }
}

function formatGrowthRecord(record: {
  id: string
  measuredAt: Date
  heightCm: number | null
  weightKg: number | null
  headCircumferenceCm: number | null
}) {
  return {
    id: record.id,
    measuredAt: formatDateKey(record.measuredAt),
    heightCm: record.heightCm ?? null,
    weightKg: record.weightKg ?? null,
    headCircumferenceCm: record.headCircumferenceCm ?? null
  }
}

function formatReminderItem(record: {
  id: string
  title: string
  reminderDate: Date
  reminderTime: string | null
  repeatType: string
  status: string
  category: string
  customCategoryLabel?: string | null
  note: string | null
  completedAt: Date | null
  source: string | null
}) {
  return {
    id: record.id,
    title: record.title,
    date: formatDateKey(record.reminderDate),
    time: record.reminderTime ?? undefined,
    repeatType: formatReminderRepeatType(record.repeatType),
    status: record.status,
    category: record.category,
    customCategoryLabel: record.customCategoryLabel ?? undefined,
    note: record.note ?? undefined,
    completedAt: record.completedAt ? formatDateKey(record.completedAt) : undefined,
    source: normalizeReminderSource(record.source)
  }
}

function formatFeedingJournalEntry(record: {
  id: string
  entryDate: Date
  entryTime: string
  type: string
  title: string
  description: string
  amountValue: number | null
  amountUnit: string | null
  note: string | null
  tagsJson: string
  source: string
  sourceReminderIdsJson: string
  detailJson: string
  createdAt: Date
  updatedAt: Date
}) {
  const detail = parseJsonObject<Record<string, unknown>>(record.detailJson) ?? {}

  return {
    id: record.id,
    date: formatDateKey(record.entryDate),
    time: record.entryTime,
    type: formatFeedingJournalType(record.type),
    title: record.title,
    description: record.description,
    amountValue: record.amountValue ?? undefined,
    amountUnit: record.amountUnit ?? undefined,
    note: record.note ?? undefined,
    tags: parseJsonStringArray(record.tagsJson),
    source: record.source === 'reminder' ? 'reminder' : 'manual',
    sourceReminderIds: parseJsonStringArray(record.sourceReminderIdsJson),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    breast: detail.breast,
    formula: detail.formula,
    bottleBreast: detail.bottleBreast,
    solid: detail.solid,
    water: detail.water,
    supplement: detail.supplement,
    sleep: detail.sleep,
    diaper: detail.diaper,
    pump: detail.pump,
    bath: detail.bath,
    play: detail.play,
    swim: detail.swim,
    other: detail.other
  }
}

function normalizeIdArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.map((item) => typeof item === 'string' ? item.trim() : '').filter(Boolean))]
}

function buildGrowthRecordWriteInput(payload: Record<string, unknown>) {
  const measuredAt = parsePlanDate(typeof payload.measuredAt === 'string' ? payload.measuredAt.trim() : '')
  const heightCm = parseNumberValue(payload.heightCm)
  const weightKg = parseNumberValue(payload.weightKg)
  const headCircumferenceCm = parseNumberValue(payload.headCircumferenceCm)

  if (!measuredAt) {
    throw new Error('测量日期格式不正确')
  }

  if (heightCm == null && weightKg == null && headCircumferenceCm == null) {
    throw new Error('请至少填写一项生长数据')
  }

  return {
    measuredAt,
    heightCm,
    weightKg,
    headCircumferenceCm
  }
}

function buildReminderWriteInput(payload: Record<string, unknown>) {
  const title = typeof payload.title === 'string' ? payload.title.trim().slice(0, 30) : ''
  const reminderDate = parsePlanDate(typeof payload.date === 'string' ? payload.date.trim() : '')
  const reminderTime = parseTimeLabel(typeof payload.time === 'string' ? payload.time : undefined, { errorMessage: '提醒时间格式不正确' })
  const repeatType = parseReminderRepeatType(typeof payload.repeatType === 'string' ? payload.repeatType : undefined)
  const category = parseReminderCategory(typeof payload.category === 'string' ? payload.category : undefined)
  const customCategoryLabel = typeof payload.customCategoryLabel === 'string' ? payload.customCategoryLabel.trim().slice(0, 20) : ''
  const note = typeof payload.note === 'string' ? payload.note.trim().slice(0, 200) : ''
  const source = normalizeReminderSource(typeof payload.source === 'string' ? payload.source : undefined)

  if (!title) {
    throw new Error('请填写提醒标题')
  }

  if (!reminderDate) {
    throw new Error('提醒日期格式不正确')
  }

  if (category === 'custom' && !customCategoryLabel) {
    throw new Error('请填写自定义分类')
  }

  return {
    title,
    reminderDate,
    reminderTime,
    repeatType,
    category,
    customCategoryLabel: category === 'custom' ? customCategoryLabel : null,
    note: note || null,
    source
  }
}

function buildFeedingJournalWriteInput(payload: Record<string, unknown>) {
  const entryDate = parsePlanDate(typeof payload.date === 'string' ? payload.date.trim() : '')
  const entryTime = parseTimeLabel(typeof payload.time === 'string' ? payload.time : undefined, { required: true, errorMessage: '记录时间格式不正确' })
  const type = parseFeedingJournalType(typeof payload.type === 'string' ? payload.type : undefined)
  const title = typeof payload.title === 'string' ? payload.title.trim().slice(0, 40) : ''
  const description = typeof payload.description === 'string' ? payload.description.trim().slice(0, 200) : ''
  const amountValue = parseNumberValue(payload.amountValue)
  const amountUnit = typeof payload.amountUnit === 'string' ? payload.amountUnit.trim().slice(0, 16) : ''
  const note = typeof payload.note === 'string' ? payload.note.trim().slice(0, 200) : ''
  const tags = Array.isArray(payload.tags)
    ? normalizeTags(payload.tags.filter((item): item is string => typeof item === 'string'))
    : []
  const source = typeof payload.source === 'string' && payload.source === 'reminder' ? 'reminder' : 'manual'
  const sourceReminderIds = normalizeIdArray(payload.sourceReminderIds)
  const detail = Object.fromEntries(Object.entries({
    breast: payload.breast,
    formula: payload.formula,
    bottleBreast: payload.bottleBreast,
    solid: payload.solid,
    water: payload.water,
    supplement: payload.supplement,
    sleep: payload.sleep,
    diaper: payload.diaper,
    pump: payload.pump,
    bath: payload.bath,
    play: payload.play,
    swim: payload.swim,
    other: payload.other
  }).filter(([, value]) => value !== undefined))

  if (!entryDate) {
    throw new Error('记录日期格式不正确')
  }

  if (!title) {
    throw new Error('请填写记录标题')
  }

  if (!description) {
    throw new Error('请填写记录说明')
  }

  return {
    entryDate,
    entryTime: entryTime!,
    type,
    title,
    description,
    amountValue,
    amountUnit: amountUnit || null,
    note: note || null,
    tagsJson: JSON.stringify(tags),
    source,
    sourceReminderIds,
    sourceReminderIdsJson: JSON.stringify(sourceReminderIds),
    detailJson: JSON.stringify(detail)
  }
}

function buildFeedingJournalWhere(scope?: string, anchorDateValue?: string, types: string[] = []) {
  const anchorDate = parsePlanDate(anchorDateValue) ?? getToday()
  const where: Record<string, unknown> = {}

  if (scope === 'week') {
    const range = getWeekRange(anchorDate)
    where.entryDate = {
      gte: range.start,
      lte: range.end
    }
  } else if (scope === 'month') {
    const range = getMonthRange(anchorDate)
    where.entryDate = {
      gte: range.start,
      lte: range.end
    }
  }

  if (types.length) {
    where.type = {
      in: types.map((item) => parseFeedingJournalType(item))
    }
  }

  return where
}

export async function getWheelHistory(userId: string, limit = 6) {
  const take = Math.min(Math.max(limit, 1), 20)
  const items = await prisma.wheelGenerationHistory.findMany({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
    take
  })

  return {
    items: items.map(formatWheelHistoryItem)
  }
}

export async function createWheelHistoryEntry(userId: string, payload: Record<string, unknown>) {
  const candidate = payload.candidate && typeof payload.candidate === 'object'
    ? payload.candidate as Record<string, unknown>
    : null

  if (!candidate) {
    throw new Error('缺少转盘结果')
  }

  const candidateId = typeof candidate.id === 'string' ? candidate.id.trim() : ''
  const title = typeof candidate.title === 'string' ? candidate.title.trim() : ''
  const category = typeof candidate.category === 'string' ? candidate.category.trim() : ''
  const icon = typeof candidate.icon === 'string' ? candidate.icon.trim() : ''
  const ageLabel = typeof candidate.ageLabel === 'string' ? candidate.ageLabel.trim() : ''
  const ingredients = Array.isArray(candidate.ingredients)
    ? candidate.ingredients.filter((item): item is string => typeof item === 'string')
    : []
  const steps = Array.isArray(candidate.steps)
    ? candidate.steps.filter((item): item is string => typeof item === 'string')
    : []
  const nutritionTags = Array.isArray(candidate.nutritionTags)
    ? candidate.nutritionTags.filter((item): item is string => typeof item === 'string')
    : []
  const filterTags = Array.isArray(candidate.filterTags)
    ? candidate.filterTags.filter((item): item is string => typeof item === 'string')
    : []
  const selectedFilters = Array.isArray(payload.selectedFilters)
    ? payload.selectedFilters.filter((item): item is string => typeof item === 'string')
    : []

  if (!candidateId || !title || !category) {
    throw new Error('转盘结果不完整')
  }

  await prisma.$transaction(async (tx) => {
    await tx.wheelGenerationHistory.create({
      data: {
        userId,
        candidateId,
        title,
        category,
        icon,
        ageLabel,
        ingredientsJson: JSON.stringify(ingredients),
        stepsJson: JSON.stringify(steps),
        nutritionTagsJson: JSON.stringify(nutritionTags),
        filterTagsJson: JSON.stringify(filterTags),
        selectedFiltersJson: JSON.stringify(selectedFilters)
      }
    })

    const duplicateIds = await tx.wheelGenerationHistory.findMany({
      where: { userId, candidateId },
      orderBy: { generatedAt: 'desc' },
      skip: 1,
      select: { id: true }
    })

    if (duplicateIds.length) {
      await tx.wheelGenerationHistory.deleteMany({
        where: {
          id: {
            in: duplicateIds.map((item) => item.id)
          }
        }
      })
    }

    const overflowIds = await tx.wheelGenerationHistory.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
      skip: 6,
      select: { id: true }
    })

    if (overflowIds.length) {
      await tx.wheelGenerationHistory.deleteMany({
        where: {
          id: {
            in: overflowIds.map((item) => item.id)
          }
        }
      })
    }
  })

  return { saved: true }
}

export async function listGrowthRecords(userId: string) {
  const baby = await ensureCurrentBaby(userId)
  const items = await prisma.growthRecord.findMany({
    where: { babyId: baby.id },
    orderBy: [
      { measuredAt: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return {
    items: items.map(formatGrowthRecord)
  }
}

export async function createGrowthRecord(userId: string, payload: Record<string, unknown>) {
  const baby = await ensureCurrentBaby(userId)
  const input = buildGrowthRecordWriteInput(payload)

  await prisma.growthRecord.create({
    data: {
      babyId: baby.id,
      ...input
    }
  })

  return { saved: true }
}

export async function updateGrowthRecord(userId: string, recordId: string, payload: Record<string, unknown>) {
  const baby = await ensureCurrentBaby(userId)
  const input = buildGrowthRecordWriteInput(payload)
  const existing = await prisma.growthRecord.findFirst({
    where: {
      id: recordId,
      babyId: baby.id
    }
  })

  if (!existing) {
    throw new Error('未找到对应生长记录')
  }

  await prisma.growthRecord.update({
    where: { id: existing.id },
    data: input
  })

  return { saved: true }
}

export async function deleteGrowthRecord(userId: string, recordId: string) {
  const baby = await ensureCurrentBaby(userId)
  const existing = await prisma.growthRecord.findFirst({
    where: {
      id: recordId,
      babyId: baby.id
    }
  })

  if (!existing) {
    throw new Error('未找到对应生长记录')
  }

  await prisma.growthRecord.delete({ where: { id: existing.id } })
  return { removed: true }
}

export async function listReminderItems(userId: string) {
  const baby = await ensureCurrentBaby(userId)
  const items = await prisma.$queryRaw<Array<{
    id: string
    title: string
    reminderDate: Date
    reminderTime: string | null
    repeatType: string
    status: string
    category: string
    customCategoryLabel: string | null
    note: string | null
    completedAt: Date | null
    source: string | null
  }>>`
    SELECT
      id,
      title,
      reminder_date AS "reminderDate",
      reminder_time AS "reminderTime",
      repeat_type::text AS "repeatType",
      status::text AS status,
      category::text AS category,
      custom_category_label AS "customCategoryLabel",
      note,
      completed_at AS "completedAt",
      source
    FROM baby_reminders
    WHERE baby_id = ${baby.id}
    ORDER BY reminder_date ASC, reminder_time ASC NULLS LAST, created_at ASC
  `

  return {
    items: items.map(formatReminderItem)
  }
}

export async function createReminderItem(userId: string, payload: Record<string, unknown>) {
  const baby = await ensureCurrentBaby(userId)
  const input = buildReminderWriteInput(payload)
  const id = `rem-${Date.now()}-${randomBytes(4).toString('hex')}`

  await prisma.$executeRaw`
    INSERT INTO baby_reminders (
      id,
      baby_id,
      title,
      reminder_date,
      reminder_time,
      repeat_type,
      status,
      category,
      custom_category_label,
      note,
      source,
      created_at,
      updated_at
    )
    VALUES (
      ${id},
      ${baby.id},
      ${input.title},
      ${input.reminderDate},
      ${input.reminderTime},
      ${toReminderRepeatTypeDbValue(input.repeatType)}::reminder_repeat_type,
      'pending'::reminder_status,
      ${input.category}::reminder_category,
      ${input.customCategoryLabel},
      ${input.note},
      ${input.source},
      NOW(),
      NOW()
    )
  `

  return { saved: true }
}

export async function updateReminderItem(userId: string, reminderId: string, payload: Record<string, unknown>) {
  const baby = await ensureCurrentBaby(userId)
  const input = buildReminderWriteInput(payload)
  const existing = await prisma.$queryRaw<Array<{
    id: string
    status: string
    completedAt: Date | null
  }>>`
    SELECT id, status::text AS status, completed_at AS "completedAt"
    FROM baby_reminders
    WHERE id = ${reminderId} AND baby_id = ${baby.id}
    LIMIT 1
  `

  if (!existing[0]) {
    throw new Error('未找到对应提醒')
  }

  await prisma.$executeRaw`
    UPDATE baby_reminders
    SET
      title = ${input.title},
      reminder_date = ${input.reminderDate},
      reminder_time = ${input.reminderTime},
      repeat_type = ${toReminderRepeatTypeDbValue(input.repeatType)}::reminder_repeat_type,
      category = ${input.category}::reminder_category,
      custom_category_label = ${input.customCategoryLabel},
      note = ${input.note},
      source = ${input.source},
      updated_at = NOW()
    WHERE id = ${existing[0].id}
  `

  return { saved: true }
}

export async function toggleReminderDone(userId: string, reminderId: string) {
  const baby = await ensureCurrentBaby(userId)
  const existing = await prisma.babyReminder.findFirst({
    where: {
      id: reminderId,
      babyId: baby.id
    }
  })

  if (!existing) {
    throw new Error('未找到对应提醒')
  }

  const nextStatus = existing.status === 'done' ? 'pending' : 'done'

  await prisma.babyReminder.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      completedAt: nextStatus === 'done' ? new Date() : null
    }
  })

  return { saved: true }
}

export async function markReminderItemsDone(userId: string, ids: string[]) {
  const baby = await ensureCurrentBaby(userId)
  const normalizedIds = normalizeIdArray(ids)

  if (!normalizedIds.length) {
    return { saved: true }
  }

  await prisma.babyReminder.updateMany({
    where: {
      babyId: baby.id,
      id: { in: normalizedIds },
      status: 'pending'
    },
    data: {
      status: 'done',
      completedAt: new Date()
    }
  })

  return { saved: true }
}

export async function deleteReminderItem(userId: string, reminderId: string) {
  const baby = await ensureCurrentBaby(userId)
  const existing = await prisma.babyReminder.findFirst({
    where: {
      id: reminderId,
      babyId: baby.id
    }
  })

  if (!existing) {
    throw new Error('未找到对应提醒')
  }

  await prisma.babyReminder.delete({ where: { id: existing.id } })
  return { removed: true }
}

export async function listFeedingJournalEntries(userId: string, options: {
  scope?: string
  anchorDate?: string
  types?: string[]
}) {
  const baby = await ensureCurrentBaby(userId)
  const items = await prisma.feedingJournalEntry.findMany({
    where: {
      babyId: baby.id,
      ...buildFeedingJournalWhere(options.scope, options.anchorDate, options.types)
    },
    orderBy: [
      { entryDate: 'desc' },
      { entryTime: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return {
    items: items.map(formatFeedingJournalEntry)
  }
}

export async function getFeedingJournalEntryDetail(userId: string, entryId: string) {
  const baby = await ensureCurrentBaby(userId)
  const entry = await prisma.feedingJournalEntry.findFirst({
    where: {
      id: entryId,
      babyId: baby.id
    }
  })

  if (!entry) {
    throw new Error('未找到对应喂养记录')
  }

  return formatFeedingJournalEntry(entry)
}

export async function createFeedingJournalEntry(userId: string, payload: Record<string, unknown>) {
  const baby = await ensureCurrentBaby(userId)
  const input = buildFeedingJournalWriteInput(payload)

  await prisma.$transaction(async (tx) => {
    await tx.feedingJournalEntry.create({
      data: {
        babyId: baby.id,
        entryDate: input.entryDate,
        entryTime: input.entryTime,
        type: input.type,
        title: input.title,
        description: input.description,
        amountValue: input.amountValue,
        amountUnit: input.amountUnit,
        note: input.note,
        tagsJson: input.tagsJson,
        source: input.source,
        sourceReminderIdsJson: input.sourceReminderIdsJson,
        detailJson: input.detailJson
      }
    })

    if (input.sourceReminderIds.length) {
      await tx.babyReminder.updateMany({
        where: {
          babyId: baby.id,
          id: { in: input.sourceReminderIds }
        },
        data: {
          status: 'done',
          completedAt: new Date()
        }
      })
    }
  })

  return { saved: true }
}

export async function updateFeedingJournalEntry(userId: string, entryId: string, payload: Record<string, unknown>) {
  const baby = await ensureCurrentBaby(userId)
  const input = buildFeedingJournalWriteInput(payload)
  const existing = await prisma.feedingJournalEntry.findFirst({
    where: {
      id: entryId,
      babyId: baby.id
    }
  })

  if (!existing) {
    throw new Error('未找到对应喂养记录')
  }

  await prisma.$transaction(async (tx) => {
    await tx.feedingJournalEntry.update({
      where: { id: existing.id },
      data: {
        entryDate: input.entryDate,
        entryTime: input.entryTime,
        type: input.type,
        title: input.title,
        description: input.description,
        amountValue: input.amountValue,
        amountUnit: input.amountUnit,
        note: input.note,
        tagsJson: input.tagsJson,
        source: input.source,
        sourceReminderIdsJson: input.sourceReminderIdsJson,
        detailJson: input.detailJson
      }
    })

    if (input.sourceReminderIds.length) {
      await tx.babyReminder.updateMany({
        where: {
          babyId: baby.id,
          id: { in: input.sourceReminderIds }
        },
        data: {
          status: 'done',
          completedAt: new Date()
        }
      })
    }
  })

  return { saved: true }
}

export async function deleteFeedingJournalEntry(userId: string, entryId: string) {
  const baby = await ensureCurrentBaby(userId)
  const existing = await prisma.feedingJournalEntry.findFirst({
    where: {
      id: entryId,
      babyId: baby.id
    }
  })

  if (!existing) {
    throw new Error('未找到对应喂养记录')
  }

  await prisma.feedingJournalEntry.delete({ where: { id: existing.id } })
  return { removed: true }
}

export async function getVaccinePageData(userId?: string) {
  const baby = userId ? await ensureCurrentBaby(userId) : null
  const rows = await prisma.$queryRaw<Array<{
    schedule_id: string
    name: string
    disease: string
    stage_label: string
    recommended_age_label: string
    category: 'free' | 'optional'
    description: string | null
    precautions_json: string | null
    sort_order: number
    record_id: string | null
    record_status: 'pending' | 'completed' | 'optional' | null
    vaccinated_at: Date | null
    note: string | null
  }>>`
    SELECT
      vs.id AS schedule_id,
      vs.name,
      vs.disease,
      vs.stage_label,
      vs.recommended_age_label,
      vs.category,
      vs.description,
      vs.precautions_json,
      vs.sort_order,
      vr.id AS record_id,
      vr.status AS record_status,
      vr.vaccinated_at,
      vr.note
    FROM vaccine_schedules vs
    LEFT JOIN vaccine_records vr
      ON vr.schedule_id = vs.id
     AND vr.baby_id = ${baby?.id ?? ''}
    ORDER BY vs.sort_order ASC, vs.name ASC
  `

  const timelineGroups = rows.reduce<Array<{
    key: string
    label: string
    description?: string
    items: Array<{
      id: string
      name: string
      disease: string
      stageLabel: string
      recommendedAgeLabel: string
      category: 'free' | 'optional'
      description?: string
      precautions?: string[]
      recordId?: string
      status: 'pending' | 'completed' | 'optional'
      vaccinatedAt?: string
      note?: string
    }>
  }>>((groups, row) => {
    const key = row.stage_label
    const item = {
      id: row.schedule_id,
      name: row.name,
      disease: row.disease,
      stageLabel: row.stage_label,
      recommendedAgeLabel: row.recommended_age_label,
      category: row.category,
      description: row.description ?? undefined,
      precautions: parseJsonStringArray(row.precautions_json),
      recordId: row.record_id ?? undefined,
      status: row.record_status ?? 'pending',
      vaccinatedAt: row.vaccinated_at ? formatDateKey(new Date(row.vaccinated_at)) : undefined,
      note: row.note ?? undefined
    }
    const existingGroup = groups.find((group) => group.key === key)

    if (existingGroup) {
      existingGroup.items.push(item)
      return groups
    }

    groups.push({
      key,
      label: row.stage_label,
      description: row.description ?? undefined,
      items: [item]
    })
    return groups
  }, [])

  const nextPendingVaccine = timelineGroups
    .flatMap((group) => group.items)
    .find((item) => item.status === 'pending') ?? null

  // 未登录时返回通用数据
  if (!baby) {
    return {
      babyProfile: null,
      nextPendingVaccine,
      timelineGroups,
      tips: [...vaccineTips]
    }
  }

  return {
    babyProfile: formatBabyProfile(baby),
    nextPendingVaccine,
    timelineGroups,
    tips: [...vaccineTips]
  }
}

export async function saveVaccineRecord(userId: string, payload: {
  scheduleId?: string
  status?: 'pending' | 'completed' | 'optional'
  vaccinatedAt?: string
  note?: string
}) {
  console.log('saveVaccineRecord called with:', { userId, payload })

  const baby = await ensureCurrentBaby(userId)
  console.log('Current baby:', baby.id)

  const scheduleId = payload.scheduleId?.trim() ?? ''
  const status = payload.status

  if (!scheduleId) {
    throw new Error('缺少 scheduleId')
  }

  if (status !== 'pending' && status !== 'completed' && status !== 'optional') {
    throw new Error('疫苗接种状态不正确')
  }

  const vaccinatedAt = payload.vaccinatedAt?.trim() ? parsePlanDate(payload.vaccinatedAt.trim()) : null
  console.log('Parsed vaccinatedAt:', vaccinatedAt)

  if (payload.vaccinatedAt?.trim() && !vaccinatedAt) {
    throw new Error('接种日期格式不正确')
  }

  const scheduleRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM vaccine_schedules WHERE id = ${scheduleId} LIMIT 1
  `
  console.log('Schedule found:', scheduleRows.length > 0)

  if (!scheduleRows[0]) {
    throw new Error('未找到对应疫苗计划')
  }

  const recordId = `vrec-${Date.now()}-${randomBytes(4).toString('hex')}`
  console.log('Inserting/updating record:', { recordId, babyId: baby.id, scheduleId, status, vaccinatedAt })

  await prisma.$executeRaw`
    INSERT INTO vaccine_records (id, baby_id, schedule_id, status, vaccinated_at, note, created_at, updated_at)
    VALUES (${recordId}, ${baby.id}, ${scheduleId}, ${status}::vaccine_record_status, ${vaccinatedAt}, ${payload.note?.trim() || null}, NOW(), NOW())
    ON CONFLICT (baby_id, schedule_id)
    DO UPDATE SET
      status = EXCLUDED.status,
      vaccinated_at = EXCLUDED.vaccinated_at,
      note = EXCLUDED.note,
      updated_at = NOW()
  `

  console.log('Record saved successfully')

  return {
    saved: true
  }
}

export async function getKnowledgePageData(userId?: string) {
  const [baby, rows] = await Promise.all([
    userId ? getCurrentBaby(userId) : Promise.resolve(null),
    prisma.$queryRaw<Array<{
      id: string
      title: string
      subtitle: string
      summary: string
      cover_image: string | null
      category_key: string
      category_label: string
      tags_json: string | null
      content_type: 'article' | 'guide' | 'taboo'
      is_featured: boolean
      sort_order: number
      updated_at: Date
    }>>`
      SELECT
        id,
        title,
        subtitle,
        summary,
        cover_image,
        category_key,
        category_label,
        tags_json,
        content_type,
        is_featured,
        sort_order,
        updated_at
      FROM knowledge_articles
      WHERE content_status = 'published'
      ORDER BY is_featured DESC, sort_order ASC, updated_at DESC
    `
  ])

  const articles = rows.map((row) => buildKnowledgeArticleSummary({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    coverImage: row.cover_image,
    categoryKey: row.category_key,
    categoryLabel: row.category_label,
    tagsJson: row.tags_json,
    contentType: row.content_type
  }))

  const categories = [
    { key: 'all', label: '全部' },
    ...rows.reduce<Array<{ key: string; label: string }>>((result, row) => {
      if (!result.find((item) => item.key === row.category_key)) {
        result.push({ key: row.category_key, label: row.category_label })
      }
      return result
    }, [])
  ]

  return {
    babyProfile: baby ? formatBabyProfile(baby) : null,
    categories,
    featuredArticle: articles[0] ?? null,
    articles
  }
}

export async function getKnowledgeArticleDetailData(articleId: string, userId?: string) {
  const articleRows = await prisma.$queryRaw<Array<{
    id: string
    title: string
    subtitle: string
    summary: string
    cover_image: string | null
    category_key: string
    category_label: string
    tags_json: string | null
    content_type: 'article' | 'guide' | 'taboo'
    content: string
  }>>`
    SELECT
      id,
      title,
      subtitle,
      summary,
      cover_image,
      category_key,
      category_label,
      tags_json,
      content_type,
      content
    FROM knowledge_articles
    WHERE id = ${articleId} AND content_status = 'published'
    LIMIT 1
  `

  const article = articleRows[0]
  if (!article) {
    throw new Error('未找到对应干货内容')
  }

  const [sectionRows, relatedRows, favoriteRows] = await Promise.all([
    prisma.$queryRaw<Array<{
      id: string
      title: string | null
      content: string
      images_json: string
      sort_order: number
    }>>`
      SELECT
        id,
        title,
        content,
        images_json,
        sort_order
      FROM knowledge_article_sections
      WHERE article_id = ${articleId}
      ORDER BY sort_order ASC
    `,
    prisma.$queryRaw<Array<{
      id: string
      title: string
      subtitle: string
      summary: string
      cover_image: string | null
      category_key: string
      category_label: string
      tags_json: string | null
      content_type: 'article' | 'guide' | 'taboo'
    }>>`
      SELECT
        id,
        title,
        subtitle,
        summary,
        cover_image,
        category_key,
        category_label,
        tags_json,
        content_type
      FROM knowledge_articles
      WHERE content_status = 'published'
        AND id <> ${article.id}
        AND category_key = ${article.category_key}
      ORDER BY sort_order ASC, updated_at DESC
      LIMIT 2
    `,
    userId
      ? prisma.$queryRaw<Array<{ article_id: string }>>`
          SELECT article_id
          FROM user_knowledge_favorites
          WHERE user_id = ${userId} AND article_id = ${article.id}
          LIMIT 1
        `
      : Promise.resolve([])
  ])

  return {
    ...buildKnowledgeArticleSummary({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      summary: article.summary,
      coverImage: article.cover_image,
      categoryKey: article.category_key,
      categoryLabel: article.category_label,
      tagsJson: article.tags_json,
      contentType: article.content_type
    }),
    content: article.content,
    sections: sectionRows.map((row) => {
      const media = parseKnowledgeSectionMedia(row.images_json || '[]')
      return {
        id: row.id,
        title: row.title ?? undefined,
        content: row.content,
        images: media.images,
        imageItems: media.imageItems,
        layout: media.layout,
        sortOrder: row.sort_order
      }
    }),
    isFavorite: favoriteRows.length > 0,
    relatedArticles: relatedRows.map((row) => buildKnowledgeArticleSummary({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      summary: row.summary,
      coverImage: row.cover_image,
      categoryKey: row.category_key,
      categoryLabel: row.category_label,
      tagsJson: row.tags_json,
      contentType: row.content_type
    }))
  }
}

export async function getFavoritesPageData(userId: string) {
  const [recipeFavoriteRows, knowledgeFavoriteRows] = await Promise.all([
    prisma.$queryRaw<Array<{
      id: string
      created_at: Date
      recipe_id: string
      title: string
      cover_image: string | null
      age_label: string
      duration_label: string
      difficulty_label: string
      summary: string | null
      tags_json: string | null
    }>>`
      SELECT
        uf.id,
        uf.created_at,
        r.id AS recipe_id,
        r.title,
        r.cover_image,
        r.age_label,
        r.duration_label,
        r.difficulty_label,
        r.summary,
        COALESCE(json_agg(rt.name ORDER BY rt.name) FILTER (WHERE rt.name IS NOT NULL), '[]'::json)::text AS tags_json
      FROM user_favorites uf
      JOIN recipes r ON r.id = uf.recipe_id
      LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
      WHERE uf.user_id = ${userId}
      GROUP BY uf.id, uf.created_at, r.id, r.title, r.cover_image, r.age_label, r.duration_label, r.difficulty_label, r.summary
      ORDER BY uf.created_at DESC
    `,
    prisma.$queryRaw<Array<{
      id: string
      created_at: Date
      article_id: string
      title: string
      subtitle: string
      summary: string
      cover_image: string | null
      category_key: string
      category_label: string
      tags_json: string | null
      content_type: 'article' | 'guide' | 'taboo'
    }>>`
      SELECT
        uf.id,
        uf.created_at,
        ka.id AS article_id,
        ka.title,
        ka.subtitle,
        ka.summary,
        ka.cover_image,
        ka.category_key,
        ka.category_label,
        ka.tags_json,
        ka.content_type
      FROM user_knowledge_favorites uf
      JOIN knowledge_articles ka ON ka.id = uf.article_id
      WHERE uf.user_id = ${userId}
        AND ka.content_status = 'published'
      ORDER BY uf.created_at DESC
    `
  ])

  return {
    recipeIds: recipeFavoriteRows.map((row) => row.recipe_id),
    recipes: recipeFavoriteRows.map((row) => ({
      id: row.id,
      savedAt: row.created_at.toISOString(),
      recipe: {
        id: row.recipe_id,
        title: row.title,
        image: row.cover_image ?? '',
        ageLabel: row.age_label,
        durationLabel: row.duration_label,
        difficultyLabel: row.difficulty_label,
        tags: parseJsonStringArray(row.tags_json),
        description: row.summary ?? ''
      }
    })),
    articles: knowledgeFavoriteRows.map((row) => ({
      id: row.id,
      savedAt: row.created_at.toISOString(),
      article: buildKnowledgeArticleSummary({
        id: row.article_id,
        title: row.title,
        subtitle: row.subtitle,
        summary: row.summary,
        coverImage: row.cover_image,
        categoryKey: row.category_key,
        categoryLabel: row.category_label,
        tagsJson: row.tags_json,
        contentType: row.content_type
      })
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

function normalizeRelationshipLabel(value?: string | null) {
  const label = value?.trim()

  if (!label) {
    return null
  }

  if (label.length > 12) {
    throw new Error('关系标签最多 12 个字')
  }

  return label
}

function formatFamilyMember(member: {
  id: string
  userId: string
  role: 'owner' | 'collaborator' | 'caregiver' | 'viewer'
  displayName?: string | null
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
    relationshipLabel: member.displayName ?? undefined,
    isOwner: member.role === 'owner'
  }
}

function formatFamilyInvite(invite: {
  id: string
  babyId: string
  inviteCode: string
  role: 'owner' | 'collaborator' | 'caregiver' | 'viewer'
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired'
  inviteeNickname?: string | null
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
    createdAt: invite.createdAt.toISOString(),
    relationshipLabel: invite.inviteeNickname ?? undefined
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

  const activityRows = members.length
    ? await prisma.userLoginLog.groupBy({
        by: ['userId'],
        where: {
          userId: {
            in: members.map((member) => member.userId)
          }
        },
        _max: { loginAt: true },
        _count: { _all: true }
      })
    : []

  const activityMap = new Map(activityRows.map((row) => [
    row.userId,
    {
      lastActiveAt: row._max.loginAt?.toISOString(),
      loginCount: row._count._all
    }
  ]))

  return {
    baby: formatBabyProfile(baby),
    members: members.map((member) => {
      const activity = activityMap.get(member.userId)

      return {
        ...formatFamilyMember(member),
        lastActiveAt: activity?.lastActiveAt,
        loginCount: activity?.loginCount,
        isCurrentUser: member.userId === userId
      }
    })
  }
}

export async function createFamilyInvite(userId: string, payload: {
  babyId?: string
  role?: 'owner' | 'editor' | 'viewer'
  relationshipLabel?: string
}) {
  const baby = await ensureOwnerBaby(userId, payload.babyId)
  const relationshipLabel = normalizeBabyRelationshipLabel(payload.relationshipLabel)
  const invite = await prisma.babyInvite.create({
    data: {
      babyId: baby.id,
      inviterUserId: userId,
      inviteeNickname: relationshipLabel,
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

export async function leaveFamily(userId: string, babyId?: string) {
  const baby = await ensureAccessibleBaby(userId, babyId)

  if (baby.isOwner || baby.accessRole === 'owner' || baby.userId === userId) {
    throw new Error('拥有者不能退出亲友团')
  }

  const membership = await prisma.babyMember.findFirst({
    where: {
      babyId: baby.id,
      userId
    }
  })

  if (!membership) {
    throw new Error('未找到可退出的亲友关系')
  }

  await prisma.babyMember.delete({ where: { id: membership.id } })
  await syncUserActiveBabyAfterAccessChange(userId)
  return getAppAuthState(userId)
}

export async function removeFamilyMember(ownerUserId: string, memberId: string, babyId?: string) {
  const baby = await ensureOwnerBaby(ownerUserId, babyId)
  const member = await prisma.babyMember.findFirst({
    where: {
      id: memberId,
      babyId: baby.id
    }
  })

  if (!member) {
    throw new Error('未找到可移除的亲友成员')
  }

  if (member.userId === ownerUserId) {
    throw new Error('不能移除自己，请使用退出功能')
  }

  if (member.role === 'owner') {
    throw new Error('不能移除拥有者')
  }

  await prisma.babyMember.delete({ where: { id: member.id } })
  await syncUserActiveBabyAfterAccessChange(member.userId)
  return getFamilyMembers(ownerUserId, baby.id)
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
      ageLabel: getRecipeAgeLabel(recipe),
      ageMinMonths: typeof (recipe as any).ageMinMonths === 'number' ? (recipe as any).ageMinMonths : undefined,
      ageMaxMonths: typeof (recipe as any).ageMaxMonths === 'number' ? (recipe as any).ageMaxMonths : null,
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
      ageMinMonths: { lte: (recipe as any).ageMaxMonths ?? 9999 },
      OR: [
        { ageMaxMonths: null },
        { ageMaxMonths: { gte: (recipe as any).ageMinMonths } }
      ]
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
    ageLabel: getRecipeAgeLabel(recipe),
    ageMinMonths: typeof (recipe as any).ageMinMonths === 'number' ? (recipe as any).ageMinMonths : undefined,
    ageMaxMonths: typeof (recipe as any).ageMaxMonths === 'number' ? (recipe as any).ageMaxMonths : null,
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
      ageLabel: getRecipeAgeLabel(item),
      ageMinMonths: typeof (item as any).ageMinMonths === 'number' ? (item as any).ageMinMonths : undefined,
      ageMaxMonths: typeof (item as any).ageMaxMonths === 'number' ? (item as any).ageMaxMonths : null,
      durationLabel: item.durationLabel,
      difficultyLabel: item.difficultyLabel,
      tags: item.tags.map((tag) => tag.name),
      description: item.summary ?? ''
    }))
  }
}

export async function getProfilePageData(userId: string) {
  const [baby, canAppAdmin] = await Promise.all([
    getCurrentBaby(userId),
    getUserCanAppAdmin(userId)
  ])
  const hasBaby = Boolean(baby)
  const profileMenus = [
    { key: 'baby', title: '宝宝档案', subtitle: hasBaby ? `当前：${baby?.nickname ?? ''} · ${baby?.allergens.length ?? 0} 项过敏原` : '添加宝宝昵称、生日与过敏原', icon: '👶' },
    { key: 'family', title: '家庭协作', subtitle: hasBaby ? baby?.isOwner ? '邀请家人共同查看计划与记录' : `当前身份：${baby?.accessRole === 'viewer' ? '只读成员' : baby?.accessRole === 'owner' ? '拥有者' : '协作成员'}` : '完善宝宝档案后邀请家人协作', icon: '🏠' },
    { key: 'favorite', title: '我的收藏', subtitle: '保存喜欢的辅食与饮食指南', icon: '❤️' },
    { key: 'history', title: '辅食计划', subtitle: '查看过往生成计划与查询记录', icon: '🕘' },
    { key: 'allergy', title: '过敏管理', subtitle: hasBaby ? `当前已记录 ${baby?.allergens.length ?? 0} 项过敏原` : '完善宝宝档案后管理过敏原', icon: '⚠️' },
    // { key: 'message', title: '消息通知', subtitle: '每日提醒与系统通知', icon: '🔔' },
    { key: 'help', title: '帮助中心', subtitle: '常见问题、意见反馈、使用说明', icon: '💬' }
  ]

  if (canAppAdmin) {
    profileMenus.push({
      key: 'admin',
      title: '内容管理',
      subtitle: '管理食谱与干货内容',
      icon: '🛠️'
    })
  }

  profileMenus.push(
    // { key: 'share', title: '推荐给朋友', subtitle: '一键分享给家人或宝妈群', icon: '🎁' },
    { key: 'logout', title: '退出登录', subtitle: '退出当前微信登录状态', icon: '🚪' }
  )

  return {
    hasBaby,
    babyProfile: baby ? formatBabyProfile(baby) : null,
    profileMenus,
    wechatEntries: [
      { key: 'subscribe', title: '订阅每日提醒', icon: '⏰' },
      { key: 'desktop', title: '添加到我的小程序', icon: '➕' },
      { key: 'share', title: '分享小程序', icon: '🔗' }
    ]
  }
}

export async function getRecipeList(options: { tag?: string; search?: string; page?: number; ageMinMonths?: number; ageMaxMonths?: number | null } = {}) {
  const { tag, search, page = 1, ageMinMonths, ageMaxMonths } = options
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

  if (typeof ageMinMonths === 'number') {
    const upperBound = typeof ageMaxMonths === 'number' ? ageMaxMonths : 9999
    where.ageMinMonths = { lte: upperBound }
    where.OR = [
      { ageMaxMonths: null },
      { ageMaxMonths: { gte: ageMinMonths } }
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
      ageLabel: getRecipeAgeLabel(recipe),
      ageMinMonths: typeof (recipe as any).ageMinMonths === 'number' ? (recipe as any).ageMinMonths : undefined,
      ageMaxMonths: typeof (recipe as any).ageMaxMonths === 'number' ? (recipe as any).ageMaxMonths : null,
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

export async function getUserFeedbackHistory(userId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).userFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true
      }
    }) as Array<{ id: string; content: string; createdAt: Date }>

    return {
      items: rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt.toISOString()
      })),
      total: rows.length
    }
  } catch {
    const rows = await prisma.$queryRaw<Array<{ id: string; content: string; createdAt: Date }>>`
      SELECT id, content, created_at AS "createdAt"
      FROM user_feedback
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return {
      items: rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt.toISOString()
      })),
      total: rows.length
    }
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
