<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppNavBar from '@/components/common/AppNavBar.vue'
import TagChip from '@/components/common/TagChip.vue'
import DatePickerModal from '@/components/common/DatePickerModal.vue'
import {
  createCloudAlbumEntry,
  deleteCloudAlbumEntry,
  ensureProtectedPageAccess,
  getCloudAlbumEntryDetail,
  readAuthSession,
  updateCloudAlbumEntry,
  uploadCloudAlbumAsset
} from '@/services/api'

interface DraftImage {
  id: string
  path: string
  assetId?: string
}

const MAX_IMAGE_COUNT = 9

const editingEntryId = ref('')
const loading = ref(false)
const tagInput = ref('')
const draftImages = ref<DraftImage[]>([])
const tags = ref<string[]>([])
const content = ref('')
const isMilestone = ref(false)
const visibility = ref<'family' | 'self'>('family')
const recordedDate = ref(getTodayYmd())
const recordedTime = ref(getCurrentTime())
const showDatePicker = ref(false)
const submitting = ref(false)
const activeBabyName = ref('')

const isEditMode = computed(() => !!editingEntryId.value)
const pageTitle = computed(() => isEditMode.value ? '编辑记录' : '发布照片')
const pageSubtitle = computed(() => activeBabyName.value ? `${activeBabyName}的云相册` : '云相册记录')
const visibilityLabel = computed(() => visibility.value === 'family' ? '所有亲友' : '仅自己')
const remainingCount = computed(() => Math.max(0, MAX_IMAGE_COUNT - draftImages.value.length))
const canAddMoreImages = computed(() => remainingCount.value > 0)
const bottomHint = computed(() => `${draftImages.value.length}/${MAX_IMAGE_COUNT} 张图片`)

function getTodayYmd() {
  const now = new Date()
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`
}

function getCurrentTime() {
  const now = new Date()
  return `${`${now.getHours()}`.padStart(2, '0')}:${`${now.getMinutes()}`.padStart(2, '0')}`
}

function syncSessionState() {
  const session = readAuthSession()
  activeBabyName.value = session?.babyProfile?.nickname || ''
}

function applyEntry(entry: Awaited<ReturnType<typeof getCloudAlbumEntryDetail>>['entry']) {
  content.value = entry.content
  tags.value = [...entry.tags]
  isMilestone.value = entry.isMilestone
  visibility.value = entry.visibility
  recordedDate.value = entry.recordedDate
  recordedTime.value = entry.recordedAt.slice(11, 16)
  draftImages.value = entry.assets.map((asset) => ({
    id: `remote-${asset.id}`,
    path: asset.url,
    assetId: asset.id
  }))
}

async function loadEntryDetail(entryId: string) {
  loading.value = true
  try {
    const data = await getCloudAlbumEntryDetail(entryId)
    editingEntryId.value = entryId
    activeBabyName.value = data.babyProfile?.nickname || activeBabyName.value
    applyEntry(data.entry)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '记录加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function addTag(rawTag = tagInput.value) {
  const nextTag = rawTag.trim()
  if (!nextTag) {
    return
  }
  if (tags.value.includes(nextTag)) {
    tagInput.value = ''
    return
  }
  tags.value = [...tags.value, nextTag]
  tagInput.value = ''
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((item) => item !== tag)
}

function chooseVisibility() {
  uni.showActionSheet({
    itemList: ['所有亲友', '仅自己'],
    success: ({ tapIndex }) => {
      visibility.value = tapIndex === 1 ? 'self' : 'family'
    }
  })
}

function previewImage(currentPath: string) {
  uni.previewImage({
    current: currentPath,
    urls: draftImages.value.map((item) => item.path)
  })
}

function removeImage(imageId: string) {
  draftImages.value = draftImages.value.filter((item) => item.id !== imageId)
}

function chooseImages() {
  if (!canAddMoreImages.value) {
    uni.showToast({ title: '最多上传 9 张', icon: 'none' })
    return
  }

  uni.chooseImage({
    count: remainingCount.value,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const nextImages = res.tempFilePaths
        .filter((path) => !draftImages.value.some((item) => item.path === path))
        .map((path, index) => ({
          id: `${Date.now()}-${index}`,
          path
        }))
      draftImages.value = [...draftImages.value, ...nextImages].slice(0, MAX_IMAGE_COUNT)
    },
    fail: (error) => {
      if (typeof error?.errMsg === 'string' && error.errMsg.includes('cancel')) {
        return
      }
      uni.showToast({ title: '选图失败，请重试', icon: 'none' })
    }
  })
}

async function submitEntry() {
  if (submitting.value || loading.value) {
    return
  }

  if (!draftImages.value.length) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }

  submitting.value = true
  uni.showLoading({ title: isEditMode.value ? '正在更新...' : '正在保存...' })

  try {
    const recordedAt = `${recordedDate.value}T${recordedTime.value}:00`

    if (isEditMode.value) {
      const retainedAssetIds = draftImages.value.filter((item) => item.assetId).map((item) => item.assetId as string)
      const pendingImages = draftImages.value
        .map((item, index) => ({ ...item, uploadIndex: index }))
        .filter((item) => !item.assetId)

      await updateCloudAlbumEntry(editingEntryId.value, {
        content: content.value.trim(),
        tags: tags.value,
        isMilestone: isMilestone.value,
        visibility: visibility.value,
        recordedAt,
        retainedAssetIds,
        newAssetCount: pendingImages.length
      })

      for (const image of pendingImages) {
        await uploadCloudAlbumAsset(editingEntryId.value, image.path, image.uploadIndex)
      }

      uni.hideLoading()
      uni.showToast({ title: '已更新云相册', icon: 'success' })
      uni.navigateBack({ delta: 1 })
      return
    }

    const { entryId } = await createCloudAlbumEntry({
      content: content.value.trim(),
      tags: tags.value,
      isMilestone: isMilestone.value,
      visibility: visibility.value,
      recordedAt,
      assetCount: draftImages.value.length
    })

    // 先建条目再逐张上传，便于沿用现有单图接口并稳定维护图片顺序。
    for (let index = 0; index < draftImages.value.length; index++) {
      await uploadCloudAlbumAsset(entryId, draftImages.value[index].path, index)
    }

    uni.hideLoading()
    uni.showToast({ title: '已保存到云相册', icon: 'success' })
    uni.navigateBack({ delta: 1 })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function removeEntry() {
  if (!isEditMode.value || submitting.value) {
    return
  }

  const result = await uni.showModal({
    title: '删除记录',
    content: '删除后这条相册记录和其中图片都将不可恢复，确定删除吗？'
  })

  if (!result.confirm) {
    return
  }

  submitting.value = true
  uni.showLoading({ title: '正在删除...' })
  try {
    await deleteCloudAlbumEntry(editingEntryId.value)
    uni.hideLoading()
    uni.showToast({ title: '已删除', icon: 'success' })
    uni.navigateBack({ delta: 1 })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error instanceof Error ? error.message : '删除失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  if (!ensureProtectedPageAccess()) {
    return
  }

  syncSessionState()

  if (typeof options?.entryId === 'string' && options.entryId) {
    void loadEntryDetail(options.entryId)
  }
})
</script>

<template>
  <view class="page-shell editor-page">
    <AppNavBar :title="pageTitle" :subtitle="pageSubtitle" :show-back="true" />

    <view class="editor-card card" :class="{ skeleton: loading }">
      <textarea
        v-model="content"
        class="content-input"
        maxlength="300"
        :disabled="loading"
        placeholder="写点什么，记录宝宝当下的样子..."
        placeholder-class="content-placeholder"
      />

      <view class="image-grid">
        <view v-for="image in draftImages" :key="image.id" class="image-item">
          <image class="image-thumb" :src="image.path" mode="aspectFill" @tap="previewImage(image.path)" />
          <view class="image-remove" @tap="removeImage(image.id)">×</view>
        </view>
        <view v-if="canAddMoreImages && !loading" class="image-add" @tap="chooseImages">
          <text class="image-add-icon">+</text>
          <text class="image-add-text">添加照片</text>
        </view>
      </view>
      <text class="image-helper">仅支持图片，最多 9 张</text>
    </view>

    <view class="form-card card" :class="{ skeleton: loading }">
      <view class="field-block">
        <view class="field-head">
          <text class="field-label">标签</text>
          <view class="field-add" @tap="addTag()">添加</view>
        </view>
        <view class="tag-input-row">
          <input v-model="tagInput" :disabled="loading" class="tag-input" type="text" maxlength="12" placeholder="输入标签，如：第一次春游" @confirm="addTag()" />
        </view>
        <view v-if="tags.length" class="tag-list">
          <view v-for="tag in tags" :key="tag" class="tag-pill" @tap="removeTag(tag)">
            <TagChip :text="tag" accent="primary" />
            <text class="tag-remove">×</text>
          </view>
        </view>
      </view>

      <view class="switch-row">
        <view>
          <text class="row-title">标记为大事记</text>
          <text class="row-desc">重要时刻会在月汇总中优先展示</text>
        </view>
        <switch :checked="isMilestone" :disabled="loading" color="var(--mini-primary)" @change="(e) => isMilestone = !!e.detail.value" />
      </view>

      <view class="info-row" @tap="!loading && chooseVisibility()">
        <view>
          <text class="row-title">谁可以看</text>
          <text class="row-desc">控制这条相册记录的可见范围</text>
        </view>
        <view class="row-value">
          <text class="row-value-text">{{ visibilityLabel }}</text>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <view class="info-row" @tap="!loading && (showDatePicker = true)">
        <view>
          <text class="row-title">记录日期</text>
          <text class="row-desc">时间轴会按这一天归档</text>
        </view>
        <view class="row-value">
          <text class="row-value-text">{{ recordedDate }}</text>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <view class="info-row compact">
        <view>
          <text class="row-title">记录时间</text>
          <text class="row-desc">补全当天发生的具体时刻</text>
        </view>
        <picker mode="time" :value="recordedTime" :disabled="loading" @change="(e) => recordedTime = e.detail.value">
          <view class="row-value">
            <text class="row-value-text">{{ recordedTime }}</text>
            <text class="row-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="bottom-meta">
        <text class="bottom-title">{{ isEditMode ? '修改这条云相册记录' : '准备发布到云相册' }}</text>
        <text class="bottom-desc">{{ bottomHint }}</text>
      </view>
      <view v-if="isEditMode" class="bottom-delete" :class="{ disabled: submitting }" @tap="removeEntry">删除</view>
      <view class="bottom-submit" :class="{ disabled: submitting || loading || !draftImages.length }" @tap="submitEntry">保存</view>
    </view>

    <DatePickerModal
      :show="showDatePicker"
      :value="recordedDate"
      title="选择记录日期"
      label="记录日期"
      @close="showDatePicker = false"
      @confirm="(value) => { recordedDate = value; showDatePicker = false }"
    />
  </view>
</template>

<style scoped lang="scss">
.editor-page {
  padding-bottom: 220rpx;
}

.editor-card,
.form-card {
  margin-top: 20rpx;
  padding: 28rpx;
}

.skeleton {
  opacity: 0.82;
}

.content-input {
  width: 100%;
  min-height: 180rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: var(--mini-text);
}

.content-placeholder {
  color: var(--mini-text-muted);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.image-item,
.image-add {
  position: relative;
  height: 200rpx;
  border-radius: 28rpx;
  overflow: hidden;
}

.image-thumb {
  width: 100%;
  height: 100%;
  display: block;
}

.image-remove {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  background: rgba(29, 27, 25, 0.56);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.image-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background: var(--mini-surface);
  border: 2rpx dashed rgba(0, 93, 170, 0.2);
  color: var(--mini-text-muted);
}

.image-add-icon {
  font-size: 56rpx;
  line-height: 1;
  color: var(--mini-primary-deep);
}

.image-add-text,
.image-helper,
.row-desc,
.bottom-desc {
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.image-helper {
  display: block;
  margin-top: 16rpx;
}

.field-block + .switch-row,
.switch-row + .info-row,
.info-row + .info-row {
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 2rpx solid rgba(0, 93, 170, 0.08);
}

.field-head,
.switch-row,
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.field-label,
.row-title,
.bottom-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.field-add {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(0, 93, 170, 0.1);
  color: var(--mini-primary-deep);
  font-size: 22rpx;
  font-weight: 700;
}

.tag-input-row {
  margin-top: 16rpx;
}

.tag-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: var(--mini-surface);
  font-size: 26rpx;
  color: var(--mini-text);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 18rpx;
}

.tag-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.tag-remove {
  font-size: 24rpx;
  color: var(--mini-text-muted);
}

.row-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.row-value-text {
  font-size: 26rpx;
  color: var(--mini-primary-deep);
}

.row-arrow {
  font-size: 28rpx;
  color: var(--mini-text-muted);
}

.bottom-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 24rpx);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 44rpx rgba(0, 0, 0, 0.1);
}

.bottom-meta {
  flex: 1;
}

.bottom-delete,
.bottom-submit {
  min-width: 168rpx;
  height: 84rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.bottom-delete {
  background: rgba(214, 106, 106, 0.14);
  color: #a94f4f;
}

.bottom-submit {
  background: var(--mini-primary);
  color: #fff;
}

.bottom-delete.disabled,
.bottom-submit.disabled {
  opacity: 0.45;
}
</style>
