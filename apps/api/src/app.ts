import express, { type NextFunction, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from './config/env.js'
import { wechatConfig } from './config/wechat.js'
import {
  getAdminDashboardOverview,
  getAdminImportJobs,
  getAdminRecipeDetail,
  getAdminRecipes,
  getAdminReviewQueue,
  getAdminSystemSettings,
  getAdminUsers
} from './data/admin.js'
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

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }

  next()
})

app.use(express.json())

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
      jwtSecretLooksPlaceholder: isPlaceholderSecret(env.jwtSecret)
    }
  })
})

app.post('/api/app/auth/wechat-login', async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : ''

  if (!code) {
    sendError(res, new HttpError(400, '缺少微信登录凭证'), '微信登录失败')
    return
  }

  try {
    const wechatSession = await getWechatSession(code)
    const user = await findOrCreateWechatUser(wechatSession.openid!)
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

  try {
    res.json({ ok: true, data: await getGeneratePageData(getAppUserId(req), mealCount, goals) })
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

  try {
    res.json({ ok: true, data: await getRecipeList({ tag, search, page }) })
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

app.post('/api/app/feedback', requireAppAuth, async (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content : ''
  try {
    await submitUserFeedback(getAppUserId(req), content)
    res.json({ ok: true, data: null })
  } catch (error) {
    sendError(res, error, '反馈提交失败')
  }
})

app.post('/api/admin/auth/login', (_req, res) => {
  res.json({ ok: true, data: { token: 'mock-admin-token' } })
})

app.get('/api/admin/dashboard/overview', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminDashboardOverview() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '看板数据读取失败' })
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

app.post('/api/admin/recipes', (_req, res) => {
  res.json({ ok: true, message: 'create recipe mock' })
})

app.put('/api/admin/recipes/:id', (req, res) => {
  res.json({ ok: true, message: `update recipe ${getRouteParam(req.params.id)} mock` })
})

app.post('/api/admin/recipes/:id/submit-review', (req, res) => {
  res.json({ ok: true, message: `submit review ${getRouteParam(req.params.id)} mock` })
})

app.post('/api/admin/recipes/:id/publish', (req, res) => {
  res.json({ ok: true, message: `publish ${getRouteParam(req.params.id)} mock` })
})

app.post('/api/admin/recipes/:id/offline', (req, res) => {
  res.json({ ok: true, message: `offline ${getRouteParam(req.params.id)} mock` })
})

app.post('/api/admin/recipes/:id/restore', (req, res) => {
  res.json({ ok: true, message: `restore ${getRouteParam(req.params.id)} mock` })
})

app.post('/api/admin/imports/recipes', (_req, res) => {
  res.json({ ok: true, message: 'import recipes mock' })
})

app.get('/api/admin/imports', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminImportJobs() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '导入记录读取失败' })
  }
})

app.get('/api/admin/reviews/pending', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminReviewQueue() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '审核队列读取失败' })
  }
})

app.post('/api/admin/reviews/:recipeId/approve', (req, res) => {
  res.json({ ok: true, message: `approve ${getRouteParam(req.params.recipeId)} mock` })
})

app.post('/api/admin/reviews/:recipeId/reject', (req, res) => {
  res.json({ ok: true, message: `reject ${getRouteParam(req.params.recipeId)} mock` })
})

app.get('/api/admin/users', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminUsers() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '用户列表读取失败' })
  }
})

app.get('/api/admin/settings/system', async (_req, res) => {
  try {
    res.json({ ok: true, data: await getAdminSystemSettings() })
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '系统设置读取失败' })
  }
})

app.put('/api/admin/settings/system', (_req, res) => {
  res.json({ ok: true, message: 'system settings updated mock' })
})

export default app
