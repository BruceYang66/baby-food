<template>
  <div class="panel grid-gap-16">
    <div class="panel-title" style="font-size:20px;">版本管理与差异对比</div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
      <section class="panel" style="background: var(--admin-surface-low);">
        <div style="font-weight:700; margin-bottom:12px;">当前版本</div>
        <div style="font-size:14px; line-height:1.8; color:var(--admin-text-muted);">补充鳕鱼预处理步骤，增加高蛋白标签，更新封面图。</div>
      </section>
      <section class="panel" style="background: var(--admin-surface-low);">
        <div style="font-weight:700; margin-bottom:12px;">历史版本</div>
        <div style="font-size:14px; line-height:1.8; color:var(--admin-text-muted);">旧版未标注腥味处理，图片为低分辨率。</div>
      </section>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="ghost-btn">查看更多版本</button>
      <button class="ghost-btn">回滚版本</button>
      <button class="primary-btn">记录修改原因</button>
    </div>
  </div>
</template>
