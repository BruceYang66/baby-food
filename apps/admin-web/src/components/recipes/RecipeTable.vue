<script setup lang="ts">
import type { RecipeAdminRow } from '@baby-food/shared-types'

defineProps<{
  rows: RecipeAdminRow[]
}>()
</script>

<template>
  <div class="panel grid-gap-16">
    <div class="table-row" style="grid-template-columns: 1.1fr 110px 120px 110px 120px 90px 140px; background: transparent; padding: 0; color: var(--admin-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">
      <div>名称</div>
      <div>月龄</div>
      <div>来源</div>
      <div>创建人</div>
      <div>状态</div>
      <div>收藏</div>
      <div>操作</div>
    </div>
    <div v-for="row in rows" :key="row.id" class="table-row" style="grid-template-columns: 1.1fr 110px 120px 110px 120px 90px 140px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <img :src="row.cover" style="width:56px; height:56px; border-radius:8px; object-fit:cover;" />
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
        <button class="ghost-btn" style="padding:8px 10px;">编辑</button>
        <button class="ghost-btn" style="padding:8px 10px;">更多</button>
      </div>
    </div>
  </div>
</template>
