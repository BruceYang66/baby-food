export type NutritionGoal = '补铁' | '补钙' | 'DHA' | '通便' | '开胃' | '挑食' | '免疫力' | '手抓食' | '补钙补锌' | '病期适用'
export type MealCount = '2餐' | '3餐' | '3餐+点心'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type GuideRuleType = 'recommended' | 'cautious' | 'forbidden'
export type TabooRuleType = 'avoid' | 'recommended'
export type FamilyRole = 'owner' | 'editor' | 'viewer'
export type FeedingRecordStatus = 'fed' | 'skipped'

export interface BabyProfile {
  id: string
  nickname: string
  monthAgeLabel: string
  stageLabel: string
  birthDate: string
  avatar: string
  allergens: string[]
  role?: FamilyRole
  ownerUserId?: string
  isOwner?: boolean
  isActive?: boolean
}

export interface BabyProfilePayload {
  nickname: string
  birthDate: string
  allergens: string[]
  avatarUrl?: string
}

export interface AppUser {
  id: string
  nickname: string
  avatarUrl: string
}

export interface AuthState {
  user: AppUser
  hasBaby: boolean
  babyProfile: BabyProfile | null
  accessibleBabies?: BabyProfile[]
}

export interface AuthSession extends AuthState {
  token: string
}

export interface HomeFeature {
  key: string
  title: string
  subtitle: string
  icon: string
  accent: 'primary' | 'secondary' | 'neutral'
  route: string
}

export type HomeShortcutAction = 'recent-plan' | 'favorites' | 'message'

export interface HomeShortcut {
  title: string
  description: string
  icon: string
  actionKey?: HomeShortcutAction
  planPreview?: DailyMealPlan
}

export interface IngredientHighlight {
  id: string
  name: string
  image: string
}

export interface RecipeSummary {
  id: string
  title: string
  image: string
  ageLabel: string
  durationLabel: string
  difficultyLabel: string
  tags: string[]
  description?: string
}

export interface RecipeIngredient {
  id: string
  name: string
  amount: string
}

export interface RecipeStep {
  stepNo: number
  title: string
  description: string
  image?: string
}

export interface RecipeDetail extends RecipeSummary {
  heroImage: string
  nutritionTips: string[]
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  relatedRecipes: RecipeSummary[]
}

export interface MealPlanEntry {
  id: string
  recipeId?: string
  customRecipeId?: string
  isCustom?: boolean
  slot: MealSlot
  time: string
  title: string
  image: string
  tags: string[]
  focus: string
  feedingRecord?: FeedingRecord
}

export interface DailyMealPlan {
  id: string
  isSaved: boolean
  planDate: string
  dateLabel: string
  nutritionScore: number
  waterSuggestion: string
  entries: MealPlanEntry[]
}

export interface MealPlanDetail extends DailyMealPlan {
  title: string
}

export interface HistoryMealPlan {
  id: string
  planDate: string
  dateLabel: string
  summary: string
  completionRate: number
  firstFoodName?: string
  firstFoodEmoji?: string
}

export interface WeeklyMealPlanDay {
  id: string
  planDate: string
  dateLabel: string
  dayLabel: string
  summary: string
  recipeTitles: string[]
  recipeIds: string[]
  completionRate: number
  tagLabel: string
  isRecommended: boolean
  mealPlan?: DailyMealPlan
}

export interface GeneratePageData {
  babyProfile: BabyProfile
  todayMealPlan: DailyMealPlan
  nutritionGoals: NutritionGoal[]
}

export interface PlanPageData {
  todayMealPlan: DailyMealPlan
  historyMealPlans: HistoryMealPlan[]
  weeklyPlanDays: WeeklyMealPlanDay[]
}

export interface SaveMealPlanEntryPayload {
  recipeId?: string
  customRecipeId?: string
  isCustom?: boolean
  slot: MealSlot
  time: string
  title: string
  focus: string
  image?: string
  tags?: string[]
}

export interface SaveMealPlanPayload {
  title?: string
  dateLabel?: string
  planDate?: string
  nutritionScore: number
  waterSuggestion: string
  entries: SaveMealPlanEntryPayload[]
}

export interface SaveMealPlanResponse {
  mealPlan: MealPlanDetail
}

export interface SwapMealPlanResponse {
  mealPlan: DailyMealPlan
}

export interface FeedingRecord {
  id: string
  mealPlanId: string
  mealPlanItemId: string
  status: FeedingRecordStatus
  note?: string
  fedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface SaveFeedingRecordPayload {
  status: FeedingRecordStatus
  note?: string
  fedAt?: string
}

export interface SaveFeedingRecordResponse {
  mealPlan: DailyMealPlan
  feedingRecord: FeedingRecord
}

export interface BatchRecipeSummaryPayload {
  recipeIds: string[]
}

export interface BatchRecipeSummaryResponse {
  recipes: RecipeSummary[]
}

export interface GuideRule {
  type: GuideRuleType
  title: string
  note?: string
  foods: string[]
}

export interface GuideStage {
  key: string
  label: string
  title: string
  description: string
  feedingTips: string[]
  qaItems: Array<{ q: string; a: string }>
  rules: GuideRule[]
  dailySchedule: Array<{ time: string; title: string; description: string }>
}

export interface TabooItem {
  food: string
  reason: string
}

export interface TabooGuide {
  symptom: string
  title: string
  avoid: TabooItem[]
  recommended: string[]
  recipes: RecipeSummary[]
  medicalTips: string[]
  matched?: boolean
  resolvedSymptom?: string
}

export interface ProfileMenuItem {
  key: string
  title: string
  subtitle: string
  icon: string
}

export interface ProfilePageData {
  hasBaby: boolean
  babyProfile: BabyProfile | null
  familyMembers?: FamilyMember[]
  pendingInvites?: FamilyInvite[]
  profileMenus: ProfileMenuItem[]
  wechatEntries: WechatEntry[]
}

export interface FamilyMember {
  id: string
  userId: string
  nickname: string
  avatarUrl: string
  role: FamilyRole
  joinedAt?: string
  isCurrentUser?: boolean
  isOwner?: boolean
}

export interface FamilyInvite {
  id: string
  babyId: string
  inviteCode: string
  role: FamilyRole
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  invitedByUserId: string
  invitedByName: string
  expiresAt: string
  createdAt?: string
}

export interface CreateFamilyInvitePayload {
  babyId?: string
  role: FamilyRole
}

export interface CreateFamilyInviteResponse {
  invite: FamilyInvite
}

export interface FamilyMembersResponse {
  baby: BabyProfile
  members: FamilyMember[]
}

export interface FamilyInvitesResponse {
  baby: BabyProfile
  invites: FamilyInvite[]
}

export interface WechatEntry {
  key: string
  title: string
  icon: string
}
