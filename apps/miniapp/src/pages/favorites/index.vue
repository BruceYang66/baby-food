<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { RecipeSummary } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { getBatchRecipeSummaries, syncFavoriteIds, removeFavorite as removeFavoriteApi } from '@/services/api'

const recipes = ref<RecipeSummary[]>([])
const loading = ref(false)

async function loadFavorites() {
  loading.value = true
  try {
    // 先从云端同步最新收藏 ID
    const ids = await syncFavoriteIds()
    if (!ids.length) {
      recipes.value = []
      return
    }
    const data = await getBatchRecipeSummaries(ids)
    recipes.value = data.recipes
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '收藏读取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goRecipeDetail(recipeId: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${recipeId}` })
}

function removeFavorite(recipeId: string) {
  uni.showModal({
    title: '取消收藏',
    content: '确定要取消收藏这道食谱吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await removeFavoriteApi(recipeId)
          recipes.value = recipes.value.filter((recipe) => recipe.id !== recipeId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
        } catch {
          uni.showToast({ title: '操作失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

onMounted(loadFavorites)
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="我的收藏" subtitle="随时查看保存的食谱" :show-back="true" />

    <view v-if="!recipes.length && !loading" class="empty-card soft-card">
      <text class="empty-title">还没有收藏的食谱</text>
      <text class="empty-desc">去食谱详情页点一下“收藏”，这里就会自动同步显示。</text>
    </view>

    <view v-else class="recipe-list">
      <view v-for="recipe in recipes" :key="recipe.id" class="recipe-card card">
        <image class="recipe-image" :src="recipe.image" mode="aspectFill" @tap="goRecipeDetail(recipe.id)" />
        <view class="recipe-main" @tap="goRecipeDetail(recipe.id)">
          <text class="recipe-title">{{ recipe.title }}</text>
          <text class="recipe-meta">{{ recipe.ageLabel }} · {{ recipe.durationLabel }} · {{ recipe.difficultyLabel }}</text>
          <text class="recipe-tags">{{ recipe.tags.join(' · ') }}</text>
        </view>
        <view class="recipe-action" @tap="removeFavorite(recipe.id)">×</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.empty-card {
  margin-top: 24rpx;
  padding: 32rpx;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.recipe-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx;
}

.recipe-image {
  width: 180rpx;
  height: 140rpx;
  border-radius: 22rpx;
}

.recipe-main {
  flex: 1;
}

.recipe-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.recipe-meta,
.recipe-tags {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.recipe-action {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(214, 106, 106, 0.12);
  text-align: center;
  line-height: 56rpx;
  font-size: 36rpx;
  color: #a94f4f;
  font-weight: 700;
}
</style>
