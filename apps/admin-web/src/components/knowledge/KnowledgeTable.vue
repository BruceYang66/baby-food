<script setup lang="ts">
import { ref } from 'vue'
import type { KnowledgeArticleRow } from '@/services/api'
import { useRouter } from 'vue-router'
import { deleteKnowledge, normalizeImageUrl } from '@/services/api'

const router = useRouter()

defineProps<{
  rows: KnowledgeArticleRow[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

function editArticle(id: string) {
  router.push({ path: '/knowledge/editor', query: { id } })
}

async function handleDelete(id: string) {
  if (!confirm('确定删除此干货文章吗？')) {
    return
  }

  try {
    await deleteKnowledge(id)
    alert('删除成功')
    emit('refresh')
  } catch (error) {
    alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function getContentTypeLabel(type: string) {
  const map: Record<string, string> = {
    article: '文章',
    guide: '指南',
    taboo: '忌口'
  }
  return map[type] || type
}
</script>

<template>
  <div class="panel grid-gap-16">
    <div class="table-row" style="grid-template-columns: 1.2fr 120px 100px 120px 100px 140px; background: transparent; padding: 0; color: var(--admin-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">
      <div>标题</div>
      <div>分类</div>
      <div>类型</div>
      <div>状态</div>
      <div>更新时间</div>
      <div>操作</div>
    </div>
    <div v-for="row in rows" :key="row.id" class="table-row" style="grid-template-columns: 1.2fr 120px 100px 120px 100px 140px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <img v-if="row.coverImage" :src="normalizeImageUrl(row.coverImage)" style="width:56px; height:56px; border-radius:8px; object-fit:cover;" />
        <div v-else style="width:56px; height:56px; border-radius:8px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-size:24px;">📄</div>
        <div>
          <div style="font-weight:700;">{{ row.title }}</div>
          <div style="margin-top:6px; font-size:13px; color:var(--admin-text-muted);">{{ row.subtitle }}</div>
        </div>
      </div>
      <div>{{ row.categoryLabel }}</div>
      <div>{{ getContentTypeLabel(row.contentType) }}</div>
      <div>
        <span class="status-pill" :class="row.contentStatus">{{ row.contentStatus }}</span>
      </div>
      <div style="font-size:13px;">{{ row.updatedAt }}</div>
      <div style="display:flex; gap:8px;">
        <button class="ghost-btn" style="padding:8px 10px;" @click="editArticle(row.id)">编辑</button>
        <button class="ghost-btn" style="padding:8px 10px;" @click="handleDelete(row.id)">删除</button>
      </div>
    </div>
  </div>
</template>
