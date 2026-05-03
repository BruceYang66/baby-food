import type { ReminderCategory, ReminderItem, ReminderRepeatType } from '@baby-food/shared-types'

const DAY_MS = 24 * 60 * 60 * 1000

function formatYmd(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

function getFirstDayOfNextMonth(base: Date) {
  return new Date(base.getFullYear(), base.getMonth() + 1, 1)
}

export const reminderCategoryMeta: Array<{ key: ReminderCategory; label: string; icon: string; accent: string }> = [
  { key: 'supplement', label: '补剂', icon: '💊', accent: 'orange' },
  { key: 'vaccine', label: '疫苗', icon: '💉', accent: 'rose' },
  { key: 'growth', label: '测量', icon: '📏', accent: 'green' },
  { key: 'feeding', label: '喂养', icon: '🥣', accent: 'teal' },
  { key: 'outing', label: '出行', icon: '🌿', accent: 'blue' },
  { key: 'custom', label: '自定义', icon: '📝', accent: 'slate' }
]

export const reminderRepeatOptions: Array<{ key: ReminderRepeatType; label: string }> = [
  { key: 'once', label: '仅一次' },
  { key: 'daily', label: '每天' },
  { key: 'alternate-day', label: '隔天' },
  { key: 'weekly', label: '每周' },
  { key: 'monthly', label: '每月' }
]

export function buildSeedReminders(today = new Date()): ReminderItem[] {
  const todayYmd = formatYmd(today)
  const tomorrowYmd = formatYmd(addDays(today, 1))
  const vaccineYmd = formatYmd(addDays(today, 12))
  const nextMonthYmd = formatYmd(getFirstDayOfNextMonth(today))

  return [
    {
      id: 'reminder-ad',
      title: '服用 AD 滴剂',
      date: todayYmd,
      time: '09:00',
      repeatType: 'daily',
      status: 'pending',
      category: 'supplement',
      note: '早餐后服用更容易记住',
      source: 'system'
    },
    {
      id: 'reminder-calcium',
      title: '补钙提醒',
      date: tomorrowYmd,
      time: '20:00',
      repeatType: 'alternate-day',
      status: 'pending',
      category: 'supplement',
      note: '洗澡后补充，避免和奶同时',
      source: 'local'
    },
    {
      id: 'reminder-vaccine',
      title: '接种五联疫苗（第四剂）',
      date: vaccineYmd,
      time: '09:30',
      repeatType: 'once',
      status: 'pending',
      category: 'vaccine',
      note: '提前准备接种本和医保卡',
      source: 'system'
    },
    {
      id: 'reminder-growth',
      title: '记录身高体重',
      date: nextMonthYmd,
      time: '08:30',
      repeatType: 'monthly',
      status: 'pending',
      category: 'growth',
      note: '建议固定在每月第一天测量',
      source: 'system'
    },
    {
      id: 'reminder-feeding',
      title: '今天还吃南瓜牛肉碎末粥吗？',
      date: todayYmd,
      time: '17:30',
      repeatType: 'once',
      status: 'pending',
      category: 'feeding',
      note: '昨天接受度不错，可以再试一次',
      source: 'system'
    }
  ]
}
