<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BackToTopButton from '@/components/common/BackToTopButton.vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import SectionEditor from '@/components/knowledge/SectionEditor.vue'
import { getKnowledgeDetail, createKnowledge, updateKnowledge, type KnowledgeArticleDetail } from '@/services/api'

const router = useRouter()
const route = useRoute()
const saving = ref(false)

const formData = ref<KnowledgeArticleDetail>({
  id: '',
  title: '',
  subtitle: '',
  summary: '',
  coverImage: '',
  categoryKey: 'feeding',
  categoryLabel: '月龄喂养',
  tags: [],
  contentType: 'article',
  content: '',
  isFeatured: false,
  contentStatus: 'published',
  sections: []
})

const isEditMode = computed(() => !!formData.value.id)

// 标签字符串转数组
const tagsString = computed({
  get: () => Array.isArray(formData.value.tags) ? formData.value.tags.join(',') : '',
  set: (val: string) => {
    formData.value.tags = val.split(',').map(t => t.trim()).filter(Boolean)
  }
})

const categories = [
  { key: 'feeding', label: '月龄喂养' },
  { key: 'health', label: '健康护理' },
  { key: 'nutrition', label: '营养知识' },
  { key: 'development', label: '成长发育' },
  { key: 'safety', label: '安全防护' }
]

function updateCategory(key: string) {
  formData.value.categoryKey = key
  formData.value.categoryLabel = categories.find(c => c.key === key)?.label || key
}

function addSection() {
  formData.value.sections.push({
    title: '',
    content: '',
    images: [],
    imageItems: [],
    layout: { type: 'stack', columns: 1 },
    sortOrder: formData.value.sections.length
  })
}

function removeSection(index: number) {
  formData.value.sections.splice(index, 1)
  // 重新排序
  formData.value.sections.forEach((section, i) => {
    section.sortOrder = i
  })
}

function updateSection(index: number, value: typeof formData.value.sections[0]) {
  formData.value.sections[index] = value
}

async function handleSave(status: 'draft' | 'published') {
  if (!formData.value.title.trim()) {
    alert('请填写文章标题')
    return
  }

  if (!formData.value.subtitle.trim()) {
    alert('请填写副标题')
    return
  }

  if (!formData.value.summary.trim()) {
    alert('请填写摘要')
    return
  }

  saving.value = true

  try {
    const payload = {
      ...formData.value,
      contentStatus: status
    }

    if (isEditMode.value) {
      await updateKnowledge(formData.value.id, payload)
      alert('干货更新成功')
    } else {
      const result = await createKnowledge(payload)
      alert('干货创建成功')
      router.push(`/knowledge/editor?id=${result.id}`)
    }
  } catch (error) {
    alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/knowledge/list')
}

onMounted(async () => {
  const articleId = typeof route.query.id === 'string' ? route.query.id : ''
  if (articleId) {
    try {
      formData.value = await getKnowledgeDetail(articleId)
    } catch (error) {
      alert('加载失败：' + (error instanceof Error ? error.message : '未知错误'))
      router.push('/knowledge/list')
    }
  }
})
</script>

<template>
  <div class="panel grid-gap-20">
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:28px;">{{ isEditMode ? '编辑干货' : '新建干货' }}</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">管理月龄喂养、健康护理与育儿经验文章。</div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="ghost-btn" @click="handleCancel" :disabled="saving">取消</button>
        <button class="ghost-btn" @click="handleSave('draft')" :disabled="saving">保存草稿</button>
        <button class="primary-btn" @click="handleSave('published')" :disabled="saving">
          {{ saving ? '保存中...' : '立即发布' }}
        </button>
      </div>
    </div>

    <div class="grid-gap-16">
      <section class="panel">
        <div class="panel-title" style="font-size:20px; margin-bottom:16px;">基础信息</div>
        <div class="grid-gap-16">
          <input v-model="formData.title" class="ghost-input" placeholder="文章标题" />
          <input v-model="formData.subtitle" class="ghost-input" placeholder="副标题" />
          <textarea v-model="formData.summary" class="ghost-textarea" rows="3" placeholder="文章摘要"></textarea>

          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">分类</label>
              <select v-model="formData.categoryKey" @change="updateCategory(formData.categoryKey)" class="ghost-select">
                <option v-for="cat in categories" :key="cat.key" :value="cat.key">{{ cat.label }}</option>
              </select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">内容类型</label>
              <select v-model="formData.contentType" class="ghost-select">
                <option value="article">文章</option>
                <option value="guide">指南</option>
                <option value="taboo">忌口</option>
              </select>
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">标签（用逗号分隔）</label>
            <input v-model="tagsString" class="ghost-input" placeholder="如：高铁,易消化,营养丰富" />
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">封面图</label>
            <ImageUploader v-model="formData.coverImage" placeholder="上传封面图" />
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" v-model="formData.isFeatured" id="featured" />
            <label for="featured" style="font-weight: 600; cursor: pointer;">设为精选文章</label>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title" style="font-size:20px; margin-bottom:16px;">文章内容</div>
        <div class="grid-gap-16">
          <textarea v-model="formData.content" class="ghost-textarea" rows="8" placeholder="文章主体内容（支持换行）"></textarea>
        </div>
      </section>

      <section class="panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div class="panel-title" style="font-size:20px;">详细段落</div>
          <button class="ghost-btn" @click="addSection">+ 添加段落</button>
        </div>
        <div class="grid-gap-16">
          <SectionEditor
            v-for="(section, index) in formData.sections"
            :key="index"
            :model-value="section"
            @update:model-value="updateSection(index, $event)"
            @remove="removeSection(index)"
          />
          <div v-if="formData.sections.length === 0" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
            暂无段落，点击上方按钮添加
          </div>
        </div>
      </section>
    </div>
  </div>
  <BackToTopButton />
</template>
