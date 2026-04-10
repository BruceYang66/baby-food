<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { UserAdminRow } from '@baby-food/shared-types'
import { getUsers } from '@/services/api'

const userRows = ref<UserAdminRow[]>([])

onMounted(async () => {
  userRows.value = await getUsers()
})
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)) 180px; gap:16px; align-items:end;">
      <input class="ghost-input" placeholder="昵称 / ID" />
      <select class="ghost-select"><option>注册时间</option></select>
      <select class="ghost-select"><option>活跃度</option></select>
      <select class="ghost-select"><option>月龄阶段</option></select>
      <button class="primary-btn">筛选用户</button>
    </section>
    <section class="panel">
      <div class="panel-title" style="font-size:24px;">用户管理页</div>
      <div class="table-shell" style="margin-top:18px;">
        <div v-for="user in userRows" :key="user.id" class="table-row" style="grid-template-columns: 1fr 180px 120px 120px 120px 200px;">
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
          <div>{{ user.status }}</div>
          <div style="display:flex; gap:8px;"><button class="ghost-btn">详情</button><button class="ghost-btn">发通知</button><button class="ghost-btn">禁用</button></div>
        </div>
      </div>
    </section>
  </div>
</template>
