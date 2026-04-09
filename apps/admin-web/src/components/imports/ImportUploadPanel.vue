<template>
  <div class="panel grid-gap-16">
    <div style="display:grid; grid-template-columns: 1fr 220px 220px; gap:12px; align-items:center;">
      <div style="font-size: 14px; line-height: 1.7; color: var(--admin-text-muted);">
        ① 下载 Excel 模板 → ② 填写数据或在线编辑 → ③ 上传文件 → ④ 数据校验与修正。
      </div>
      <button class="ghost-btn">下载模板</button>
      <button class="primary-btn">上传文件</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
      <section class="panel" style="background: var(--admin-surface-low);">
        <div class="panel-title" style="font-size:18px; margin-bottom:12px;">上传与校验</div>
        <div style="min-height:200px; border-radius:8px; background: rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; color: var(--admin-text-muted);">
          拖拽 xlsx / csv 文件到此处，支持 10MB 以内
        </div>
      </section>
      <section class="panel" style="background: var(--admin-surface-low);">
        <div class="panel-title" style="font-size:18px; margin-bottom:12px;">校验结果</div>
        <div class="table-shell">
          <div class="table-row" style="grid-template-columns: 90px 1fr 120px;">
            <div>有效行</div><div>78 行</div><div style="color: var(--admin-primary); font-weight: 700;">通过</div>
          </div>
          <div class="table-row" style="grid-template-columns: 90px 1fr 120px;">
            <div>警告行</div><div>5 行：缺少封面图</div><div style="color: var(--admin-warning); font-weight: 700;">需补充</div>
          </div>
          <div class="table-row" style="grid-template-columns: 90px 1fr 120px;">
            <div>错误行</div><div>3 行：月龄字段格式错误</div><div style="color: var(--admin-danger); font-weight: 700;">需修正</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
