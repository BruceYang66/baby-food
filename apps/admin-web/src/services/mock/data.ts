import type {
  DashboardMetric,
  DashboardTrendPoint,
  ImportJob,
  OptimizationTask,
  RecipeAdminRow,
  ReviewQueueItem,
  SystemSettingGroup,
  UserAdminRow
} from '@baby-food/shared-types'

export const dashboardMetrics: DashboardMetric[] = [
  { key: 'users', label: '总用户数', value: '18,420', trend: '+12.8%', accent: 'primary' },
  { key: 'recipes', label: '食谱总数', value: '1,286', trend: '+86', accent: 'secondary' },
  { key: 'pending', label: '待审核', value: '42', trend: '今日 +8', accent: 'warning' },
  { key: 'published', label: '已上线', value: '964', trend: '+3.2%', accent: 'primary' },
  { key: 'coverage', label: '月龄覆盖度', value: '91%', trend: '10-12月偏低', accent: 'warning' },
  { key: 'feedback', label: '负反馈预警', value: '7', trend: '需尽快处理', accent: 'danger' }
]

export const userTrend: DashboardTrendPoint[] = [
  { label: '周一', value: 320 },
  { label: '周二', value: 410 },
  { label: '周三', value: 390 },
  { label: '周四', value: 470 },
  { label: '周五', value: 520 },
  { label: '周六', value: 610 },
  { label: '周日', value: 660 }
]

export const recipeRows: RecipeAdminRow[] = [
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

export const reviewQueue: ReviewQueueItem[] = [
  { id: 'RV-001', title: '南瓜鸡肉烩面', source: '批量导入', submittedBy: '运营-小顾', submittedAt: '今天 09:10', focus: '10-12月覆盖补齐' },
  { id: 'RV-002', title: '苹果小米蒸糕', source: '手动创建', submittedBy: '陈营养师', submittedAt: '今天 08:35', focus: '病期可用点心' },
  { id: 'RV-003', title: '菠菜猪肝软饭', source: '快速添加', submittedBy: '外采营养师', submittedAt: '昨天 20:10', focus: '高铁需求热门' }
]

export const importJobs: ImportJob[] = [
  { id: 'IMP-240409-01', fileName: '春季辅食补充批次.xlsx', operator: '运营-小顾', total: 86, success: 78, failed: 8, status: 'completed', createdAt: '2026-04-09 08:40' },
  { id: 'IMP-240408-02', fileName: '病期食谱.csv', operator: '陈营养师', total: 24, success: 24, failed: 0, status: 'completed', createdAt: '2026-04-08 16:12' },
  { id: 'IMP-240407-01', fileName: '月龄禁忌修订.xlsx', operator: '管理员', total: 18, success: 15, failed: 3, status: 'failed', createdAt: '2026-04-07 11:20' }
]

export const optimizationTasks: OptimizationTask[] = [
  { id: 'OPT-01', recipeTitle: '南瓜鸡肉烩面', issueType: '替换率偏高', severity: '高', suggestion: '口感偏粗，建议补充更细颗粒版本', status: '待处理' },
  { id: 'OPT-02', recipeTitle: '三文鱼山药泥', issueType: '收藏率下降', severity: '中', suggestion: '更新封面图并补充新版步骤图', status: '处理中' },
  { id: 'OPT-03', recipeTitle: '菠菜猪肝软饭', issueType: '反馈集中', severity: '高', suggestion: '检查猪肝焯水步骤与腥味处理', status: '待复核' }
]

export const userRows: UserAdminRow[] = [
  { id: 'U-10001', nickname: '糯米妈妈', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', registerAt: '2026-03-12 09:18', babyCount: 1, activity: '高活跃', status: '正常' },
  { id: 'U-10002', nickname: '暖暖爸比', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80', registerAt: '2026-03-19 20:05', babyCount: 2, activity: '中活跃', status: '正常' },
  { id: 'U-10003', nickname: '星星妈', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80', registerAt: '2026-04-01 10:41', babyCount: 1, activity: '低活跃', status: '待回访' }
]

export const settingGroups: SystemSettingGroup[] = [
  {
    title: '基础设置',
    description: '品牌名称、Logo、分享文案与默认入口。',
    items: [
      { label: '系统名称', value: '养娃小管家' },
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
