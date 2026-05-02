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
  canAppAdmin: boolean
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
  ageMinMonths?: number
  ageMaxMonths?: number | null
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

export interface AgeRangeMonths {
  minMonths: number
  maxMonths: number | null
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

export interface AppFeedbackHistoryItem {
  id: string
  content: string
  createdAt: string
}

export interface AppFeedbackHistoryResponse {
  items: AppFeedbackHistoryItem[]
  total: number
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

export type AppModuleKey = 'home' | 'feeding' | 'vaccine' | 'knowledge' | 'profile'
export type HomeModuleAccent = 'primary' | 'secondary' | 'tertiary' | 'neutral'
export type HomeTodoStatus = 'pending' | 'done'
export type FavoriteTargetType = 'recipe' | 'knowledge'
export type KnowledgeContentType = 'article' | 'guide' | 'taboo'
export type VaccineCategory = 'free' | 'optional'
export type VaccineRecordStatus = 'pending' | 'completed' | 'optional'

export interface HomeModuleEntry {
  key: AppModuleKey
  title: string
  subtitle: string
  icon: string
  accent: HomeModuleAccent
  route: string
  description?: string
  badge?: string
}

export interface HomeTodoItem {
  id: string
  title: string
  description: string
  timeLabel?: string
  status: HomeTodoStatus
  accent?: HomeModuleAccent
  route?: string
}

export interface HomeRecommendationItem {
  id: string
  title: string
  subtitle: string
  summary?: string
  image?: string
  tag?: string
  accent?: HomeModuleAccent
  route: string
}

export interface ParentingHomePageData {
  babyProfile: BabyProfile
  moduleEntries: HomeModuleEntry[]
  todoItems: HomeTodoItem[]
  recommendations: HomeRecommendationItem[]
}

export interface VaccineScheduleItem {
  id: string
  name: string
  disease: string
  stageLabel: string
  recommendedAgeLabel: string
  category: VaccineCategory
  description?: string
  precautions?: string[]
}

export interface VaccineRecordItem extends VaccineScheduleItem {
  recordId?: string
  status: VaccineRecordStatus
  vaccinatedAt?: string
  note?: string
}

export interface VaccineTimelineGroup {
  key: string
  label: string
  description?: string
  items: VaccineRecordItem[]
}

export interface VaccineTip {
  title: string
  description: string
}

export interface VaccinePageData {
  babyProfile: BabyProfile | null
  nextPendingVaccine: VaccineRecordItem | null
  timelineGroups: VaccineTimelineGroup[]
  tips: VaccineTip[]
}

export interface SaveVaccineRecordPayload {
  scheduleId: string
  status: VaccineRecordStatus
  vaccinatedAt?: string
  note?: string
}

export interface KnowledgeCategory {
  key: string
  label: string
}

export interface KnowledgeArticleSummary {
  id: string
  title: string
  subtitle: string
  summary: string
  image?: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: KnowledgeContentType
  route: string
}

export type KnowledgeSectionLayoutType = 'stack' | 'grid' | 'carousel'
export type KnowledgeSectionImageStyle = 'rounded' | 'square'
export type KnowledgeSectionImageAspectRatio = 'wide' | 'square' | 'portrait'

export interface KnowledgeSectionLayout {
  type: KnowledgeSectionLayoutType
  columns?: 1 | 2 | 3
}

export interface KnowledgeSectionImageItem {
  url: string
  style?: KnowledgeSectionImageStyle
  aspectRatio?: KnowledgeSectionImageAspectRatio
}

export interface KnowledgeArticleSection {
  id: string
  title?: string
  content: string
  images: string[]
  imageItems?: KnowledgeSectionImageItem[]
  layout?: KnowledgeSectionLayout
  sortOrder: number
}

export interface KnowledgeArticleDetail extends KnowledgeArticleSummary {
  content: string
  sections: KnowledgeArticleSection[]
  isFavorite?: boolean
  relatedArticles: KnowledgeArticleSummary[]
}

export interface KnowledgePageData {
  babyProfile?: BabyProfile | null
  categories: KnowledgeCategory[]
  featuredArticle?: KnowledgeArticleSummary | null
  articles: KnowledgeArticleSummary[]
}

export interface FavoriteRecipeItem {
  id: string
  savedAt: string
  recipe: RecipeSummary
}

export interface FavoriteKnowledgeItem {
  id: string
  savedAt: string
  article: KnowledgeArticleSummary
}

export interface FavoritesPageData {
  recipeIds: string[]
  recipes: FavoriteRecipeItem[]
  articles: FavoriteKnowledgeItem[]
}
