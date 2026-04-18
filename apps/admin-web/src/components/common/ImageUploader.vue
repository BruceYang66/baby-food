<script setup lang="ts">
import { ref, computed } from 'vue'
import { normalizeImageUrl } from '@/services/api'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploading = ref(false)
const dragOver = ref(false)

// 计算显示的图片URL（兼容相对路径和完整URL）
const displayImageUrl = computed(() => normalizeImageUrl(props.modelValue || ''))

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:3000'

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await uploadFile(file)
  }
}

async function handleDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    await uploadFile(file)
  }
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/admin/upload/image`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (result.ok && result.data?.url) {
      // 返回相对路径，前端显示时会自动拼接域名
      emit('update:modelValue', result.data.url)
    } else {
      alert(result.message || '上传失败')
    }
  } catch (error) {
    alert('上传失败：' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    uploading.value = false
  }
}

function clearImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-uploader">
    <div
      v-if="!props.modelValue"
      class="upload-area"
      :class="{ 'drag-over': dragOver, uploading }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput?.click()"
    >
      <div v-if="uploading" class="upload-status">
        <div class="spinner"></div>
        <span>上传中...</span>
      </div>
      <div v-else class="upload-prompt">
        <span class="upload-icon">📷</span>
        <span class="upload-text">{{ placeholder || '点击或拖拽上传图片' }}</span>
        <span class="upload-hint">支持 JPG、PNG、GIF、WebP，最大 5MB</span>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <div v-else class="image-preview">
      <img :src="displayImageUrl" :alt="placeholder" />
      <button class="clear-btn" @click="clearImage">✕</button>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed rgba(0, 93, 170, 0.3);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 93, 170, 0.02);
}

.upload-area:hover {
  border-color: rgba(0, 93, 170, 0.5);
  background: rgba(0, 93, 170, 0.05);
}

.upload-area.drag-over {
  border-color: #005daa;
  background: rgba(0, 93, 170, 0.1);
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.upload-icon {
  font-size: 48px;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #005daa;
}

.upload-hint {
  font-size: 13px;
  color: #6B625B;
}

.upload-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 93, 170, 0.2);
  border-top-color: #005daa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
