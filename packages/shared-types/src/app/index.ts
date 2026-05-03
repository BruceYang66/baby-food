export type NutritionGoal = '补铁' | '补钙' | 'DHA' | '通便' | '开胃' | '挑食' | '免疫力' | '手抓食' | '补钙补锌' | '病期适用'
export type MealCount = '2餐' | '3餐' | '3餐+点心'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type GuideRuleType = 'recommended' | 'cautious' | 'forbidden'
export type TabooRuleType = 'avoid' | 'recommended'
export type FamilyRole = 'owner' | 'editor' | 'viewer'
export type BabyGender = 'boy' | 'girl'
export type FeedingRecordStatus = 'fed' | 'skipped'

export interface BabyProfile {
  id: string
  nickname: string
  monthAgeLabel: string
  stageLabel: string
  birthDate: string
  avatar: string
  backgroundImageUrl?: string
  relationshipLabel?: string
  gender?: BabyGender
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
  backgroundImageUrl?: string
  relationshipLabel?: string
  gender?: BabyGender
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

export type FeedingJournalType = 'breast' | 'formula' | 'bottle-breast' | 'sleep' | 'diaper' | 'pump' | 'solid' | 'bath' | 'play' | 'swim' | 'water' | 'supplement' | 'other'
export type FeedingSolidIntake = 'finished' | 'half' | 'few-bites' | 'refused'
export type FeedingReactionTag = 'rash' | 'diarrhea' | 'vomit' | 'constipation'
export type SupplementDoseUnit = '滴' | '粒' | 'ml' | '勺'
export type LifeRecordScope = 'week' | 'month' | 'all'
export type LifeRecordDisplayMode = 'timeline' | 'chart'
export type DiaperRecordKind = 'wet' | 'dirty' | 'mixed'

export interface FeedingJournalEntry {
  id: string
  date: string
  time: string
  type: FeedingJournalType
  title: string
  description: string
  amountValue?: number
  amountUnit?: string
  note?: string
  tags?: string[]
  source?: 'manual' | 'reminder'
  sourceReminderIds?: string[]
  createdAt: string
  updatedAt: string
  breast?: {
    side?: 'left' | 'right' | 'switch'
    durationMinutes?: number
    estimatedMilkMl?: number
    quickNotes?: string[]
  }
  formula?: {
    brand?: string
    stage?: '1段' | '2段' | '3段' | '4段'
    temperature?: '37℃' | '40℃' | '45℃'
    tags?: string[]
  }
  bottleBreast?: {
    amountMl?: number
  }
  solid?: {
    foodName: string
    intakeLevel: FeedingSolidIntake
    reactions?: FeedingReactionTag[]
  }
  water?: {
    amountMl?: number
  }
  supplement?: {
    name: string
    doseText?: string
    unit?: SupplementDoseUnit
  }
  sleep?: {
    durationMinutes?: number
  }
  diaper?: {
    kind?: DiaperRecordKind
  }
  pump?: {
    amountMl?: number
  }
  bath?: {
    durationMinutes?: number
  }
  play?: {
    durationMinutes?: number
  }
  swim?: {
    durationMinutes?: number
  }
  other?: {
    categoryLabel?: string
  }
}

export interface FeedingJournalDaySummary {
  milkMl: number
  milkTargetMl: number
  milkProgress: number
  solidCount: number
  waterMl: number
  supplementCount: number
  totalCount: number
}

export interface FeedingJournalDayStat {
  date: string
  label: string
  milkMl: number
  solidCount: number
  waterMl: number
  supplementCount: number
  totalCount: number
}

export interface FeedingJournalWeekStats {
  days: FeedingJournalDayStat[]
  maxMilkMl: number
  maxSolidCount: number
  maxTotalCount: number
}

export interface FeedingJournalMonthPoint {
  date: string
  label: string
  milkMl: number
  solidCount: number
  waterMl: number
  totalCount: number
}

export interface FeedingJournalMonthStats {
  points: FeedingJournalMonthPoint[]
  maxMilkMl: number
  maxSolidCount: number
  maxTotalCount: number
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
  relationshipLabel?: string
  lastActiveAt?: string
  loginCount?: number
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
  relationshipLabel?: string
}

export interface CreateFamilyInvitePayload {
  babyId?: string
  role: FamilyRole
  relationshipLabel?: string
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

export type GrowthMetricType = 'height' | 'weight' | 'head'
export type GrowthTabKey = 'list' | 'height' | 'weight' | 'head'
export type GrowthRangeKey = 'halfYear' | 'oneYear' | 'threeYear'
export type GrowthStandardKey = 'nhc-2025' | 'nhc-2022' | 'who'
export type GrowthStatusTone = 'healthy' | 'caution' | 'warning' | 'elevated'

export interface GrowthRecord {
  id: string
  measuredAt: string
  heightCm?: number | null
  weightKg?: number | null
  headCircumferenceCm?: number | null
}

export interface GrowthRecordPayload {
  measuredAt: string
  heightCm?: number | null
  weightKg?: number | null
  headCircumferenceCm?: number | null
}

export interface GrowthMetricSnapshot {
  metric: GrowthMetricType
  label: string
  unit: string
  value: number | null
  percentile: number | null
  statusLabel: string
  statusTone: GrowthStatusTone
}

export interface GrowthRecordListItem {
  id: string
  measuredAt: string
  ageLabel: string
  metrics: GrowthMetricSnapshot[]
}

export interface GrowthStandardOption {
  key: GrowthStandardKey
  label: string
  ageRangeLabel: string
  sourceLabel: string
}

export interface GrowthRangeOption {
  key: GrowthRangeKey
  label: string
  months: number
}

export interface GrowthReferenceBandPoint {
  ageMonths: number
  p3: number
  p50: number
  p97: number
}

export interface GrowthChartPoint {
  id: string
  measuredAt: string
  ageLabel: string
  xLabel: string
  ageMonths: number
  value: number
  percentile: number | null
  statusLabel: string
}

export interface GrowthChartDataset {
  metric: GrowthMetricType
  unit: string
  minValue: number
  maxValue: number
  points: GrowthChartPoint[]
  bands: GrowthReferenceBandPoint[]
}

export type ReminderRepeatType = 'once' | 'daily' | 'alternate-day' | 'weekly' | 'monthly'
export type ReminderStatus = 'pending' | 'done'
export type ReminderCategory = 'supplement' | 'vaccine' | 'growth' | 'feeding' | 'outing' | 'custom'

export interface ReminderItem {
  id: string
  title: string
  date: string
  time?: string
  repeatType: ReminderRepeatType
  status: ReminderStatus
  category: ReminderCategory
  note?: string
  completedAt?: string
  source?: 'local' | 'system'
}

export interface ReminderGroup {
  label: string
  items: ReminderItem[]
}

export type WheelCategory = 'vegetable' | 'protein' | 'egg' | 'grain' | 'fruit' | 'mixed' | 'finger' | 'soup'

export interface WheelCandidate {
  id: string
  title: string
  category: WheelCategory
  icon: string
  ageLabel: string
  ingredients: string[]
  steps: string[]
  nutritionTags: string[]
  filterTags: string[]
  route?: string
}
