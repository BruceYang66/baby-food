<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { RecipeAdminRow } from '@baby-food/shared-types'
import RecipeFilterBar from '@/components/recipes/RecipeFilterBar.vue'
import RecipeTable from '@/components/recipes/RecipeTable.vue'
import { getRecipeList } from '@/services/api'

const recipeRows = ref<RecipeAdminRow[]>([])

onMounted(async () => {
  recipeRows.value = await getRecipeList()
})
</script>

<template>
  <div class="grid-gap-20">
    <RecipeFilterBar />
    <section class="panel" style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:24px;">食谱库管理</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">支持列表 / 卡片视图与批量上架、下架、删除、打标签。</div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="ghost-btn">批量上架</button>
        <button class="ghost-btn">批量下架</button>
        <button class="ghost-btn">批量打标签</button>
      </div>
    </section>
    <RecipeTable :rows="recipeRows" />
  </div>
</template>
