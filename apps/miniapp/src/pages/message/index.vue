<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getMessages, readAuthSession } from '@/services/api'

type MessageItem = { title: string; desc: string }

const messages = ref<MessageItem[]>([])

function buildLocalMessages() {
  const session = readAuthSession()
  const baby = session?.babyProfile
  const result: MessageItem[] = [{ title: '每日提醒', desc: '建议每天固定时间查看和调整宝宝辅食计划。' }]
  if (baby?.allergens?.length) {
    result.push({ title: '过敏提醒', desc: `当前已记录 ${baby.allergens.join('、')} 过敏原，新增食材请少量尝试并连续观察 3 天。` })
  } else {
    result.push({ title: '过敏提醒', desc: '若新增食材，请少量尝试并连续观察 3 天。' })
  }
  result.push({ title: '温馨提示', desc: '生病期间可前往”忌口查询”查看适合的饮食建议。' })
  return result
}

onMounted(async () => {
  // 先用本地数据快速展示
  messages.value = buildLocalMessages()
  // 然后从服务端刷新（消息内容可能更丰富/个性化）
  try {
    const data = await getMessages()
    if (data.messages.length) {
      messages.value = data.messages
    }
  } catch {
    // 保持本地数据
  }
})
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="消息通知" subtitle="每日提醒与喂养提示" :show-back="true" />

    <view class="message-list">
      <view v-for="(item, index) in messages" :key="index" class="message-card card">
        <text class="message-title">{{ item.title }}</text>
        <text class="message-desc">{{ item.desc }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.message-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.message-card {
  padding: 26rpx;
}

.message-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.message-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}
</style>
