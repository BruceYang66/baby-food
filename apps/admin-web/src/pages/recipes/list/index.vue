<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RecipeAdminRow } from '@baby-food/shared-types'
import RecipeFilterBar from '@/components/recipes/RecipeFilterBar.vue'
import RecipeTable from '@/components/recipes/RecipeTable.vue'
import { getRecipeList } from '@/services/api'

const router = useRouter()
const recipeRows = ref<RecipeAdminRow[]>([])
const searchKeyword = ref('')
const filterAgeLabel = ref<string>('')
const filterContentStatus = ref<string>('')
const filterReviewStatus = ref<string>('')
const sortBy = ref<'updatedAt' | 'favorites'>('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

async function loadRecipes() {
  recipeRows.value = await getRecipeList()
}

function createRecipe() {
  router.push('/recipes/editor')
}

// 筛选和排序后的食谱列表
const filteredRecipes = computed(() => {
  let result = [...recipeRows.value]

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(recipe =>
      recipe.title.toLowerCase().includes(keyword) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 月龄筛选
  if (filterAgeLabel.value) {
    result = result.filter(recipe => recipe.ageLabel === filterAgeLabel.value)
  }

  // 内容状态筛选
  if (filterContentStatus.value) {
    result = result.filter(recipe => recipe.contentStatus === filterContentStatus.value)
  }

  // 审核状态筛选
  if (filterReviewStatus.value) {
    result = result.filter(recipe => recipe.reviewStatus === filterReviewStatus.value)
  }

  // 排序
  result.sort((a, b) => {
    let compareValue = 0
    if (sortBy.value === 'updatedAt') {
      compareValue = a.updatedAt.localeCompare(b.updatedAt)
    } else if (sortBy.value === 'favorites') {
      compareValue = a.favorites - b.favorites
    }
    return sortOrder.value === 'asc' ? compareValue : -compareValue
  })

  return result
})

onMounted(loadRecipes)
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:24px;">食谱库管理</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">支持列表 / 卡片视图与批量上架、下架、删除、打标签。</div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="primary-btn" @click="createRecipe">+ 新建食谱</button>
      </div>
    </section>

    <!-- 搜索和筛选栏 -->
    <section class="panel" style="padding: 16px;">
      <div style="display: grid; grid-template-columns: 1fr 150px 150px 150px 150px; gap: 12px; align-items: end;">
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">搜索</label>
          <input
            v-model="searchKeyword"
            class="ghost-input"
            placeholder="搜索食谱名称或标签..."
            style="margin: 0;"
          />
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">月龄</label>
          <select v-model="filterAgeLabel" class="ghost-select" style="margin: 0;">
            <option value="">全部</option>
            <option>6-8个月</option>
            <option>8-10个月</option>
            <option>10-12个月</option>
            <option>12-18个月</option>
            <option>18-24个月</option>
            <option>2-3岁</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">内容状态</label>
          <select v-model="filterContentStatus" class="ghost-select" style="margin: 0;">
            <option value="">全部</option>
            <option value="draft">草稿</option>
            <option value="pending_review">待审核</option>
            <option value="published">已上线</option>
            <option value="offline">已下架</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">审核状态</label>
          <select v-model="filterReviewStatus" class="ghost-select" style="margin: 0;">
            <option value="">全部</option>
            <option value="none">未审核</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">排序</label>
          <select v-model="sortBy" class="ghost-select" style="margin: 0;">
            <option value="updatedAt">更新时间</option>
            <option value="favorites">收藏数</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 13px; color: var(--admin-text-muted);">
          共 {{ filteredRecipes.length }} 条结果
        </div>
        <button
          class="ghost-btn"
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          style="font-size: 13px;"
        >
          {{ sortOrder === 'asc' ? '↑ 升序' : '↓ 降序' }}
        </button>
      </div>
    </section>

    <RecipeTable :rows="filteredRecipes" @refresh="loadRecipes" />
  </div>
</template>
