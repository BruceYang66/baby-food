<script setup lang="ts">
import AppNavBar from '@/components/common/AppNavBar.vue'

const meaningItems = [
  {
    title: '最下面的一条曲线为 3% ',
    description: '意思是将有 3% 的孩子低于这一水平，可能存在生长发育迟缓。'
  },
  {
    title: '最上面的一条曲线为 97% ',
    description: '意思是将有 3% 的孩子高于这一水平，可能存在生长过速。这两种情况都应该引起关注。'
  },
  {
    title: '中间的一条曲线为 50% ',
    description: '代表平均值。我们经常谈及的正常值，应该是 3%~97% 涉及的范围。'
  },
  {
    title: '需要注意的是',
    description: '任何时候，都会有近 50% 的孩子生长发育指标高于正常值，50% 左右的孩子低于正常值，刚好在平均水平的孩子为数极少。所以，千万不要以“平均值”作为自己心中可以接受的最低限度。'
  }
]

const mistakeItems = [
  {
    title: '误区一：以“平均值”作为衡量标准',
    paragraphs: [
      '平均值曲线并不是判断宝宝发育正常与否的标准。只要宝宝的生长曲线一直在正常范围内，而且匀速顺时增长就是正常的。',
      '只要处于 3%~97% 的范围内，发育趋势是大致平行于参考曲线的，都是正常的。'
    ]
  },
  {
    title: '误区二：以某一时刻的生长发育数据与生长发育曲线进行比较',
    paragraphs: [
      '生长曲线需要动态且连续性进行观察，仅靠某一个点的数据来判断是否正常，是不准确的。',
      '只有动态连续监测孩子的生长和发育，才可能真正了解孩子的发育状况。千万不要以一次的点状测定值贸然下结论，这样不仅不能真正评估孩子的生长，有时还会耽误对疾病和一些问题的认识。'
    ]
  },
  {
    title: '误区三：只要身高或体重都在正常范围就可以',
    paragraphs: [
      '不能将身高体重分开看，要综合身高、体重两个曲线一起看。虽然身高和体重都在正常范围，但是将二者综合考虑，计算出的数值可能会告诉你小宝贝已经得了肥胖症，或者已经出现营养不良了。',
      '所以，我们还要同时监测一下宝宝的身体质量指数 BMI。同时身高、体重曲线的趋势不能波动太大，如果曲线短时间内跨越两个区间，生长太快或太慢都是不好的。'
    ]
  }
]
</script>

<template>
  <view class="page-shell growth-explainer-page">
    <AppNavBar title="帮助" :show-back="true" />

    <view class="intro-card card">
      <text class="intro-text">用生长曲线来监测宝宝的生长发育状况，实际上是对宝宝生长发育的一种线性的、长期而有效的管理。通过生长发育曲线的变化，我们可以及时发现宝宝生长发育存在的问题。</text>
    </view>

    <view class="section-card card">
      <text class="section-title">生长曲线图的三条曲线是什么意思？</text>
      <view class="bullet-list">
        <view v-for="item in meaningItems" :key="item.title" class="bullet-item">
          <view class="bullet-dot" />
          <view class="bullet-copy">
            <text class="bullet-title">{{ item.title }}</text>
            <text class="bullet-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card card">
      <text class="section-title">怎么看宝宝的生长曲线？</text>
      <view class="mistake-list">
        <view v-for="item in mistakeItems" :key="item.title" class="mistake-item">
          <view class="mistake-head">
            <view class="bullet-dot" />
            <text class="mistake-title">{{ item.title }}</text>
          </view>
          <view class="mistake-body">
            <text v-for="paragraph in item.paragraphs" :key="paragraph" class="mistake-paragraph">{{ paragraph }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.growth-explainer-page {
  padding-bottom: 56rpx;
}

.intro-card,
.section-card {
  padding: 30rpx 28rpx;
  border-radius: 28rpx;
}

.intro-card {
  margin-top: 22rpx;
}

.section-card {
  margin-top: 22rpx;
}

.intro-text,
.bullet-desc,
.mistake-paragraph {
  display: block;
  font-size: 26rpx;
  line-height: 1.9;
  color: var(--mini-text);
}

.section-title {
  display: inline-block;
  margin-bottom: 22rpx;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.4;
  color: var(--mini-text);
  box-shadow: inset 0 -14rpx 0 rgba(245, 130, 172, 0.18);
}

.bullet-list,
.mistake-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.bullet-dot {
  flex-shrink: 0;
  width: 16rpx;
  height: 16rpx;
  margin-top: 14rpx;
  border-radius: 999rpx;
  background: #f26fa0;
}

.bullet-copy,
.mistake-body {
  flex: 1;
  min-width: 0;
}

.bullet-title,
.mistake-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.7;
  color: var(--mini-text);
}

.mistake-item + .mistake-item {
  padding-top: 6rpx;
}

.mistake-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.mistake-body {
  margin-top: 10rpx;
  padding-left: 32rpx;
}

.mistake-paragraph + .mistake-paragraph {
  margin-top: 10rpx;
}
</style>
