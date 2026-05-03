<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BackToTopButton from '@/components/common/BackToTopButton.vue'
import RecipeEditorForm from '@/components/recipes/RecipeEditorForm.vue'
import { getRecipeDetail, type RecipeEditorDetail } from '@/services/api'

const route = useRoute()
const recipe = ref<RecipeEditorDetail>()

onMounted(async () => {
  const recipeId = typeof route.query.id === 'string' ? route.query.id : 'R-1025'
  recipe.value = await getRecipeDetail(recipeId)
})
</script>

<template>
  <RecipeEditorForm :recipe="recipe" />
  <BackToTopButton />
</template>
