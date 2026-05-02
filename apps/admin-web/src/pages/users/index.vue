<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { UserAdminRow } from '@baby-food/shared-types'
import { getUsers, updateUserPermissions } from '@/services/api'

const userRows = ref<UserAdminRow[]>([])
const loading = ref(false)
const togglingUserId = ref('')

async function loadUsers() {
  loading.value = true
  try {
    userRows.value = await getUsers()
  } finally {
    loading.value = false
  }
}

async function toggleAppAdmin(user: UserAdminRow) {
  if (togglingUserId.value) {
    return
  }

  const next = !user.canAppAdmin
  const confirmed = window.confirm(next ? `确定给 ${user.nickname} 开通小程序后台权限吗？` : `确定取消 ${user.nickname} 的小程序后台权限吗？`)
  if (!confirmed) {
    return
  }

  togglingUserId.value = user.id
  try {
    await updateUserPermissions(user.id, { canAppAdmin: next })
    await loadUsers()
  } catch (error) {
    window.alert(error instanceof Error ? error.message : '权限更新失败')
  } finally {
    togglingUserId.value = ''
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)) 180px; gap:16px; align-items:end;">
      <input class="ghost-input" placeholder="昵称 / ID" />
      <select class="ghost-select"><option>注册时间</option></select>
      <select class="ghost-select"><option>活跃度</option></select>
      <select class="ghost-select"><option>月龄阶段</option></select>
      <button class="primary-btn" @click="loadUsers">刷新用户</button>
    </section>
    <section class="panel">
      <div class="panel-title" style="font-size:24px;">用户管理页</div>
      <div v-if="loading" style="margin-top: 18px; color: var(--admin-text-muted);">加载中...</div>
      <div v-else class="table-shell" style="margin-top:18px;">
        <div v-for="user in userRows" :key="user.id" class="table-row" style="grid-template-columns: 1fr 180px 120px 120px 160px 260px;">
          <div style="display:flex; gap:12px; align-items:center;">
            <img :src="user.avatar" style="width:48px; height:48px; border-radius:999px; object-fit:cover;" />
            <div>
              <div style="font-weight:700;">{{ user.nickname }}</div>
              <div style="margin-top:6px; font-size:13px; color:var(--admin-text-muted);">{{ user.id }}</div>
            </div>
          </div>
          <div>{{ user.registerAt }}</div>
          <div>{{ user.babyCount }} 个宝宝</div>
          <div>{{ user.activity }}</div>
          <div>{{ user.canAppAdmin ? '已开通' : '未开通' }}</div>
          <div style="display:flex; gap:8px; flex-wrap: wrap;">
            <button class="ghost-btn" @click="toggleAppAdmin(user)" :disabled="togglingUserId === user.id">
              {{ user.canAppAdmin ? '取消后台权限' : '开通后台权限' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
