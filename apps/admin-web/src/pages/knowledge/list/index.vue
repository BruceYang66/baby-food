<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { KnowledgeArticleRow } from '@/services/api'
import { getKnowledgeList } from '@/services/api'
import KnowledgeTable from '@/components/knowledge/KnowledgeTable.vue'

const router = useRouter()
const articles = ref<KnowledgeArticleRow[]>([])
const activeCategory = ref<string>()
const searchKeyword = ref('')
const filterContentType = ref<string>('')
const filterContentStatus = ref<string>('')
const filterIsFeatured = ref<string>('')
const sortBy = ref<'updatedAt' | 'title'>('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

async function loadArticles() {
  articles.value = await getKnowledgeList(activeCategory.value)
}

function createArticle() {
  router.push('/knowledge/editor')
}

// 筛选和排序后的文章列表
const filteredArticles = computed(() => {
  let result = [...articles.value]

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(article =>
      article.title.toLowerCase().includes(keyword) ||
      article.subtitle.toLowerCase().includes(keyword) ||
      article.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 内容类型筛选
  if (filterContentType.value) {
    result = result.filter(article => article.contentType === filterContentType.value)
  }

  // 内容状态筛选
  if (filterContentStatus.value) {
    result = result.filter(article => article.contentStatus === filterContentStatus.value)
  }

  // 是否精选筛选
  if (filterIsFeatured.value === 'true') {
    result = result.filter(article => article.isFeatured)
  } else if (filterIsFeatured.value === 'false') {
    result = result.filter(article => !article.isFeatured)
  }

  // 排序
  result.sort((a, b) => {
    let compareValue = 0
    if (sortBy.value === 'updatedAt') {
      compareValue = a.updatedAt.localeCompare(b.updatedAt)
    } else if (sortBy.value === 'title') {
      compareValue = a.title.localeCompare(b.title)
    }
    return sortOrder.value === 'asc' ? compareValue : -compareValue
  })

  return result
})

onMounted(loadArticles)
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:24px;">干货百科管理</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">管理月龄喂养、病期忌口与育儿经验文章。</div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="primary-btn" @click="createArticle">+ 新建干货</button>
      </div>
    </section>

    <div class="panel" style="padding: 16px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button
          class="ghost-btn"
          :class="{ active: !activeCategory }"
          @click="activeCategory = undefined; loadArticles()"
        >
          全部
        </button>
        <button
          class="ghost-btn"
          :class="{ active: activeCategory === 'feeding' }"
          @click="activeCategory = 'feeding'; loadArticles()"
        >
          月龄喂养
        </button>
        <button
          class="ghost-btn"
          :class="{ active: activeCategory === 'health' }"
          @click="activeCategory = 'health'; loadArticles()"
        >
          健康护理
        </button>
        <button
          class="ghost-btn"
          :class="{ active: activeCategory === 'nutrition' }"
          @click="activeCategory = 'nutrition'; loadArticles()"
        >
          营养知识
        </button>
        <button
          class="ghost-btn"
          :class="{ active: activeCategory === 'development' }"
          @click="activeCategory = 'development'; loadArticles()"
        >
          成长发育
        </button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <section class="panel" style="padding: 16px;">
      <div style="display: grid; grid-template-columns: 1fr 150px 150px 150px 150px; gap: 12px; align-items: end;">
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">搜索</label>
          <input
            v-model="searchKeyword"
            class="ghost-input"
            placeholder="搜索标题、副标题或标签..."
            style="margin: 0;"
          />
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">内容类型</label>
          <select v-model="filterContentType" class="ghost-select" style="margin: 0;">
            <option value="">全部</option>
            <option value="article">文章</option>
            <option value="guide">指南</option>
            <option value="taboo">忌口</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">内容状态</label>
          <select v-model="filterContentStatus" class="ghost-select" style="margin: 0;">
            <option value="">全部</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="offline">已下架</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">是否精选</label>
          <select v-model="filterIsFeatured" class="ghost-select" style="margin: 0;">
            <option value="">全部</option>
            <option value="true">精选</option>
            <option value="false">非精选</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">排序</label>
          <select v-model="sortBy" class="ghost-select" style="margin: 0;">
            <option value="updatedAt">更新时间</option>
            <option value="title">标题</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 13px; color: var(--admin-text-muted);">
          共 {{ filteredArticles.length }} 条结果
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

    <KnowledgeTable :rows="filteredArticles" @refresh="loadArticles" />
  </div>
</template>

<style scoped>
.ghost-btn.active {
  background: #005daa;
  color: white;
}
</style>
