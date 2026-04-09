<template>
  <div class="panel grid-gap-16">
    <div class="panel-title" style="font-size:20px;">角色权限矩阵</div>
    <div class="table-shell">
      <div class="table-row" style="grid-template-columns: 1fr repeat(4, 120px); background: transparent; padding: 0; color: var(--admin-text-muted); font-size:12px; text-transform: uppercase; letter-spacing: 0.12em;">
        <div>权限项</div><div>管理员</div><div>运营</div><div>营养师</div><div>审核员</div>
      </div>
      <div class="table-row" style="grid-template-columns: 1fr repeat(4, 120px);"><div>食谱创建</div><div>✓</div><div>✓</div><div>✓</div><div>—</div></div>
      <div class="table-row" style="grid-template-columns: 1fr repeat(4, 120px);"><div>批量导入</div><div>✓</div><div>✓</div><div>—</div><div>—</div></div>
      <div class="table-row" style="grid-template-columns: 1fr repeat(4, 120px);"><div>审核发布</div><div>✓</div><div>—</div><div>—</div><div>✓</div></div>
      <div class="table-row" style="grid-template-columns: 1fr repeat(4, 120px);"><div>系统设置</div><div>✓</div><div>—</div><div>—</div><div>—</div></div>
    </div>
  </div>
</template>
