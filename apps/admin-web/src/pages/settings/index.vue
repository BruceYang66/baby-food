<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { SystemSettingGroup } from '@baby-food/shared-types'
import RoleMatrix from '@/components/settings/RoleMatrix.vue'
import { getSystemSettings } from '@/services/api'

const settingGroups = ref<SystemSettingGroup[]>([])

onMounted(async () => {
  settingGroups.value = await getSystemSettings()
})
</script>

<template>
  <div class="grid-gap-20">
    <section style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; align-items:start;">
      <div class="grid-gap-20">
        <section v-for="group in settingGroups" :key="group.title" class="panel">
          <div class="panel-title" style="font-size:22px;">{{ group.title }}</div>
          <div style="margin-top:6px; color:var(--admin-text-muted); line-height:1.8;">{{ group.description }}</div>
          <div class="table-shell" style="margin-top:18px;">
            <div v-for="item in group.items" :key="item.label" class="table-row" style="grid-template-columns: 180px 1fr;">
              <div style="color:var(--admin-text-muted);">{{ item.label }}</div>
              <div>{{ item.value }}</div>
            </div>
          </div>
        </section>
      </div>
      <div class="grid-gap-20">
        <RoleMatrix />
        <section class="panel">
          <div class="panel-title" style="font-size:20px;">数据安全</div>
          <div style="margin-top:16px; display:grid; gap:12px;">
            <button class="ghost-btn">查看操作日志</button>
            <button class="ghost-btn">创建备份</button>
            <button class="ghost-btn">恢复备份</button>
            <button class="primary-btn">保存系统设置</button>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
