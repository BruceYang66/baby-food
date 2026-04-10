const babyProfile = {
  id: 'baby-001',
  nickname: '小糯米',
  monthAgeLabel: '8个月',
  stageLabel: '碎末状辅食阶段',
  birthDate: '2025-08-18',
  avatar: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80',
  allergens: ['鸡蛋', '花生']
}

const homeFeatures = [
  { key: 'generate', title: '生成今日辅食', subtitle: '根据月龄与需求一键生成', icon: '🍚', accent: 'primary', route: '/pages/generate/index' },
  { key: 'plan', title: '本周计划', subtitle: '一周安排清晰不重样', icon: '📅', accent: 'neutral', route: '/pages/plan/index' },
  { key: 'taboo', title: '生病忌口查询', subtitle: '不舒服时快速查能吃什么', icon: '🏥', accent: 'secondary', route: '/pages/taboo/index' },
  { key: 'guide', title: '月龄饮食指南', subtitle: '各月龄吃什么一查便知', icon: '📚', accent: 'neutral', route: '/pages/guide/index' }
]

const homeShortcuts = [
  { title: '继续上次计划', description: '昨天已保存 3 餐安排', icon: '↩︎', actionKey: 'recent-plan', planPreview: getGeneratePageData().todayMealPlan },
  { title: '收藏有更新', description: '新增 3 道高铁食谱', icon: '♡', actionKey: 'favorites' },
  { title: '温馨提示', description: '本周注意增加深绿叶菜摄入', icon: '☀︎', actionKey: 'message' }
]

const ingredientHighlights = [
  { id: 'ing-1', name: '有机胡萝卜', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=500&q=80' },
  { id: 'ing-2', name: '铁棍山药', image: 'https://images.unsplash.com/photo-1615485925873-8c6d2437cf7d?auto=format&fit=crop&w=500&q=80' },
  { id: 'ing-3', name: '贝贝南瓜', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=500&q=80' }
]

const featuredRecipes = [
  {
    id: 'recipe-001',
    title: '红薯山药小米粥',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    ageLabel: '8个月+',
    durationLabel: '20分钟',
    difficultyLabel: '初级',
    tags: ['高纤维', '健脾']
  },
  {
    id: 'recipe-002',
    title: '鳕鱼西兰花软饭',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ageLabel: '8个月+',
    durationLabel: '25分钟',
    difficultyLabel: '中级',
    tags: ['优质蛋白', 'DHA']
  },
  {
    id: 'recipe-003',
    title: '贝贝南瓜猪肝泥',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    ageLabel: '8个月+',
    durationLabel: '18分钟',
    difficultyLabel: '中级',
    tags: ['高效补铁', '好消化']
  }
]

const nutritionGoals = ['补铁', '补钙', '通便', '挑食', '免疫力']

const baseMealEntries = [
  { id: 'meal-1', slot: 'breakfast', time: '08:00', title: '红薯山药小米粥', image: featuredRecipes[0].image, tags: ['高纤维', '健脾'], focus: '温和唤醒肠胃' },
  { id: 'meal-2', slot: 'lunch', time: '12:30', title: '鳕鱼西兰花软饭', image: featuredRecipes[1].image, tags: ['优质蛋白', 'DHA'], focus: '补充优质蛋白' },
  { id: 'meal-3', slot: 'dinner', time: '18:00', title: '贝贝南瓜猪肝泥', image: featuredRecipes[2].image, tags: ['高效补铁', '助眠'], focus: '晚间高铁修复' }
]

const snackEntry = {
  id: 'meal-4',
  slot: 'snack',
  time: '15:30',
  title: '牛油果酸奶水果杯',
  image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80',
  tags: ['能量加餐', '顺滑易吞咽'],
  focus: '午后补能量'
}

const historyMealPlans = [
  { id: 'history-1', dateLabel: '2026年4月8日', summary: '南瓜鸡肉软饭 / 鳕鱼蔬菜粥 · 完成度 100%', completionRate: 100 },
  { id: 'history-2', dateLabel: '2026年4月7日', summary: '牛油果软饭 / 山药鸡肉面 · 完成度 85%', completionRate: 85 },
  { id: 'history-3', dateLabel: '2026年4月6日', summary: '高铁猪肝泥 / 小米南瓜粥 · 完成度 92%', completionRate: 92 }
]

const weeklyPlanDays = [
  {
    id: 'plan-2026-04-07',
    planDate: '2026-04-07',
    dateLabel: '4月7日',
    dayLabel: '周二',
    summary: '3 餐安排',
    recipeTitles: ['牛油果软饭', '山药鸡肉面', '胡萝卜鳕鱼泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 85,
    tagLabel: '已保存',
    isRecommended: false
  },
  {
    id: 'plan-2026-04-08',
    planDate: '2026-04-08',
    dateLabel: '4月8日',
    dayLabel: '周三',
    summary: '3 餐安排',
    recipeTitles: ['南瓜鸡肉软饭', '鳕鱼蔬菜粥', '苹果小米蒸糕'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 100,
    tagLabel: '已保存',
    isRecommended: false
  },
  {
    id: 'recommended-2026-04-09',
    planDate: '2026-04-09',
    dateLabel: '4月9日',
    dayLabel: '周四',
    summary: '推荐 3 餐安排',
    recipeTitles: ['红薯山药小米粥', '鳕鱼西兰花软饭', '贝贝南瓜猪肝泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 89,
    tagLabel: '推荐',
    isRecommended: true
  },
  {
    id: 'plan-001',
    planDate: '2026-04-10',
    dateLabel: '4月10日',
    dayLabel: '今天',
    summary: '3 餐安排',
    recipeTitles: ['红薯山药小米粥', '鳕鱼西兰花软饭', '贝贝南瓜猪肝泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 98,
    tagLabel: '今日',
    isRecommended: false
  },
  {
    id: 'recommended-2026-04-11',
    planDate: '2026-04-11',
    dateLabel: '4月11日',
    dayLabel: '周六',
    summary: '推荐 3 餐安排',
    recipeTitles: ['红薯山药小米粥', '鳕鱼西兰花软饭', '贝贝南瓜猪肝泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 90,
    tagLabel: '推荐',
    isRecommended: true
  },
  {
    id: 'recommended-2026-04-12',
    planDate: '2026-04-12',
    dateLabel: '4月12日',
    dayLabel: '周日',
    summary: '推荐 3 餐安排',
    recipeTitles: ['红薯山药小米粥', '鳕鱼西兰花软饭', '贝贝南瓜猪肝泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 91,
    tagLabel: '推荐',
    isRecommended: true
  },
  {
    id: 'recommended-2026-04-13',
    planDate: '2026-04-13',
    dateLabel: '4月13日',
    dayLabel: '周一',
    summary: '推荐 3 餐安排',
    recipeTitles: ['红薯山药小米粥', '鳕鱼西兰花软饭', '贝贝南瓜猪肝泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 92,
    tagLabel: '推荐',
    isRecommended: true
  }
]

function getTodayLabel() {
  const now = new Date()
  return `今天 · ${now.getMonth() + 1}月${now.getDate()}日`
}

function createMealEntries(mealCount = '3餐') {
  if (mealCount === '2餐') {
    return baseMealEntries.slice(0, 2)
  }

  if (mealCount === '3餐+点心') {
    return [...baseMealEntries, snackEntry]
  }

  return baseMealEntries
}

export function getHomePageData() {
  return {
    babyProfile,
    homeFeatures,
    homeShortcuts,
    ingredientHighlights
  }
}

export function getGeneratePageData(mealCount = '3餐', goals: string[] = []) {
  const selectedGoals = goals.length ? goals : ['补钙']
  const scoreBase = mealCount === '3餐+点心' ? 99 : mealCount === '2餐' ? 96 : 98

  return {
    babyProfile,
    todayMealPlan: {
      id: 'plan-001',
      planDate: '2026-04-10',
      dateLabel: getTodayLabel(),
      nutritionScore: Math.min(100, scoreBase + Math.min(selectedGoals.length, 1)),
      waterSuggestion: mealCount === '3餐+点心' ? '500ml' : '450ml',
      entries: createMealEntries(mealCount)
    },
    nutritionGoals
  }
}

export function getPlanPageData() {
  return {
    todayMealPlan: getGeneratePageData().todayMealPlan,
    historyMealPlans,
    weeklyPlanDays
  }
}

export function getAdminDashboardData() {
  return {
    metrics: [
      { key: 'users', label: '总用户数', value: '18,420', trend: '+12.8%', accent: 'primary' },
      { key: 'recipes', label: '食谱总数', value: '1,286', trend: '+86', accent: 'secondary' },
      { key: 'pending', label: '待审核', value: '42', trend: '今日 +8', accent: 'warning' },
      { key: 'published', label: '已上线', value: '964', trend: '+3.2%', accent: 'primary' },
      { key: 'coverage', label: '月龄覆盖度', value: '91%', trend: '10-12月偏低', accent: 'warning' },
      { key: 'feedback', label: '负反馈预警', value: '7', trend: '需尽快处理', accent: 'danger' }
    ],
    userTrend: [
      { label: '周一', value: 320 },
      { label: '周二', value: 410 },
      { label: '周三', value: 390 },
      { label: '周四', value: 470 },
      { label: '周五', value: 520 },
      { label: '周六', value: 610 },
      { label: '周日', value: 660 }
    ],
    reviewQueue: [
      { id: 'RV-001', title: '南瓜鸡肉烩面', source: '批量导入', submittedBy: '运营-小顾', submittedAt: '今天 09:10', focus: '10-12月覆盖补齐' },
      { id: 'RV-002', title: '苹果小米蒸糕', source: '手动创建', submittedBy: '陈营养师', submittedAt: '今天 08:35', focus: '病期可用点心' },
      { id: 'RV-003', title: '菠菜猪肝软饭', source: '快速添加', submittedBy: '外采营养师', submittedAt: '昨天 20:10', focus: '高铁需求热门' }
    ]
  }
}

export function getAdminRecipeList() {
  return [
    {
      id: 'R-1024',
      title: '鳕鱼西兰花软饭',
      cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      ageLabel: '8-10月',
      source: '营养师精品',
      creator: '陈营养师',
      tags: ['DHA', '优质蛋白'],
      favorites: 928,
      contentStatus: 'published',
      reviewStatus: 'approved',
      updatedAt: '2026-04-08 18:22'
    },
    {
      id: 'R-1025',
      title: '南瓜鸡肉烩面',
      cover: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
      ageLabel: '10-12月',
      source: '批量导入',
      creator: '运营-小顾',
      tags: ['补铁', '软面'],
      favorites: 314,
      contentStatus: 'pending_review',
      reviewStatus: 'pending',
      updatedAt: '2026-04-09 09:10'
    },
    {
      id: 'R-1026',
      title: '牛油果香蕉酸奶碗',
      cover: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
      ageLabel: '1-2岁',
      source: '手机快速添加',
      creator: '外采营养师',
      tags: ['加餐', '益生菌'],
      favorites: 122,
      contentStatus: 'draft',
      reviewStatus: 'none',
      updatedAt: '2026-04-09 08:41'
    },
    {
      id: 'R-1027',
      title: '三文鱼山药泥',
      cover: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80',
      ageLabel: '6-8月',
      source: '历史版本',
      creator: '陈营养师',
      tags: ['DHA', '健脾'],
      favorites: 503,
      contentStatus: 'offline',
      reviewStatus: 'approved',
      updatedAt: '2026-04-02 16:05'
    }
  ]
}

export function getAdminRecipeDetail(recipeId = 'R-1025') {
  const recipes = getAdminRecipeList()
  const currentRecipe = recipes.find((item) => item.id === recipeId) ?? recipes[1]

  return {
    id: currentRecipe.id,
    title: currentRecipe.title,
    ageLabel: currentRecipe.ageLabel,
    durationLabel: '25分钟',
    difficultyLabel: '中级',
    cover: currentRecipe.cover,
    description: '高蛋白、适合当前月龄，口感软糯，适合作为午餐主食。',
    tags: currentRecipe.tags,
    allergens: ['鸡蛋'],
    symptom: '腹泻',
    contentStatus: currentRecipe.contentStatus,
    reviewStatus: currentRecipe.reviewStatus,
    ingredients: [
      { id: 'ing-1', name: '鸡肉', amount: '40g', unit: '克' },
      { id: 'ing-2', name: '南瓜', amount: '60g', unit: '克' },
      { id: 'ing-3', name: '宝宝面', amount: '30g', unit: '克' }
    ],
    steps: [
      { id: 'step-1', description: '鸡肉焯水后剁碎，南瓜蒸软备用。', image: currentRecipe.cover },
      { id: 'step-2', description: '宝宝面煮软后切短，与鸡肉、南瓜一起翻拌。', image: currentRecipe.cover },
      { id: 'step-3', description: '根据月龄调整颗粒度，出锅前确认温度适宜。', image: currentRecipe.cover }
    ],
    preview: {
      title: currentRecipe.title,
      subtitle: '高蛋白、适合 8-10 月龄，口感软糯。'
    }
  }
}

export function getAdminReviewQueue() {
  return [
    { id: 'RV-001', title: '南瓜鸡肉烩面', source: '批量导入', submittedBy: '运营-小顾', submittedAt: '今天 09:10', focus: '10-12月覆盖补齐' },
    { id: 'RV-002', title: '苹果小米蒸糕', source: '手动创建', submittedBy: '陈营养师', submittedAt: '今天 08:35', focus: '病期可用点心' },
    { id: 'RV-003', title: '菠菜猪肝软饭', source: '快速添加', submittedBy: '外采营养师', submittedAt: '昨天 20:10', focus: '高铁需求热门' }
  ]
}

export function getAdminImportJobs() {
  return [
    { id: 'IMP-240409-01', fileName: '春季辅食补充批次.xlsx', operator: '运营-小顾', total: 86, success: 78, failed: 8, status: 'completed', createdAt: '2026-04-09 08:40' },
    { id: 'IMP-240408-02', fileName: '病期食谱.csv', operator: '陈营养师', total: 24, success: 24, failed: 0, status: 'completed', createdAt: '2026-04-08 16:12' },
    { id: 'IMP-240407-01', fileName: '月龄禁忌修订.xlsx', operator: '管理员', total: 18, success: 15, failed: 3, status: 'failed', createdAt: '2026-04-07 11:20' }
  ]
}

export function getAdminUsers() {
  return [
    { id: 'U-10001', nickname: '糯米妈妈', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', registerAt: '2026-03-12 09:18', babyCount: 1, activity: '高活跃', status: '正常' },
    { id: 'U-10002', nickname: '暖暖爸比', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80', registerAt: '2026-03-19 20:05', babyCount: 2, activity: '中活跃', status: '正常' },
    { id: 'U-10003', nickname: '星星妈', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80', registerAt: '2026-04-01 10:41', babyCount: 1, activity: '低活跃', status: '待回访' }
  ]
}

export function getAdminSystemSettings() {
  return [
    {
      title: '基础设置',
      description: '品牌名称、Logo、分享文案与默认入口。',
      items: [
        { label: '系统名称', value: '宝宝辅食智囊' },
        { label: '分享文案', value: '科学辅食，悦享成长' },
        { label: '首页引导语', value: '根据宝宝成长阶段生成今日辅食' }
      ]
    },
    {
      title: '内容模板',
      description: '默认食谱结构、审核标签、营养参考值。',
      items: [
        { label: '默认步骤模板', value: '食材处理 / 蒸煮 / 打泥 / 出锅' },
        { label: '审核标签', value: '高铁 / 高钙 / 易消化 / 病期适用' },
        { label: '营养标准', value: '按月龄维度维护参考值' }
      ]
    },
    {
      title: '推送与权限',
      description: '微信提醒、导出权限、角色矩阵。',
      items: [
        { label: '每日提醒', value: '08:00 自动推送' },
        { label: '导出权限', value: '运营经理以上可导出' },
        { label: '账号角色', value: '管理员 / 运营 / 营养师 / 审核员' }
      ]
    }
  ]
}
