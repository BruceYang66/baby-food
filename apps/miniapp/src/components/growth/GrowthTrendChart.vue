<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import type { GrowthChartDataset, GrowthRangeKey } from '@baby-food/shared-types'

const props = defineProps<{
  dataset: GrowthChartDataset
  activePointId?: string
  rangeKey: GrowthRangeKey
  currentAgeMonths: number
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const padding = {
  top: 28,
  right: 32,
  bottom: 64,
  left: 56
}
const drawHeight = 336
const minimumInnerWidth = 320
const shellWidth = ref(0)
const scrollLeft = ref(0)
const instance = getCurrentInstance()

function measureShellWidth() {
  nextTick(() => {
    if (!instance?.proxy) {
      return
    }

    uni.createSelectorQuery()
      .in(instance.proxy)
      .select('.trend-chart-shell')
      .boundingClientRect((rect) => {
        if (rect && typeof rect.width === 'number') {
          shellWidth.value = rect.width
        }
      })
      .exec()
  })
}

function handleScroll(event: { detail: { scrollLeft?: number } }) {
  scrollLeft.value = event.detail.scrollLeft || 0
}

onMounted(() => {
  measureShellWidth()
})

function formatMonthLabel(month: number) {
  if (month === 0) {
    return '出生'
  }

  if (month === 12) {
    return '1岁'
  }

  if (month === 24) {
    return '2岁'
  }

  if (month === 36) {
    return '3岁'
  }

  return `${month}个月`
}

function formatAgeBadge(months: number) {
  const roundedMonths = Math.max(0, Math.round(months))
  if (roundedMonths < 12) {
    return `${roundedMonths}月`
  }

  const years = Math.floor(roundedMonths / 12)
  const remainingMonths = roundedMonths % 12
  return remainingMonths === 0 ? `${years}岁` : `${years}岁${remainingMonths}月`
}

const domain = computed(() => ({
  min: props.dataset.minAgeMonths,
  max: props.dataset.maxAgeMonths
}))

function getX(ageMonths: number) {
  const range = Math.max(domain.value.max - domain.value.min, 1)
  return padding.left + ((ageMonths - domain.value.min) / range) * innerWidth.value
}

function getY(value: number) {
  const range = Math.max(props.dataset.maxValue - props.dataset.minValue, 0.001)
  return padding.top + ((props.dataset.maxValue - value) / range) * drawHeight
}

const tickAges = computed(() => {
  if (props.rangeKey === 'threeYear') {
    return [0, 6, 12, 18, 24, 30, 36]
  }

  if (props.rangeKey === 'oneYear') {
    const ticks: number[] = []
    for (let age = domain.value.min; age <= domain.value.max; age += 2) {
      ticks.push(age)
    }
    if (ticks[ticks.length - 1] !== domain.value.max) {
      ticks.push(domain.value.max)
    }
    return ticks
  }

  const ticks: number[] = []
  for (let age = domain.value.min; age <= domain.value.max; age += 1) {
    ticks.push(age)
  }
  if (ticks[ticks.length - 1] !== domain.value.max) {
    ticks.push(domain.value.max)
  }
  return ticks
})

const innerWidth = computed(() => {
  const tickGap = props.rangeKey === 'threeYear' ? 92 : props.rangeKey === 'oneYear' ? 82 : 74
  return Math.max(minimumInnerWidth, Math.max(tickAges.value.length - 1, 3) * tickGap)
})
const canvasHeight = computed(() => padding.top + drawHeight + padding.bottom)
const canvasWidth = computed(() => padding.left + padding.right + innerWidth.value)

const yGrid = computed(() => {
  const lineCount = 5
  const range = props.dataset.maxValue - props.dataset.minValue
  return Array.from({ length: lineCount }, (_, index) => {
    const ratio = index / (lineCount - 1)
    const value = props.dataset.maxValue - range * ratio
    return {
      id: `y-grid-${index}`,
      y: padding.top + drawHeight * ratio,
      label: Number(value.toFixed(1)).toString().replace(/\.0$/, '')
    }
  })
})

const xTicks = computed(() => tickAges.value.map((age) => ({
  age,
  x: getX(age),
  label: formatMonthLabel(age)
})))

const bandColumns = computed(() => {
  const source = props.dataset.bands
  if (!source.length) {
    return []
  }

  return source.map((band, index) => {
    const x = getX(band.ageMonths)
    const nextBand = source[index + 1]
    const nextX = nextBand ? getX(nextBand.ageMonths) : x + 6
    return {
      id: `${band.ageMonths}`,
      left: x,
      width: Math.max(nextX - x + 1, 4),
      top: getY(band.p97),
      height: Math.max(getY(band.p3) - getY(band.p97), 12),
      p50Y: getY(band.p50)
    }
  })
})

const bandGuidePoints = computed(() => props.dataset.bands.map((band) => ({
  x: getX(band.ageMonths),
  p3Y: getY(band.p3),
  p50Y: getY(band.p50),
  p97Y: getY(band.p97)
})))

function createGuideSegments(key: 'p3Y' | 'p50Y' | 'p97Y') {
  if (bandGuidePoints.value.length < 2) {
    return []
  }

  return bandGuidePoints.value.slice(1).map((point, index) => {
    const previous = bandGuidePoints.value[index]
    const deltaX = point.x - previous.x
    const deltaY = point[key] - previous[key]
    return {
      id: `${key}-${index}`,
      left: previous.x,
      top: previous[key],
      width: Math.sqrt(deltaX ** 2 + deltaY ** 2),
      angle: (Math.atan2(deltaY, deltaX) * 180) / Math.PI
    }
  })
}

const p97GuideSegments = computed(() => createGuideSegments('p97Y'))
const p50GuideSegments = computed(() => createGuideSegments('p50Y'))
const p3GuideSegments = computed(() => createGuideSegments('p3Y'))

const pointPositions = computed(() => props.dataset.points.map((point) => ({
  ...point,
  x: getX(point.ageMonths),
  y: getY(point.value)
})))

const lineSegments = computed(() => {
  if (pointPositions.value.length < 2) {
    return []
  }

  return pointPositions.value.slice(1).map((point, index) => {
    const previous = pointPositions.value[index]
    const deltaX = point.x - previous.x
    const deltaY = point.y - previous.y
    return {
      id: `${previous.id}-${point.id}`,
      left: previous.x,
      top: previous.y,
      width: Math.sqrt(deltaX ** 2 + deltaY ** 2),
      angle: (Math.atan2(deltaY, deltaX) * 180) / Math.PI
    }
  })
})

const resolvedActivePoint = computed(() => pointPositions.value.find((item) => item.id === props.activePointId) || pointPositions.value[pointPositions.value.length - 1] || null)
const todayWithinRange = computed(() => props.currentAgeMonths >= domain.value.min && props.currentAgeMonths <= domain.value.max)
const todayAxisX = computed(() => getX(Math.min(Math.max(props.currentAgeMonths, domain.value.min), domain.value.max)))
const todayBadgeLabel = computed(() => (todayWithinRange.value ? '今天' : `今天·${formatAgeBadge(props.currentAgeMonths)}`))
const todayBadgeWidth = computed(() => (todayWithinRange.value ? 56 : 118))
const todayAxisStyle = computed(() => ({
  left: `${todayAxisX.value}px`,
  top: `${padding.top}px`,
  height: `${drawHeight}px`
}))
const todayBadgeStyle = computed(() => {
  const left = Math.min(Math.max(todayAxisX.value + 10, padding.left + 6), canvasWidth.value - todayBadgeWidth.value)
  const top = padding.top + drawHeight - 42

  return {
    left: `${left}px`,
    top: `${top}px`
  }
})
const referenceAnchorX = computed(() => {
  const fallbackWidth = padding.left + innerWidth.value + padding.right
  const viewportWidth = shellWidth.value || fallbackWidth
  return Math.min(
    Math.max(scrollLeft.value + viewportWidth - padding.right - 12, padding.left),
    padding.left + innerWidth.value
  )
})
const visibleReference = computed(() => {
  const points = bandGuidePoints.value
  if (!points.length) {
    return null
  }

  const anchorX = referenceAnchorX.value
  if (anchorX <= points[0].x) {
    return points[0]
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    if (anchorX <= next.x) {
      const ratio = (anchorX - current.x) / Math.max(next.x - current.x, 0.001)
      return {
        x: anchorX,
        p3Y: current.p3Y + (next.p3Y - current.p3Y) * ratio,
        p50Y: current.p50Y + (next.p50Y - current.p50Y) * ratio,
        p97Y: current.p97Y + (next.p97Y - current.p97Y) * ratio
      }
    }
  }

  return points[points.length - 1]
})
const emptyHintStyle = computed(() => ({
  left: `${padding.left + 10}px`,
  width: `${innerWidth.value - 20}px`,
  top: `${padding.top + drawHeight / 2 - 24}px`
}))
const tooltipStyle = computed(() => {
  if (!resolvedActivePoint.value) {
    return {}
  }

  const atRight = resolvedActivePoint.value.x > canvasWidth.value - 180
  const left = atRight ? resolvedActivePoint.value.x - 164 : resolvedActivePoint.value.x + 12
  const top = Math.max(20, resolvedActivePoint.value.y - 86)

  return {
    left: `${Math.min(Math.max(left, padding.left + 6), canvasWidth.value - 166)}px`,
    top: `${top}px`
  }
})
</script>

<template>
  <view class="trend-chart-shell">
    <scroll-view scroll-x class="trend-scroll" show-scrollbar="false" @scroll="handleScroll">
      <view class="trend-canvas" :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }">
        <view v-for="line in yGrid" :key="line.id" class="grid-line" :style="{ top: `${line.y}px` }">
          <text class="grid-label" :style="{ top: `${line.y - 10}px` }">{{ line.label }}</text>
        </view>

        <view v-for="tick in xTicks" :key="`tick-${tick.age}`" class="vertical-grid-line" :style="{ left: `${tick.x}px`, top: `${padding.top}px`, height: `${drawHeight}px` }" />

        <view
          v-for="column in bandColumns"
          :key="column.id"
          class="band-column"
          :style="{
            left: `${column.left}px`,
            width: `${column.width}px`,
            top: `${column.top}px`,
            height: `${column.height}px`
          }"
        />

        <view
          v-for="segment in p97GuideSegments"
          :key="segment.id"
          class="band-guide top"
          :style="{
            left: `${segment.left}px`,
            top: `${segment.top}px`,
            width: `${segment.width}px`,
            transform: `rotate(${segment.angle}deg)`
          }"
        />

        <view
          v-for="segment in p50GuideSegments"
          :key="segment.id"
          class="band-guide mid"
          :style="{
            left: `${segment.left}px`,
            top: `${segment.top}px`,
            width: `${segment.width}px`,
            transform: `rotate(${segment.angle}deg)`
          }"
        />

        <view
          v-for="segment in p3GuideSegments"
          :key="segment.id"
          class="band-guide bottom"
          :style="{
            left: `${segment.left}px`,
            top: `${segment.top}px`,
            width: `${segment.width}px`,
            transform: `rotate(${segment.angle}deg)`
          }"
        />

        <view class="today-axis" :class="{ clipped: !todayWithinRange }" :style="todayAxisStyle" />
        <view class="today-badge" :class="{ clipped: !todayWithinRange }" :style="todayBadgeStyle">{{ todayBadgeLabel }}</view>

        <view v-if="!pointPositions.length" class="trend-empty-hint" :style="emptyHintStyle">该阶段暂无记录，继续记录后可看到个人曲线</view>

        <view
          v-for="segment in lineSegments"
          :key="segment.id"
          class="trend-segment"
          :style="{
            left: `${segment.left}px`,
            top: `${segment.top}px`,
            width: `${segment.width}px`,
            transform: `rotate(${segment.angle}deg)`
          }"
        />

        <view
          v-for="point in pointPositions"
          :key="point.id"
          class="trend-point"
          :style="{ left: `${point.x - 10}px`, top: `${point.y - 10}px` }"
          @tap="emit('select', point.id)"
        >
          <view class="trend-point-dot" :class="{ active: resolvedActivePoint?.id === point.id }" />
        </view>

        <view v-if="resolvedActivePoint" class="trend-tooltip" :style="tooltipStyle">
          <text class="tooltip-age">{{ resolvedActivePoint.ageLabel }}</text>
          <text class="tooltip-value">{{ resolvedActivePoint.value }}{{ dataset.unit }}</text>
          <text class="tooltip-percentile">{{ resolvedActivePoint.percentile != null ? `百分位 ${resolvedActivePoint.percentile}%` : '待完善评估信息' }}</text>
        </view>

        <view v-for="tick in xTicks" :key="`label-${tick.age}`" class="x-label" :style="{ left: `${tick.x - 28}px` }">
          {{ tick.label }}
        </view>
      </view>
    </scroll-view>

    <view v-if="visibleReference" class="reference-overlay">
      <view class="reference-tag top" :style="{ top: `${visibleReference.p97Y - 12}px` }">97%</view>
      <view class="reference-tag mid" :style="{ top: `${visibleReference.p50Y - 12}px` }">50%</view>
      <view class="reference-tag bottom" :style="{ top: `${visibleReference.p3Y - 12}px` }">3%</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.trend-chart-shell {
  position: relative;
}

.trend-scroll {
  white-space: nowrap;
}

.trend-canvas {
  position: relative;
}

.grid-line {
  position: absolute;
  left: 56px;
  right: 32px;
  height: 0;
  border-top: 1px dashed rgba(132, 147, 138, 0.16);
}

.grid-label {
  position: absolute;
  left: -54px;
  width: 42px;
  text-align: right;
  font-size: 11px;
  color: #8c847f;
}

.vertical-grid-line {
  position: absolute;
  width: 0;
  border-left: 1px dashed rgba(132, 147, 138, 0.12);
}

.today-axis {
  position: absolute;
  z-index: 2;
  width: 0;
  border-left: 3rpx solid rgba(96, 104, 122, 0.92);
  box-shadow: 0 0 0 1rpx rgba(255, 255, 255, 0.18);
}

.today-axis.clipped {
  border-left-style: dashed;
}

.today-badge {
  position: absolute;
  z-index: 4;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6b7280, #525866);
  color: #fff;
  font-size: 20rpx;
  line-height: 1;
  box-shadow: 0 10rpx 20rpx rgba(82, 88, 102, 0.18);
}

.today-badge.clipped {
  background: linear-gradient(135deg, #7b7f88, #636873);
}

.trend-empty-hint {
  position: absolute;
  z-index: 2;
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10rpx 22rpx rgba(29, 27, 25, 0.06);
  text-align: center;
  font-size: 22rpx;
  line-height: 1.6;
  color: #847d77;
}

.band-column {
  position: absolute;
  background: rgba(114, 187, 136, 0.12);
}

.band-guide {
  position: absolute;
  z-index: 1;
  height: 2rpx;
  transform-origin: left center;
}

.band-guide.top,
.band-guide.bottom {
  background: rgba(114, 187, 136, 0.3);
}

.band-guide.mid {
  height: 3rpx;
  background: rgba(90, 173, 116, 0.44);
}

.trend-segment {
  position: absolute;
  height: 3px;
  border-radius: 999px;
  background: #d94373;
  transform-origin: left center;
}

.trend-point {
  position: absolute;
  width: 20px;
  height: 20px;
}

.trend-point-dot {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 3px solid #d94373;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(217, 67, 115, 0.18);
}

.trend-point-dot.active {
  background: #ffd3e2;
  transform: scale(1.05);
}

.trend-tooltip {
  position: absolute;
  width: 152px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 24px rgba(29, 27, 25, 0.08);
}

.tooltip-age {
  display: block;
  font-size: 12px;
  color: #746d67;
}

.tooltip-value {
  display: block;
  margin-top: 6px;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.tooltip-percentile {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #746d67;
}

.reference-overlay {
  position: absolute;
  top: 0;
  right: 8px;
  bottom: 0;
  width: 64px;
  pointer-events: none;
}

.reference-tag {
  position: absolute;
  right: 0;
  min-width: 52rpx;
  padding: 6rpx 10rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  line-height: 1;
  font-weight: 700;
  text-align: center;
}

.reference-tag.top {
  background: rgba(245, 166, 192, 0.18);
  color: #bf4f79;
}

.reference-tag.mid {
  background: rgba(114, 187, 136, 0.18);
  color: #4d8e61;
}

.reference-tag.bottom {
  background: rgba(90, 135, 227, 0.14);
  color: #5076c6;
}

.x-label {
  position: absolute;
  bottom: 6px;
  width: 56px;
  text-align: center;
  font-size: 11px;
  color: #8c847f;
}
</style>
