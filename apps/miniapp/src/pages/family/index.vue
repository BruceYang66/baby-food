<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import type { BabyProfile, FamilyInvite, FamilyMember, FamilyRole } from '@baby-food/shared-types'
import AppNavBar from '@/components/common/AppNavBar.vue'
import TagChip from '@/components/common/TagChip.vue'
import {
  acceptFamilyInvite,
  createFamilyInvite,
  ensureProtectedPageAccess,
  getFamilyInvites,
  getFamilyMembers,
  leaveFamily,
  removeFamilyMember
} from '@/services/api'

const relationshipOptions = ['爸爸', '妈妈', '奶奶', '爷爷', '外公', '外婆', '姨姨', '舅舅', '姑姑', '其他'] as const
const roleOptions: Array<{ value: FamilyRole; label: string; desc: string }> = [
  { value: 'editor', label: '协作成员', desc: '可查看并协作记录计划' },
  { value: 'viewer', label: '只读成员', desc: '仅查看，不可修改记录' }
]

const currentBaby = ref<BabyProfile | null>(null)
const members = ref<FamilyMember[]>([])
const invites = ref<FamilyInvite[]>([])
const loading = ref(true)
const creatingInvite = ref(false)
const acceptingInvite = ref(false)
const sharingInvite = ref(false)
const leaving = ref(false)
const removingMemberId = ref('')
const inviteRole = ref<FamilyRole>('editor')
const selectedRelationship = ref<typeof relationshipOptions[number]>('爸爸')
const customRelationship = ref('')
const acceptCode = ref('')
const targetBabyId = ref('')
const sharedInviteCode = ref('')
const autoAcceptedInviteCode = ref('')
const pendingShareInvite = ref<FamilyInvite | null>(null)

const canCreateInvite = computed(() => currentBaby.value?.isOwner === true)
const canLeaveFamily = computed(() => Boolean(currentBaby.value && currentBaby.value.isOwner !== true))
const pendingInviteCount = computed(() => invites.value.filter((invite) => invite.status === 'pending').length)
const shareInvite = computed(() => pendingShareInvite.value ?? invites.value.find((invite) => invite.status === 'pending') ?? null)
const currentMember = computed(() => members.value.find((member) => member.isCurrentUser) ?? null)
const relationshipLabel = computed(() => {
  if (selectedRelationship.value === '其他') {
    return customRelationship.value.trim()
  }

  return selectedRelationship.value
})
const pageSubtitle = computed(() => currentBaby.value ? '邀请家人一起关注宝宝成长' : '输入邀请码加入宝宝家庭')
const joinCardTitle = computed(() => {
  if (sharedInviteCode.value) {
    return '立即加入家人分享的家庭'
  }

  return currentBaby.value ? '加入更多宝宝家庭' : '输入邀请码加入家庭'
})
const joinCardDesc = computed(() => {
  if (sharedInviteCode.value) {
    return '已识别分享邀请，点击下方按钮即可直接加入；也可以手动修改邀请码。'
  }

  return currentBaby.value
    ? '若家里有多个宝宝档案，可继续输入邀请码加入其它家庭。'
    : '登录后输入家人发来的邀请码，即可加入对应宝宝的亲友团。'
})
const joinButtonText = computed(() => {
  if (acceptingInvite.value) {
    return '加入中...'
  }

  return sharedInviteCode.value ? '一键加入家庭' : '确认加入'
})

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
    title: currentBaby.value ? `邀请你加入${currentBaby.value.nickname}的亲友团` : '邀请你加入宝宝亲友团',
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
    title: currentBaby.value ? `邀请你加入${currentBaby.value.nickname}的亲友团` : '邀请你加入宝宝亲友团',
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

function getInviteRelationshipLabel() {
  const label = relationshipLabel.value.trim()

  if (!label) {
    uni.showToast({ title: '请先选择关系标签', icon: 'none' })
    return ''
  }

  return label
}

async function ensureShareInvite() {
  const relationship = getInviteRelationshipLabel()
  if (!relationship) {
    throw new Error('请先选择关系标签')
  }

  const pendingInvite = invites.value.find((invite) => (
    invite.status === 'pending'
    && invite.role === inviteRole.value
    && (invite.relationshipLabel ?? '') === relationship
  ))

  if (pendingInvite) {
    pendingShareInvite.value = pendingInvite
    return pendingInvite
  }

  if (!currentBaby.value) {
    throw new Error('当前没有可分享的宝宝档案')
  }

  const data = await createFamilyInvite({
    babyId: currentBaby.value.id,
    role: inviteRole.value,
    relationshipLabel: relationship
  })

  invites.value = [data.invite, ...invites.value.filter((invite) => invite.id !== data.invite.id)]
  pendingShareInvite.value = data.invite
  return data.invite
}

async function handleCreateInvite() {
  if (creatingInvite.value || !currentBaby.value) return
  if (!canCreateInvite.value) {
    uni.showToast({ title: '只有拥有者可以邀请亲友', icon: 'none' })
    return
  }

  const relationship = getInviteRelationshipLabel()
  if (!relationship) {
    return
  }

  creatingInvite.value = true
  try {
    const data = await createFamilyInvite({
      babyId: currentBaby.value.id,
      role: inviteRole.value,
      relationshipLabel: relationship
    })
    invites.value = [data.invite, ...invites.value.filter((invite) => invite.id !== data.invite.id)]
    pendingShareInvite.value = data.invite
    uni.showModal({
      title: '邀请码已生成',
      content: `已为${relationship}生成邀请码：${data.invite.inviteCode}`,
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
    uni.showToast({ title: '已加入亲友团', icon: 'success' })
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

async function handleLeaveFamily() {
  if (!currentBaby.value || leaving.value || !canLeaveFamily.value) {
    return
  }

  const confirm = await uni.showModal({
    title: '退出亲友团',
    content: '退出后将不再关注当前宝宝，也无法继续查看这位宝宝的计划与记录。',
    confirmText: '确认退出',
    cancelText: '再想想'
  })

  if (!confirm.confirm) {
    return
  }

  leaving.value = true
  try {
    const authState = await leaveFamily(currentBaby.value.id)
    const nextBabyId = authState.babyProfile?.id ?? ''

    uni.showToast({ title: '已退出亲友团', icon: 'success' })
    sharedInviteCode.value = ''
    autoAcceptedInviteCode.value = ''
    pendingShareInvite.value = null
    targetBabyId.value = nextBabyId

    if (nextBabyId) {
      await loadFamilyData(nextBabyId)
    } else {
      currentBaby.value = null
      members.value = []
      invites.value = []
    }
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '退出失败', icon: 'none' })
  } finally {
    leaving.value = false
  }
}

async function handleRemoveMember(member: FamilyMember) {
  if (!currentBaby.value || removingMemberId.value || member.isCurrentUser || member.isOwner) {
    return
  }

  const confirm = await uni.showModal({
    title: '剔除亲友',
    content: `确认将${member.relationshipLabel || member.nickname}移出当前亲友团吗？`,
    confirmText: '确认剔除',
    cancelText: '取消'
  })

  if (!confirm.confirm) {
    return
  }

  removingMemberId.value = member.id
  try {
    const data = await removeFamilyMember(member.id, currentBaby.value.id)
    currentBaby.value = data.baby ?? currentBaby.value
    members.value = data.members ?? []
    uni.showToast({ title: '已剔除亲友', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '剔除失败', icon: 'none' })
  } finally {
    removingMemberId.value = ''
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
    return '已加入'
  }

  if (status === 'revoked') {
    return '已撤回'
  }

  if (status === 'expired') {
    return '已过期'
  }

  return '待加入'
}

function getInitial(name?: string, fallback = '家') {
  const initial = name?.trim().charAt(0)
  return initial || fallback
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

function formatRecentLabel(value?: string, fallbackDate?: string) {
  if (!value) {
    return fallbackDate ? formatDateLabel(fallbackDate) : '最近未登录'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return formatDateLabel(value)
  }

  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.floor(diff / 60000))

  if (minutes < 60) {
    return `${minutes}分钟前`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}小时前`
  }

  return formatDateLabel(value)
}

function formatVisitLabel(member: FamilyMember) {
  if (typeof member.loginCount === 'number' && member.loginCount > 0) {
    return `来过 ${member.loginCount} 次`
  }

  return member.joinedAt ? `加入于 ${formatDateLabel(member.joinedAt)}` : '刚加入'
}

function getRoleChipAccent(role?: FamilyRole) {
  if (role === 'owner') {
    return 'primary' as const
  }

  if (role === 'viewer') {
    return 'neutral' as const
  }

  return 'secondary' as const
}
</script>

<template>
  <view class="page-shell family-page">
    <AppNavBar title="家庭协作" :subtitle="pageSubtitle" :show-back="true" />

    <view v-if="loading" class="family-panel loading-panel">
      <text>加载中...</text>
    </view>

    <view v-else class="family-stack">
      <view v-if="currentBaby" class="family-hero">
        <view class="hero-main">
          <view class="hero-avatar-wrap">
            <image v-if="currentBaby.avatar" class="hero-avatar" :src="currentBaby.avatar" mode="aspectFill" />
            <view v-else class="hero-avatar-placeholder">{{ getInitial(currentBaby.nickname, '宝') }}</view>
          </view>
          <view class="hero-copy">
            <text class="hero-name">{{ currentBaby.nickname }}</text>
            <text class="hero-meta">{{ currentBaby.monthAgeLabel }} · {{ currentBaby.stageLabel }}</text>
            <view class="hero-chip-row">
              <TagChip :text="getRoleLabel(currentBaby.role)" :accent="getRoleChipAccent(currentBaby.role)" />
              <TagChip v-if="currentMember?.relationshipLabel" :text="currentMember.relationshipLabel" accent="secondary" />
            </view>
          </view>
        </view>

        <view class="hero-stats">
          <view class="hero-stat">
            <text class="hero-stat-value">{{ members.length }}</text>
            <text class="hero-stat-label">当前亲友</text>
          </view>
          <view class="hero-stat">
            <text class="hero-stat-value">{{ pendingInviteCount }}</text>
            <text class="hero-stat-label">待加入邀请</text>
          </view>
          <view class="hero-stat">
            <text class="hero-stat-value">{{ canCreateInvite ? '拥有者' : '亲友' }}</text>
            <text class="hero-stat-label">当前身份</text>
          </view>
        </view>
      </view>

      <view v-else class="family-panel empty-panel">
        <text class="empty-title">还没有可查看的家庭</text>
        <text class="empty-desc">可以先输入家人分享的邀请码加入家庭；若你尚未创建宝宝档案，也可先去添加宝宝。</text>
      </view>

      <view v-if="currentBaby" class="family-panel member-panel">
        <view class="panel-head">
          <view>
            <text class="panel-title">当前亲友</text>
            <text class="panel-desc">按当前宝宝查看谁在关注、谁最近回来过。</text>
          </view>
        </view>

        <view v-if="members.length" class="member-grid">
          <view v-for="member in members" :key="member.id" class="member-card">
            <image v-if="member.avatarUrl" class="member-avatar" :src="member.avatarUrl" mode="aspectFill" />
            <view v-else class="member-avatar placeholder">{{ getInitial(member.nickname) }}</view>

            <view class="member-badge-row">
              <text class="member-relation">{{ member.relationshipLabel || member.nickname }}</text>
              <text v-if="member.isCurrentUser" class="member-self">我</text>
            </view>
            <text class="member-name">{{ member.nickname }}</text>
            <text class="member-visit">{{ formatVisitLabel(member) }}</text>
            <text class="member-recent">{{ formatRecentLabel(member.lastActiveAt, member.joinedAt) }}</text>

            <view class="member-tag-row">
              <TagChip :text="getRoleLabel(member.role)" :accent="getRoleChipAccent(member.role)" />
            </view>

            <view
              v-if="canCreateInvite && !member.isCurrentUser && !member.isOwner"
              class="member-remove"
              @tap="handleRemoveMember(member)"
            >
              {{ removingMemberId === member.id ? '剔除中...' : '剔除' }}
            </view>
          </view>
        </view>
      </view>

      <view class="family-panel join-panel" :class="{ subdued: currentBaby && !sharedInviteCode }">
        <view class="panel-head">
          <view>
            <text class="panel-title">{{ joinCardTitle }}</text>
            <text class="panel-desc">{{ joinCardDesc }}</text>
          </view>
          <text v-if="sharedInviteCode" class="join-badge">分享直达</text>
        </view>

        <input
          v-model="acceptCode"
          class="join-input"
          placeholder="请输入邀请码"
          maxlength="32"
          confirm-type="done"
          @confirm="handleAcceptInvite()"
        />
        <view class="join-button" :class="{ disabled: acceptingInvite }" @tap="handleAcceptInvite()">
          {{ joinButtonText }}
        </view>
      </view>

      <view v-if="currentBaby && canCreateInvite" class="family-panel invite-builder-panel">
        <view class="panel-head">
          <view>
            <text class="panel-title">邀请关系设置</text>
            <text class="panel-desc">先指定家人关系，再选择加入后是协作查看还是只读查看。</text>
          </view>
        </view>

        <view class="relationship-grid">
          <view
            v-for="option in relationshipOptions"
            :key="option"
            class="relationship-chip"
            :class="{ active: selectedRelationship === option }"
            @tap="selectedRelationship = option"
          >
            {{ option }}
          </view>
        </view>

        <input
          v-if="selectedRelationship === '其他'"
          v-model="customRelationship"
          class="relationship-input"
          maxlength="12"
          placeholder="请输入自定义关系标签"
        />

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
      </view>

      <view v-if="currentBaby && invites.length" class="family-panel invite-list-panel">
        <view class="panel-head">
          <view>
            <text class="panel-title">邀请记录</text>
            <text class="panel-desc">可继续复制邀请码，或对待加入邀请直接发起分享。</text>
          </view>
        </view>

        <view class="invite-list">
          <view v-for="invite in invites" :key="invite.id" class="invite-row">
            <view class="invite-main">
              <view class="invite-title-row">
                <text class="invite-relation">{{ invite.relationshipLabel || '亲友' }}</text>
                <text class="invite-status" :class="invite.status">{{ getInviteStatusLabel(invite.status) }}</text>
              </view>
              <view class="invite-tag-row">
                <TagChip :text="getRoleLabel(invite.role)" :accent="getRoleChipAccent(invite.role)" />
              </view>
              <text class="invite-code">邀请码：{{ invite.inviteCode }}</text>
              <text class="invite-meta">创建于 {{ formatDateLabel(invite.createdAt) }} · 失效于 {{ formatDateLabel(invite.expiresAt) }}</text>
            </view>
            <view class="invite-actions">
              <view v-if="invite.status === 'pending'" class="invite-action outline" @tap="handleShareInvite(invite)">分享</view>
              <view class="invite-action" @tap="copyInviteCode(invite.inviteCode)">复制</view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="currentBaby && !canCreateInvite" class="family-panel readonly-panel">
        <text class="panel-title">当前权限说明</text>
        <text class="panel-desc">你可以查看宝宝资料、计划和家庭成员动态，但不能修改宝宝基础信息。如不再关注，可直接退出当前亲友团。</text>
      </view>
    </view>

    <view v-if="currentBaby && canCreateInvite" class="fixed-bottom-actions family-bottom-bar">
      <view class="outline-button bottom-secondary" @tap="handleCreateInvite">
        {{ creatingInvite ? '生成中...' : '生成邀请码' }}
      </view>
      <view class="primary-button bottom-primary" :class="{ disabled: sharingInvite }" @tap="handleShareInvite()">
        {{ sharingInvite ? '准备中...' : '邀请亲友' }}
      </view>
    </view>

    <view v-else-if="canLeaveFamily" class="fixed-bottom-actions family-bottom-bar single-action">
      <view class="danger-button bottom-danger" @tap="handleLeaveFamily">
        {{ leaving ? '退出中...' : '退出亲友团' }}
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.family-page {
  padding-top: 0;
}

.family-stack {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.family-panel,
.family-hero {
  border-radius: var(--mini-radius-lg);
  background: var(--mini-surface);
  box-shadow: var(--mini-shadow-card);
}

.loading-panel,
.empty-panel,
.member-panel,
.join-panel,
.invite-builder-panel,
.invite-list-panel,
.readonly-panel {
  padding: 28rpx;
}

.loading-panel {
  text-align: center;
  color: var(--mini-text-muted);
  font-size: 26rpx;
}

.family-hero {
  padding: 30rpx;
  background: linear-gradient(135deg, rgba(255, 179, 102, 0.18), rgba(168, 230, 207, 0.16) 60%, rgba(255, 255, 255, 0.96));
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hero-avatar-wrap {
  flex-shrink: 0;
}

.hero-avatar,
.member-avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 999rpx;
  display: block;
}

.hero-avatar-placeholder,
.member-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 38rpx;
  font-weight: 700;
}

.hero-copy,
.invite-main {
  flex: 1;
  min-width: 0;
}

.hero-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--mini-primary-deep);
}

.hero-meta,
.empty-desc,
.panel-desc,
.role-option-desc,
.member-name,
.member-visit,
.member-recent,
.invite-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--mini-text-muted);
}

.hero-chip-row,
.invite-tag-row,
.member-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.hero-stat {
  padding: 18rpx 16rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.78);
  text-align: center;
}

.hero-stat-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.hero-stat-label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--mini-text-muted);
}

.empty-title,
.panel-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.panel-head,
.invite-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 22rpx;
}

.member-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 324rpx;
  padding: 24rpx 20rpx 22rpx;
  border-radius: 28rpx;
  background: var(--mini-surface-soft);
  text-align: center;
}

.member-badge-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 18rpx;
}

.member-relation,
.invite-relation {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.member-self {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(0, 93, 170, 0.1);
  color: var(--mini-primary-deep);
  font-size: 20rpx;
  font-weight: 700;
}

.member-name {
  margin-top: 6rpx;
}

.member-visit {
  margin-top: 12rpx;
}

.member-remove {
  margin-top: auto;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(214, 106, 106, 0.12);
  color: #b24d4d;
  font-size: 22rpx;
  font-weight: 700;
}

.join-panel.subdued {
  opacity: 0.96;
}

.join-badge {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 179, 102, 0.18);
  color: #a45a18;
  font-size: 20rpx;
  font-weight: 700;
}

.join-input,
.relationship-input {
  width: 100%;
  margin-top: 18rpx;
  padding: 0 24rpx;
  height: 92rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.92);
  font-size: 28rpx;
  color: var(--mini-text);
  box-sizing: border-box;
}

.join-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 18rpx;
  height: 96rpx;
  border-radius: var(--mini-radius-pill);
  background: linear-gradient(135deg, var(--mini-primary-deep), var(--mini-primary));
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: var(--mini-shadow-soft);
}

.join-button.disabled,
.bottom-primary.disabled {
  opacity: 0.65;
}

.relationship-grid,
.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 20rpx;
}

.relationship-chip,
.role-option {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 84rpx;
  padding: 0 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.88);
  color: var(--mini-text);
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
}

.relationship-chip.active {
  background: rgba(168, 230, 207, 0.36);
  color: var(--mini-secondary-deep);
  box-shadow: inset 0 0 0 2rpx rgba(44, 105, 86, 0.18);
}

.role-option.active {
  background: rgba(255, 179, 102, 0.16);
  box-shadow: inset 0 0 0 2rpx rgba(255, 179, 102, 0.4);
}

.role-option {
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 148rpx;
  padding: 22rpx;
}

.role-option-title,
.invite-code {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--mini-text);
}

.invite-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 22rpx;
}

.invite-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  background: var(--mini-surface-soft);
}

.invite-status {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.invite-status.pending {
  background: rgba(255, 179, 102, 0.2);
  color: #a45a18;
}

.invite-status.accepted {
  background: rgba(168, 230, 207, 0.24);
  color: var(--mini-secondary-deep);
}

.invite-status.revoked,
.invite-status.expired {
  background: rgba(0, 0, 0, 0.06);
  color: var(--mini-text-muted);
}

.invite-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.invite-action {
  min-width: 112rpx;
  padding: 18rpx 0;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
  color: var(--mini-primary-deep);
  font-size: 24rpx;
  font-weight: 700;
}

.invite-action.outline {
  background: rgba(168, 230, 207, 0.22);
  color: var(--mini-secondary-deep);
}

.bottom-secondary,
.bottom-primary,
.bottom-danger {
  flex: 1;
}

.outline-button.bottom-secondary {
  background: rgba(255, 255, 255, 0.72);
  color: var(--mini-text);
}

.single-action {
  display: block;
}

.danger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  border-radius: var(--mini-radius-pill);
  background: rgba(214, 106, 106, 0.12);
  color: #b24d4d;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
