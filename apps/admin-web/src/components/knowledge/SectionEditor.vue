<script setup lang="ts">
import { computed } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'

const props = defineProps<{
  modelValue: {
    id?: string
    title: string
    content: string
    images: string[]
    imageItems?: Array<{
      url: string
      style?: 'rounded' | 'square'
      aspectRatio?: 'wide' | 'square' | 'portrait'
    }>
    layout?: {
      type: 'stack' | 'grid' | 'carousel'
      columns?: 1 | 2 | 3
    }
    sortOrder: number
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
  remove: []
}>()

const normalizedImageItems = computed(() => {
  if (props.modelValue.imageItems && props.modelValue.imageItems.length > 0) {
    return props.modelValue.imageItems
  }
  return props.modelValue.images.map((url) => ({
    url,
    style: 'rounded' as const,
    aspectRatio: 'wide' as const
  }))
})

const normalizedLayout = computed(() => props.modelValue.layout ?? { type: 'stack' as const, columns: 1 as const })

function updateField<K extends keyof typeof props.modelValue>(field: K, value: typeof props.modelValue[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function updateImageItems(items: typeof normalizedImageItems.value) {
  emit('update:modelValue', {
    ...props.modelValue,
    images: items.map((item) => item.url).filter(Boolean),
    imageItems: items
  })
}

function addImage() {
  updateImageItems([
    ...normalizedImageItems.value,
    { url: '', style: 'rounded', aspectRatio: 'wide' }
  ])
}

function updateImage(index: number, patch: Partial<(typeof normalizedImageItems.value)[number]>) {
  const items = normalizedImageItems.value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
  updateImageItems(items)
}

function removeImage(index: number) {
  updateImageItems(normalizedImageItems.value.filter((_, itemIndex) => itemIndex !== index))
}

function updateLayoutType(type: 'stack' | 'grid' | 'carousel') {
  const currentColumns = normalizedLayout.value.columns
  updateField('layout', {
    type,
    columns: type === 'grid' ? (currentColumns === 2 || currentColumns === 3 ? currentColumns : 2) : 1
  })
}

function updateLayoutColumns(columns: 1 | 2 | 3) {
  updateField('layout', {
    ...normalizedLayout.value,
    columns
  })
}
</script>

<template>
  <div class="section-editor panel">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div class="panel-title" style="font-size: 18px;">段落 {{ props.modelValue.sortOrder + 1 }}</div>
      <button class="ghost-btn" style="padding: 6px 12px;" @click="emit('remove')">删除段落</button>
    </div>

    <div class="grid-gap-16">
      <input
        :value="props.modelValue.title"
        @input="updateField('title', ($event.target as HTMLInputElement).value)"
        class="ghost-input"
        placeholder="段落标题（可选）"
      />

      <textarea
        :value="props.modelValue.content"
        @input="updateField('content', ($event.target as HTMLTextAreaElement).value)"
        class="ghost-textarea"
        rows="6"
        placeholder="段落内容"
      ></textarea>

      <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">布局模式</label>
          <select :value="normalizedLayout.type" class="ghost-select" @change="updateLayoutType(($event.target as HTMLSelectElement).value as 'stack' | 'grid' | 'carousel')">
            <option value="stack">纵向堆叠</option>
            <option value="grid">多列网格</option>
            <option value="carousel">横向滑动</option>
          </select>
        </div>

        <div v-if="normalizedLayout.type === 'grid'">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">网格列数</label>
          <select :value="normalizedLayout.columns ?? 2" class="ghost-select" @change="updateLayoutColumns(Number(($event.target as HTMLSelectElement).value) as 1 | 2 | 3)">
            <option :value="2">2 列</option>
            <option :value="3">3 列</option>
          </select>
        </div>
      </div>

      <div v-if="normalizedImageItems.length > 0" class="images-grid">
        <div v-for="(image, index) in normalizedImageItems" :key="index" class="image-item panel">
          <ImageUploader
            :model-value="image.url"
            @update:model-value="updateImage(index, { url: $event })"
            placeholder="上传段落图片"
          />

          <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:12px; margin-top: 12px;">
            <div>
              <label style="display:block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">圆角样式</label>
              <select :value="image.style ?? 'rounded'" class="ghost-select" @change="updateImage(index, { style: ($event.target as HTMLSelectElement).value as 'rounded' | 'square' })">
                <option value="rounded">圆角</option>
                <option value="square">直角</option>
              </select>
            </div>
            <div>
              <label style="display:block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">图片比例</label>
              <select :value="image.aspectRatio ?? 'wide'" class="ghost-select" @change="updateImage(index, { aspectRatio: ($event.target as HTMLSelectElement).value as 'wide' | 'square' | 'portrait' })">
                <option value="wide">横图</option>
                <option value="square">方图</option>
                <option value="portrait">竖图</option>
              </select>
            </div>
          </div>

          <button class="ghost-btn" style="margin-top: 12px; width: 100%;" @click="removeImage(index)">移除图片</button>
        </div>
      </div>

      <button class="ghost-btn" style="justify-self: start;" @click="addImage">+ 添加图片</button>
    </div>
  </div>
</template>

<style scoped>
.section-editor {
  background: rgba(0, 93, 170, 0.02);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.image-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7);
}
</style>
