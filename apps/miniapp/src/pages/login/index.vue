<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getGuideData, readAuthSession, wechatLogin } from '@/services/api'

const heroTitle = ref('科学辅食，悦享成长')
const heroDesc = ref('为宝宝量身定制每一餐，开启健康饮食第一步。')
const agreed = ref(true)
const loggingIn = ref(false)

onMounted(async () => {
  try {
    const stage = await getGuideData('6-7')
    // heroTitle.value = stage.title
    // heroDesc.value = stage.description
  } catch {
    const session = readAuthSession()

    if (session?.hasBaby) {
      heroDesc.value = `${session.babyProfile?.monthAgeLabel ?? ''} 宝宝专属辅食建议已准备好。`.trim()
    }
  }
})

async function enterApp() {
  if (!agreed.value) {
    uni.showToast({ title: '请先勾选协议', icon: 'none' })
    return
  }

  if (loggingIn.value) {
    return
  }

  // #ifdef H5
  uni.showToast({
    title: 'H5 环境暂不支持微信登录，请使用游客模式',
    icon: 'none',
    duration: 2000
  })
  return
  // #endif

  loggingIn.value = true

  try {
    // #ifdef MP-WEIXIN
    const loginResult = await uni.login({ provider: 'weixin' })
    const code = loginResult.code

    if (!code) {
      throw new Error('未获取到微信登录凭证')
    }

    await wechatLogin(code)
    // #endif
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '微信登录失败',
      icon: 'none'
    })
  } finally {
    loggingIn.value = false
  }
}

function guestEnter() {
  uni.reLaunch({ url: '/pages/home/index' })
}
</script>

<template>
  <view class="page-shell login-page">
    <view class="rice-paper"></view>
    <view class="brand-block">
      <text class="brand-title">宝宝辅食智囊</text>
      <text class="brand-subtitle">Pure Nourishment for Growth</text>
    </view>

    <view class="hero-wrap">
      <view class="hero-glow mint"></view>
      <view class="hero-glow peach"></view>
      <image
        class="hero-image"
        src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80"
        mode="aspectFill"
      />
      <view class="hero-badge">🌿</view>
    </view>

    <view class="intro-block">
      <text class="intro-title">{{ heroTitle }}</text>
      <text class="intro-desc">{{ heroDesc }}</text>
    </view>

    <view class="action-panel card">
      <button class="wechat-btn" @tap="enterApp">
        <text class="wechat-icon">微</text>
        <text>{{ loggingIn ? '登录中...' : '微信一键登录' }}</text>
      </button>
      <view class="guest-link" @tap="guestEnter">暂不登录先逛逛 →</view>
      <view class="agreement-row" @tap="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">{{ agreed ? '✓' : '' }}</view>
        <text class="agreement-text">登录即代表已阅读并同意《用户服务协议》《隐私政策》</text>
      </view>
      <view class="onboarding-tip">首次登录将引导创建宝宝档案，游客模式仅支持浏览公开内容。</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: calc(54rpx + constant(safe-area-inset-top));
  padding-top: calc(54rpx + env(safe-area-inset-top));
  overflow: hidden;
}

.rice-paper {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  background-image: radial-gradient(#d7c3b3 1px, transparent 1px);
  background-size: 24rpx 24rpx;
}

.brand-block,
.hero-wrap,
.intro-block,
.action-panel {
  position: relative;
  z-index: 1;
}

.brand-block {
  text-align: center;
}

.brand-title {
  display: block;
  font-size: 58rpx;
  font-weight: 800;
  color: var(--mini-primary-deep);
}

.brand-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  color: var(--mini-text-muted);
}

.hero-wrap {
  position: relative;
  width: 100%;
  height: 560rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  width: 100%;
  height: 100%;
  border-radius: 48rpx;
}

.hero-glow {
  position: absolute;
  border-radius: 999rpx;
  filter: blur(40rpx);
  opacity: 0.6;
}

.hero-glow.mint {
  right: 10rpx;
  top: 40rpx;
  width: 180rpx;
  height: 180rpx;
  background: rgba(168, 230, 207, 0.9);
}

.hero-glow.peach {
  left: 20rpx;
  bottom: 20rpx;
  width: 220rpx;
  height: 220rpx;
  background: rgba(255, 179, 102, 0.5);
}

.hero-badge {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 28rpx;
  background: rgba(255,255,255,0.9);
  text-align: center;
  line-height: 88rpx;
  font-size: 40rpx;
}

.intro-block {
  padding: 0 20rpx;
  text-align: center;
}

.intro-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.intro-desc {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.action-panel {
  padding: 30rpx;
}

.wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  height: 96rpx;
  border: none;
  border-radius: 999rpx;
  background: #07c160;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.wechat-icon {
  width: 42rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.16);
  text-align: center;
  line-height: 42rpx;
  font-size: 24rpx;
}

.guest-link {
  margin-top: 24rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 30rpx;
}

.checkbox {
  width: 34rpx;
  height: 34rpx;
  border-radius: 10rpx;
  background: rgba(255,255,255,0.72);
  box-shadow: inset 0 0 0 2rpx rgba(107,98,91,0.18);
  text-align: center;
  line-height: 34rpx;
  font-size: 22rpx;
  color: #fff;
}

.checkbox.checked {
  background: var(--mini-secondary-deep);
  box-shadow: none;
}

.agreement-text,
.onboarding-tip {
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.onboarding-tip {
  display: block;
  margin-top: 18rpx;
}
</style>
