<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ImageUploader from '@/components/common/ImageUploader.vue'
import { createRecipe, updateRecipe, normalizeImageUrl, type RecipeEditorDetail } from '@/services/api'

const props = defineProps<{
  recipe?: RecipeEditorDetail
}>()

const AGE_RANGE_OPTIONS: Array<{ label: string; minMonths: number; maxMonths: number | null }> = [
  { label: '6-8个月', minMonths: 6, maxMonths: 8 },
  { label: '8-10个月', minMonths: 8, maxMonths: 10 },
  { label: '10-12个月', minMonths: 10, maxMonths: 12 },
  { label: '12-18个月', minMonths: 12, maxMonths: 18 },
  { label: '18-24个月', minMonths: 18, maxMonths: 24 },
  { label: '2岁+', minMonths: 24, maxMonths: null }
]

function getAgeLabel(minMonths: number, maxMonths: number | null) {
  if (maxMonths === null) {
    return `${minMonths}个月+`
  }
  return `${minMonths}-${maxMonths}月`
}

const formData = ref<RecipeEditorDetail>(props.recipe || {
  id: '',
  title: '',
  ageLabel: '6-8个月',
  ageMinMonths: 6,
  ageMaxMonths: 8,
  durationLabel: '20分钟',
  difficultyLabel: '简单',
  cover: '',
  description: '',
  tags: [],
  allergens: [],
  symptom: '',
  contentStatus: 'draft',
  reviewStatus: 'none',
  ingredients: [{ id: '', name: '', amount: '', unit: '' }],
  steps: [{ id: '', description: '', image: '' }],
  preview: { title: '', subtitle: '' }
})

// 监听props变化，更新formData
watch(() => props.recipe, (newRecipe) => {
  if (newRecipe) {
    formData.value = {
      ...newRecipe,
      ageMinMonths: typeof newRecipe.ageMinMonths === 'number' ? newRecipe.ageMinMonths : 6,
      ageMaxMonths: newRecipe.ageMaxMonths ?? 8
    }
  }
}, { immediate: true })

const selectedAgeRangeKey = computed({
  get: () => `${formData.value.ageMinMonths ?? 6}-${formData.value.ageMaxMonths === null ? 'null' : (formData.value.ageMaxMonths ?? 8)}`,
  set: (value: string) => {
    const [minText, maxText] = value.split('-')
    const minMonths = Number(minText)
    const maxMonths = maxText === 'null' ? null : Number(maxText)
    formData.value.ageMinMonths = Number.isFinite(minMonths) ? minMonths : 6
    formData.value.ageMaxMonths = maxMonths === null || Number.isFinite(maxMonths) ? maxMonths : 8
    formData.value.ageLabel = getAgeLabel(formData.value.ageMinMonths, formData.value.ageMaxMonths ?? null)
  }
})


// 标签字符串转数组
const tagsString = computed({
  get: () => Array.isArray(formData.value.tags) ? formData.value.tags.join(',') : '',
  set: (val: string) => {
    formData.value.tags = val.split(',').map(t => t.trim()).filter(Boolean)
  }
})

// 过敏原字符串转数组
const allergensString = computed({
  get: () => Array.isArray(formData.value.allergens) ? formData.value.allergens.join(',') : '',
  set: (val: string) => {
    formData.value.allergens = val.split(',').map(t => t.trim()).filter(Boolean)
  }
})

function addIngredient() {
  formData.value.ingredients.push({ id: '', name: '', amount: '', unit: '' })
}

function removeIngredient(index: number) {
  if (formData.value.ingredients.length > 1) {
    formData.value.ingredients.splice(index, 1)
  }
}

function addStep() {
  formData.value.steps.push({ id: '', description: '', image: '' })
}

function removeStep(index: number) {
  if (formData.value.steps.length > 1) {
    formData.value.steps.splice(index, 1)
  }
}

function moveStepUp(index: number) {
  if (index > 0) {
    const temp = formData.value.steps[index]
    formData.value.steps[index] = formData.value.steps[index - 1]
    formData.value.steps[index - 1] = temp
  }
}

function moveStepDown(index: number) {
  if (index < formData.value.steps.length - 1) {
    const temp = formData.value.steps[index]
    formData.value.steps[index] = formData.value.steps[index + 1]
    formData.value.steps[index + 1] = temp
  }
}

async function handleSave(status: 'draft' | 'published') {
  if (!formData.value.title.trim()) {
    alert('请填写食谱名称')
    return
  }

  if (formData.value.ingredients.some(ing => !ing.name.trim())) {
    alert('请填写所有食材名称')
    return
  }

  if (formData.value.steps.some(step => !step.description.trim())) {
    alert('请填写所有步骤描述')
    return
  }

  saving.value = true

  try {
    const payload = {
      ...formData.value,
      contentStatus: status,
      ageLabel: getAgeLabel(formData.value.ageMinMonths ?? 6, formData.value.ageMaxMonths ?? null)
    }

    if (isEditMode.value) {
      await updateRecipe(formData.value.id, payload)
      alert('食谱更新成功')
    } else {
      const result = await createRecipe(payload)
      alert('食谱创建成功')
      router.push(`/recipes/editor?id=${result.id}`)
    }
  } catch (error) {
    alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/recipes/list')
}
</script>

<template>
  <div class="panel grid-gap-20">
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:28px;">{{ isEditMode ? '编辑食谱' : '新建食谱' }}</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">分块折叠编辑，右侧实时手机预览。</div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="ghost-btn" @click="handleCancel" :disabled="saving">取消</button>
        <button class="ghost-btn" @click="handleSave('draft')" :disabled="saving">保存草稿</button>
        <button class="primary-btn" @click="handleSave('published')" :disabled="saving">
          {{ saving ? '保存中...' : '立即上线' }}
        </button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: minmax(0, 1.2fr) 360px; gap:20px; align-items:start;">
      <div class="grid-gap-16">
        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">基础信息</div>
          <div class="grid-gap-16" style="grid-template-columns: repeat(2, minmax(0, 1fr)); display:grid;">
            <input v-model="formData.title" class="ghost-input" placeholder="食谱名称" />
            <select v-model="selectedAgeRangeKey" class="ghost-select">
              <option
                v-for="option in AGE_RANGE_OPTIONS"
                :key="`${option.minMonths}-${option.maxMonths === null ? 'null' : option.maxMonths}`"
                :value="`${option.minMonths}-${option.maxMonths === null ? 'null' : option.maxMonths}`"
              >{{ option.label }}</option>
            </select>
            <input v-model="formData.durationLabel" class="ghost-input" placeholder="时长，如 20 分钟" />
            <select v-model="formData.difficultyLabel" class="ghost-select">
              <option>简单</option>
              <option>中等</option>
              <option>困难</option>
            </select>
            <div style="grid-column: span 2;">
              <ImageUploader v-model="formData.cover" placeholder="上传封面图" />
            </div>
            <textarea v-model="formData.description" class="ghost-textarea" rows="3" placeholder="一句话简介" style="grid-column: span 2;"></textarea>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">食材清单</div>
          <div class="grid-gap-16">
            <div v-for="(ingredient, index) in formData.ingredients" :key="index" style="display:grid; grid-template-columns: 1.2fr 140px 120px 80px; gap:10px;">
              <input v-model="ingredient.name" class="ghost-input" placeholder="食材名称" />
              <input v-model="ingredient.amount" class="ghost-input" placeholder="数量" />
              <input v-model="ingredient.unit" class="ghost-input" placeholder="单位" />
              <button class="ghost-btn" @click="removeIngredient(index)">删除</button>
            </div>
            <button class="ghost-btn" style="justify-self:start;" @click="addIngredient">+ 添加食材</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">制作步骤</div>
          <div class="grid-gap-16">
            <div v-for="(step, index) in formData.steps" :key="index" class="step-item">
              <div style="font-weight:600; margin-bottom:8px;">步骤 {{ index + 1 }}</div>
              <textarea v-model="step.description" class="ghost-textarea" rows="3" placeholder="步骤描述"></textarea>
              <ImageUploader v-model="step.image" placeholder="上传步骤图（可选）" />
              <div style="display:flex; gap:10px; margin-top:8px;">
                <button class="ghost-btn" @click="moveStepUp(index)" :disabled="index === 0">上移</button>
                <button class="ghost-btn" @click="moveStepDown(index)" :disabled="index === formData.steps.length - 1">下移</button>
                <button class="ghost-btn" @click="removeStep(index)">删除</button>
              </div>
            </div>
            <button class="ghost-btn" style="justify-self:start;" @click="addStep">+ 添加步骤</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">营养与贴士</div>
          <div class="grid-gap-16">
            <input v-model="tagsString" class="ghost-input" placeholder="标签（用逗号分隔，如：高铁,易消化）" />
            <input v-model="formData.symptom" class="ghost-input" placeholder="关联病症，如 腹泻 / 便秘" />
            <input v-model="allergensString" class="ghost-input" placeholder="过敏原标签（用逗号分隔）" />
          </div>
        </section>
      </div>

      <aside class="panel" style="position:sticky; top:24px;">
        <div class="panel-title" style="font-size:20px; margin-bottom:16px;">实时预览</div>
        <div style="background: #FDF8F3; border-radius: 28px; padding: 18px; min-height: 640px;">
          <div style="font-size: 12px; color: #8A5108;">手机端详情页预览</div>
          <div style="margin-top: 16px; background: #fff; border-radius: 24px; overflow: hidden;">
            <img v-if="formData.cover" :src="normalizeImageUrl(formData.cover)" :alt="formData.title" style="width: 100%; height: 180px; object-fit: cover;" />
            <div v-else style="width: 100%; height: 180px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">
              暂无封面
            </div>
            <div style="padding: 18px;">
              <div style="font-weight: 800; font-size: 22px;">{{ formData.title || '食谱标题' }}</div>
              <div style="margin-top: 10px; color: #6B625B; font-size: 13px; line-height: 1.7;">{{ formData.description || '食谱简介' }}</div>
              <div v-if="formData.tags.length > 0" style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
                <span v-for="tag in formData.tags" :key="tag" style="padding: 4px 10px; background: rgba(0, 93, 170, 0.1); color: #005daa; border-radius: 12px; font-size: 12px;">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.step-item {
  padding: 16px;
  background: rgba(0, 93, 170, 0.02);
  border-radius: 8px;
}
</style>
