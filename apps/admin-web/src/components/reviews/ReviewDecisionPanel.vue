<template>
  <div class="panel grid-gap-16">
    <div class="panel-title" style="font-size:20px;">审核决策面板</div>
    <select class="ghost-select"><option>审核结果</option><option>通过</option><option>驳回</option></select>
    <input class="ghost-input" placeholder="快捷标签，如 图片不清晰 / 适龄不准" />
    <textarea class="ghost-textarea" rows="4" placeholder="审核意见与修改建议"></textarea>
    <div style="display:flex; gap:10px;">
      <button class="ghost-btn">标记复审</button>
      <button class="ghost-btn">保存意见</button>
      <button class="primary-btn">确认审核</button>
    </div>
  </div>
</template>
