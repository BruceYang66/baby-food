<script setup lang="ts">
import ImportUploadPanel from '@/components/imports/ImportUploadPanel.vue'
import { importJobs } from '@/services/mock/data'
</script>

<template>
  <div class="grid-gap-20">
    <ImportUploadPanel />
    <section class="panel">
      <div class="panel-title" style="font-size:24px;">导入历史</div>
      <div class="table-shell" style="margin-top:18px;">
        <div class="table-row" style="grid-template-columns: 190px 1fr 120px 120px 120px 120px; background: transparent; padding: 0; color: var(--admin-text-muted); font-size:12px; text-transform:uppercase; letter-spacing:0.12em;">
          <div>时间</div><div>文件</div><div>操作人</div><div>总数</div><div>成功 / 失败</div><div>状态</div>
        </div>
        <div v-for="job in importJobs" :key="job.id" class="table-row" style="grid-template-columns: 190px 1fr 120px 120px 120px 120px;">
          <div>{{ job.createdAt }}</div>
          <div>{{ job.fileName }}</div>
          <div>{{ job.operator }}</div>
          <div>{{ job.total }}</div>
          <div>{{ job.success }} / {{ job.failed }}</div>
          <div>{{ job.status }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
