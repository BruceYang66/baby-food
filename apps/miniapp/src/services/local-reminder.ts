import type { HomeTodoItem, ReminderGroup, ReminderItem, ReminderRepeatType } from '@baby-food/shared-types'
import { buildSeedReminders, reminderCategoryMeta, reminderRepeatOptions } from '@/data/reminder'

const STORAGE_KEY = 'miniapp-reminders-v1'

type ReminderFilterKey = 'all' | 'today' | 'pending' | 'done'

function formatYmd(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStoredReminders() {
  const value = uni.getStorageSync(STORAGE_KEY)
  return Array.isArray(value) ? value.filter((item): item is ReminderItem => typeof item?.id === 'string') : []
}

function writeReminders(items: ReminderItem[]) {
  uni.setStorageSync(STORAGE_KEY, items)
}

function ensureReminders() {
  const current = getStoredReminders()
  if (current.length) {
    return current
  }

  const seeded = buildSeedReminders()
  writeReminders(seeded)
  return seeded
}

function compareReminder(left: ReminderItem, right: ReminderItem) {
  const dateDiff = left.date.localeCompare(right.date)
  if (dateDiff !== 0) {
    return dateDiff
  }

  return (left.time || '').localeCompare(right.time || '')
}

function formatGroupLabel(date: string) {
  const today = formatYmd(new Date())
  if (date === today) {
    return '今天'
  }

  const tomorrow = formatYmd(new Date(Date.now() + 24 * 60 * 60 * 1000))
  if (date === tomorrow) {
    return '明天'
  }

  const [year, month, day] = date.split('-')
  return `${Number(month)}月${Number(day)}日`
}

function formatRepeatLabel(repeatType: ReminderRepeatType) {
  return reminderRepeatOptions.find((item) => item.key === repeatType)?.label || '仅一次'
}

export function readReminderItems() {
  return ensureReminders().slice().sort(compareReminder)
}

export function getReminderById(id: string) {
  return ensureReminders().find((item) => item.id === id) || null
}

export function saveReminder(input: Omit<ReminderItem, 'id' | 'status' | 'completedAt'> & { status?: ReminderItem['status'] }, id?: string) {
  const current = ensureReminders()
  const nextReminder: ReminderItem = {
    id: id || `reminder-${Date.now()}`,
    title: input.title,
    date: input.date,
    time: input.time,
    repeatType: input.repeatType,
    status: input.status || 'pending',
    category: input.category,
    note: input.note,
    completedAt: input.status === 'done' ? formatYmd(new Date()) : undefined,
    source: input.source || 'local'
  }

  const next = id ? current.map((item) => (item.id === id ? nextReminder : item)) : [...current, nextReminder]
  const sorted = next.sort(compareReminder)
  writeReminders(sorted)
  return sorted
}

export function toggleReminderDone(id: string) {
  const current = ensureReminders()
  const next = current.map((item) => {
    if (item.id !== id) {
      return item
    }

    const isDone = item.status === 'done'
    return {
      ...item,
      status: isDone ? 'pending' : 'done',
      completedAt: isDone ? undefined : formatYmd(new Date())
    }
  })

  const sorted = next.sort(compareReminder)
  writeReminders(sorted)
  return sorted
}

export function markReminderItemsDone(ids: string[]) {
  if (!ids.length) {
    return readReminderItems()
  }

  const idSet = new Set(ids)
  const next = ensureReminders().map((item) => {
    if (!idSet.has(item.id) || item.status === 'done') {
      return item
    }

    return {
      ...item,
      status: 'done' as const,
      completedAt: formatYmd(new Date())
    }
  })

  const sorted = next.sort(compareReminder)
  writeReminders(sorted)
  return sorted
}

export function markAllPendingRemindersDone() {
  const pendingIds = ensureReminders().filter((item) => item.status === 'pending').map((item) => item.id)
  return markReminderItemsDone(pendingIds)
}

export function removeReminder(id: string) {
  const next = ensureReminders().filter((item) => item.id !== id)
  writeReminders(next)
  return next
}

export function getReminderGroups(filter: ReminderFilterKey = 'all'): ReminderGroup[] {
  const today = formatYmd(new Date())
  let items = readReminderItems()

  if (filter === 'today') {
    items = items.filter((item) => item.date === today)
  } else if (filter === 'pending') {
    items = items.filter((item) => item.status === 'pending')
  } else if (filter === 'done') {
    items = items.filter((item) => item.status === 'done')
  }

  const grouped = items.reduce<Record<string, ReminderItem[]>>((result, item) => {
    const key = filter === 'done' ? item.completedAt || item.date : item.date
    result[key] = result[key] || []
    result[key].push(item)
    return result
  }, {})

  return Object.keys(grouped)
    .sort((left, right) => left.localeCompare(right))
    .map((key) => ({
      label: formatGroupLabel(key),
      items: grouped[key].slice().sort(compareReminder)
    }))
}

export function getReminderStats() {
  const items = readReminderItems()
  const today = formatYmd(new Date())
  return {
    total: items.length,
    pending: items.filter((item) => item.status === 'pending').length,
    done: items.filter((item) => item.status === 'done').length,
    today: items.filter((item) => item.date === today).length,
    todayPending: items.filter((item) => item.date === today && item.status === 'pending').length
  }
}

export function getReminderCategoryMeta(category: ReminderItem['category']) {
  return reminderCategoryMeta.find((item) => item.key === category) || reminderCategoryMeta[0]
}

export function getReminderRepeatLabel(repeatType: ReminderRepeatType) {
  return formatRepeatLabel(repeatType)
}

export function getReminderCategoryOptions() {
  return reminderCategoryMeta
}

export function getReminderRepeatOptions() {
  return reminderRepeatOptions
}

export function getHomeReminderPreview(limit = 3): HomeTodoItem[] {
  return readReminderItems()
    .filter((item) => item.status === 'pending')
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: `${getReminderCategoryMeta(item.category).label} · ${formatRepeatLabel(item.repeatType)}`,
      timeLabel: item.time ? `${item.date.slice(5).replace('-', '/')} ${item.time}` : item.date.slice(5).replace('-', '/'),
      status: 'pending',
      route: item.category === 'vaccine'
        ? '/pages/vaccine/index'
        : item.category === 'supplement'
          ? `/pages/record/index?type=supplement&sourceReminderId=${encodeURIComponent(item.id)}`
          : item.category === 'feeding'
            ? `/pages/record/index?type=feeding&sourceReminderId=${encodeURIComponent(item.id)}`
            : '/pages/reminder/index'
    }))
}
