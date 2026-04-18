<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ReviewQueueItem } from '@baby-food/shared-types'
import ReviewDecisionPanel from '@/components/reviews/ReviewDecisionPanel.vue'
import { getReviewQueue, approveRecipe, rejectRecipe } from '@/services/api'

const router = useRouter()
const reviewQueue = ref<ReviewQueueItem[]>([])
const selectedRecipe = ref<ReviewQueueItem | null>(null)
const rejectComment = ref('')
const showRejectDialog = ref(false)

async function loadReviewQueue() {
  reviewQueue.value = await getReviewQueue()
}

function viewRecipe(item: ReviewQueueItem) {
  selectedRecipe.value = item
  router.push({ path: '/recipes/editor', query: { id: item.id } })
}

async function handleApprove(recipeId: string) {
  if (!confirm('确定通过此食谱的审核吗？')) {
    return
  }

  try {
    await approveRecipe(recipeId)
    alert('审核通过成功')
    await loadReviewQueue()
  } catch (error) {
    alert('审核通过失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function showRejectForm(recipeId: string) {
  selectedRecipe.value = reviewQueue.value.find(item => item.id === recipeId) || null
  rejectComment.value = ''
  showRejectDialog.value = true
}

async function handleReject() {
  if (!selectedRecipe.value) return

  if (!rejectComment.value.trim()) {
    alert('请填写拒绝原因')
    return
  }

  try {
    await rejectRecipe(selectedRecipe.value.id, rejectComment.value)
    alert('审核拒绝成功')
    showRejectDialog.value = false
    await loadReviewQueue()
  } catch (error) {
    alert('审核拒绝失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

onMounted(loadReviewQueue)
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div class="panel-title" style="font-size:24px;">内容审核页</div>
          <div style="margin-top:6px; color:var(--admin-text-muted);">审核待发布的食谱内容，确保质量和安全性。</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="ghost-btn" @click="loadReviewQueue">刷新列表</button>
        </div>
      </div>
      <div class="table-shell" style="margin-top:18px;">
        <div v-if="reviewQueue.length === 0" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
          暂无待审核内容
        </div>
        <div v-for="item in reviewQueue" :key="item.id" class="table-row" style="grid-template-columns: 180px 1fr 140px 140px 200px;">
          <div>{{ item.submittedAt }}</div>
          <div>
            <div style="font-weight:700;">{{ item.title }}</div>
            <div style="margin-top:6px; color:var(--admin-text-muted); font-size:13px;">{{ item.focus }}</div>
          </div>
          <div>{{ item.submittedBy }}</div>
          <div>{{ item.source }}</div>
          <div style="display: flex; gap: 8px;">
            <button class="ghost-btn" style="padding: 8px 12px;" @click="viewRecipe(item)">查看</button>
            <button class="ghost-btn" style="padding: 8px 12px; background: #e8f5e9; color: #2e7d32;" @click="handleApprove(item.id)">通过</button>
            <button class="ghost-btn" style="padding: 8px 12px; background: #ffebee; color: #c62828;" @click="showRejectForm(item.id)">拒绝</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 拒绝对话框 -->
    <div v-if="showRejectDialog" class="modal-overlay" @click.self="showRejectDialog = false">
      <div class="modal-content panel" style="max-width: 500px; padding: 24px;">
        <div class="panel-title" style="font-size: 20px; margin-bottom: 16px;">拒绝审核</div>
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; margin-bottom: 8px;">食谱：{{ selectedRecipe?.title }}</div>
          <div style="color: var(--admin-text-muted); font-size: 13px;">请说明拒绝原因，以便创建者改进</div>
        </div>
        <textarea
          v-model="rejectComment"
          class="ghost-textarea"
          rows="5"
          placeholder="请输入拒绝原因..."
          style="margin-bottom: 16px;"
        ></textarea>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="ghost-btn" @click="showRejectDialog = false">取消</button>
          <button class="primary-btn" @click="handleReject">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
</style>
