import type {
  AuthSession,
  AuthState,
  BabyProfile,
  BabyProfilePayload,
  BatchRecipeSummaryResponse,
  CreateFamilyInvitePayload,
  CreateFamilyInviteResponse,
  FamilyInvitesResponse,
  FamilyMembersResponse,
  GeneratePageData,
  GuideStage,
  HomeFeature,
  HomeShortcut,
  IngredientHighlight,
  MealCount,
  MealPlanDetail,
  NutritionGoal,
  PlanPageData,
  ProfilePageData,
  SaveFeedingRecordPayload,
  SaveFeedingRecordResponse,
  SaveMealPlanPayload,
  SaveMealPlanResponse,
  SwapMealPlanResponse,
  TabooGuide
} from '@baby-food/shared-types'
import { appConfig } from '@/config/app'

interface ApiResponse<T> {
  ok: boolean
  data: T
  message?: string
}

interface HomePageData {
  babyProfile: BabyProfile
  homeFeatures: HomeFeature[]
  homeShortcuts: HomeShortcut[]
  ingredientHighlights: IngredientHighlight[]
}

type NavigateMode = 'navigateTo' | 'reLaunch'
type RequestOptions = Partial<UniApp.RequestOptions> & {
  redirectOnUnauthorized?: boolean
}

type UniPageLike = {
  route?: string
  options?: Record<string, string | number | boolean | undefined>
}

const AUTH_SESSION_KEY = 'appAuthSession'
const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirectUrl'
const LOGIN_PAGE = '/pages/login/index'
const HOME_PAGE = '/pages/home/index'
const BABY_FORM_PAGE = '/pages/baby-form/index'
const FAMILY_PAGE = '/pages/family/index'
const PROTECTED_PAGES = new Set([
  '/pages/home/index',
  '/pages/generate/index',
  '/pages/plan/index',
  '/pages/plan-detail/index',
  '/pages/profile/index',
  FAMILY_PAGE
])

function getRouteBase(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.split('?')[0] || normalized
}

function getCurrentRoutePath() {
  const pages = getCurrentPages() as UniPageLike[]
  const currentPage = pages[pages.length - 1]
  return currentPage?.route ? `/${currentPage.route}` : ''
}

function getCurrentRouteUrl() {
  const pages = getCurrentPages() as UniPageLike[]
  const currentPage = pages[pages.length - 1]

  if (!currentPage?.route) {
    return ''
  }

  const route = `/${currentPage.route}`
  const options = currentPage.options ?? {}
  const query = Object.entries(options)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return query ? `${route}?${query}` : route
}

function isProtectedPage(path: string) {
  return PROTECTED_PAGES.has(getRouteBase(path))
}

function getStoredAuthSession() {
  const stored = uni.getStorageSync(AUTH_SESSION_KEY) as Partial<AuthSession> | undefined

  if (!stored || typeof stored !== 'object' || typeof stored.token !== 'string' || !stored.token) {
    return null
  }

  return stored as AuthSession
}

function saveAuthSession(session: AuthSession) {
  uni.setStorageSync(AUTH_SESSION_KEY, session)
}

function updateStoredAuthState(state: AuthState) {
  const currentSession = getStoredAuthSession()

  if (!currentSession) {
    return
  }

  saveAuthSession({
    token: currentSession.token,
    ...state
  })
}

export function clearAuthSession() {
  uni.removeStorageSync(AUTH_SESSION_KEY)
}

export function readAuthSession() {
  return getStoredAuthSession()
}

function savePostLoginRedirect(url: string) {
  if (!url) {
    uni.removeStorageSync(POST_LOGIN_REDIRECT_KEY)
    return
  }

  uni.setStorageSync(POST_LOGIN_REDIRECT_KEY, url)
}

function clearPostLoginRedirect() {
  uni.removeStorageSync(POST_LOGIN_REDIRECT_KEY)
}

function readPostLoginRedirect() {
  const stored = uni.getStorageSync(POST_LOGIN_REDIRECT_KEY)
  return typeof stored === 'string' ? stored : ''
}

export function takePostLoginRedirect() {
  const stored = readPostLoginRedirect()
  clearPostLoginRedirect()
  return stored
}

function getPostAuthRedirectUrl(session: Pick<AuthSession, 'hasBaby'>) {
  const redirectUrl = readPostLoginRedirect()
  const routeBase = redirectUrl ? getRouteBase(redirectUrl) : ''

  if (redirectUrl && routeBase === FAMILY_PAGE) {
    clearPostLoginRedirect()
    return redirectUrl
  }

  if (redirectUrl && session.hasBaby) {
    clearPostLoginRedirect()
    return redirectUrl
  }

  if (!session.hasBaby) {
    return BABY_FORM_PAGE
  }

  clearPostLoginRedirect()
  return HOME_PAGE
}

function reLaunchIfNeeded(url: string) {
  if (getRouteBase(getCurrentRoutePath()) === getRouteBase(url)) {
    return
  }

  uni.reLaunch({ url })
}

function redirectToLogin(message?: string, redirectUrl = getCurrentRouteUrl()) {
  const routeBase = redirectUrl ? getRouteBase(redirectUrl) : ''

  if (routeBase && routeBase !== getRouteBase(LOGIN_PAGE)) {
    savePostLoginRedirect(redirectUrl)
  }

  if (message) {
    uni.showToast({ title: message, icon: 'none' })
  }

  reLaunchIfNeeded(LOGIN_PAGE)
}

function redirectToBabyForm(message?: string, redirectUrl = '') {
  const routeBase = redirectUrl ? getRouteBase(redirectUrl) : ''

  if (routeBase && routeBase !== getRouteBase(BABY_FORM_PAGE)) {
    savePostLoginRedirect(redirectUrl)
  }

  if (message) {
    uni.showToast({ title: message, icon: 'none' })
  }

  reLaunchIfNeeded(BABY_FORM_PAGE)
}

function handleUnauthorized(message?: string, redirect = true) {
  clearAuthSession()

  if (!redirect) {
    return
  }

  const currentPath = getCurrentRoutePath()
  if (isProtectedPage(currentPath) || getRouteBase(currentPath) === getRouteBase(BABY_FORM_PAGE)) {
    redirectToLogin(message ?? '登录已失效，请重新登录')
  }
}

function request<T>(path: string, options: RequestOptions = {}) {
  return new Promise<T>((resolve, reject) => {
    const session = getStoredAuthSession()
    const header: Record<string, string> = {
      ...((options.header as Record<string, string> | undefined) ?? {})
    }

    if (session?.token) {
      header.Authorization = `Bearer ${session.token}`
    }

    uni.request({
      url: `${appConfig.apiBaseUrl}${path}`,
      method: options.method ?? 'GET',
      data: options.data,
      header,
      success: (response) => {
        const payload = response.data as ApiResponse<T> | undefined

        if (response.statusCode >= 200 && response.statusCode < 300 && payload?.ok) {
          resolve(payload.data)
          return
        }

        if (response.statusCode === 401) {
          handleUnauthorized(payload?.message, options.redirectOnUnauthorized !== false)
        }

        reject(new Error(payload?.message ?? '接口请求失败'))
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error('网络请求失败'))
      }
    })
  })
}

export function ensureProtectedPageAccess(options: { allowNoBaby?: boolean } = {}) {
  const session = getStoredAuthSession()

  if (!session?.token) {
    redirectToLogin('请先登录')
    return false
  }

  if (!options.allowNoBaby && !session.hasBaby) {
    redirectToBabyForm('请先完善宝宝档案', getCurrentRouteUrl())
    return false
  }

  return true
}

export function openProtectedPage(url: string, navigateMode: NavigateMode = 'navigateTo') {
  const session = getStoredAuthSession()
  const routeBase = getRouteBase(url)
  const allowNoBaby = routeBase === FAMILY_PAGE

  if (!session?.token) {
    redirectToLogin('公开内容可直接浏览，个性化功能请先登录', url)
    return false
  }

  if (!allowNoBaby && !session.hasBaby) {
    redirectToBabyForm('请先完善宝宝档案', url)
    return false
  }

  if (navigateMode === 'reLaunch') {
    uni.reLaunch({ url })
    return true
  }

  uni.navigateTo({ url })
  return true
}

export async function syncAppSession() {
  const currentPath = getCurrentRoutePath()
  const currentBase = getRouteBase(currentPath)
  const storedSession = getStoredAuthSession()

  if (!storedSession?.token) {
    if (isProtectedPage(currentPath) || currentBase === getRouteBase(BABY_FORM_PAGE)) {
      redirectToLogin()
    }

    return null
  }

  try {
    const authState = await getAuthMe()
    const nextSession: AuthSession = {
      token: storedSession.token,
      ...authState
    }

    saveAuthSession(nextSession)

    if (!nextSession.hasBaby && (isProtectedPage(currentPath) || currentBase === getRouteBase(LOGIN_PAGE) || !currentBase)) {
      if (currentBase !== FAMILY_PAGE) {
        redirectToBabyForm(undefined, getCurrentRouteUrl())
        return nextSession
      }
    }

    if (nextSession.hasBaby && (currentBase === getRouteBase(LOGIN_PAGE) || currentBase === getRouteBase(BABY_FORM_PAGE) || !currentBase)) {
      const redirectUrl = getPostAuthRedirectUrl(nextSession)
      reLaunchIfNeeded(redirectUrl)
    }

    return nextSession
  } catch {
    // 401 已在 request() 内部处理过 handleUnauthorized，这里只处理网络异常等其他错误
    // 不清除 session，避免弱网/服务短暂不可用时强制登出
    return null
  }
}

export async function wechatLogin(code: string) {
  const session = await request<AuthSession>('/app/auth/wechat-login', {
    method: 'POST',
    data: { code },
    redirectOnUnauthorized: false
  })

  saveAuthSession(session)

  const redirectUrl = getPostAuthRedirectUrl(session)
  if (getRouteBase(redirectUrl) !== getRouteBase(LOGIN_PAGE)) {
    uni.reLaunch({ url: redirectUrl })
  }

  return session
}

export function getAuthMe() {
  return request<AuthState>('/app/auth/me')
}

export function logout() {
  return request<{ loggedOut: boolean }>('/app/auth/logout', {
    method: 'POST'
  })
}

export function createBabyProfile(payload: BabyProfilePayload) {
  return request<{ babyProfile: BabyProfile }>('/app/babies', {
    method: 'POST',
    data: payload
  }).then((data) => {
    const session = getStoredAuthSession()

    if (session) {
      updateStoredAuthState({
        user: session.user,
        hasBaby: true,
        babyProfile: data.babyProfile
      })
    }

    return data
  })
}

export function updateBabyProfile(babyId: string, payload: BabyProfilePayload) {
  return request<{ babyProfile: BabyProfile }>(`/app/babies/${babyId}`, {
    method: 'PUT',
    data: payload
  }).then((data) => {
    const session = getStoredAuthSession()

    if (session) {
      updateStoredAuthState({
        user: session.user,
        hasBaby: true,
        babyProfile: data.babyProfile
      })
    }

    return data
  })
}

export function listBabyProfiles() {
  return request<{ babies: BabyProfile[] }>('/app/babies')
}

export function activateBaby(babyId: string) {
  return request<{ babyProfile: BabyProfile }>(`/app/babies/${babyId}/activate`, {
    method: 'POST'
  }).then((data) => {
    const session = getStoredAuthSession()
    if (session) {
      updateStoredAuthState({ user: session.user, hasBaby: true, babyProfile: data.babyProfile })
    }
    return data
  })
}

export function getHomeData() {
  return request<HomePageData>('/app/home')
}

export function getGeneratePageData(payload?: { mealCount?: MealCount; goals?: NutritionGoal[] }) {
  return request<GeneratePageData>('/app/meal-plans/generate-today', {
    method: 'POST',
    data: payload
  })
}

export function getPlanPageData() {
  return request<PlanPageData>('/app/meal-plans/overview')
}

export function getMealPlanDetail(mealPlanId: string) {
  return request<{ mealPlan: MealPlanDetail }>(`/app/meal-plans/${mealPlanId}`)
}

export function saveMealPlan(payload: SaveMealPlanPayload) {
  return request<SaveMealPlanResponse>('/app/meal-plans', {
    method: 'POST',
    data: payload
  })
}

export function updateMealPlan(mealPlanId: string, payload: SaveMealPlanPayload) {
  return request<SaveMealPlanResponse>(`/app/meal-plans/${mealPlanId}`, {
    method: 'PUT',
    data: payload
  })
}

export function saveFeedingRecord(mealPlanId: string, itemId: string, payload: SaveFeedingRecordPayload) {
  return request<SaveFeedingRecordResponse>(`/app/meal-plans/${mealPlanId}/items/${itemId}/feeding-record`, {
    method: 'POST',
    data: payload
  })
}

export function swapMealPlanItem(mealPlanId: string, itemId: string) {
  return request<SwapMealPlanResponse>(`/app/meal-plans/${mealPlanId}/items/${itemId}/swap`, {
    method: 'POST'
  })
}

export function getBatchRecipeSummaries(recipeIds: string[]) {
  return request<BatchRecipeSummaryResponse>('/app/recipes/batch-summary', {
    method: 'POST',
    data: { recipeIds },
    redirectOnUnauthorized: false
  })
}

export function getRecipeList(params?: { tag?: string; search?: string; page?: number }) {
  const parts: string[] = []
  if (params?.tag) parts.push(`tag=${encodeURIComponent(params.tag)}`)
  if (params?.search) parts.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.page) parts.push(`page=${params.page}`)
  const qs = parts.join('&')
  return request<{
    recipes: import('@baby-food/shared-types').RecipeSummary[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
  }>(`/app/recipes${qs ? `?${qs}` : ''}`, { redirectOnUnauthorized: false })
}

export function getRecipeDetailData(recipeId: string) {
  return request<RecipeDetail>(`/app/recipes/${recipeId}`, {
    redirectOnUnauthorized: false
  })
}

export function getGuideData(stageKey: string) {
  return request<GuideStage>(`/app/guides/stages/${stageKey}`, {
    redirectOnUnauthorized: false
  })
}

export function getTabooData(symptom = '腹泻') {
  return request<TabooGuide>(`/app/taboo/query?symptom=${encodeURIComponent(symptom)}`, {
    redirectOnUnauthorized: false
  })
}

export function getProfileData() {
  return request<ProfilePageData>('/app/profile')
}

export function getFamilyMembers(babyId?: string) {
  const query = babyId ? `?babyId=${encodeURIComponent(babyId)}` : ''
  return request<FamilyMembersResponse>(`/app/family/members${query}`)
}

export function getFamilyInvites(babyId?: string) {
  const query = babyId ? `?babyId=${encodeURIComponent(babyId)}` : ''
  return request<FamilyInvitesResponse>(`/app/family/invites${query}`)
}

export function createFamilyInvite(payload: CreateFamilyInvitePayload) {
  return request<CreateFamilyInviteResponse>('/app/family/invites', {
    method: 'POST',
    data: payload
  })
}

export function acceptFamilyInvite(inviteCode: string) {
  return request<FamilyMembersResponse>('/app/family/invites/accept', {
    method: 'POST',
    data: { inviteCode }
  }).then(async (data) => {
    const session = getStoredAuthSession()
    if (!session) {
      return data
    }

    try {
      const authState = await getAuthMe()
      updateStoredAuthState(authState)
    } catch {
      updateStoredAuthState({
        user: session.user,
        hasBaby: true,
        babyProfile: data.baby
      })
    }

    return data
  })
}

export function updateUserProfile(payload: { nickname?: string; avatarUrl?: string }) {
  return request<AuthState>('/app/auth/user', {
    method: 'PATCH',
    data: payload
  }).then((state) => {
    updateStoredAuthState(state)
    return state
  })
}

// ---- 收藏（云端同步 + 本地缓存） ----

const FAVORITE_CACHE_KEY = 'favoriteRecipeIds'

export function readFavoriteRecipeIds() {
  const value = uni.getStorageSync(FAVORITE_CACHE_KEY)
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function writeFavoriteCache(ids: string[]) {
  uni.setStorageSync(FAVORITE_CACHE_KEY, ids)
}

export async function syncFavoriteIds(): Promise<string[]> {
  try {
    const data = await request<{ recipeIds: string[] }>('/app/favorites', { redirectOnUnauthorized: false })
    writeFavoriteCache(data.recipeIds)
    return data.recipeIds
  } catch {
    return readFavoriteRecipeIds()
  }
}

export async function addFavorite(recipeId: string) {
  await request<null>('/app/favorites', { method: 'POST', data: { recipeId } })
  const current = readFavoriteRecipeIds()
  if (!current.includes(recipeId)) {
    writeFavoriteCache([recipeId, ...current])
  }
}

export async function removeFavorite(recipeId: string) {
  await request<null>(`/app/favorites/${recipeId}`, { method: 'DELETE' })
  writeFavoriteCache(readFavoriteRecipeIds().filter((id) => id !== recipeId))
}

// ---- 消息 ----

export function getMessages() {
  return request<{ messages: Array<{ title: string; desc: string }> }>('/app/messages', {
    redirectOnUnauthorized: false
  })
}

// ---- 反馈 ----

export function submitFeedback(content: string) {
  return request<null>('/app/feedback', { method: 'POST', data: { content } })
}
