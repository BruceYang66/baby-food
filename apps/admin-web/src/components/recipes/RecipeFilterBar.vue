<template>
  <div class="panel" style="display:grid; gap:16px; grid-template-columns: repeat(5, minmax(0, 1fr)) 180px; align-items:end;">
    <div>
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.12em; color:var(--admin-text-muted); margin-bottom:8px;">关键词</div>
      <input class="ghost-input" placeholder="名称 / ID / 标签" />
    </div>
    <div>
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.12em; color:var(--admin-text-muted); margin-bottom:8px;">月龄</div>
      <select class="ghost-select"><option>全部月龄</option></select>
    </div>
    <div>
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.12em; color:var(--admin-text-muted); margin-bottom:8px;">状态</div>
      <select class="ghost-select"><option>全部状态</option></select>
    </div>
    <div>
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.12em; color:var(--admin-text-muted); margin-bottom:8px;">来源</div>
      <select class="ghost-select"><option>全部来源</option></select>
    </div>
    <div>
      <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.12em; color:var(--admin-text-muted); margin-bottom:8px;">标签</div>
      <select class="ghost-select"><option>全部标签</option></select>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="primary-btn" style="width:100%;">搜索</button>
      <button class="ghost-btn" style="width:100%;">重置</button>
    </div>
  </div>
</template>
