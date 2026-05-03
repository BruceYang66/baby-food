import type { WheelCandidate, WheelCategory } from '@baby-food/shared-types'

export const wheelFilterTags = ['全部', '补铁', '补钙', '助消化', '增强免疫力', '快手10分钟'] as const

export const wheelCategoryMeta: Array<{
  key: WheelCategory
  label: string
  icon: string
  color: string
}> = [
  { key: 'vegetable', label: '蔬菜泥/碎', icon: '🥕', color: '#FF9A62' },
  { key: 'protein', label: '肉泥/肉末', icon: '🥩', color: '#FFC54A' },
  { key: 'egg', label: '蛋黄/蛋羹', icon: '🥚', color: '#8DD97C' },
  { key: 'grain', label: '米粉/粥', icon: '🍚', color: '#69B7FF' },
  { key: 'fruit', label: '水果泥/块', icon: '🍎', color: '#B48DFF' },
  { key: 'mixed', label: '混合辅食', icon: '🥘', color: '#FF6B6B' },
  { key: 'finger', label: '手指食物', icon: '🥐', color: '#9F7B58' },
  { key: 'soup', label: '汤羹类', icon: '🍲', color: '#BFC7D3' }
]

export const wheelCandidates: WheelCandidate[] = [
  {
    id: 'wheel-1',
    title: '番茄牛肉碎末粥',
    category: 'mixed',
    icon: '🥘',
    ageLabel: '适合18月龄',
    ingredients: ['牛肉20g', '番茄30g', '大米15g', '西兰花10g'],
    steps: ['牛肉焯熟后剁碎。', '番茄与西兰花切小块煮软。', '和大米同煮至软烂后拌匀。'],
    nutritionTags: ['补铁', '增强免疫力'],
    filterTags: ['补铁', '增强免疫力'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-2',
    title: '南瓜鸡肉软饭',
    category: 'protein',
    icon: '🥩',
    ageLabel: '适合15月龄+',
    ingredients: ['鸡胸肉25g', '南瓜35g', '软饭50g'],
    steps: ['鸡肉蒸熟撕碎。', '南瓜压成小块泥。', '和软饭翻拌后再焖2分钟。'],
    nutritionTags: ['增强免疫力', '快手10分钟'],
    filterTags: ['增强免疫力', '快手10分钟'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-3',
    title: '山药鳕鱼羹',
    category: 'soup',
    icon: '🍲',
    ageLabel: '适合12月龄+',
    ingredients: ['鳕鱼20g', '山药25g', '胡萝卜10g'],
    steps: ['山药和胡萝卜蒸熟压碎。', '鳕鱼蒸熟挑刺压散。', '加少量温水搅成细羹。'],
    nutritionTags: ['助消化', '补钙'],
    filterTags: ['助消化', '补钙'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-4',
    title: '香蕉燕麦蛋羹',
    category: 'egg',
    icon: '🥚',
    ageLabel: '适合10月龄+',
    ingredients: ['鸡蛋1个', '香蕉20g', '燕麦10g'],
    steps: ['燕麦提前泡软。', '香蕉压泥后与蛋液混合。', '上锅蒸8分钟即可。'],
    nutritionTags: ['助消化', '快手10分钟'],
    filterTags: ['助消化', '快手10分钟'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-5',
    title: '牛油果苹果块',
    category: 'fruit',
    icon: '🍎',
    ageLabel: '适合10月龄+',
    ingredients: ['牛油果20g', '苹果25g', '酸奶10g'],
    steps: ['苹果蒸软切小丁。', '牛油果切小块。', '加入少量酸奶拌匀。'],
    nutritionTags: ['增强免疫力'],
    filterTags: ['增强免疫力'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-6',
    title: '虾仁豆腐小方',
    category: 'finger',
    icon: '🥐',
    ageLabel: '适合14月龄+',
    ingredients: ['虾仁20g', '嫩豆腐40g', '玉米淀粉8g'],
    steps: ['虾仁剁碎后与豆腐拌匀。', '加入淀粉整理成小块。', '平底锅小火煎至定型。'],
    nutritionTags: ['补钙', '手指食物'],
    filterTags: ['补钙'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-7',
    title: '菠菜猪肝米粉',
    category: 'grain',
    icon: '🍚',
    ageLabel: '适合8月龄+',
    ingredients: ['高铁米粉20g', '猪肝15g', '菠菜10g'],
    steps: ['猪肝焯水蒸熟压泥。', '菠菜烫熟切细。', '米粉冲调后加入猪肝和菠菜。'],
    nutritionTags: ['补铁'],
    filterTags: ['补铁'],
    route: '/pages/recipe-list/index'
  },
  {
    id: 'wheel-8',
    title: '西兰花土豆碎',
    category: 'vegetable',
    icon: '🥕',
    ageLabel: '适合9月龄+',
    ingredients: ['西兰花20g', '土豆30g', '橄榄油2滴'],
    steps: ['土豆蒸熟压碎。', '西兰花焯熟切细。', '拌入少量橄榄油即可。'],
    nutritionTags: ['助消化'],
    filterTags: ['助消化'],
    route: '/pages/recipe-list/index'
  }
]
