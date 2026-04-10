<script setup lang="ts">
import { ref } from 'vue'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { submitFeedback } from '@/services/api'

const faqs = [
  { title: '游客模式能做什么？', desc: '可浏览月龄指南、忌口查询与食谱详情，个性化功能需先登录。' },
  { title: '为什么要填写宝宝档案？', desc: '宝宝年龄、阶段和过敏原会直接影响生成的辅食计划。' },
  { title: '如何反馈问题？', desc: '可在下方填写反馈内容，我们会认真阅读每一条建议。' }
]

const feedbackText = ref('')
const submitting = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  const content = feedbackText.value.trim()
  if (!content) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await submitFeedback(content)
    submitted.value = true
    feedbackText.value = ''
    uni.showToast({ title: '感谢您的反馈！', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
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
        :disabled="submitted"
      />
      <text class="char-count">{{ feedbackText.length }}/500</text>
      <view
        class="submit-btn"
        :class="{ disabled: submitting || submitted }"
        @tap="handleSubmit"
      >
        {{ submitted ? '已提交，感谢！' : submitting ? '提交中...' : '提交反馈' }}
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
</style>
