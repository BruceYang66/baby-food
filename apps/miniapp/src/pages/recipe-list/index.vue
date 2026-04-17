<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { RecipeSummary } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getRecipeList, openProtectedPage } from '@/services/api'

const AGE_RANGES = ['全部月龄', '6-8月', '9-11月', '12-18月', '19-24月', '2岁+']
const GOALS = ['补铁', '补钙', 'DHA', '通便', '开胃', '手抓食', '免疫力', '病期适用', '挑食', '补锌', '护眼']

const recipes = ref<RecipeSummary[]>([])
const allRecipes = ref<RecipeSummary[]>([]) // 存储所有加载的食谱
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)
const selectedTag = ref('')
const selectedAgeRange = ref('全部月龄')
const searchText = ref('')

const totalCount = ref(0)

// 计算过滤后的食谱
const filteredRecipes = computed(() => {
  let result = allRecipes.value

  // 按年龄段过滤
  if (selectedAgeRange.value !== '全部月龄') {
    const ageFilter = selectedAgeRange.value
    result = result.filter((recipe) => {
      const ageLabel = recipe.ageLabel || ''
      // 匹配逻辑：检查年龄标签是否包含选中的范围
      if (ageFilter === '6-8月') {
        return /[6-8]月/.test(ageLabel) || ageLabel.includes('6-') || ageLabel.includes('-8')
      } else if (ageFilter === '9-11月') {
        return /[9]月|1[01]月/.test(ageLabel) || ageLabel.includes('9-') || ageLabel.includes('-11')
      } else if (ageFilter === '12-18月') {
        return /1[2-8]月/.test(ageLabel) || ageLabel.includes('12-') || ageLabel.includes('-18') || (ageLabel.includes('1') && ageLabel.includes('岁'))
      } else if (ageFilter === '19-24月') {
        return /1[9]月|2[0-4]月/.test(ageLabel) || ageLabel.includes('19-') || ageLabel.includes('-24') || ageLabel.includes('2岁')
      } else if (ageFilter === '2岁+') {
        return /[2-9]岁|岁\+/.test(ageLabel)
      }
      return true
    })
  }

  return result
})

const pageTitle = computed(() => {
  const count = filteredRecipes.value.length
  if (count > 0) {
    return `全部食谱 (${count})`
  }
  return '全部食谱'
})

async function loadRecipes(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    allRecipes.value = []
  }
  loading.value = true
  try {
    const data = await getRecipeList({
      tag: selectedTag.value || undefined,
      search: searchText.value || undefined,
      page: page.value
    })

    if (reset) {
      allRecipes.value = data.recipes
      totalCount.value = data.total
    } else {
      allRecipes.value = [...allRecipes.value, ...data.recipes]
    }
    hasMore.value = data.hasMore
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  loadRecipes(true)
}

function selectAgeRange(range: string) {
  selectedAgeRange.value = range
  // 年龄段筛选是前端过滤，不需要重新加载
}

function onSearchConfirm() {
  loadRecipes(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  loadRecipes(false)
}

function goRecipeDetail(recipeId: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${recipeId}` })
}

function addToPlan(recipe: RecipeSummary) {
  uni.setStorageSync('pendingPlanRecipe', {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    tags: recipe.tags
  })
  if (!openProtectedPage('/pages/generate/index')) {
    uni.removeStorageSync('pendingPlanRecipe')
  }
}

onMounted(() => loadRecipes(true))
</script>

<template>
  <view class="page-shell">
    <AppNavBar :title="pageTitle" subtitle="浏览并加入今日计划" :show-back="true" />

    <!-- 搜索框 -->
    <view class="search-bar soft-card">
      <input
        v-model="searchText"
        class="search-input"
        placeholder="搜索食谱名称..."
        confirm-type="search"
        @confirm="onSearchConfirm"
      />
      <view class="search-btn" @tap="onSearchConfirm">搜索</view>
    </view>

    <!-- 年龄段筛选 -->
    <scroll-view scroll-x class="tag-scroll" show-scrollbar="false">
      <view class="tag-row">
        <view
          v-for="range in AGE_RANGES"
          :key="range"
          class="age-chip"
          :class="{ active: selectedAgeRange === range }"
          @tap="selectAgeRange(range)"
        >{{ range }}</view>
      </view>
    </scroll-view>

    <!-- 营养标签 -->
    <scroll-view scroll-x class="tag-scroll" show-scrollbar="false">
      <view class="tag-row">
        <view
          class="tag-chip"
          :class="{ active: selectedTag === '' }"
          @tap="selectTag('')"
        >全部标签</view>
        <view
          v-for="goal in GOALS"
          :key="goal"
          class="tag-chip"
          :class="{ active: selectedTag === goal }"
          @tap="selectTag(goal)"
        >{{ goal }}</view>
      </view>
    </scroll-view>

    <!-- 食谱列表 -->
    <view class="recipe-list">
      <view
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="recipe-card card"
        @tap="goRecipeDetail(recipe.id)"
      >
        <image class="recipe-image" :src="recipe.image" mode="aspectFill" />
        <view class="recipe-body">
          <text class="recipe-title">{{ recipe.title }}</text>
          <text class="recipe-meta">{{ recipe.ageLabel }} · {{ recipe.durationLabel }} · {{ recipe.difficultyLabel }}</text>
          <text class="recipe-desc">{{ recipe.description }}</text>
          <view class="recipe-tags">
            <text v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="recipe-tag">{{ tag }}</text>
          </view>
        </view>
        <view class="recipe-action" @tap.stop="addToPlan(recipe)">加入计划</view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore" class="load-more" @tap="loadMore">
      <text class="load-more-text">{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>
    <view v-else-if="filteredRecipes.length" class="load-more">
      <text class="load-more-text">已显示全部 {{ filteredRecipes.length }} 条食谱</text>
    </view>

    <view v-if="!loading && !filteredRecipes.length" class="empty soft-card">
      <text class="empty-text">没有找到相关食谱，换个关键词试试</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.search-bar {
  display: flex;
  gap: 14rpx;
  padding: 18rpx;
  margin-top: 18rpx;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 76rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  padding: 0 28rpx;
  font-size: 26rpx;
}

.search-btn {
  padding: 0 30rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.tag-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}

.tag-row {
  display: flex;
  gap: 14rpx;
  padding: 0 4rpx 8rpx;
}

.age-chip {
  display: inline-flex;
  align-items: center;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: rgba(168, 230, 207, 0.2);
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-secondary-deep);
  white-space: nowrap;
}

.age-chip.active {
  background: linear-gradient(135deg, var(--mini-secondary-deep), var(--mini-secondary));
  color: #fff;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.85);
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text-muted);
  white-space: nowrap;
}

.tag-chip.active {
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.recipe-card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  align-items: flex-start;
}

.recipe-image {
  width: 180rpx;
  height: 148rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.recipe-body {
  flex: 1;
  min-width: 0;
}

.recipe-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.recipe-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.recipe-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.recipe-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.16);
  color: var(--mini-primary-deep);
  font-size: 20rpx;
  font-weight: 700;
}

.recipe-action {
  flex-shrink: 0;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-secondary-deep), var(--mini-secondary));
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  margin-top: 16rpx;
}

.load-more {
  padding: 28rpx;
  text-align: center;
}

.load-more-text {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.empty {
  margin-top: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: var(--mini-text-muted);
}
</style>
