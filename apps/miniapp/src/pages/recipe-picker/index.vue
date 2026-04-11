<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { RecipeSummary } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getRecipeList } from '@/services/api'

const recipes = ref<RecipeSummary[]>([])
const loading = ref(true)
const searchText = ref('')
const hasMore = ref(false)
const currentPage = ref(1)
const loadingMore = ref(false)

// EventChannel 用于回传选择结果
let eventChannel: any = null

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPageInstance = pages[pages.length - 1] as any
  eventChannel = currentPageInstance.getOpenerEventChannel?.()

  await loadRecipes(1)
})

async function loadRecipes(page: number) {
  if (page === 1) loading.value = true
  else loadingMore.value = true

  try {
    const data = await getRecipeList({
      search: searchText.value.trim() || undefined,
      page
    })

    if (page === 1) {
      recipes.value = data.recipes
    } else {
      recipes.value.push(...data.recipes)
    }

    hasMore.value = data.hasMore
    currentPage.value = page
  } catch {
    uni.showToast({ title: '食谱加载失败', icon: 'none' })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadRecipes(1)
  }, 400)
}

function clearSearch() {
  searchText.value = ''
  loadRecipes(1)
}

function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadRecipes(currentPage.value + 1)
}

function selectRecipe(recipe: RecipeSummary) {
  if (eventChannel) {
    eventChannel.emit('selectRecipe', {
      id: recipe.id,
      title: recipe.title,
      focus: recipe.description || recipe.tags[0] || '',
      image: recipe.image,
      tags: recipe.tags
    })
  }
  uni.navigateBack()
}

const filteredCount = computed(() => recipes.value.length)
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="选择食谱" subtitle="从食谱库中选择适合的菜品" :show-back="true" />

    <!-- 搜索框 -->
    <view class="search-bar soft-card">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索食谱名称、标签..."
          @input="onSearchInput"
          confirm-type="search"
          @confirm="loadRecipes(1)"
        />
        <view v-if="searchText" class="search-clear" @tap="clearSearch">✕</view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-state soft-card">
      <text class="loading-text">加载食谱库中...</text>
    </view>

    <!-- 食谱列表 -->
    <scroll-view
      v-else
      scroll-y
      class="recipe-scroll"
      @scrolltolower="loadMore"
    >
      <view class="recipe-count-tip">
        <text class="count-text">共 {{ filteredCount }} 道食谱{{ hasMore ? '（下拉加载更多）' : '' }}</text>
      </view>

      <view v-if="recipes.length === 0" class="empty-state soft-card">
        <text class="empty-icon">🍽️</text>
        <text class="empty-title">没有找到相关食谱</text>
        <text class="empty-desc">换个关键词试试</text>
      </view>

      <view v-else class="recipe-list">
        <view
          v-for="recipe in recipes"
          :key="recipe.id"
          class="recipe-card card"
          @tap="selectRecipe(recipe)"
        >
          <view class="recipe-img-wrap">
            <image
              v-if="recipe.image"
              class="recipe-img"
              :src="recipe.image"
              mode="aspectFill"
            />
            <view v-else class="recipe-img-fallback">🍚</view>
          </view>
          <view class="recipe-info">
            <text class="recipe-title">{{ recipe.title }}</text>
            <text class="recipe-desc">{{ recipe.description }}</text>
            <view class="recipe-meta">
              <text class="recipe-age">{{ recipe.ageLabel }}</text>
              <text class="recipe-duration">{{ recipe.durationLabel }}</text>
              <text class="recipe-diff">{{ recipe.difficultyLabel }}</text>
            </view>
            <view class="recipe-tags">
              <text
                v-for="tag in recipe.tags.slice(0, 3)"
                :key="tag"
                class="recipe-tag"
              >{{ tag }}</text>
            </view>
          </view>
          <view class="recipe-select-icon">›</view>
        </view>
      </view>

      <view v-if="loadingMore" class="load-more-tip">
        <text class="load-more-text">加载中...</text>
      </view>

      <view v-if="!hasMore && recipes.length > 0" class="load-more-tip">
        <text class="load-more-text">已显示全部食谱</text>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.search-bar {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 999rpx;
  padding: 16rpx 20rpx;
}

.search-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: var(--mini-text);
}

.search-clear {
  font-size: 24rpx;
  color: var(--mini-text-muted);
  padding: 4rpx 10rpx;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
  margin-top: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: var(--mini-text-muted);
}

.recipe-scroll {
  height: calc(100vh - 260rpx);
  margin-top: 20rpx;
}

.recipe-count-tip {
  padding: 8rpx 4rpx 16rpx;
}

.count-text {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 30rpx;
  gap: 16rpx;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.empty-desc {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 40rpx;
}

.recipe-card {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  padding: 20rpx;
}

.recipe-img-wrap {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.recipe-img {
  width: 120rpx;
  height: 120rpx;
}

.recipe-img-fallback {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 179, 102, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.recipe-info {
  flex: 1;
  min-width: 0;
}

.recipe-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.recipe-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 10rpx;
}

.recipe-age,
.recipe-duration,
.recipe-diff {
  font-size: 20rpx;
  color: var(--mini-secondary-deep);
  font-weight: 600;
}

.recipe-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 10rpx;
  flex-wrap: wrap;
}

.recipe-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.15);
  font-size: 18rpx;
  color: var(--mini-primary-deep);
}

.recipe-select-icon {
  font-size: 36rpx;
  color: var(--mini-text-muted);
  line-height: 120rpx;
  flex-shrink: 0;
}

.load-more-tip {
  padding: 20rpx;
  text-align: center;
}

.load-more-text {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}
</style>
