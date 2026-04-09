export type NutritionGoal = '补铁' | '补钙' | '通便' | '挑食' | '免疫力'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type GuideRuleType = 'recommended' | 'cautious' | 'forbidden'
export type TabooRuleType = 'avoid' | 'recommended'

export interface BabyProfile {
  id: string
  nickname: string
  monthAgeLabel: string
  stageLabel: string
  birthDate: string
  avatar: string
  allergens: string[]
}

export interface HomeFeature {
  key: string
  title: string
  subtitle: string
  icon: string
  accent: 'primary' | 'secondary' | 'neutral'
  route: string
}

export interface HomeShortcut {
  title: string
  description: string
  icon: string
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
  slot: MealSlot
  time: string
  title: string
  image: string
  tags: string[]
  focus: string
}

export interface DailyMealPlan {
  id: string
  dateLabel: string
  nutritionScore: number
  waterSuggestion: string
  entries: MealPlanEntry[]
}

export interface HistoryMealPlan {
  id: string
  dateLabel: string
  summary: string
  completionRate: number
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
}

export interface ProfileMenuItem {
  key: string
  title: string
  subtitle: string
  icon: string
}

export interface WechatEntry {
  key: string
  title: string
  icon: string
}
