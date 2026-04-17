<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import type { BabyProfile, FamilyInvite, FamilyMember, FamilyRole } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import {
  acceptFamilyInvite,
  createFamilyInvite,
  ensureProtectedPageAccess,
  getFamilyInvites,
  getFamilyMembers
} from '@/services/api'

const currentBaby = ref<BabyProfile | null>(null)
const members = ref<FamilyMember[]>([])
const invites = ref<FamilyInvite[]>([])
const loading = ref(true)
const creatingInvite = ref(false)
const acceptingInvite = ref(false)
const sharingInvite = ref(false)
const inviteRole = ref<FamilyRole>('editor')
const acceptCode = ref('')
const targetBabyId = ref('')
const sharedInviteCode = ref('')
const autoAcceptedInviteCode = ref('')
const pendingShareInvite = ref<FamilyInvite | null>(null)

const canCreateInvite = computed(() => currentBaby.value?.role === 'owner')
const pageSubtitle = computed(() => {
  if (!currentBaby.value) {
    return sharedInviteCode.value ? '确认加入家人分享的宝宝家庭' : '输入邀请码加入宝宝家庭'
  }

  return canCreateInvite.value ? '邀请家人共同查看计划与记录' : '查看家庭成员与当前权限'
})
const heroDesc = computed(() => {
  if (!currentBaby.value) {
    return ''
  }

  return canCreateInvite.value
    ? `当前家庭共 ${members.value.length} 位成员，待处理邀请 ${pendingInviteCount.value} 个。`
    : `当前家庭共 ${members.value.length} 位成员，你当前为${getRoleLabel(currentBaby.value.role)}。`
})
const pendingInviteCount = computed(() => invites.value.filter((invite) => invite.status === 'pending').length)
const shareInvite = computed(() => pendingShareInvite.value ?? invites.value.find((invite) => invite.status === 'pending') ?? null)
const joinCardTitle = computed(() => sharedInviteCode.value ? '点击即可加入家人分享的家庭' : '输入邀请码加入家庭')
const joinCardDesc = computed(() => sharedInviteCode.value
  ? '已识别分享邀请，点击下方按钮可直接加入；若失败，也可手动输入或修改邀请码。'
  : '登录后输入家人发来的邀请码，即可加入对应宝宝的家庭协作。')
const joinButtonText = computed(() => {
  if (acceptingInvite.value) {
    return '加入中...'
  }

  return sharedInviteCode.value ? '一键加入家庭' : '确认加入'
})

const roleOptions: Array<{ value: FamilyRole; label: string; desc: string }> = [
  { value: 'editor', label: '协作成员', desc: '可查看并编辑计划与记录' },
  { value: 'viewer', label: '只读成员', desc: '可查看家庭信息，不可编辑' }
]

onLoad((options) => {
  targetBabyId.value = typeof options?.babyId === 'string' ? options.babyId : ''
  sharedInviteCode.value = typeof options?.inviteCode === 'string' ? options.inviteCode.trim().toUpperCase() : ''
  acceptCode.value = sharedInviteCode.value
})

onShow(async () => {
  if (!ensureProtectedPageAccess({ allowNoBaby: true })) {
    return
  }

  if (sharedInviteCode.value && autoAcceptedInviteCode.value !== sharedInviteCode.value) {
    await handleAcceptInvite(sharedInviteCode.value, true)
    return
  }

  await loadFamilyData(targetBabyId.value || undefined)
})

onShareAppMessage(() => {
  const invite = shareInvite.value
  const queryParts = [
    currentBaby.value?.id ? `babyId=${encodeURIComponent(currentBaby.value.id)}` : '',
    invite?.inviteCode ? `inviteCode=${encodeURIComponent(invite.inviteCode)}` : ''
  ].filter(Boolean)

  return {
    title: currentBaby.value ? `邀请你加入${currentBaby.value.nickname}的家庭协作` : '邀请你加入宝宝家庭协作',
    path: `/pages/family/index${queryParts.length ? `?${queryParts.join('&')}` : ''}`
  }
})

onShareTimeline(() => {
  const invite = shareInvite.value
  const queryParts = [
    currentBaby.value?.id ? `babyId=${encodeURIComponent(currentBaby.value.id)}` : '',
    invite?.inviteCode ? `inviteCode=${encodeURIComponent(invite.inviteCode)}` : ''
  ].filter(Boolean)

  return {
    title: currentBaby.value ? `邀请你加入${currentBaby.value.nickname}的家庭协作` : '邀请你加入宝宝家庭协作',
    query: queryParts.join('&')
  }
})

async function loadFamilyData(babyId?: string) {
  loading.value = true
  pendingShareInvite.value = null
  try {
    const memberData = await getFamilyMembers(babyId)
    const baby = memberData.baby ?? null

    currentBaby.value = baby
    members.value = memberData.members ?? []

    if (!baby?.id) {
      invites.value = []
      targetBabyId.value = ''
      pendingShareInvite.value = null
      return
    }

    targetBabyId.value = baby.id

    const inviteData = await getFamilyInvites(baby.id)
    invites.value = inviteData.invites ?? []
  } catch (error) {
    const message = error instanceof Error ? error.message : '家庭信息加载失败'
    if (message.includes('未找到可访问的宝宝档案')) {
      currentBaby.value = null
      members.value = []
      invites.value = []
      targetBabyId.value = ''
      pendingShareInvite.value = null
    } else {
      uni.showToast({ title: message, icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

async function ensureShareInvite() {
  const pendingInvite = invites.value.find((invite) => invite.status === 'pending' && invite.role === inviteRole.value)
  if (pendingInvite) {
    pendingShareInvite.value = pendingInvite
    return pendingInvite
  }

  if (!currentBaby.value) {
    throw new Error('当前没有可分享的宝宝档案')
  }

  const data = await createFamilyInvite({
    babyId: currentBaby.value.id,
    role: inviteRole.value
  })

  invites.value = [data.invite, ...invites.value.filter((invite) => invite.id !== data.invite.id)]
  pendingShareInvite.value = data.invite
  return data.invite
}

async function handleCreateInvite() {
  if (creatingInvite.value || !currentBaby.value) return
  if (!canCreateInvite.value) {
    uni.showToast({ title: '只有拥有者可以邀请成员', icon: 'none' })
    return
  }

  creatingInvite.value = true
  try {
    const data = await createFamilyInvite({
      babyId: currentBaby.value.id,
      role: inviteRole.value
    })
    invites.value = [data.invite, ...invites.value.filter((invite) => invite.id !== data.invite.id)]
    pendingShareInvite.value = data.invite
    uni.showModal({
      title: '邀请码已生成',
      content: `邀请码：${data.invite.inviteCode}\n可复制邀请码，或点击“直接分享给家人”发送当前邀请链接。`,
      showCancel: false
    })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '邀请码生成失败', icon: 'none' })
  } finally {
    creatingInvite.value = false
  }
}

async function handleShareInvite(invite?: FamilyInvite) {
  if (sharingInvite.value) {
    return
  }

  if (!currentBaby.value || !canCreateInvite.value) {
    uni.showToast({ title: '只有拥有者可以发起分享邀请', icon: 'none' })
    return
  }

  sharingInvite.value = true
  try {
    pendingShareInvite.value = invite ?? await ensureShareInvite()
    uni.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
    uni.showToast({ title: '点击右上角 ··· 转发给家人', icon: 'none', duration: 1800 })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '分享邀请创建失败', icon: 'none' })
  } finally {
    sharingInvite.value = false
  }
}

async function handleAcceptInvite(inviteCode = acceptCode.value.trim(), isAutoJoin = false) {
  const normalizedCode = inviteCode.trim().toUpperCase()
  if (acceptingInvite.value || !normalizedCode) {
    if (!normalizedCode) {
      uni.showToast({ title: '请输入邀请码', icon: 'none' })
    }
    return
  }

  acceptingInvite.value = true
  try {
    const data = await acceptFamilyInvite(normalizedCode)
    sharedInviteCode.value = ''
    autoAcceptedInviteCode.value = normalizedCode
    acceptCode.value = ''
    targetBabyId.value = data.baby.id
    uni.showToast({ title: '已加入家庭', icon: 'success' })
    await loadFamilyData(data.baby.id)
  } catch (error) {
    if (isAutoJoin) {
      autoAcceptedInviteCode.value = normalizedCode
      acceptCode.value = normalizedCode
      await loadFamilyData(targetBabyId.value || undefined)
    }

    uni.showToast({ title: error instanceof Error ? error.message : '加入失败，请重试', icon: 'none' })
  } finally {
    acceptingInvite.value = false
  }
}

function copyInviteCode(inviteCode: string) {
  // #ifdef H5
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(inviteCode).then(() => {
      uni.showToast({ title: '邀请码已复制', icon: 'success' })
    }).catch(() => {
      uni.showToast({ title: '复制失败，请手动复制', icon: 'none' })
    })
  } else {
    uni.showToast({ title: `邀请码：${inviteCode}`, icon: 'none', duration: 3000 })
  }
  // #endif

  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: inviteCode,
    success: () => {
      uni.showToast({ title: '邀请码已复制', icon: 'success' })
    }
  })
  // #endif
}

function getRoleLabel(role?: FamilyRole) {
  if (role === 'owner') {
    return '拥有者'
  }

  if (role === 'viewer') {
    return '只读成员'
  }

  return '协作成员'
}

function getInviteStatusLabel(status: FamilyInvite['status']) {
  if (status === 'accepted') {
    return '已接受'
  }

  if (status === 'revoked') {
    return '已撤回'
  }

  if (status === 'expired') {
    return '已过期'
  }

  return '待加入'
}

function formatDateLabel(value?: string) {
  if (!value) {
    return '刚刚'
  }

  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getInitial(name?: string, fallback = '家') {
  const initial = name?.trim().charAt(0)
  return initial || fallback
}
</script>

<template>
  <view class="page-shell family-page">
    <AppNavBar title="家庭协作" :subtitle="pageSubtitle" :show-back="true" />

    <view v-if="loading" class="loading-tip">
      <text>加载中...</text>
    </view>

    <view v-else>
      <view v-if="currentBaby" class="hero-card card">
        <view class="hero-avatar-wrap">
          <image v-if="currentBaby.avatar" class="hero-avatar" :src="currentBaby.avatar" mode="aspectFill" />
          <view v-else class="hero-avatar-placeholder">{{ getInitial(currentBaby.nickname, '宝') }}</view>
        </view>
        <view class="hero-main">
          <view class="hero-title-row">
            <text class="hero-name">{{ currentBaby.nickname }}</text>
            <text class="hero-role" :class="currentBaby.role">{{ getRoleLabel(currentBaby.role) }}</text>
          </view>
          <text class="hero-meta">{{ currentBaby.monthAgeLabel }} · {{ currentBaby.stageLabel }}</text>
          <text class="hero-desc">{{ heroDesc }}</text>
        </view>
      </view>

      <view v-else class="empty-card soft-card">
        <text class="empty-title">还没有可查看的家庭</text>
        <text class="empty-desc">可以先输入家人分享的邀请码加入家庭；若你尚未创建宝宝档案，也可先去添加宝宝。</text>
      </view>

      <view class="join-card card">
        <view class="section-head">
          <text class="section-title">{{ joinCardTitle }}</text>
          <text v-if="sharedInviteCode" class="share-badge">分享直达</text>
        </view>
        <text class="section-desc">{{ joinCardDesc }}</text>
        <input
          v-model="acceptCode"
          class="invite-input"
          placeholder="请输入邀请码"
          maxlength="32"
          confirm-type="done"
          @confirm="handleAcceptInvite()"
        />
        <view class="primary-button" :class="{ disabled: acceptingInvite }" @tap="handleAcceptInvite()">
          {{ joinButtonText }}
        </view>
      </view>

      <view v-if="currentBaby" class="members-card card">
        <view class="section-head">
          <text class="section-title">家庭成员</text>
          <text class="section-tip">按当前宝宝查看协作者</text>
        </view>

        <view v-if="members.length" class="member-list">
          <view v-for="member in members" :key="member.id" class="member-row">
            <image v-if="member.avatarUrl" class="member-avatar" :src="member.avatarUrl" mode="aspectFill" />
            <view v-else class="member-avatar placeholder">{{ getInitial(member.nickname) }}</view>
            <view class="member-main">
              <view class="member-name-row">
                <text class="member-name">{{ member.nickname }}</text>
                <text v-if="member.isCurrentUser" class="self-tag">我</text>
              </view>
              <text class="member-meta">{{ getRoleLabel(member.role) }} · 加入于 {{ formatDateLabel(member.joinedAt) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="currentBaby && (canCreateInvite || invites.length)" class="invite-card card">
        <view class="section-head">
          <text class="section-title">家庭邀请</text>
          <text class="section-tip">邀请会绑定到当前宝宝</text>
        </view>

        <view v-if="canCreateInvite" class="invite-share-row">
          <view class="primary-button invite-share-btn" :class="{ disabled: sharingInvite || creatingInvite }" @tap="handleShareInvite">
            {{ sharingInvite || creatingInvite ? '准备中...' : '直接分享给家人' }}
          </view>
        </view>

        <view v-if="canCreateInvite" class="create-box soft-card">
          <text class="create-title">创建新邀请码</text>
          <view class="role-grid">
            <view
              v-for="option in roleOptions"
              :key="option.value"
              class="role-option"
              :class="{ active: inviteRole === option.value }"
              @tap="inviteRole = option.value"
            >
              <text class="role-option-title">{{ option.label }}</text>
              <text class="role-option-desc">{{ option.desc }}</text>
            </view>
          </view>
          <view class="primary-button" :class="{ disabled: creatingInvite }" @tap="handleCreateInvite">
            {{ creatingInvite ? '生成中...' : '生成邀请码' }}
          </view>
        </view>

        <view v-if="invites.length" class="invite-list">
          <view v-for="invite in invites" :key="invite.id" class="invite-row soft-card">
            <view class="invite-main">
              <view class="invite-title-row">
                <text class="invite-role">{{ getRoleLabel(invite.role) }}</text>
                <text class="invite-status" :class="invite.status">{{ getInviteStatusLabel(invite.status) }}</text>
              </view>
              <text class="invite-code">邀请码：{{ invite.inviteCode }}</text>
              <text class="invite-meta">创建于 {{ formatDateLabel(invite.createdAt) }} · 失效于 {{ formatDateLabel(invite.expiresAt) }}</text>
            </view>
            <view class="invite-actions">
              <view v-if="invite.status === 'pending'" class="copy-btn outline" @tap="handleShareInvite(invite)">分享</view>
              <view class="copy-btn" @tap="copyInviteCode(invite.inviteCode)">复制</view>
            </view>
          </view>
        </view>

        <view v-else class="empty-inline soft-card">
          <text class="empty-inline-text">还没有邀请码，生成后可直接复制给家人。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.family-page {
  padding-top: 0;
}

.loading-tip {
  padding: 60rpx;
  text-align: center;
  color: var(--mini-text-muted);
  font-size: 26rpx;
}

.hero-card,
.join-card,
.members-card,
.invite-card {
  margin-top: 20rpx;
  padding: 28rpx;
}

.hero-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hero-avatar-wrap {
  flex-shrink: 0;
}

.hero-avatar,
.member-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  display: block;
}

.hero-avatar-placeholder,
.member-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
}

.hero-main,
.member-main,
.invite-main {
  flex: 1;
  min-width: 0;
}

.hero-title-row,
.member-name-row,
.invite-title-row,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.hero-name,
.section-title,
.create-title,
.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.hero-role,
.self-tag,
.invite-status {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.hero-role,
.self-tag {
  background: rgba(0, 93, 170, 0.1);
  color: var(--mini-primary-deep);
}

.hero-role.owner {
  background: rgba(255, 179, 102, 0.25);
  color: #a45a18;
}

.hero-role.viewer,
.invite-status.expired,
.invite-status.revoked {
  background: rgba(0, 0, 0, 0.06);
  color: var(--mini-text-muted);
}

.invite-status.pending,
.invite-status.accepted {
  background: rgba(255, 179, 102, 0.2);
  color: #a45a18;
}

.hero-meta,
.hero-desc,
.section-desc,
.section-tip,
.member-meta,
.invite-meta,
.role-option-desc,
.readonly-desc,
.empty-desc,
.empty-inline-text {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.invite-input {
  width: 100%;
  margin-top: 18rpx;
  padding: 0 24rpx;
  height: 92rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  font-size: 28rpx;
  box-sizing: border-box;
}

.share-badge {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.18);
  color: #a45a18;
  font-size: 20rpx;
  font-weight: 700;
}

.invite-share-row {
  margin-top: 18rpx;
}

.invite-share-btn {
  width: 100%;
}

.primary-button.disabled {
  opacity: 0.6;
}

.invite-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.copy-btn.outline {
  background: rgba(168, 230, 207, 0.22);
  color: var(--mini-secondary-deep);
}

.member-list,
.invite-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 18rpx;
}

.member-row,
.invite-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.member-name,
.invite-role,
.readonly-title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.create-box,
.readonly-tip,
.empty-card,
.empty-inline {
  margin-top: 18rpx;
  padding: 24rpx;
}

.role-grid {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 18rpx;
}

.role-option {
  padding: 22rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.86);
}

.role-option.active {
  background: rgba(255, 179, 102, 0.16);
  box-shadow: inset 0 0 0 2rpx rgba(255, 179, 102, 0.4);
}

.role-option-title,
.invite-code {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.copy-btn {
  flex-shrink: 0;
  min-width: 112rpx;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}
</style>
