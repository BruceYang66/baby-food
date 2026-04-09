<script setup lang="ts">
import ReviewDecisionPanel from '@/components/reviews/ReviewDecisionPanel.vue'
import { reviewQueue } from '@/services/mock/data'
</script>

<template>
  <div class="grid-gap-20">
    <section class="panel">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div class="panel-title" style="font-size:24px;">内容审核页</div>
          <div style="margin-top:6px; color:var(--admin-text-muted);">支持待审 / 审核中 / 已通过 / 已拒绝筛选，以及批量审核。</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="ghost-btn">批量通过</button>
          <button class="ghost-btn">批量驳回</button>
        </div>
      </div>
      <div class="table-shell" style="margin-top:18px;">
        <div v-for="item in reviewQueue" :key="item.id" class="table-row" style="grid-template-columns: 180px 1fr 140px 140px 120px;">
          <div>{{ item.submittedAt }}</div>
          <div>
            <div style="font-weight:700;">{{ item.title }}</div>
            <div style="margin-top:6px; color:var(--admin-text-muted); font-size:13px;">{{ item.focus }}</div>
          </div>
          <div>{{ item.submittedBy }}</div>
          <div>{{ item.source }}</div>
          <div><button class="ghost-btn" style="width:100%;">查看</button></div>
        </div>
      </div>
    </section>

    <section style="display:grid; grid-template-columns: 0.95fr 0.9fr 0.8fr; gap:20px; align-items:start;">
      <div class="panel">
        <div class="panel-title" style="font-size:20px;">左侧：食谱预览</div>
        <div style="margin-top: 16px; border-radius: 12px; overflow:hidden; background: #FDF8F3;">
          <div style="height: 220px; background: linear-gradient(180deg, rgba(255,179,102,0.38), rgba(255,255,255,0.86));"></div>
          <div style="padding: 20px;">
            <div style="font-weight: 800; font-size: 22px;">南瓜鸡肉烩面</div>
            <div style="margin-top: 12px; color: var(--admin-text-muted); line-height: 1.8;">10-12 月龄，面条软烂，适合作为午餐主食。</div>
          </div>
        </div>
      </div>
      <ReviewDecisionPanel />
      <div class="panel grid-gap-16">
        <div class="panel-title" style="font-size:20px;">参考信息</div>
        <div class="panel" style="background: var(--admin-surface-low);">相似食谱：南瓜牛肉烩面 / 鳕鱼胡萝卜面</div>
        <div class="panel" style="background: var(--admin-surface-low);">营养标准：蛋白质与铁含量需达到同龄午餐参考范围</div>
        <div class="panel" style="background: var(--admin-surface-low);">用户关注点：面条软烂程度、腥味处理、是否便于吞咽</div>
      </div>
    </section>
  </div>
</template>
