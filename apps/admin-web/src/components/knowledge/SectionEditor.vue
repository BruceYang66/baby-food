<script setup lang="ts">
import { ref } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'

const props = defineProps<{
  modelValue: {
    id?: string
    title: string
    content: string
    images: string[]
    sortOrder: number
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
  remove: []
}>()

function updateField<K extends keyof typeof props.modelValue>(field: K, value: typeof props.modelValue[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function addImage() {
  const images = [...props.modelValue.images, '']
  emit('update:modelValue', { ...props.modelValue, images })
}

function updateImage(index: number, url: string) {
  const images = [...props.modelValue.images]
  images[index] = url
  emit('update:modelValue', { ...props.modelValue, images })
}

function removeImage(index: number) {
  const images = props.modelValue.images.filter((_, i) => i !== index)
  emit('update:modelValue', { ...props.modelValue, images })
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

      <div v-if="props.modelValue.images.length > 0" class="images-grid">
        <div v-for="(image, index) in props.modelValue.images" :key="index" class="image-item">
          <ImageUploader
            :model-value="image"
            @update:model-value="updateImage(index, $event)"
            placeholder="上传段落图片"
          />
          <button class="ghost-btn" style="margin-top: 8px; width: 100%;" @click="removeImage(index)">移除图片</button>
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  display: flex;
  flex-direction: column;
}
</style>
