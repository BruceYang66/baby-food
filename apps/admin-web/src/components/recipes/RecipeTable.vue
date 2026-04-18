<script setup lang="ts">
import { ref } from 'vue'
import type { RecipeAdminRow } from '@baby-food/shared-types'
import { useRouter } from 'vue-router'
import { batchUpdateRecipeStatus, deleteRecipe, normalizeImageUrl } from '@/services/api'

const router = useRouter()

const props = defineProps<{
  rows: RecipeAdminRow[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

const selectedIds = ref<Set<string>>(new Set())

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

function toggleSelectAll() {
  if (selectedIds.value.size === props.rows.length) {
    selectedIds.value.clear()
  } else {
    selectedIds.value = new Set(props.rows.map(r => r.id))
  }
}

function editRecipe(id: string) {
  router.push({ path: '/recipes/editor', query: { id } })
}

async function handleDelete(id: string) {
  if (!confirm('确定删除此食谱吗？')) {
    return
  }

  try {
    await deleteRecipe(id)
    alert('删除成功')
    emit('refresh')
  } catch (error) {
    alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function handleBatchPublish() {
  if (selectedIds.value.size === 0) {
    alert('请先选择食谱')
    return
  }

  try {
    await batchUpdateRecipeStatus(Array.from(selectedIds.value), 'published')
    alert('批量上架成功')
    selectedIds.value.clear()
    emit('refresh')
  } catch (error) {
    alert('批量上架失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function handleBatchOffline() {
  if (selectedIds.value.size === 0) {
    alert('请先选择食谱')
    return
  }

  try {
    await batchUpdateRecipeStatus(Array.from(selectedIds.value), 'offline')
    alert('批量下架成功')
    selectedIds.value.clear()
    emit('refresh')
  } catch (error) {
    alert('批量下架失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}
</script>

<template>
  <div class="grid-gap-16">
    <div v-if="selectedIds.size > 0" class="batch-actions panel" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
      <div style="color: var(--admin-text-muted);">已选择 {{ selectedIds.size }} 项</div>
      <div style="display: flex; gap: 10px;">
        <button class="ghost-btn" @click="handleBatchPublish">批量上架</button>
        <button class="ghost-btn" @click="handleBatchOffline">批量下架</button>
        <button class="ghost-btn" @click="selectedIds.clear()">取消选择</button>
      </div>
    </div>

    <div class="panel grid-gap-16">
      <div class="table-row" style="grid-template-columns: 40px 1.1fr 110px 120px 110px 120px 90px 180px; background: transparent; padding: 0; color: var(--admin-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">
        <div>
          <input type="checkbox" :checked="selectedIds.size === rows.length && rows.length > 0" @change="toggleSelectAll" />
        </div>
        <div>名称</div>
        <div>月龄</div>
        <div>来源</div>
        <div>创建人</div>
        <div>状态</div>
        <div>收藏</div>
        <div>操作</div>
      </div>
      <div v-for="row in rows" :key="row.id" class="table-row" style="grid-template-columns: 40px 1.1fr 110px 120px 110px 120px 90px 180px;">
        <div>
          <input type="checkbox" :checked="selectedIds.has(row.id)" @change="toggleSelect(row.id)" />
        </div>
        <div style="display:flex; gap:12px; align-items:center;">
          <img :src="normalizeImageUrl(row.cover)" style="width:56px; height:56px; border-radius:8px; object-fit:cover;" />
          <div>
            <div style="font-weight:700;">{{ row.title }}</div>
            <div style="margin-top:6px; font-size:13px; color:var(--admin-text-muted);">{{ row.tags.join(' · ') }}</div>
          </div>
        </div>
        <div>{{ row.ageLabel }}</div>
        <div>{{ row.source }}</div>
        <div>{{ row.creator }}</div>
        <div>
          <span class="status-pill" :class="row.contentStatus">{{ row.contentStatus }}</span>
        </div>
        <div>{{ row.favorites }}</div>
        <div style="display:flex; gap:8px;">
          <button class="ghost-btn" style="padding:8px 10px;" @click="editRecipe(row.id)">编辑</button>
          <button class="ghost-btn" style="padding:8px 10px;" @click="handleDelete(row.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>
