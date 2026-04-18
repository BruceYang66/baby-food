<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ImageUploader from '@/components/common/ImageUploader.vue'
import { createRecipe } from '@/services/api'

const router = useRouter()
const saving = ref(false)

const formData = ref({
  title: '',
  ageLabel: '6-8个月',
  cover: '',
  ingredients: '',
  steps: '',
  tags: ''
})

async function handleSaveDraft() {
  if (!formData.value.title.trim()) {
    alert('请填写食谱名称')
    return
  }

  saving.value = true

  try {
    // 解析食材
    const ingredientLines = formData.value.ingredients.split('\n').filter(line => line.trim())
    const ingredients = ingredientLines.map(line => {
      const parts = line.trim().split(/\s+/)
      return {
        name: parts[0] || '',
        amount: parts[1] || '适量',
        unit: parts[2] || ''
      }
    })

    // 解析步骤
    const stepLines = formData.value.steps.split('\n').filter(line => line.trim())
    const steps = stepLines.map((line, index) => ({
      stepNo: index + 1,
      title: `步骤${index + 1}`,
      description: line.trim(),
      imageUrl: ''
    }))

    // 解析标签
    const tags = formData.value.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean)

    const payload = {
      title: formData.value.title,
      ageLabel: formData.value.ageLabel,
      durationLabel: '待补充',
      difficultyLabel: '简单',
      coverImage: formData.value.cover,
      summary: '快速录入，待完善',
      tags,
      contentStatus: 'draft' as const,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: '待补充', amount: '', unit: '' }],
      steps: steps.length > 0 ? steps : [{ stepNo: 1, title: '步骤1', description: '待补充', imageUrl: '' }]
    }

    const result = await createRecipe(payload)
    alert('草稿保存成功，请在24小时内完善')
    router.push(`/recipes/editor?id=${result.id}`)
  } catch (error) {
    alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    saving.value = false
  }
}

async function handleSubmitReview() {
  if (!formData.value.title.trim()) {
    alert('请填写食谱名称')
    return
  }

  if (!formData.value.ingredients.trim()) {
    alert('请填写食材简述')
    return
  }

  if (!formData.value.steps.trim()) {
    alert('请填写做法简述')
    return
  }

  saving.value = true

  try {
    // 解析食材
    const ingredientLines = formData.value.ingredients.split('\n').filter(line => line.trim())
    const ingredients = ingredientLines.map(line => {
      const parts = line.trim().split(/\s+/)
      return {
        name: parts[0] || '',
        amount: parts[1] || '适量',
        unit: parts[2] || ''
      }
    })

    // 解析步骤
    const stepLines = formData.value.steps.split('\n').filter(line => line.trim())
    const steps = stepLines.map((line, index) => ({
      stepNo: index + 1,
      title: `步骤${index + 1}`,
      description: line.trim(),
      imageUrl: ''
    }))

    // 解析标签
    const tags = formData.value.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean)

    const payload = {
      title: formData.value.title,
      ageLabel: formData.value.ageLabel,
      durationLabel: '待补充',
      difficultyLabel: '简单',
      coverImage: formData.value.cover,
      summary: formData.value.ingredients.split('\n')[0] || '快速录入',
      tags,
      contentStatus: 'pending_review' as const,
      ingredients,
      steps
    }

    await createRecipe(payload)
    alert('提交成功，等待审核')
    router.push('/recipes/list')
  } catch (error) {
    alert('提交失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    saving.value = false
  }
}

function resetForm() {
  formData.value = {
    title: '',
    ageLabel: '6-8个月',
    cover: '',
    ingredients: '',
    steps: '',
    tags: ''
  }
}
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:grid; grid-template-columns: minmax(0, 1fr) 360px; gap:20px; align-items:start;">
      <div class="panel" style="background: var(--admin-surface-low);">
        <div class="panel-title" style="font-size:24px;">快速添加页（手机端录入）</div>
        <div style="margin-top: 8px; color: var(--admin-text-muted); line-height: 1.8;">适合现场录入，用最少字段快速形成草稿，24 小时内再到电脑端完善。</div>
        <div class="grid-gap-16" style="margin-top: 20px;">
          <input v-model="formData.title" class="ghost-input" placeholder="食谱名称" />
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">封面图</label>
              <ImageUploader v-model="formData.cover" placeholder="拍照上传" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">月龄</label>
              <select v-model="formData.ageLabel" class="ghost-select" style="margin: 0;">
                <option>6-8个月</option>
                <option>8-10个月</option>
                <option>10-12个月</option>
                <option>12-18个月</option>
                <option>18-24个月</option>
                <option>2-3岁</option>
              </select>
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">食材简述（每行一个，格式：食材名 数量 单位）</label>
            <textarea v-model="formData.ingredients" class="ghost-textarea" rows="4" placeholder="例如：&#10;南瓜 100g&#10;鸡肉 50g&#10;面条 适量"></textarea>
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">做法简述（每行一个步骤）</label>
            <textarea v-model="formData.steps" class="ghost-textarea" rows="5" placeholder="例如：&#10;南瓜去皮切块蒸熟&#10;鸡肉切丁焯水&#10;面条煮软&#10;所有食材混合搅拌"></textarea>
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">快捷标签（用逗号分隔）</label>
            <input v-model="formData.tags" class="ghost-input" placeholder="如：补铁,通便,加餐" />
          </div>
          <div style="display:flex; gap:10px;">
            <button class="ghost-btn" @click="resetForm" :disabled="saving">清空</button>
            <button class="ghost-btn" @click="handleSaveDraft" :disabled="saving">存草稿电脑完善</button>
            <button class="primary-btn" @click="handleSubmitReview" :disabled="saving">
              {{ saving ? '提交中...' : '直接提交审核' }}
            </button>
          </div>
        </div>
      </div>
      <aside class="panel" style="position:sticky; top:24px;">
        <div class="panel-title" style="font-size:20px;">录入提示</div>
        <div style="margin-top: 12px; color: var(--admin-text-muted); line-height: 1.9;">
          <div>• 封面图建议竖版 4:5。</div>
          <div>• 月龄字段必须完整。</div>
          <div>• 食材格式：食材名 数量 单位，每行一个。</div>
          <div>• 做法格式：每行一个步骤。</div>
          <div>• 标签用逗号分隔。</div>
          <div>• 存草稿后 24 小时内补全步骤图和营养贴士。</div>
        </div>
      </aside>
    </section>
  </div>
</template>
