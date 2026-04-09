<script setup lang="ts">
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { dashboardMetrics, reviewQueue, userTrend } from '@/services/mock/data'

const maxValue = Math.max(...userTrend.map((item) => item.value))
</script>

<template>
  <div class="grid-gap-20">
    <section style="display:grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap:16px;">
      <KpiCard v-for="metric in dashboardMetrics" :key="metric.key" :label="metric.label" :value="metric.value" :trend="metric.trend" :accent="metric.accent" />
    </section>

    <section style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:20px; align-items:start;">
      <div class="panel">
        <div class="panel-title" style="font-size:24px;">用户增长趋势</div>
        <div style="margin-top: 6px; color: var(--admin-text-muted);">近 7 日新增趋势与内容消费热度。</div>
        <div style="display:flex; align-items:end; gap:16px; height: 280px; margin-top: 24px; padding-top: 20px;">
          <div v-for="point in userTrend" :key="point.label" style="flex:1; display:flex; flex-direction:column; align-items:center; gap:10px;">
            <div :style="{ width: '100%', borderRadius: '8px 8px 0 0', background: 'linear-gradient(180deg, rgba(0,93,170,0.86), rgba(0,117,213,0.36))', height: `${(point.value / maxValue) * 220}px` }"></div>
            <div style="font-size:12px; color:var(--admin-text-muted);">{{ point.label }}</div>
          </div>
        </div>
      </div>

      <div class="grid-gap-20">
        <div class="panel">
          <div class="panel-title" style="font-size:24px;">快捷入口</div>
          <div class="grid-gap-16" style="margin-top:18px; grid-template-columns: repeat(2, minmax(0, 1fr)); display:grid;">
            <button class="ghost-btn">审核待处理</button>
            <button class="ghost-btn">批量导入</button>
            <button class="ghost-btn">用户反馈</button>
            <button class="ghost-btn">导出报表</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title" style="font-size:24px;">最新审核队列</div>
          <div class="table-shell" style="margin-top: 18px;">
            <div v-for="item in reviewQueue" :key="item.id" class="table-row" style="grid-template-columns: 1fr 140px;">
              <div>
                <div style="font-weight:700;">{{ item.title }}</div>
                <div style="margin-top:6px; font-size:13px; color:var(--admin-text-muted);">{{ item.source }} · {{ item.submittedBy }} · {{ item.submittedAt }}</div>
              </div>
              <div style="font-size:13px; color:var(--admin-primary); justify-self:end;">{{ item.focus }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
