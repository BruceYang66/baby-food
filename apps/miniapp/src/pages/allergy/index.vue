<script setup lang="ts">
import { computed, ref } from 'vue'
import AppNavBar from '@/components/common/AppNavBar.vue'
import { readAuthSession, updateBabyProfile } from '@/services/api'

const session = readAuthSession()
const babyId = session?.babyProfile?.id ?? ''
const isOwner = session?.babyProfile?.isOwner === true
const allergens = ref<string[]>([...(session?.babyProfile?.allergens ?? [])])
const newAllergen = ref('')
const saving = ref(false)

const hasChanged = computed(() => {
  const original = session?.babyProfile?.allergens ?? []
  return JSON.stringify([...allergens.value].sort()) !== JSON.stringify([...original].sort())
})

function addAllergen() {
  if (!isOwner) {
    return
  }

  const value = newAllergen.value.trim()
  if (!value) return
  if (allergens.value.includes(value)) {
    uni.showToast({ title: '已在列表中', icon: 'none' })
    return
  }
  allergens.value = [...allergens.value, value]
  newAllergen.value = ''
}

function removeAllergen(item: string) {
  if (!isOwner) {
    return
  }

  allergens.value = allergens.value.filter((a) => a !== item)
}

async function saveChanges() {
  if (!isOwner) {
    uni.showToast({ title: '当前亲友仅可查看过敏信息', icon: 'none' })
    return
  }

  if (!babyId) {
    uni.showToast({ title: '未找到宝宝档案', icon: 'none' })
    return
  }

  const baby = session?.babyProfile
  if (!baby) return

  saving.value = true
  try {
    await updateBabyProfile(babyId, {
      nickname: baby.nickname,
      birthDate: baby.birthDate,
      allergens: allergens.value
    })
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <view class="page-shell">
    <AppNavBar title="过敏管理" subtitle="管理宝宝已知过敏原" :show-back="true" />

    <view class="allergy-card card">
      <text class="allergy-title">已记录过敏原</text>

      <view v-if="allergens.length" class="pill-row">
        <view v-for="item in allergens" :key="item" class="pill">
          <text class="pill-text">{{ item }}</text>
          <text v-if="isOwner" class="pill-del" @tap="removeAllergen(item)">×</text>
        </view>
      </view>
      <text v-else class="allergy-empty">{{ isOwner ? '还没有记录过敏原，可在下方添加。' : '当前还没有记录过敏原。' }}</text>

      <view v-if="isOwner" class="add-row">
        <input
          v-model="newAllergen"
          class="add-input"
          placeholder="输入过敏原，如：鸡蛋"
          maxlength="20"
          confirm-type="done"
          @confirm="addAllergen"
        />
        <view class="add-btn" @tap="addAllergen">添加</view>
      </view>
      <view v-else class="readonly-tip soft-card">
        <text class="readonly-text">当前为亲友查看模式，仅宝宝创建者可以修改过敏信息。</text>
      </view>
    </view>

    <view v-if="isOwner && hasChanged" class="save-bar">
      <view class="save-btn" @tap="saveChanges">{{ saving ? '保存中...' : '保存修改' }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.allergy-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.allergy-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 28rpx;
}

.pill {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(214, 106, 106, 0.12);
}

.pill-text {
  color: #a94f4f;
  font-size: 24rpx;
  font-weight: 700;
}

.pill-del {
  color: #a94f4f;
  font-size: 28rpx;
  line-height: 1;
  opacity: 0.7;
}

.allergy-empty {
  display: block;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.add-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.add-input {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  padding: 0 22rpx;
  font-size: 26rpx;
}

.add-btn {
  padding: 0 32rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.readonly-tip {
  margin-top: 24rpx;
  padding: 24rpx;
}

.readonly-text {
  display: block;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--mini-text-muted);
}

.save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(253, 248, 243, 0.95);
}

.save-btn {
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  text-align: center;
  line-height: 96rpx;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
