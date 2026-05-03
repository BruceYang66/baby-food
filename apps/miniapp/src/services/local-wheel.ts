import type { WheelCandidate, WheelCategory } from '@baby-food/shared-types'
import { wheelCandidates, wheelFilterTags } from '@/data/wheel'

const STORAGE_KEY = 'miniapp-wheel-history-v1'

function getStoredHistory() {
  const value = uni.getStorageSync(STORAGE_KEY)
  return Array.isArray(value) ? value.filter((item): item is WheelCandidate => typeof item?.id === 'string') : []
}

function writeHistory(items: WheelCandidate[]) {
  uni.setStorageSync(STORAGE_KEY, items)
}

export function getWheelFilterTags() {
  return wheelFilterTags
}

export function getWheelCandidates(filters: string[] = [], category?: WheelCategory | 'all') {
  const applied = filters.filter((item) => item && item !== '全部')
  let candidates = wheelCandidates

  if (category && category !== 'all') {
    candidates = candidates.filter((item) => item.category === category)
  }

  if (!applied.length) {
    return candidates
  }

  const filtered = candidates.filter((item) => applied.every((tag) => item.filterTags.includes(tag)))
  return filtered.length ? filtered : candidates
}

export function spinWheel(filters: string[] = [], category?: WheelCategory | 'all') {
  const pool = getWheelCandidates(filters, category)
  const candidate = pool[Math.floor(Math.random() * pool.length)]
  const sectorIndex = Math.max(0, wheelCandidates.findIndex((item) => item.category === candidate.category))
  const fullTurns = 5 + Math.floor(Math.random() * 2)
  const sectorAngle = 360 / 8
  const rotation = fullTurns * 360 + (360 - sectorIndex * sectorAngle - sectorAngle / 2)

  return {
    candidate,
    sectorIndex,
    rotation
  }
}

export function readWheelHistory() {
  return getStoredHistory()
}

export function pushWheelHistory(candidate: WheelCandidate) {
  const next = [candidate, ...getStoredHistory().filter((item) => item.id !== candidate.id)].slice(0, 6)
  writeHistory(next)
  return next
}
