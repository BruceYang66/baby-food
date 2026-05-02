<script setup lang="ts">
import AppNavBar from '@/components/common/AppNavBar.vue'

const sections = [
  {
    title: '一、服务说明',
    content: '本小程序用于提供婴幼儿辅食建议、食谱参考与喂养辅助信息，内容仅供家庭日常参考，不替代医生诊疗意见。'
  },
  {
    title: '二、账号与使用',
    content: '你通过微信授权登录后可使用个性化功能。请妥善保管账号信息，不得以任何方式干扰本服务正常运行。'
  },
  {
    title: '三、免责声明',
    content: '因个体差异，辅食建议需结合宝宝实际情况调整。出现不适请及时就医，本服务不对由此产生的直接或间接损失承担责任。'
  },
  {
    title: '四、协议更新',
    content: '当服务规则发生变化时，我们会通过页面公告或新版协议进行说明，继续使用即视为你已阅读更新内容。'
  }
]
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="用户服务协议" :show-back="true" />

    <view class="card content-card">
      <text class="lead">请你在使用前认真阅读本协议，了解服务规则与双方权利义务。</text>
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
