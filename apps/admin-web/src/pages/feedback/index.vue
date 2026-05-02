<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { AdminFeedbackDetail, AdminFeedbackRow } from '@baby-food/shared-types'
import { getFeedbackDetail, getFeedbackList } from '@/services/api'

const keyword = ref('')
const rows = ref<AdminFeedbackRow[]>([])
const loading = ref(false)
const showDetailDialog = ref(false)
const detailLoading = ref(false)
const detail = ref<AdminFeedbackDetail | null>(null)

async function loadRows() {
  loading.value = true
  try {
    rows.value = await getFeedbackList(keyword.value)
  } finally {
    loading.value = false
  }
}

async function openDetail(feedbackId: string) {
  showDetailDialog.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await getFeedbackDetail(feedbackId)
  } catch (error) {
    showDetailDialog.value = false
    window.alert(error instanceof Error ? error.message : '反馈详情读取失败')
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  showDetailDialog.value = false
  detail.value = null
}

onMounted(() => {
  void loadRows()
})
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:24px;">用户反馈</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">集中查看用户在小程序帮助中心提交的反馈内容。</div>
      </div>
      <button class="ghost-btn" @click="loadRows">刷新</button>
    </section>

    <section class="panel" style="display:grid; grid-template-columns: 1fr 140px 140px; gap: 12px; align-items:end;">
      <div>
        <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">关键词</label>
        <input
          v-model="keyword"
          class="ghost-input"
          placeholder="昵称 / 反馈内容"
          style="margin:0;"
          @keydown.enter="loadRows"
        />
      </div>
      <button class="primary-btn" @click="loadRows">筛选</button>
      <button class="ghost-btn" @click="keyword = ''; loadRows()">清空</button>
    </section>

    <section class="panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <div class="panel-title" style="font-size:20px;">反馈列表</div>
        <div style="font-size:13px; color:var(--admin-text-muted);">共 {{ rows.length }} 条</div>
      </div>

      <div v-if="loading" style="padding: 24px 0; color: var(--admin-text-muted);">加载中...</div>
      <div v-else-if="!rows.length" style="padding: 24px 0; color: var(--admin-text-muted);">暂无反馈数据</div>
      <div v-else class="table-shell">
        <div class="table-row header" style="grid-template-columns: 180px 220px 1fr 120px; font-weight:700; color:var(--admin-text-muted);">
          <div>反馈时间</div>
          <div>用户</div>
          <div>内容摘要</div>
          <div>操作</div>
        </div>
        <div
          v-for="item in rows"
          :key="item.id"
          class="table-row"
          style="grid-template-columns: 180px 220px 1fr 120px;"
        >
          <div>{{ item.createdAt }}</div>
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <img
              v-if="item.user.avatarUrl"
              :src="item.user.avatarUrl"
              style="width:34px; height:34px; border-radius:999px; object-fit:cover; background:#f2f4f7;"
            />
            <div
              v-else
              style="width:34px; height:34px; border-radius:999px; background:var(--admin-surface-lowest); display:flex; align-items:center; justify-content:center; color:var(--admin-text-muted); font-size:12px;"
            >
              -
            </div>
            <div style="min-width:0;">
              <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ item.user.nickname || '未知用户' }}</div>
              <div style="font-size:12px; color:var(--admin-text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ item.user.id || '-' }}</div>
            </div>
          </div>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ item.content }}</div>
          <div>
            <button class="ghost-btn" @click="openDetail(item.id)">详情</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showDetailDialog" class="dialog-mask" @click.self="closeDetail">
      <div class="dialog-card panel">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div class="panel-title" style="font-size:20px;">反馈详情</div>
          <button class="ghost-btn" @click="closeDetail">关闭</button>
        </div>

        <div v-if="detailLoading" style="margin-top: 18px; color: var(--admin-text-muted);">加载中...</div>
        <div v-else-if="detail" class="grid-gap-16" style="margin-top: 18px;">
          <div>
            <div style="font-size:12px; color:var(--admin-text-muted);">反馈时间</div>
            <div style="margin-top:4px; font-weight:600;">{{ detail.createdAt }}</div>
          </div>

          <div>
            <div style="font-size:12px; color:var(--admin-text-muted);">用户</div>
            <div style="margin-top:4px; display:flex; align-items:center; gap:10px;">
              <img
                v-if="detail.user.avatarUrl"
                :src="detail.user.avatarUrl"
                style="width:38px; height:38px; border-radius:999px; object-fit:cover; background:#f2f4f7;"
              />
              <div
                v-else
                style="width:38px; height:38px; border-radius:999px; background:var(--admin-surface-lowest); display:flex; align-items:center; justify-content:center; color:var(--admin-text-muted);"
              >
                -
              </div>
              <div>
                <div style="font-weight:600;">{{ detail.user.nickname || '未知用户' }}</div>
                <div style="font-size:12px; color:var(--admin-text-muted);">{{ detail.user.id || '-' }}</div>
              </div>
            </div>
          </div>

          <div>
            <div style="font-size:12px; color:var(--admin-text-muted);">反馈内容</div>
            <div class="detail-content">{{ detail.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 24px;
}

.dialog-card {
  width: min(760px, 100%);
  max-height: min(88vh, 760px);
  overflow: auto;
}

.detail-content {
  margin-top: 8px;
  background: var(--admin-surface-lowest);
  border-radius: 8px;
  padding: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
}
</style>
