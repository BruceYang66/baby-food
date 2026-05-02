<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ImportEntityType, ImportFileFormat, ImportPreviewResponse } from '@baby-food/shared-types'
import { commitImport, downloadExport, previewImport, type ImportUploadPayload } from '@/services/api'

const emit = defineEmits<{
  imported: []
}>()

const fileInput = ref<HTMLInputElement>()
const entity = ref<ImportEntityType>('recipes')
const uploading = ref(false)
const previewing = ref(false)
const exporting = ref(false)
const preview = ref<ImportPreviewResponse | null>(null)
const payload = ref<ImportUploadPayload | null>(null)

const canCommit = computed(() => Boolean(payload.value) && Boolean(preview.value) && (preview.value?.summary.errors ?? 0) === 0)

function triggerFileSelect() {
  fileInput.value?.click()
}

function inferFormat(fileName: string): ImportFileFormat | null {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.json')) {
    return 'json'
  }
  if (lower.endsWith('.csv')) {
    return 'csv'
  }
  return null
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function buildRecipeJsonTemplate() {
  return JSON.stringify([
    {
      title: '鳕鱼西兰花软饭',
      summary: '适合 8-10 月宝宝的软饭食谱',
      coverImage: '/uploads/images/example-recipe.jpg',
      ageLabel: '8-10月',
      ageMinMonths: 8,
      ageMaxMonths: 10,
      durationLabel: '20分钟',
      difficultyLabel: '简单',
      contentStatus: 'draft',
      tags: ['高蛋白', '易消化'],
      ingredients: [
        { name: '鳕鱼', amount: '50', unit: 'g' },
        { name: '西兰花', amount: '30', unit: 'g' }
      ],
      steps: [
        { stepNo: 1, title: '步骤1', description: '西兰花焯水备用' },
        { stepNo: 2, title: '步骤2', description: '鳕鱼蒸熟后与米饭拌匀' }
      ]
    }
  ], null, 2)
}

function buildKnowledgeJsonTemplate() {
  return JSON.stringify([
    {
      title: '8-10月龄喂养重点',
      subtitle: '从泥糊到颗粒的过渡建议',
      summary: '帮助宝宝适应颗粒与自主进食。',
      coverImage: '/uploads/images/example-knowledge.jpg',
      categoryKey: 'feeding',
      categoryLabel: '月龄喂养',
      tags: ['月龄喂养', '颗粒过渡'],
      contentType: 'article',
      content: '这一阶段可以逐步增加食物颗粒感。',
      isFeatured: true,
      contentStatus: 'published',
      sections: [
        {
          title: '核心建议',
          content: '每天观察吞咽与咀嚼能力。',
          images: ['/uploads/images/example-section.jpg'],
          imageItems: [
            { url: '/uploads/images/example-section.jpg', style: 'rounded', aspectRatio: 'wide' }
          ],
          layout: { type: 'grid', columns: 2 },
          sortOrder: 0
        }
      ]
    }
  ], null, 2)
}

function buildRecipeCsvTemplate() {
  return [
    'id,title,summary,coverImage,ageLabel,ageMinMonths,ageMaxMonths,durationLabel,difficultyLabel,contentStatus,tags,ingredients,steps',
    ',鳕鱼西兰花软饭,适合 8-10 月宝宝的软饭食谱,/uploads/images/example-recipe.jpg,8-10月,8,10,20分钟,简单,draft,高蛋白|易消化,"[{""name"":""鳕鱼"",""amount"":""50"",""unit"":""g""},{""name"":""西兰花"",""amount"":""30"",""unit"":""g""}]","[{""stepNo"":1,""title"":""步骤1"",""description"":""西兰花焯水备用""},{""stepNo"":2,""title"":""步骤2"",""description"":""鳕鱼蒸熟后与米饭拌匀""}]"'
  ].join('\n')
}

function buildKnowledgeCsvTemplate() {
  return [
    'id,title,subtitle,summary,coverImage,categoryKey,categoryLabel,tags,contentType,content,isFeatured,contentStatus,sections',
    ',8-10月龄喂养重点,从泥糊到颗粒的过渡建议,帮助宝宝适应颗粒与自主进食。,/uploads/images/example-knowledge.jpg,feeding,月龄喂养,月龄喂养|颗粒过渡,article,这一阶段可以逐步增加食物颗粒感。,true,published,"[{""title"":""核心建议"",""content"":""每天观察吞咽与咀嚼能力。"",""images"": [""/uploads/images/example-section.jpg""],""imageItems"": [{""url"":""/uploads/images/example-section.jpg"",""style"":""rounded"",""aspectRatio"":""wide""}],""layout"": {""type"":""grid"",""columns"":2},""sortOrder"":0}]"'
  ].join('\n')
}

function downloadTemplate(format: ImportFileFormat) {
  const isRecipe = entity.value === 'recipes'
  const fileName = `${entity.value}-template.${format}`
  const content = format === 'json'
    ? (isRecipe ? buildRecipeJsonTemplate() : buildKnowledgeJsonTemplate())
    : (isRecipe ? buildRecipeCsvTemplate() : buildKnowledgeCsvTemplate())

  downloadTextFile(fileName, content, format === 'json' ? 'application/json' : 'text/csv')
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''

  if (!file) {
    return
  }

  const format = inferFormat(file.name)
  if (!format) {
    alert('当前仅支持 .json 或 .csv 文件导入')
    return
  }

  uploading.value = true

  try {
    const content = await file.text()
    const nextPayload = {
      fileName: file.name,
      format,
      content
    } satisfies ImportUploadPayload

    payload.value = nextPayload
    previewing.value = true
    preview.value = await previewImport(entity.value, nextPayload)
  } catch (error) {
    alert('导入预检失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    uploading.value = false
    previewing.value = false
  }
}

async function handleCommit() {
  if (!payload.value || !canCommit.value) {
    return
  }

  previewing.value = true

  try {
    const result = await commitImport(entity.value, payload.value)
    alert(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`)
    preview.value = null
    payload.value = null
    emit('imported')
  } catch (error) {
    alert('导入提交失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    previewing.value = false
  }
}

async function handleExport(format: ImportFileFormat) {
  exporting.value = true

  try {
    const result = await downloadExport(entity.value, format)
    const url = URL.createObjectURL(result.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.fileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="panel grid-gap-16">
    <input ref="fileInput" type="file" accept=".json,.csv" style="display:none;" @change="handleFileChange" />

    <div style="display:grid; grid-template-columns: 180px 1fr; gap:16px; align-items:center;">
      <div>
        <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">导入对象</label>
        <select v-model="entity" class="ghost-select" style="margin:0;">
          <option value="recipes">食谱库</option>
          <option value="knowledge">干货内容</option>
        </select>
      </div>
      <div style="font-size:14px; line-height:1.7; color:var(--admin-text-muted);">
        ① 下载 JSON / CSV 模板 → ② 按模板填写嵌套字段 → ③ 上传文件预检 → ④ 修正错误后提交导入。
      </div>
    </div>

    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <button class="ghost-btn" @click="downloadTemplate('json')">下载 JSON 模板</button>
      <button class="ghost-btn" @click="downloadTemplate('csv')">下载 CSV 模板</button>
      <button class="primary-btn" @click="triggerFileSelect" :disabled="uploading || previewing">{{ uploading || previewing ? '处理中...' : '上传并预检' }}</button>
      <button class="ghost-btn" @click="handleExport('json')" :disabled="exporting">导出 JSON</button>
      <button class="ghost-btn" @click="handleExport('csv')" :disabled="exporting">导出 CSV</button>
      <button class="primary-btn" @click="handleCommit" :disabled="!canCommit || previewing">提交导入</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:16px;">
      <section class="panel" style="background: var(--admin-surface-low);">
        <div class="panel-title" style="font-size:18px; margin-bottom:12px;">上传与校验</div>
        <div style="min-height:200px; border-radius:8px; background: rgba(255,255,255,0.8); padding:20px; color: var(--admin-text-muted); display:grid; gap:10px; align-content:start;">
          <div>支持格式：.json、.csv</div>
          <div>嵌套字段说明：</div>
          <div>• 食谱 ingredients / steps 使用 JSON 数组</div>
          <div>• 干货 sections 使用 JSON 数组，可携带 layout / imageItems</div>
          <div>• tags 使用 <code>|</code> 分隔或 JSON 数组</div>
          <div v-if="payload">当前文件：{{ payload.fileName }}</div>
        </div>
      </section>

      <section class="panel" style="background: var(--admin-surface-low);">
        <div class="panel-title" style="font-size:18px; margin-bottom:12px;">校验结果</div>
        <div v-if="preview" class="table-shell">
          <div class="table-row" style="grid-template-columns: 90px 1fr 120px;">
            <div>有效行</div><div>{{ preview.summary.valid }} 行</div><div style="color: var(--admin-primary); font-weight: 700;">通过</div>
          </div>
          <div class="table-row" style="grid-template-columns: 90px 1fr 120px;">
            <div>警告行</div><div>{{ preview.summary.warnings }} 行</div><div style="color: var(--admin-warning); font-weight: 700;">可导入</div>
          </div>
          <div class="table-row" style="grid-template-columns: 90px 1fr 120px;">
            <div>错误行</div><div>{{ preview.summary.errors }} 行</div><div style="color: var(--admin-danger); font-weight: 700;">需修正</div>
          </div>
        </div>
        <div v-else style="min-height:200px; border-radius:8px; background: rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; color: var(--admin-text-muted);">
          上传文件后显示预检摘要
        </div>
      </section>
    </div>

    <section v-if="preview" class="panel" style="background: var(--admin-surface-low);">
      <div class="panel-title" style="font-size:18px; margin-bottom:12px;">逐行结果</div>
      <div class="table-shell">
        <div class="table-row" style="grid-template-columns: 80px 1fr 120px 1.5fr; background: transparent; padding: 0; color: var(--admin-text-muted); font-size:12px; text-transform:uppercase; letter-spacing:0.12em;">
          <div>行号</div><div>标题</div><div>状态</div><div>问题</div>
        </div>
        <div v-for="row in preview.rows" :key="row.rowNumber" class="table-row" style="grid-template-columns: 80px 1fr 120px 1.5fr;">
          <div>{{ row.rowNumber }}</div>
          <div>{{ row.title }}</div>
          <div>
            <span :style="row.status === 'error' ? 'color: var(--admin-danger); font-weight: 700;' : row.status === 'warning' ? 'color: var(--admin-warning); font-weight: 700;' : 'color: var(--admin-primary); font-weight: 700;'">
              {{ row.status }}
            </span>
          </div>
          <div>
            <template v-if="row.issues.length > 0">
              <div v-for="issue in row.issues" :key="`${row.rowNumber}-${issue.field}-${issue.message}`" style="font-size:13px; line-height:1.6;">
                {{ issue.field }}：{{ issue.message }}
              </div>
            </template>
            <span v-else style="color: var(--admin-text-muted);">无</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
