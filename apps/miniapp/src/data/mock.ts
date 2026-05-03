import type {
  BabyProfile,
  DailyMealPlan,
  GuideStage,
  HistoryMealPlan,
  HomeFeature,
  HomeShortcut,
  IngredientHighlight,
  ProfileMenuItem,
  RecipeDetail,
  RecipeSummary,
  TabooGuide,
  WechatEntry
} from '@baby-food/shared-types'

export const babyProfile: BabyProfile = {
  id: 'baby-001',
  nickname: '小糯米',
  monthAgeLabel: '8个月',
  stageLabel: '碎末状辅食阶段',
  birthDate: '2025-08-18',
  avatar: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80',
  allergens: ['鸡蛋', '花生']
}

export const homeFeatures: HomeFeature[] = [
  { key: 'generate', title: '生成今日辅食', subtitle: '根据月龄与需求一键生成', icon: '🍚', accent: 'primary', route: '/pages/generate/index' },
  { key: 'plan', title: '本周计划', subtitle: '一周安排清晰不重样', icon: '📅', accent: 'neutral', route: '/pages/plan/index' },
  { key: 'taboo', title: '生病忌口查询', subtitle: '不舒服时快速查能吃什么', icon: '🏥', accent: 'secondary', route: '/pages/taboo/index' },
  { key: 'guide', title: '月龄饮食指南', subtitle: '各月龄吃什么一查便知', icon: '📚', accent: 'neutral', route: '/pages/guide/index' }
]

export const homeShortcuts: HomeShortcut[] = [
  { title: '继续上次计划', description: '昨天已保存 3 餐安排', icon: '↩︎', actionKey: 'recent-plan', planPreview: todayMealPlan },
  { title: '收藏有更新', description: '新增 3 道高铁食谱', icon: '♡', actionKey: 'favorites' },
  { title: '温馨提示', description: '本周注意增加深绿叶菜摄入', icon: '☀︎', actionKey: 'message' }
]

export const ingredientHighlights: IngredientHighlight[] = [
  { id: 'ing-1', name: '有机胡萝卜', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=500&q=80' },
  { id: 'ing-2', name: '铁棍山药', image: 'https://images.unsplash.com/photo-1615485925873-8c6d2437cf7d?auto=format&fit=crop&w=500&q=80' },
  { id: 'ing-3', name: '贝贝南瓜', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=500&q=80' }
]

export const featuredRecipes: RecipeSummary[] = [
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

export const todayMealPlan: DailyMealPlan = {
  id: 'plan-001',
  isSaved: true,
  planDate: '2026-04-10',
  dateLabel: '今天 · 4月10日',
  nutritionScore: 98,
  waterSuggestion: '450ml',
  entries: [
    { id: 'meal-1', slot: 'breakfast', time: '08:00', title: '红薯山药小米粥', image: featuredRecipes[0].image, tags: ['高纤维', '健脾'], focus: '温和唤醒肠胃' },
    { id: 'meal-2', slot: 'lunch', time: '12:30', title: '鳕鱼西兰花软饭', image: featuredRecipes[1].image, tags: ['优质蛋白', 'DHA'], focus: '补充优质蛋白' },
    { id: 'meal-3', slot: 'dinner', time: '18:00', title: '贝贝南瓜猪肝泥', image: featuredRecipes[2].image, tags: ['高效补铁', '助眠'], focus: '晚间高铁修复' }
  ]
}

export const historyMealPlans: HistoryMealPlan[] = [
  { id: 'history-1', dateLabel: '2026年4月8日', summary: '南瓜鸡肉软饭 / 鳕鱼蔬菜粥 · 完成度 100%', completionRate: 100 },
  { id: 'history-2', dateLabel: '2026年4月7日', summary: '牛油果软饭 / 山药鸡肉面 · 完成度 85%', completionRate: 85 },
  { id: 'history-3', dateLabel: '2026年4月6日', summary: '高铁猪肝泥 / 小米南瓜粥 · 完成度 92%', completionRate: 92 }
]

export const weeklyPlanDays = [
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
    id: 'plan-2026-04-09',
    planDate: '2026-04-09',
    dateLabel: '4月9日',
    dayLabel: '周四',
    summary: '推荐 3 餐安排',
    recipeTitles: ['红薯山药小米粥', '鳕鱼西兰花软饭', '贝贝南瓜猪肝泥'],
    recipeIds: ['recipe-001', 'recipe-002', 'recipe-003'],
    completionRate: 89,
    tagLabel: '推荐',
    isRecommended: true,
    mealPlan: {
      id: 'recommended-2026-04-09',
      isSaved: false,
      planDate: '2026-04-09',
      dateLabel: '2026年4月9日',
      nutritionScore: 89,
      waterSuggestion: '450ml',
      entries: todayMealPlan.entries
    }
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
    isRecommended: true,
    mealPlan: {
      id: 'recommended-2026-04-11',
      isSaved: false,
      planDate: '2026-04-11',
      dateLabel: '2026年4月11日',
      nutritionScore: 90,
      waterSuggestion: '450ml',
      entries: todayMealPlan.entries
    }
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
    isRecommended: true,
    mealPlan: {
      id: 'recommended-2026-04-12',
      isSaved: false,
      planDate: '2026-04-12',
      dateLabel: '2026年4月12日',
      nutritionScore: 91,
      waterSuggestion: '450ml',
      entries: todayMealPlan.entries
    }
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
    isRecommended: true,
    mealPlan: {
      id: 'recommended-2026-04-13',
      isSaved: false,
      planDate: '2026-04-13',
      dateLabel: '2026年4月13日',
      nutritionScore: 92,
      waterSuggestion: '450ml',
      entries: todayMealPlan.entries
    }
  }
]

export const guideStages: GuideStage[] = [
  {
    key: '0-6',
    label: '0-6月',
    title: '0-6个月：以奶为主',
    description: '此阶段主要以母乳或配方奶喂养为主，暂不建议常规添加辅食。',
    feedingTips: ['纯奶喂养为主', '观察挺舌反射是否减弱', '遵医嘱补充维生素 D'],
    rules: [
      { type: 'recommended', title: '推荐', foods: ['母乳', '配方奶'] },
      { type: 'cautious', title: '谨慎', note: '仅在医生建议下尝试', foods: ['高铁米粉'] },
      { type: 'forbidden', title: '禁止', foods: ['蜂蜜', '盐', '果汁'] }
    ],
    dailySchedule: [
      { time: '07:00', title: '晨奶', description: '母乳或配方奶' },
      { time: '11:00', title: '午间奶', description: '按需喂养' },
      { time: '19:00', title: '睡前奶', description: '保持规律作息' }
    ]
  },
  {
    key: '6-8',
    label: '6-8月',
    title: '6-8个月：尝试颗粒感',
    description: '从细腻泥糊状逐步过渡到带细小颗粒的碎末状，训练吞咽与咀嚼。',
    feedingTips: ['从单一食材开始', '每次新增观察 3 天', '可加入蛋黄和肝泥等高铁食材'],
    rules: [
      { type: 'recommended', title: '推荐添加', foods: ['南瓜泥', '三文鱼泥', '豆腐碎', '西兰花', '肝泥'] },
      { type: 'cautious', title: '谨慎尝试', note: '少量、单次、连续观察 3 天', foods: ['全蛋黄', '虾泥', '草莓泥'] },
      { type: 'forbidden', title: '严格禁止', foods: ['蜂蜜', '盐', '鲜牛奶'] }
    ],
    dailySchedule: [
      { time: '07:00', title: '晨奶', description: '母乳或配方奶 200-240ml' },
      { time: '10:00', title: '第一次辅食', description: '鸡肉碎青菜烂面 + 1/4 蛋黄' },
      { time: '15:00', title: '午后点心', description: '蒸苹果泥或南瓜条' },
      { time: '18:00', title: '第二次辅食', description: '含铁米粉或三文鱼土豆泥' }
    ]
  },
  {
    key: '8-10',
    label: '8-10月',
    title: '8-10个月：增加咀嚼练习',
    description: '逐步从碎末状过渡到小颗粒和软块状，鼓励手抓食。',
    feedingTips: ['安排 2-3 次正餐', '增加软面、软饭和手指食物', '减少过细搅打'],
    rules: [
      { type: 'recommended', title: '推荐添加', foods: ['软饭', '鸡肉末', '牛油果块', '小面片'] },
      { type: 'cautious', title: '谨慎尝试', foods: ['芝麻酱', '整颗蓝莓'] },
      { type: 'forbidden', title: '严格禁止', foods: ['坚果整粒', '果冻', '辣味调料'] }
    ],
    dailySchedule: [
      { time: '08:00', title: '早餐', description: '山药软饭' },
      { time: '12:00', title: '午餐', description: '鸡肉蔬菜烩面' },
      { time: '18:00', title: '晚餐', description: '南瓜鳕鱼泥' }
    ]
  }
]

export const tabooGuides: TabooGuide[] = [
  {
    symptom: '腹泻',
    title: '宝宝腹泻时这样吃更稳妥',
    avoid: [
      { food: '高油脂食物', reason: '会加重肠胃负担，引起蠕动异常。' },
      { food: '高膳食纤维蔬菜', reason: '粗纤维会机械性刺激肠壁。' },
      { food: '生冷瓜果', reason: '易导致胃肠平滑肌痉挛。' }
    ],
    recommended: ['小米米汤', '蒸苹果', '胡萝卜泥', '焦米粥', '熟藕粉'],
    recipes: [
      {
        id: 'recipe-004',
        title: '焦米汤',
        image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
        ageLabel: '6个月+',
        durationLabel: '15分钟',
        difficultyLabel: '初级',
        tags: ['腹泻期首选'],
        description: '含焦化碳水，帮助吸附肠道水分。'
      },
      {
        id: 'recipe-005',
        title: '蒸熟苹果泥',
        image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
        ageLabel: '6个月+',
        durationLabel: '12分钟',
        difficultyLabel: '初级',
        tags: ['温和收敛'],
        description: '煮熟果胶更易吸收，对肠道刺激小。'
      }
    ],
    medicalTips: ['持续发烧超过 38.5℃请及时就医', '若出现脱水、精神差、少尿需尽快就医', '腹泻伴血便或剧烈腹痛时立即就医']
  },
  {
    symptom: '便秘',
    title: '宝宝便秘时优先补水与高纤维',
    avoid: [
      { food: '高糖点心', reason: '会占据胃口，影响膳食平衡。' },
      { food: '过多奶制品', reason: '部分宝宝会因此排便更干。' }
    ],
    recommended: ['西梅泥', '燕麦粥', '南瓜泥', '充足饮水'],
    recipes: featuredRecipes,
    medicalTips: ['便秘超过 3 天并伴哭闹腹胀，请咨询医生']
  }
]

export const recipeDetail: RecipeDetail = {
  id: 'recipe-001',
  title: '有机南瓜小米米糊',
  image: featuredRecipes[0].image,
  heroImage: 'https://images.unsplash.com/photo-1604908176997-4312197e9581?auto=format&fit=crop&w=1200&q=80',
  ageLabel: '6个月+ 尝试期',
  durationLabel: '20分钟',
  difficultyLabel: '初级',
  tags: ['健脾开胃', '高铁搭配'],
  description: '香甜软糯，适合辅食初添阶段的早餐或加餐。',
  nutritionTips: ['南瓜富含 β-胡萝卜素', '小米更温和，适合作为过渡主食', '初次添加请观察 3 天'],
  ingredients: [
    { id: 'ri-1', name: '有机南瓜', amount: '50g' },
    { id: 'ri-2', name: '黄小米', amount: '20g' },
    { id: 'ri-3', name: '温水 / 母乳', amount: '适量' }
  ],
  steps: [
    { stepNo: 1, title: '处理食材', description: '南瓜去皮切丁，小米洗净后浸泡 15 分钟。', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80' },
    { stepNo: 2, title: '蒸熟软化', description: '南瓜和小米蒸 15-20 分钟，直到完全软烂。', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
    { stepNo: 3, title: '打成细腻米糊', description: '加入温水或母乳打成顺滑细腻的糊状。', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80' }
  ],
  relatedRecipes: featuredRecipes.slice(1)
}

export const profileMenus: ProfileMenuItem[] = [
  { key: 'baby', title: '宝宝档案', subtitle: '生日、月龄、阶段与身高体重', icon: '👶' },
  { key: 'favorite', title: '我的收藏', subtitle: '保存喜欢的辅食与饮食指南', icon: '❤️' },
  { key: 'history', title: '辅食计划', subtitle: '查看过往生成计划与查询记录', icon: '🕘' },
  { key: 'allergy', title: '过敏管理', subtitle: '统一维护过敏原与提醒', icon: '⚠️' },
  { key: 'message', title: '消息通知', subtitle: '每日提醒与系统通知', icon: '🔔' },
  { key: 'help', title: '帮助中心', subtitle: '常见问题、意见反馈、使用说明', icon: '💬' },
  { key: 'share', title: '推荐给朋友', subtitle: '一键分享给家人或宝妈群', icon: '🎁' }
]

export const wechatEntries: WechatEntry[] = [
  { key: 'subscribe', title: '订阅每日提醒', icon: '⏰' },
  { key: 'desktop', title: '添加到我的小程序', icon: '➕' },
  { key: 'share', title: '分享小程序', icon: '🔗' }
]

export const homeDashboardDailyChange = '我的独立意识越来越强啦，总是想要自己来完成一些事情，比如穿衣服时，我会说“我自己来”。'

export const homeDashboardMonthlyFocusText = '继续保持规律进餐，逐步丰富食材种类，并鼓励宝宝练习自主进食。'

export const homeDashboardModules = [
    {
    key: 'record',
    title: '喂养记录',
    icon: '📝',
    route: '/pages/record/index',
    implemented: true,
    tone: 'pink',
    shape: 'shape-1'
  },
  {
    key: 'growth',
    title: '记身高体重',
    icon: '📏',
    route: '/pages/growth/index?tab=list',
    implemented: true,
    tone: 'green',
    shape: 'shape-3'
  },
  {
    key: 'feeding-hub',
    title: '宝宝辅食',
    icon: '🍲',
    route: '/pages/feeding/index',
    implemented: true,
    tone: 'orange',
    shape: 'shape-4'
  },
  {
    key: 'vaccine',
    title: '疫苗接种',
    icon: '💉',
    route: '/pages/vaccine/index',
    implemented: true,
    tone: 'teal',
    shape: 'shape-3'
  },
  {
    key: 'knowledge',
    title: '干货百科',
    icon: '📘',
    route: '/pages/knowledge/index',
    implemented: true,
    tone: 'blue',
    shape: 'shape-2'
  },
  {
    key: 'guide',
    title: '饮食指南',
    icon: '🥣',
    route: '/pages/guide/index',
    implemented: true,
    tone: 'amber',
    shape: 'shape-2'
  },
  {
    key: 'taboo',
    title: '生病忌口',
    icon: '🚫',
    route: '/pages/taboo/index',
    implemented: true,
    tone: 'rose',
    shape: 'shape-1'
  },
  {
    key: 'wheel',
    title: '辅食转盘',
    icon: '🎡',
    route: '/pages/wheel/index',
    implemented: true,
    tone: 'purple',
    shape: 'shape-1'
  },
  {
    key: 'favorite',
    title: '我的收藏',
    icon: '🔖',
    route: '/pages/favorites/index',
    implemented: true,
    tone: 'indigo',
    shape: 'shape-4'
  },
  {
    key: 'feedback',
    title: '反馈中心',
    icon: '💬',
    route: '/pages/help/index',
    implemented: true,
    tone: 'slate',
    shape: 'shape-3'
  }
] as const

export const homeDashboardTodos = [
  {
    id: 'todo-ad',
    title: '服用 AD 滴剂',
    timeLabel: '09:00',
    status: 'pending'
  },
  {
    id: 'todo-vaccine',
    title: '接种五联疫苗（第四剂）',
    timeLabel: '5月15日',
    status: 'pending'
  }
] as const

export const homeDashboardRecommendations = [
  {
    id: 'rec-help',
    title: '宝宝办证全攻略：从出生证到社保',
    tag: '干货',
    badge: 'NEW',
    image: recipeDetail.heroImage,
    route: '/pages/help/index'
  },
  {
    id: 'rec-knowledge',
    title: '夏季宝宝开胃辅食：5款高颜值面点',
    tag: '食谱',
    image: featuredRecipes[2].image,
    route: '/pages/knowledge/index'
  },
  {
    id: 'rec-list',
    title: '一周不重样搭配思路，做饭更省心',
    tag: '推荐',
    image: featuredRecipes[1].image,
    route: '/pages/recipe-list/index'
  }
] as const
