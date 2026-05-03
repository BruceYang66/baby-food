<script setup lang="ts">
import { computed } from 'vue'
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
  top: 24,
  right: 44,
  bottom: 56,
  left: 56
}
const drawHeight = 260
const minimumInnerWidth = 320

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

const domain = computed(() => {
  const currentAge = Math.max(1, props.currentAgeMonths)

  if (props.rangeKey === 'threeYear') {
    return {
      min: 0,
      max: 36
    }
  }

  if (props.rangeKey === 'oneYear') {
    const max = Math.max(12, Math.ceil(currentAge))
    return {
      min: Math.max(0, max - 11),
      max
    }
  }

  const max = Math.max(5, Math.ceil(currentAge))
  return {
    min: Math.max(0, max - 5),
    max
  }
})

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
const todayAxisStyle = computed(() => ({
  left: `${getX(Math.min(Math.max(props.currentAgeMonths, domain.value.min), domain.value.max))}px`,
  top: `${padding.top}px`,
  height: `${drawHeight}px`
}))
const todayBadgeStyle = computed(() => {
  const axisX = getX(Math.min(Math.max(props.currentAgeMonths, domain.value.min), domain.value.max))
  const left = Math.min(Math.max(axisX + 10, padding.left + 6), canvasWidth.value - 64)
  const top = padding.top + drawHeight - 40

  return {
    left: `${left}px`,
    top: `${top}px`
  }
})
const rightReference = computed(() => bandColumns.value[bandColumns.value.length - 1] || null)
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
    <scroll-view scroll-x class="trend-scroll" show-scrollbar="false">
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

        <view class="today-axis" :style="todayAxisStyle" />
        <view class="today-badge" :style="todayBadgeStyle">今天</view>

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
          <text class="tooltip-percentile">百分位 {{ resolvedActivePoint.percentile }}%</text>
        </view>

        <view v-if="rightReference" class="reference-tag top" :style="{ top: `${rightReference.top - 10}px` }">97%</view>
        <view v-if="rightReference" class="reference-tag mid" :style="{ top: `${rightReference.p50Y - 10}px` }">50%</view>
        <view
          v-if="rightReference"
          class="reference-tag bottom"
          :style="{ top: `${rightReference.top + rightReference.height - 10}px` }"
        >
          3%
        </view>

        <view v-for="tick in xTicks" :key="`label-${tick.age}`" class="x-label" :style="{ left: `${tick.x - 28}px` }">
          {{ tick.label }}
        </view>
      </view>
    </scroll-view>
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
  right: 44px;
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
  border-left: 2rpx solid rgba(170, 170, 176, 0.72);
}

.today-badge {
  position: absolute;
  z-index: 3;
  padding: 8rpx 14rpx;
  border-radius: 14rpx;
  background: rgba(123, 123, 128, 0.92);
  color: #fff;
  font-size: 20rpx;
  line-height: 1;
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
  background: rgba(114, 187, 136, 0.26);
}

.band-guide.mid {
  background: rgba(114, 187, 136, 0.18);
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

.reference-tag {
  position: absolute;
  right: 0;
  font-size: 11px;
  color: #72bb88;
}

.reference-tag.mid {
  color: #61a778;
}

.reference-tag.bottom {
  color: #4f9d68;
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
