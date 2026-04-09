<script setup lang="ts">
import VersionComparePanel from '@/components/maintenance/VersionComparePanel.vue'
import { optimizationTasks } from '@/services/mock/data'
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel">
      <div class="panel-title" style="font-size:24px;">食谱维护页</div>
      <div style="margin-top:6px; color: var(--admin-text-muted);">系统根据替换率、收藏率、反馈自动生成优化建议，支持版本管理与回收站恢复。</div>
      <div class="table-shell" style="margin-top:18px;">
        <div v-for="task in optimizationTasks" :key="task.id" class="table-row" style="grid-template-columns: 1fr 140px 80px 1.2fr 120px;">
          <div style="font-weight:700;">{{ task.recipeTitle }}</div>
          <div>{{ task.issueType }}</div>
          <div>{{ task.severity }}</div>
          <div style="color:var(--admin-text-muted);">{{ task.suggestion }}</div>
          <div>{{ task.status }}</div>
        </div>
      </div>
    </section>
    <VersionComparePanel />
    <section class="panel">
      <div class="panel-title" style="font-size:24px;">回收站</div>
      <div style="margin-top: 8px; color: var(--admin-text-muted);">保留 30 天，可恢复、彻底删除、批量清空。</div>
      <div class="table-shell" style="margin-top:18px;">
        <div class="table-row" style="grid-template-columns: 1fr 120px 160px;">
          <div>三文鱼山药泥</div><div>剩余 12 天</div><div style="display:flex; gap:8px;"><button class="ghost-btn">恢复</button><button class="ghost-btn">删除</button></div>
        </div>
        <div class="table-row" style="grid-template-columns: 1fr 120px 160px;">
          <div>苹果小米蒸糕</div><div>剩余 28 天</div><div style="display:flex; gap:8px;"><button class="ghost-btn">恢复</button><button class="ghost-btn">删除</button></div>
        </div>
      </div>
    </section>
  </div>
</template>
