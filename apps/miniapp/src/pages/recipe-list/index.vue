<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { RecipeSummary } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getRecipeList, openProtectedPage } from '@/services/api'

const GOALS = ['补铁', '补钙', 'DHA', '通便', '开胃', '手抓食', '免疫力', '病期适用']

const recipes = ref<RecipeSummary[]>([])
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)
const selectedTag = ref('')
const searchText = ref('')

async function loadRecipes(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    recipes.value = []
  }
  loading.value = true
  try {
    const data = await getRecipeList({
      tag: selectedTag.value || undefined,
      search: searchText.value || undefined,
      page: page.value
    })
    if (reset) {
      recipes.value = data.recipes
    } else {
      recipes.value = [...recipes.value, ...data.recipes]
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
    <AppNavBar title="全部食谱" subtitle="浏览并加入今日计划" :show-back="true" />

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

    <!-- 分类标签 -->
    <scroll-view scroll-x class="tag-scroll" show-scrollbar="false">
      <view class="tag-row">
        <view
          class="tag-chip"
          :class="{ active: selectedTag === '' }"
          @tap="selectTag('')"
        >全部</view>
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
        v-for="recipe in recipes"
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
    <view v-else-if="recipes.length" class="load-more">
      <text class="load-more-text">已显示全部 {{ recipes.length }} 条食谱</text>
    </view>

    <view v-if="!loading && !recipes.length" class="empty soft-card">
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
