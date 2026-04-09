<template>
  <div class="grid-gap-20">
    <section class="panel" style="display:grid; grid-template-columns: minmax(0, 1fr) 360px; gap:20px; align-items:start;">
      <div class="panel" style="background: var(--admin-surface-low);">
        <div class="panel-title" style="font-size:24px;">快速添加页（手机端录入）</div>
        <div style="margin-top: 8px; color: var(--admin-text-muted); line-height: 1.8;">适合现场录入，用最少字段快速形成草稿，24 小时内再到电脑端完善。</div>
        <div class="grid-gap-16" style="margin-top: 20px;">
          <input class="ghost-input" placeholder="食谱名称" />
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <button class="ghost-btn">拍照上传</button>
            <select class="ghost-select"><option>月龄快速选择</option></select>
          </div>
          <textarea class="ghost-textarea" rows="3" placeholder="食材简述"></textarea>
          <textarea class="ghost-textarea" rows="4" placeholder="做法简述"></textarea>
          <input class="ghost-input" placeholder="快捷标签：补铁 / 通便 / 加餐" />
          <div style="display:flex; gap:10px;">
            <button class="ghost-btn">存草稿电脑完善</button>
            <button class="primary-btn">直接提交审核</button>
          </div>
        </div>
      </div>
      <aside class="panel" style="position:sticky; top:24px;">
        <div class="panel-title" style="font-size:20px;">录入提示</div>
        <div style="margin-top: 12px; color: var(--admin-text-muted); line-height: 1.9;">
          <div>• 封面图建议竖版 4:5。</div>
          <div>• 月龄字段必须完整。</div>
          <div>• 上传后 24 小时内补全步骤图和营养贴士。</div>
        </div>
      </aside>
    </section>
  </div>
</template>
