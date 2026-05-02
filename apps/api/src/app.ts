import express, { type NextFunction, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { wechatConfig } from './config/wechat.js'
import { prisma } from './db/prisma.js'
import {
  getAdminDashboardOverview,
  getAdminImportJobs,
  getAdminRecipeDetail,
  getAdminRecipes,
  getAdminReviewQueue,
  getAdminSystemSettings,
  getAdminUsers,
  setUserAppAdminPermission,
  getAdminFeedbackList,
  getAdminFeedbackDetail,
  getAdminFeedbackTrend,
  createRecipe,
  updateRecipe,
  batchUpdateRecipeStatus,
  deleteRecipe,
  getAdminKnowledgeArticles,
  getAdminKnowledgeDetail,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  deleteKnowledgeArticle
} from './data/admin.js'
import {
  commitKnowledgeImport,
  commitRecipeImport,
  exportKnowledgeArticles,
  exportRecipes,
  previewKnowledgeImport,
  previewRecipeImport
} from './data/imports.js'
import {
  acceptFamilyInvite,
  createBabyProfile,
  createFamilyInvite,
  findOrCreateWechatUser,
  getAppAuthState,
  getAppMessages,
  getBatchRecipeSummaries,
  getFamilyInvites,
  getFamilyMembers,
  getFavoritesPageData,
  getGeneratePageData,
  getGuideStageData,
  getHomePageData,
  getKnowledgeArticleDetailData,
  getKnowledgePageData,
  getMealPlanDetailData,
  getPlanPageData,
  getProfilePageData,
  getRecipeDetailData,
  getRecipeList,
  getTabooGuideData,
  getUserFavoriteIds,
  getUserFeedbackHistory,
  getVaccinePageData,
  addUserFavorite,
  removeUserFavorite,
  listBabyProfiles,
  saveVaccineRecord,
  setActiveBaby,
  saveFeedingRecord,
  saveMealPlan,
  submitUserFeedback,
  swapMealPlanEntry,
  updateBabyProfile,
  updateMealPlan,
  updateUserProfile
} from './data/app.js'
import { checkDatabaseHealth } from './db/prisma.js'

type AppRequest = Request & {
  appUserId?: string
}

type BabyProfilePayload = {
  nickname: string
  birthDate: string
  allergens: string[]
  avatarUrl?: string
}

type FamilyInvitePayload = {
  babyId?: string
  role?: 'owner' | 'editor' | 'viewer'
}

type WechatSessionResponse = {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

const app = express()
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
])

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Vary', 'Origin')
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }

  next()
})

app.use(express.json({ limit: '5mb' }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置图片上传
const uploadDir = path.join(__dirname, '../uploads/images')

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 根据上传模式配置 multer
const storage = env.uploadMode === 'remote'
  ? multer.memoryStorage() // 远程上传使用内存存储
  : multer.diskStorage({   // 本地上传使用磁盘存储
      destination: (_req, _file, cb) => {
        cb(null, uploadDir)
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
      }
    })

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片格式：jpeg, jpg, png, gif, webp'))
    }
  }
})

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function getStatusCode(error: unknown) {
  if (error instanceof HttpError) {
    return error.statusCode
  }

  if (!(error instanceof Error)) {
    return 500
  }

  if (
    error.message === '请填写宝宝昵称'
    || error.message === '宝宝生日格式不正确'
    || error.message === '当前账号已存在宝宝档案，请改用编辑'
    || error.message === '未找到可编辑的宝宝档案'
    || error.message === '请先完善宝宝档案'
    || error.message === '未找到对应计划'
    || error.message === '未找到可更新的计划'
    || error.message === '未找到可替换的餐次'
    || error.message === '暂无可替换菜谱'
    || error.message === '邀请不存在或已失效'
    || error.message === '未找到可记录的餐次'
    || error.message === '喂养时间格式不正确'
    || error.message === '未找到可访问的宝宝档案'
    || error.message === '疫苗接种状态不正确'
    || error.message === '接种日期格式不正确'
    || error.message === '缺少 scheduleId'
  ) {
    return 400
  }

  if (error.message === '未找到当前登录用户') {
    return 401
  }

  if (
    error.message === '未找到对应月龄指南'
    || error.message === '未找到对应食谱'
    || error.message === '未找到对应疫苗计划'
    || error.message === '未找到对应干货内容'
  ) {
    return 404
  }

  return 500
}

function sendError(res: Response, error: unknown, fallback: string) {
  res.status(getStatusCode(error)).json({
    ok: false,
    message: getErrorMessage(error, fallback)
  })
}

function resolveUploadedImageUrl(rawUrl: string, baseUrl?: string) {
  if (!rawUrl) {
    return rawUrl
  }

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl
  }

  const normalizedBase = (baseUrl || '').trim().replace(/\/$/, '')
  if (!normalizedBase) {
    return rawUrl
  }

  if (rawUrl.startsWith('/')) {
    return `${normalizedBase}${rawUrl}`
  }

  return `${normalizedBase}/${rawUrl}`
}

function getRemoteUploadBaseUrl() {
  try {
    return new URL(env.remoteUploadUrl).origin
  } catch {
    return ''
  }
}

function shouldUseRemoteUpload(req: Request) {
  if (env.uploadMode !== 'remote' || !env.remoteUploadUrl) {
    return false
  }

  try {
    const remoteHost = new URL(env.remoteUploadUrl).host
    const currentHost = String(req.headers.host || '')
    return remoteHost !== currentHost
  } catch {
    return true
  }
}

function isPlaceholderSecret(value: string) {
  return (
    !value
    || value.includes('replace-')
    || value.includes('replace_with')
    || value.includes('your-wechat-app-secret')
    || value.includes('server-only')
  )
}

function ensureJwtSecret() {
  if (isPlaceholderSecret(env.jwtSecret)) {
    throw new HttpError(500, '服务端未配置真实 JWT_SECRET，请检查 apps/api/.env')
  }

  return env.jwtSecret
}

function createAppToken(userId: string) {
  return jwt.sign({ sub: userId, scope: 'app' }, ensureJwtSecret(), { expiresIn: '7d' })
}

function verifyAppToken(token: string) {
  try {
    const payload = jwt.verify(token, ensureJwtSecret())

    if (
      typeof payload !== 'object'
      || !payload
      || payload.scope !== 'app'
      || typeof payload.sub !== 'string'
    ) {
      throw new HttpError(401, '登录状态已失效，请重新登录')
    }

    return payload.sub
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }

    throw new HttpError(401, '登录状态已失效，请重新登录')
  }
}

function getBearerToken(req: Request) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return ''
  }

  return authorization.slice('Bearer '.length).trim()
}

function getAppUserId(req: Request) {
  const userId = (req as AppRequest).appUserId

  if (!userId) {
    throw new HttpError(401, '请先登录')
  }

  return userId
}

function requireAppAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req)

    if (!token) {
      throw new HttpError(401, '请先登录')
    }

    ;(req as AppRequest).appUserId = verifyAppToken(token)
    next()
  } catch (error) {
    sendError(res, error, '登录校验失败')
  }
}

async function ensureUserCanManageAppContent(userId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: { canAppAdmin: true }
    }) as { canAppAdmin?: boolean } | null

    if (!user?.canAppAdmin) {
      throw new HttpError(403, '当前账号无内容管理权限')
    }

    return
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }

    const rows = await prisma.$queryRaw<Array<{ canAppAdmin: boolean }>>`
      SELECT can_app_admin AS "canAppAdmin"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `

    if (!rows[0]?.canAppAdmin) {
      throw new HttpError(403, '当前账号无内容管理权限')
    }
  }
}

async function requireAppAdminPermission(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureUserCanManageAppContent(getAppUserId(req))
    next()
  } catch (error) {
    sendError(res, error, '权限校验失败')
  }
}

function parseBabyProfilePayload(body: unknown): BabyProfilePayload {
  const payload = body as Record<string, unknown> | null | undefined

  return {
    nickname: typeof payload?.nickname === 'string' ? payload.nickname : '',
    birthDate: typeof payload?.birthDate === 'string' ? payload.birthDate : '',
    allergens: Array.isArray(payload?.allergens)
      ? payload.allergens.filter((item): item is string => typeof item === 'string')
      : [],
    avatarUrl: typeof payload?.avatarUrl === 'string' ? payload.avatarUrl : undefined
  }
}

function getRouteParam(value: string | string[] | undefined) {
  if (typeof value === 'string') {
    return value
  }

  return Array.isArray(value) ? value[0] ?? '' : ''
}

function maskSecret(value: string) {
  if (!value) {
    return '(empty)'
  }

  if (value.length <= 8) {
    return '***'
  }

  return `***${value.slice(-4)}`
}

async function getWechatSession(code: string) {
  if (!wechatConfig.appId) {
    throw new HttpError(500, '服务端未配置 WECHAT_APP_ID，请检查 apps/api/.env')
  }

  if (isPlaceholderSecret(wechatConfig.secret)) {
    throw new HttpError(500, '服务端未配置真实 WECHAT_SECRET，请检查 apps/api/.env，而不是 .env.example')
  }

  const searchParams = new URLSearchParams({
    appid: wechatConfig.appId,
    secret: wechatConfig.secret,
    js_code: code,
    grant_type: 'authorization_code'
  })

  const response = await fetch(`https://api.weixin.qq.com/sns/jscode2session?${searchParams.toString()}`)

  if (!response.ok) {
    throw new HttpError(502, '微信登录服务暂时不可用')
  }

  const payload = await response.json() as WechatSessionResponse

  if (payload.errcode || !payload.openid) {
    throw new HttpError(401, payload.errmsg ? `微信登录失败：${payload.errmsg}` : '微信登录失败，请稍后重试')
  }

  return payload
}

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabaseHealth()
    res.json({ ok: true, service: 'baby-food-api', env: env.nodeEnv, database: 'connected' })
  } catch (error) {
    res.json({
      ok: true,
      service: 'baby-food-api',
      env: env.nodeEnv,
      database: 'disconnected',
      databaseMessage: error instanceof Error ? error.message : '数据库不可用'
    })
  }
})

app.get('/api/debug/runtime-config', (_req, res) => {
  res.json({
    ok: true,
    data: {
      wechatAppId: env.wechatAppId,
      wechatSecretMasked: maskSecret(env.wechatSecret),
      wechatSecretLooksPlaceholder: isPlaceholderSecret(env.wechatSecret),
      jwtSecretMasked: maskSecret(env.jwtSecret),
      jwtSecretLooksPlaceholder: isPlaceholderSecret(env.jwtSecret),
      uploadMode: env.uploadMode,
      remoteUploadConfigured: Boolean(env.remoteUploadUrl),
      remoteUploadHost: env.remoteUploadUrl ? getRemoteUploadBaseUrl() : ''
    }
  })
})

app.post('/api/app/auth/wechat-login', async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : ''
  const nickname = typeof req.body?.nickname === 'string' ? req.body.nickname.trim() : undefined
  const avatarUrl = typeof req.body?.avatarUrl === 'string' ? req.body.avatarUrl.trim() : undefined

  if (!code) {
    sendError(res, new HttpError(400, '缺少微信登录凭证'), '微信登录失败')
    return
  }

  try {
    const wechatSession = await getWechatSession(code)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    const user = await findOrCreateWechatUser(
      wechatSession.openid!,
      { nickname, avatarUrl },
      { ipAddress, userAgent }
    )
    const authState = await getAppAuthState(user.id)

    res.json({
      ok: true,
      data: {
        token: createAppToken(user.id),
        ...authState
      }
    })
  } catch (error) {
    sendError(res, error, '微信登录失败')
  }
})

app.get('/api/app/auth/me', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getAppAuthState(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '登录态读取失败')
  }
})

app.post('/api/app/auth/logout', (_req, res) => {
  res.json({
    ok: true,
    data: {
      loggedOut: true
    }
  })
})

app.patch('/api/app/auth/user', requireAppAuth, async (req, res) => {
  try {
    const payload = req.body as Record<string, unknown> | null | undefined
    const nickname = typeof payload?.nickname === 'string' ? payload.nickname : undefined
    const avatarUrl = typeof payload?.avatarUrl === 'string' ? payload.avatarUrl : undefined

    await updateUserProfile(getAppUserId(req), { nickname, avatarUrl })
    res.json({ ok: true, data: await getAppAuthState(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '用户信息更新失败')
  }
})

app.post('/api/app/babies', requireAppAuth, async (req, res) => {
  try {
    res.json({
      ok: true,
      data: await createBabyProfile(getAppUserId(req), parseBabyProfilePayload(req.body))
    })
  } catch (error) {
    sendError(res, error, '宝宝档案创建失败')
  }
})

app.get('/api/app/babies', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await listBabyProfiles(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '宝宝档案列表读取失败')
  }
})

app.put('/api/app/babies/:id', requireAppAuth, async (req, res) => {
  try {
    res.json({
      ok: true,
      data: await updateBabyProfile(getAppUserId(req), getRouteParam(req.params.id), parseBabyProfilePayload(req.body))
    })
  } catch (error) {
    sendError(res, error, '宝宝档案更新失败')
  }
})

app.post('/api/app/babies/:id/activate', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await setActiveBaby(getAppUserId(req), getRouteParam(req.params.id)) })
  } catch (error) {
    sendError(res, error, '切换宝宝失败')
  }
})

app.get('/api/app/family/members', requireAppAuth, async (req, res) => {
  try {
    const babyId = typeof req.query.babyId === 'string' ? req.query.babyId : undefined
    res.json({ ok: true, data: await getFamilyMembers(getAppUserId(req), babyId) })
  } catch (error) {
    sendError(res, error, '家庭成员读取失败')
  }
})

app.get('/api/app/family/invites', requireAppAuth, async (req, res) => {
  try {
    const babyId = typeof req.query.babyId === 'string' ? req.query.babyId : undefined
    res.json({ ok: true, data: await getFamilyInvites(getAppUserId(req), babyId) })
  } catch (error) {
    sendError(res, error, '家庭邀请读取失败')
  }
})

app.post('/api/app/family/invites', requireAppAuth, async (req, res) => {
  try {
    const payload = (req.body ?? {}) as FamilyInvitePayload
    res.json({ ok: true, data: await createFamilyInvite(getAppUserId(req), payload) })
  } catch (error) {
    sendError(res, error, '家庭邀请创建失败')
  }
})

app.post('/api/app/family/invites/accept', requireAppAuth, async (req, res) => {
  const inviteCode = typeof req.body?.inviteCode === 'string' ? req.body.inviteCode.trim() : ''

  if (!inviteCode) {
    sendError(res, new HttpError(400, '邀请不存在或已失效'), '家庭邀请接受失败')
    return
  }

  try {
    res.json({ ok: true, data: await acceptFamilyInvite(getAppUserId(req), inviteCode) })
  } catch (error) {
    sendError(res, error, '家庭邀请接受失败')
  }
})

app.get('/api/app/home', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getHomePageData(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '首页数据读取失败')
  }
})

app.post('/api/app/meal-plans/generate-today', requireAppAuth, async (req, res) => {
  const mealCount = typeof req.body?.mealCount === 'string' ? req.body.mealCount : '3餐'
  const goals = Array.isArray(req.body?.goals)
    ? req.body.goals.filter((item: unknown): item is string => typeof item === 'string')
    : []
  const legacyAgeRange = typeof req.body?.ageRange === 'string' ? req.body.ageRange : undefined
  const numericAgeRange = req.body?.ageRange && typeof req.body.ageRange === 'object'
    ? {
        min: typeof req.body.ageRange.minMonths === 'number' ? req.body.ageRange.minMonths : undefined,
        max: typeof req.body.ageRange.maxMonths === 'number' ? req.body.ageRange.maxMonths : null
      }
    : undefined
  const ageRange = typeof numericAgeRange?.min === 'number'
    ? numericAgeRange
    : legacyAgeRange
  const excludeTags = Array.isArray(req.body?.excludeTags)
    ? req.body.excludeTags.filter((item: unknown): item is string => typeof item === 'string')
    : undefined
  const avoidRepeat = typeof req.body?.avoidRepeat === 'string' ? req.body.avoidRepeat : undefined

  try {
    res.json({ ok: true, data: await getGeneratePageData(getAppUserId(req), mealCount, goals, ageRange, excludeTags, avoidRepeat) })
  } catch (error) {
    sendError(res, error, '生成辅食计划失败')
  }
})

app.get('/api/app/meal-plans/overview', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getPlanPageData(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '计划总览读取失败')
  }
})

app.get('/api/app/meal-plans/week', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: (await getPlanPageData(getAppUserId(req))).weeklyPlanDays })
  } catch (error) {
    sendError(res, error, '本周计划读取失败')
  }
})

app.get('/api/app/meal-plans/history', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: (await getPlanPageData(getAppUserId(req))).historyMealPlans })
  } catch (error) {
    sendError(res, error, '历史计划读取失败')
  }
})

app.get('/api/app/meal-plans/:id', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getMealPlanDetailData(getAppUserId(req), getRouteParam(req.params.id)) })
  } catch (error) {
    sendError(res, error, '计划详情读取失败')
  }
})

app.post('/api/app/meal-plans', requireAppAuth, async (req, res) => {
  try {
    const payload = req.body as {
      title?: string
      dateLabel?: string
      planDate?: string
      nutritionScore: number
      waterSuggestion: string
      entries: Array<{
        recipeId?: string
        customRecipeId?: string
        isCustom?: boolean
        slot: string
        time: string
        title: string
        focus: string
        image?: string
        tags?: string[]
      }>
    }

    res.json({ ok: true, data: await saveMealPlan(getAppUserId(req), payload) })
  } catch (error) {
    sendError(res, error, '计划保存失败')
  }
})

app.put('/api/app/meal-plans/:id', requireAppAuth, async (req, res) => {
  try {
    const payload = req.body as {
      title?: string
      dateLabel?: string
      planDate?: string
      nutritionScore: number
      waterSuggestion: string
      entries: Array<{
        recipeId?: string
        customRecipeId?: string
        isCustom?: boolean
        slot: string
        time: string
        title: string
        focus: string
        image?: string
        tags?: string[]
      }>
    }

    res.json({ ok: true, data: await updateMealPlan(getAppUserId(req), getRouteParam(req.params.id), payload) })
  } catch (error) {
    sendError(res, error, '计划更新失败')
  }
})

app.post('/api/app/meal-plans/:id/items/:itemId/feeding-record', requireAppAuth, async (req, res) => {
  try {
    const payload = req.body as {
      status?: 'fed' | 'skipped'
      note?: string
      fedAt?: string
    }

    res.json({
      ok: true,
      data: await saveFeedingRecord(getAppUserId(req), getRouteParam(req.params.id), getRouteParam(req.params.itemId), {
        status: payload.status === 'skipped' ? 'skipped' : 'fed',
        note: payload.note,
        fedAt: payload.fedAt
      })
    })
  } catch (error) {
    sendError(res, error, '喂养记录保存失败')
  }
})

app.post('/api/app/meal-plans/:id/items/:itemId/swap', requireAppAuth, async (req, res) => {
  try {
    res.json({
      ok: true,
      data: await swapMealPlanEntry(getAppUserId(req), getRouteParam(req.params.id), getRouteParam(req.params.itemId))
    })
  } catch (error) {
    sendError(res, error, '餐次替换失败')
  }
})

app.get('/api/app/recipes', async (req, res) => {
  const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const page = typeof req.query.page === 'string' ? Math.max(1, parseInt(req.query.page, 10) || 1) : 1
  const ageMinMonths = typeof req.query.ageMinMonths === 'string' ? Number.parseInt(req.query.ageMinMonths, 10) : undefined
  const ageMaxMonths = typeof req.query.ageMaxMonths === 'string' ? Number.parseInt(req.query.ageMaxMonths, 10) : undefined

  try {
    res.json({ ok: true, data: await getRecipeList({ tag, search, page, ageMinMonths: Number.isNaN(ageMinMonths as number) ? undefined : ageMinMonths, ageMaxMonths: Number.isNaN(ageMaxMonths as number) ? undefined : ageMaxMonths }) })
  } catch (error) {
    sendError(res, error, '食谱列表读取失败')
  }
})

app.post('/api/app/recipes/batch-summary', async (req, res) => {
  const recipeIds = Array.isArray(req.body?.recipeIds)
    ? req.body.recipeIds.filter((item: unknown): item is string => typeof item === 'string')
    : []

  try {
    res.json({ ok: true, data: await getBatchRecipeSummaries(recipeIds) })
  } catch (error) {
    sendError(res, error, '食谱摘要读取失败')
  }
})

app.get('/api/app/recipes/:id', async (req, res) => {
  try {
    res.json({ ok: true, data: await getRecipeDetailData(getRouteParam(req.params.id)) })
  } catch (error) {
    sendError(res, error, '食谱详情读取失败')
  }
})

app.get('/api/app/guides/stages/:stageKey', async (req, res) => {
  try {
    res.json({ ok: true, data: await getGuideStageData(getRouteParam(req.params.stageKey)) })
  } catch (error) {
    sendError(res, error, '月龄指南读取失败')
  }
})

app.get('/api/app/taboo/query', async (req, res) => {
  const symptom = typeof req.query.symptom === 'string' ? req.query.symptom : '腹泻'

  try {
    res.json({ ok: true, data: await getTabooGuideData(symptom) })
  } catch (error) {
    sendError(res, error, '病症忌口读取失败')
  }
})

app.get('/api/app/vaccines', async (req, res) => {
  const authorization = req.headers.authorization
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''

  try {
    const userId = token ? verifyAppToken(token) : undefined
    res.json({ ok: true, data: await getVaccinePageData(userId) })
  } catch (error) {
    sendError(res, error, '疫苗记录读取失败')
  }
})

app.post('/api/app/vaccines/records', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await saveVaccineRecord(getAppUserId(req), req.body ?? {}) })
  } catch (error) {
    sendError(res, error, '疫苗记录保存失败')
  }
})

app.get('/api/app/knowledge', async (req, res) => {
  const authorization = req.headers.authorization
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''

  try {
    const userId = token ? verifyAppToken(token) : undefined
    res.json({ ok: true, data: await getKnowledgePageData(userId) })
  } catch (error) {
    sendError(res, error, '干货列表读取失败')
  }
})

app.get('/api/app/knowledge/:id', async (req, res) => {
  const authorization = req.headers.authorization
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''

  try {
    const userId = token ? verifyAppToken(token) : undefined
    res.json({ ok: true, data: await getKnowledgeArticleDetailData(getRouteParam(req.params.id), userId) })
  } catch (error) {
    sendError(res, error, '干货详情读取失败')
  }
})

app.get('/api/app/profile', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getProfilePageData(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '个人中心读取失败')
  }
})

app.get('/api/app/favorites', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: { recipeIds: await getUserFavoriteIds(getAppUserId(req)) } })
  } catch (error) {
    sendError(res, error, '收藏读取失败')
  }
})

app.get('/api/app/favorites/page', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getFavoritesPageData(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '收藏页面读取失败')
  }
})

app.post('/api/app/favorites', requireAppAuth, async (req, res) => {
  const recipeId = typeof req.body?.recipeId === 'string' ? req.body.recipeId : ''
  if (!recipeId) {
    return res.status(400).json({ ok: false, message: '缺少 recipeId' })
  }
  try {
    await addUserFavorite(getAppUserId(req), recipeId)
    res.json({ ok: true, data: null })
  } catch (error) {
    sendError(res, error, '收藏添加失败')
  }
})

app.delete('/api/app/favorites/:recipeId', requireAppAuth, async (req, res) => {
  try {
    await removeUserFavorite(getAppUserId(req), getRouteParam(req.params.recipeId))
    res.json({ ok: true, data: null })
  } catch (error) {
    sendError(res, error, '收藏移除失败')
  }
})

app.get('/api/app/messages', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: { messages: await getAppMessages(getAppUserId(req)) } })
  } catch (error) {
    sendError(res, error, '消息读取失败')
  }
})

app.get('/api/app/feedback', requireAppAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getUserFeedbackHistory(getAppUserId(req)) })
  } catch (error) {
    sendError(res, error, '反馈历史读取失败')
  }
})

app.post('/api/app/feedback', requireAppAuth, async (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content : ''
  try {
    await submitUserFeedback(getAppUserId(req), content)
    res.json({ ok: true, data: null })
  } catch (error) {
    sendError(res, error, '反馈提交失败')
  }
})

app.get('/api/app/admin/recipes', requireAppAuth, requireAppAdminPermission, async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminRecipes() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱列表读取失败' })
  }
})

app.get('/api/app/admin/recipes/:id', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    res.json({ ok: true, data: await getAdminRecipeDetail(getRouteParam(req.params.id)) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱详情读取失败' })
  }
})

app.post('/api/app/admin/recipes', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    const data = await createRecipe(req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱创建失败' })
  }
})

app.put('/api/app/admin/recipes/:id', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    const data = await updateRecipe(getRouteParam(req.params.id), req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱更新失败' })
  }
})

app.get('/api/app/admin/knowledge', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    const categoryKey = typeof req.query.categoryKey === 'string' ? req.query.categoryKey : undefined
    res.json({ ok: true, data: await getAdminKnowledgeArticles(categoryKey) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货列表读取失败' })
  }
})

app.get('/api/app/admin/knowledge/:id', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    res.json({ ok: true, data: await getAdminKnowledgeDetail(getRouteParam(req.params.id)) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货详情读取失败' })
  }
})

app.post('/api/app/admin/knowledge', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    const data = await createKnowledgeArticle(req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货创建失败' })
  }
})

app.put('/api/app/admin/knowledge/:id', requireAppAuth, requireAppAdminPermission, async (req, res) => {
  try {
    const data = await updateKnowledgeArticle(getRouteParam(req.params.id), req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货更新失败' })
  }
})

app.post('/api/app/admin/upload/image', requireAppAuth, requireAppAdminPermission, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ ok: false, message: '未上传图片文件' })
      return
    }

    let imageUrl: string

    if (shouldUseRemoteUpload(req)) {
      if (!env.remoteUploadUrl) {
        res.status(500).json({ ok: false, message: '未配置远程上传地址' })
        return
      }

      const formData = new FormData()
      formData.append(
        'image',
        new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }),
        req.file.originalname
      )

      const headers: Record<string, string> = {}
      if (env.remoteUploadToken) {
        headers['Authorization'] = `Bearer ${env.remoteUploadToken}`
      }

      const response = await fetch(env.remoteUploadUrl, {
        method: 'POST',
        body: formData,
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = errorText
        try {
          const errorPayload = JSON.parse(errorText) as { message?: string }
          errorMessage = errorPayload.message ?? errorText
        } catch {
        }
        res.status(500).json({ ok: false, message: `远程上传失败: ${response.status} ${errorMessage}` })
        return
      }

      const result = await response.json() as { ok: boolean; data?: { url: string }; message?: string }

      if (!result.ok || !result.data?.url) {
        res.status(500).json({ ok: false, message: result.message || '远程上传失败' })
        return
      }

      imageUrl = resolveUploadedImageUrl(result.data.url, getRemoteUploadBaseUrl())
    } else {
      imageUrl = resolveUploadedImageUrl(`/uploads/images/${req.file.filename}`, env.uploadBaseUrl)
    }

    res.json({ ok: true, data: { url: imageUrl } })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '图片上传失败' })
  }
})

app.post('/api/admin/auth/login', (_req, res) => {
  res.json({ ok: true, data: { token: 'mock-admin-token' } })
})

// 图片上传接口（admin token 或 app Bearer token 均可调用）
app.post('/api/admin/upload/image', upload.single('image'), async (req, res) => {
  // 简单鉴权：有 Bearer token 即可（admin mock token 或 app JWT 均接受）
  // const authHeader = req.headers['authorization'] ?? ''
  // const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  // if (!token) {
  //   res.status(401).json({ ok: false, message: '未授权' })
  //   return
  // }
  try {
    if (!req.file) {
      res.status(400).json({ ok: false, message: '未上传图片文件' })
      return
    }

    let imageUrl: string

    if (shouldUseRemoteUpload(req)) {
      // 远程上传模式
      if (!env.remoteUploadUrl) {
        res.status(500).json({ ok: false, message: '未配置远程上传地址' })
        return
      }

      const formData = new FormData()
      formData.append(
        'image',
        new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }),
        req.file.originalname
      )

      const headers: Record<string, string> = {}
      if (env.remoteUploadToken) {
        headers['Authorization'] = `Bearer ${env.remoteUploadToken}`
      }

      const response = await fetch(env.remoteUploadUrl, {
        method: 'POST',
        body: formData,
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = errorText
        try {
          const errorPayload = JSON.parse(errorText) as { message?: string }
          errorMessage = errorPayload.message ?? errorText
        } catch {
        }
        res.status(500).json({ ok: false, message: `远程上传失败: ${response.status} ${errorMessage}` })
        return
      }

      const result = await response.json() as { ok: boolean; data?: { url: string }; message?: string }

      if (!result.ok || !result.data?.url) {
        res.status(500).json({ ok: false, message: result.message || '远程上传失败' })
        return
      }

      imageUrl = resolveUploadedImageUrl(result.data.url, getRemoteUploadBaseUrl())
    } else {
      // 本地上传模式
      imageUrl = resolveUploadedImageUrl(`/uploads/images/${req.file.filename}`, env.uploadBaseUrl)
    }

    res.json({ ok: true, data: { url: imageUrl } })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '图片上传失败' })
  }
})

app.get('/api/admin/dashboard/overview', async (req, res) => {
  try {
    const range = typeof req.query.range === 'string' && ['week', 'month', 'year', 'all'].includes(req.query.range)
      ? req.query.range as 'week' | 'month' | 'year' | 'all'
      : 'week'
    res.json({ ok: true, data: await getAdminDashboardOverview(range) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '看板数据读取失败' })
  }
})

app.get('/api/admin/dashboard/feedback-trend', async (req, res) => {
  try {
    const range = typeof req.query.range === 'string' && ['week', 'month', 'year', 'all'].includes(req.query.range)
      ? req.query.range as 'week' | 'month' | 'year' | 'all'
      : 'week'
    res.json({ ok: true, data: await getAdminFeedbackTrend(range) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '反馈趋势读取失败' })
  }
})

app.get('/api/admin/recipes', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminRecipes() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱列表读取失败' })
  }
})

app.get('/api/admin/recipes/:id', async (req, res) => {
  try {
    res.json({ ok: true, data: await getAdminRecipeDetail(getRouteParam(req.params.id)) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱详情读取失败' })
  }
})

app.post('/api/admin/recipes', async (req, res) => {
  try {
    const data = await createRecipe(req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱创建失败' })
  }
})

app.put('/api/admin/recipes/:id', async (req, res) => {
  try {
    const data = await updateRecipe(getRouteParam(req.params.id), req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱更新失败' })
  }
})

app.delete('/api/admin/recipes/:id', async (req, res) => {
  try {
    await deleteRecipe(getRouteParam(req.params.id))
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱删除失败' })
  }
})

app.post('/api/admin/recipes/batch-update-status', async (req, res) => {
  try {
    const { recipeIds, contentStatus } = req.body as { recipeIds: string[], contentStatus: string }
    await batchUpdateRecipeStatus(recipeIds, contentStatus)
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '批量更新失败' })
  }
})

app.post('/api/admin/recipes/:id/submit-review', async (req, res) => {
  try {
    const recipeId = getRouteParam(req.params.id)
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        contentStatus: 'pending_review',
        reviewStatus: 'pending'
      }
    })
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '提交审核失败' })
  }
})

app.post('/api/admin/recipes/:id/publish', async (req, res) => {
  try {
    const recipeId = getRouteParam(req.params.id)
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { contentStatus: 'published' }
    })
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '发布失败' })
  }
})

app.post('/api/admin/recipes/:id/offline', async (req, res) => {
  try {
    const recipeId = getRouteParam(req.params.id)
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { contentStatus: 'offline' }
    })
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '下架失败' })
  }
})

app.post('/api/admin/recipes/:id/restore', async (req, res) => {
  try {
    const recipeId = getRouteParam(req.params.id)
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { contentStatus: 'draft' }
    })
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '恢复失败' })
  }
})

app.post('/api/admin/imports/recipes/preview', async (req, res) => {
  try {
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName : 'recipes-import'
    const format = req.body?.format === 'csv' ? 'csv' : 'json'
    const content = typeof req.body?.content === 'string' ? req.body.content : ''
    res.json({ ok: true, data: await previewRecipeImport({ fileName, format, content }) })
  } catch (error) {
    res.status(400).json({ ok: false, message: error instanceof Error ? error.message : '食谱导入预检失败' })
  }
})

app.post('/api/admin/imports/recipes/commit', async (req, res) => {
  try {
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName : 'recipes-import'
    const format = req.body?.format === 'csv' ? 'csv' : 'json'
    const content = typeof req.body?.content === 'string' ? req.body.content : ''
    res.json({ ok: true, data: await commitRecipeImport({ fileName, format, content }) })
  } catch (error) {
    res.status(400).json({ ok: false, message: error instanceof Error ? error.message : '食谱导入提交失败' })
  }
})

app.post('/api/admin/imports/knowledge/preview', async (req, res) => {
  try {
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName : 'knowledge-import'
    const format = req.body?.format === 'csv' ? 'csv' : 'json'
    const content = typeof req.body?.content === 'string' ? req.body.content : ''
    res.json({ ok: true, data: await previewKnowledgeImport({ fileName, format, content }) })
  } catch (error) {
    res.status(400).json({ ok: false, message: error instanceof Error ? error.message : '干货导入预检失败' })
  }
})

app.post('/api/admin/imports/knowledge/commit', async (req, res) => {
  try {
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName : 'knowledge-import'
    const format = req.body?.format === 'csv' ? 'csv' : 'json'
    const content = typeof req.body?.content === 'string' ? req.body.content : ''
    res.json({ ok: true, data: await commitKnowledgeImport({ fileName, format, content }) })
  } catch (error) {
    res.status(400).json({ ok: false, message: error instanceof Error ? error.message : '干货导入提交失败' })
  }
})

app.get('/api/admin/exports/recipes', async (req, res) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json'
    const content = await exportRecipes(format)
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="recipes-export.${format}"`)
    res.send(content)
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '食谱导出失败' })
  }
})

app.get('/api/admin/exports/knowledge', async (req, res) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json'
    const content = await exportKnowledgeArticles(format)
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="knowledge-export.${format}"`)
    res.send(content)
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货导出失败' })
  }
})

app.get('/api/admin/imports', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminImportJobs() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '导入记录读取失败' })
  }
})

app.get('/api/admin/feedback', async (req, res) => {
  try {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : undefined
    res.json({ ok: true, data: await getAdminFeedbackList(keyword) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '反馈列表读取失败' })
  }
})

app.get('/api/admin/feedback/:id', async (req, res) => {
  try {
    res.json({ ok: true, data: await getAdminFeedbackDetail(getRouteParam(req.params.id)) })
  } catch (error) {
    const message = error instanceof Error ? error.message : '反馈详情读取失败'
    if (message === '未找到对应反馈') {
      res.status(404).json({ ok: false, message })
      return
    }

    res.status(500).json({ ok: false, message })
  }
})

app.get('/api/admin/reviews/pending', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminReviewQueue() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '审核队列读取失败' })
  }
})

app.post('/api/admin/reviews/:recipeId/approve', async (req, res) => {
  try {
    const recipeId = getRouteParam(req.params.recipeId)
    const { comment } = req.body as { comment?: string }

    await prisma.$transaction([
      prisma.recipe.update({
        where: { id: recipeId },
        data: {
          reviewStatus: 'approved',
          contentStatus: 'published'
        }
      }),
      prisma.recipeReview.create({
        data: {
          recipeId,
          action: 'approved',
          comment: comment || '审核通过'
        }
      })
    ])

    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '审核通过失败' })
  }
})

app.post('/api/admin/reviews/:recipeId/reject', async (req, res) => {
  try {
    const recipeId = getRouteParam(req.params.recipeId)
    const { comment } = req.body as { comment: string }

    if (!comment || !comment.trim()) {
      res.status(400).json({ ok: false, message: '请填写拒绝原因' })
      return
    }

    await prisma.$transaction([
      prisma.recipe.update({
        where: { id: recipeId },
        data: {
          reviewStatus: 'rejected',
          contentStatus: 'draft'
        }
      }),
      prisma.recipeReview.create({
        data: {
          recipeId,
          action: 'rejected',
          comment
        }
      })
    ])

    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '审核拒绝失败' })
  }
})

app.get('/api/admin/users', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminUsers() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '用户列表读取失败' })
  }
})

app.patch('/api/admin/users/:id/permissions', async (req, res) => {
  try {
    const canAppAdmin = Boolean(req.body?.canAppAdmin)
    await setUserAppAdminPermission(getRouteParam(req.params.id), canAppAdmin)
    res.json({ ok: true, data: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : '用户权限更新失败'
    res.status(message === '未找到对应用户' ? 404 : 500).json({ ok: false, message })
  }
})

app.get('/api/admin/settings/system', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminSystemSettings() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '系统设置读取失败' })
  }
})

// 干货管理接口
app.get('/api/admin/knowledge', async (req, res) => {
  try {
    const categoryKey = typeof req.query.categoryKey === 'string' ? req.query.categoryKey : undefined
    res.json({ ok: true, data: await getAdminKnowledgeArticles(categoryKey) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货列表读取失败' })
  }
})

app.get('/api/admin/knowledge/:id', async (req, res) => {
  try {
    res.json({ ok: true, data: await getAdminKnowledgeDetail(getRouteParam(req.params.id)) })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货详情读取失败' })
  }
})

app.post('/api/admin/knowledge', async (req, res) => {
  try {
    const data = await createKnowledgeArticle(req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货创建失败' })
  }
})

app.put('/api/admin/knowledge/:id', async (req, res) => {
  try {
    const data = await updateKnowledgeArticle(getRouteParam(req.params.id), req.body)
    res.json({ ok: true, data })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货更新失败' })
  }
})

app.delete('/api/admin/knowledge/:id', async (req, res) => {
  try {
    await deleteKnowledgeArticle(getRouteParam(req.params.id))
    res.json({ ok: true, data: null })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '干货删除失败' })
  }
})

app.put('/api/admin/settings/system', (_req, res) => {
  res.json({ ok: true, message: 'system settings updated mock' })
})

export default app
