<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { AppFeedbackHistoryItem } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getFeedbackHistory, submitFeedback } from '@/services/api'

const faqs = [
  { title: '游客模式能做什么？', desc: '可浏览月龄指南、忌口查询与食谱详情，个性化功能需先登录。' },
  { title: '为什么要填写宝宝档案？', desc: '宝宝年龄、阶段和过敏原会直接影响生成的辅食计划。' },
  { title: '如何反馈问题？', desc: '可在下方填写反馈内容，我们会认真阅读每一条建议。' }
]

const feedbackText = ref('')
const submitting = ref(false)
const historyLoading = ref(false)
const feedbackHistory = ref<AppFeedbackHistoryItem[]>([])

async function loadFeedbackHistory() {
  historyLoading.value = true
  try {
    const history = await getFeedbackHistory()
    feedbackHistory.value = history.items
  } catch {
    feedbackHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

async function handleSubmit() {
  const content = feedbackText.value.trim()
  if (!content) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await submitFeedback(content)
    feedbackText.value = ''
    uni.showToast({ title: '感谢您的反馈！', icon: 'success' })
    await loadFeedbackHistory()
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onShow(() => {
  void loadFeedbackHistory()
})
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="帮助中心" subtitle="常见问题与使用说明" :show-back="true" />

    <view class="faq-list">
      <view v-for="item in faqs" :key="item.title" class="faq-card soft-card">
        <text class="faq-title">{{ item.title }}</text>
        <text class="faq-desc">{{ item.desc }}</text>
      </view>
    </view>

    <view class="feedback-card card">
      <text class="feedback-title">意见反馈</text>
      <text class="feedback-subtitle">您的每一条建议都会让产品变得更好</text>
      <textarea
        v-model="feedbackText"
        class="feedback-input"
        placeholder="描述您遇到的问题或建议..."
        maxlength="500"
        :disabled="submitting"
      />
      <text class="char-count">{{ feedbackText.length }}/500</text>
      <view
        class="submit-btn"
        :class="{ disabled: submitting }"
        @tap="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交反馈' }}
      </view>
    </view>

    <view class="history-card card">
      <view class="history-head">
        <text class="feedback-title">我的反馈历史</text>
        <text class="history-count">{{ feedbackHistory.length }} 条</text>
      </view>
      <view v-if="historyLoading" class="history-empty">加载中...</view>
      <view v-else-if="!feedbackHistory.length" class="history-empty">暂无反馈记录</view>
      <view v-else class="history-list">
        <view v-for="item in feedbackHistory" :key="item.id" class="history-item">
          <text class="history-time">{{ item.createdAt }}</text>
          <text class="history-content">{{ item.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.faq-card {
  padding: 28rpx;
}

.faq-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.faq-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.feedback-card {
  margin-top: 28rpx;
  padding: 30rpx;
}

.feedback-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.feedback-subtitle {
  display: block;
  margin-top: 8rpx;
  margin-bottom: 22rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.feedback-input {
  width: 100%;
  min-height: 240rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  padding: 22rpx;
  font-size: 26rpx;
  line-height: 1.7;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.submit-btn {
  margin-top: 20rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  text-align: center;
  line-height: 96rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.submit-btn.disabled {
  opacity: 0.6;
}

.history-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.history-count {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.history-empty {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.history-list {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.history-item {
  border-radius: 14rpx;
  padding: 18rpx;
  background: rgba(255, 255, 255, 0.9);
}

.history-time {
  display: block;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.history-content {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--mini-text);
}
</style>
