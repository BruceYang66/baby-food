<script setup lang="ts">
import AppNavBar from '@/components/common/AppNavBar.vue'

const sections = [
  {
    title: '一、我们收集的信息',
    content: '为实现微信授权登录与基础功能，我们会在你同意后获取微信头像、昵称及账号标识信息，用于创建和维护你的账号。'
  },
  {
    title: '二、信息使用目的',
    content: '我们仅将上述信息用于账号识别、页面展示和功能服务，不会在未获授权情况下将你的个人信息用于与本服务无关的用途。'
  },
  {
    title: '三、信息存储与保护',
    content: '我们采取合理的安全措施保护你的信息，防止数据被未经授权访问、披露或篡改。'
  },
  {
    title: '四、你的权利',
    content: '你可通过小程序内功能修改昵称头像信息；如需进一步处理个人信息，可通过产品反馈渠道联系我们。'
  }
]
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="隐私政策" :show-back="true" />

    <view class="card content-card">
      <text class="lead">我们重视你的个人信息与隐私安全，请阅读本政策以了解信息处理方式。</text>
      <view v-for="item in sections" :key="item.title" class="section">
        <text class="section-title">{{ item.title }}</text>
        <text class="section-content">{{ item.content }}</text>
      </view>
      <text class="updated-at">更新日期：2026-04-22</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.content-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.lead {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.section {
  margin-top: 22rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.section-content {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.9;
  color: var(--mini-text-muted);
}

.updated-at {
  display: block;
  margin-top: 26rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}
</style>
