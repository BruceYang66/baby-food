<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { GuideStage } from '@baby-food/shared-types'
import { getCalendarAge, getGuideStageKey } from '@/utils/age'
import AppNavBar from '@/components/common/AppNavBar.vue'
import AgeStageTabs from '@/components/guide/AgeStageTabs.vue'
import FoodRuleSection from '@/components/guide/FoodRuleSection.vue'
import { getGuideData, openProtectedPage, readAuthSession } from '@/services/api'

const STAGE_KEYS = ['4-6', '6-7', '8-9', '10-12', '12-18', '18-24']

const stages = ref<GuideStage[]>([])
const activeKey = ref('6-7')
const expandedQaIndex = ref<number | null>(null)

function getDefaultStageKey() {
  const session = readAuthSession()
  const baby = session?.babyProfile

  if (!baby?.birthDate) {
    return '6-7'
  }

  return getGuideStageKey(getCalendarAge(baby.birthDate).totalCompletedMonths)
}

onMounted(async () => {
  const defaultKey = getDefaultStageKey()
  activeKey.value = defaultKey

  const results = await Promise.allSettled(
    STAGE_KEYS.map((key) => getGuideData(key))
  )
  stages.value = results
    .filter((r): r is PromiseFulfilledResult<GuideStage> => r.status === 'fulfilled')
    .map((r) => r.value)

  if (!stages.value.find((item) => item.key === activeKey.value) && stages.value[0]) {
    activeKey.value = stages.value[0].key
  }
})

const activeStage = computed(() => stages.value.find((item) => item.key === activeKey.value) ?? stages.value[0])

function switchStage(key: string) {
  activeKey.value = key
  expandedQaIndex.value = null
}

function toggleQa(index: number) {
  expandedQaIndex.value = expandedQaIndex.value === index ? null : index
}
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="月龄饮食指南" subtitle="各月龄吃什么，禁忌一查便知" :show-back="true" />

    <AgeStageTabs :stages="stages" :active-key="activeKey" @change="switchStage" />

    <view v-if="activeStage" class="stage-hero card">
      <view>
        <text class="stage-title">{{ activeStage.title }}</text>
        <text class="stage-desc">{{ activeStage.description }}</text>
      </view>
      <view class="stage-emoji">🥣</view>
    </view>

    <view v-if="activeStage" class="tip-card soft-card">
      <text class="tip-title">喂养要点</text>
      <view class="tip-list">
        <view v-for="tip in activeStage.feedingTips" :key="tip" class="tip-item">
          <view class="tip-dot"></view>
          <text class="tip-text">{{ tip }}</text>
        </view>
      </view>
    </view>

    <view v-if="activeStage" class="rule-list">
      <FoodRuleSection v-for="rule in activeStage.rules" :key="rule.title" :rule="rule" />
    </view>

    <view v-if="activeStage" class="schedule-section">
      <text class="section-title">本月龄一日安排示例</text>
      <view class="schedule-list">
        <view v-for="schedule in activeStage.dailySchedule" :key="schedule.time" class="schedule-card card">
          <text class="schedule-time">{{ schedule.time }}</text>
          <view class="schedule-main">
            <text class="schedule-title">{{ schedule.title }}</text>
            <text class="schedule-desc">{{ schedule.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Q&A 模块 -->
    <view v-if="activeStage && activeStage.qaItems && activeStage.qaItems.length" class="qa-section">
      <text class="section-title">常见问题</text>
      <view class="qa-list">
        <view
          v-for="(qa, index) in activeStage.qaItems"
          :key="index"
          class="qa-card card"
          @tap="toggleQa(index)"
        >
          <view class="qa-header">
            <text class="qa-q">Q：{{ qa.q }}</text>
            <text class="qa-arrow">{{ expandedQaIndex === index ? '∧' : '∨' }}</text>
          </view>
          <view v-if="expandedQaIndex === index" class="qa-answer">
            <text class="qa-a">{{ qa.a }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="fixed-bottom-actions single">
      <view class="bottom-mini-btn primary" @tap="openProtectedPage('/pages/generate/index')">生成今日食谱</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.stage-hero {
  display: flex;
  justify-content: space-between;
  margin-top: 22rpx;
  padding: 30rpx;
}

.stage-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
}

.stage-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.stage-emoji {
  font-size: 64rpx;
}

.tip-card {
  margin-top: 22rpx;
  padding: 28rpx;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.tip-list {
  margin-top: 18rpx;
}

.tip-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.tip-dot {
  width: 18rpx;
  height: 18rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: var(--mini-secondary-deep);
  flex-shrink: 0;
}

.tip-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.rule-list,
.schedule-section,
.qa-section {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 22rpx;
}

.schedule-list,
.qa-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.schedule-card {
  display: flex;
  gap: 18rpx;
  padding: 24rpx;
}

.schedule-time {
  width: 96rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
  flex-shrink: 0;
}

.schedule-main {
  flex: 1;
}

.schedule-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.schedule-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--mini-text-muted);
}

/* Q&A */
.qa-card {
  padding: 24rpx 28rpx;
}

.qa-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.qa-q {
  flex: 1;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
  line-height: 1.6;
}

.qa-arrow {
  font-size: 24rpx;
  color: var(--mini-text-muted);
  flex-shrink: 0;
  margin-top: 4rpx;
}

.qa-answer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(0,0,0,0.06);
}

.qa-a {
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.fixed-bottom-actions.single {
  justify-content: center;
}

.fixed-bottom-actions.single .bottom-mini-btn {
  max-width: 100%;
}
</style>
