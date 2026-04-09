import {
  babyProfile,
  featuredRecipes,
  guideStages,
  historyMealPlans,
  homeFeatures,
  homeShortcuts,
  ingredientHighlights,
  profileMenus,
  recipeDetail,
  tabooGuides,
  todayMealPlan,
  wechatEntries
} from '@/data/mock'

const wait = async () => new Promise((resolve) => setTimeout(resolve, 60))

export async function getLoginGuide() {
  await wait()
  return {
    heroTitle: '科学辅食，悦享成长',
    heroDesc: '为宝宝量身定制每一餐，开启健康饮食第一步。'
  }
}

export async function getHomeData() {
  await wait()
  return {
    babyProfile,
    homeFeatures,
    homeShortcuts,
    ingredientHighlights
  }
}

export async function getGeneratePageData() {
  await wait()
  return {
    babyProfile,
    todayMealPlan,
    nutritionGoals: ['补铁', '补钙', '通便', '挑食', '免疫力']
  }
}

export async function getPlanPageData() {
  await wait()
  return {
    todayMealPlan,
    historyMealPlans,
    featuredRecipes
  }
}

export async function getGuideData() {
  await wait()
  return guideStages
}

export async function getTabooData(symptom = '腹泻') {
  await wait()
  return tabooGuides.find((item) => item.symptom === symptom) ?? tabooGuides[0]
}

export async function getProfileData() {
  await wait()
  return {
    babyProfile,
    profileMenus,
    wechatEntries
  }
}

export async function getRecipeDetailData() {
  await wait()
  return recipeDetail
}
