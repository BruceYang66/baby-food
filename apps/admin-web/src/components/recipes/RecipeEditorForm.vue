<template>
  <div class="panel grid-gap-20">
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div class="panel-title" style="font-size:28px;">食谱编辑器</div>
        <div style="margin-top:6px; color:var(--admin-text-muted);">分块折叠编辑，右侧实时手机预览。</div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="ghost-btn">保存草稿</button>
        <button class="ghost-btn">预览</button>
        <button class="ghost-btn">提交审核</button>
        <button class="primary-btn">立即上线</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: minmax(0, 1.2fr) 360px; gap:20px; align-items:start;">
      <div class="grid-gap-16">
        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">基础信息</div>
          <div class="grid-gap-16" style="grid-template-columns: repeat(2, minmax(0, 1fr)); display:grid;">
            <input class="ghost-input" placeholder="食谱名称" />
            <select class="ghost-select"><option>适龄月龄</option></select>
            <input class="ghost-input" placeholder="时长，如 20 分钟" />
            <select class="ghost-select"><option>难度等级</option></select>
            <input class="ghost-input" placeholder="封面图 URL" style="grid-column: span 2;" />
            <textarea class="ghost-textarea" rows="3" placeholder="一句话简介" style="grid-column: span 2;"></textarea>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">食材清单</div>
          <div class="grid-gap-16">
            <div style="display:grid; grid-template-columns: 1.2fr 140px 120px 120px; gap:10px;">
              <input class="ghost-input" placeholder="食材名称" />
              <input class="ghost-input" placeholder="数量" />
              <input class="ghost-input" placeholder="单位" />
              <button class="ghost-btn">新增行</button>
            </div>
            <button class="ghost-btn" style="justify-self:start;">快捷导入</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">制作步骤</div>
          <div class="grid-gap-16">
            <textarea class="ghost-textarea" rows="3" placeholder="步骤描述"></textarea>
            <input class="ghost-input" placeholder="步骤图 URL" />
            <div style="display:flex; gap:10px;">
              <button class="ghost-btn">上移</button>
              <button class="ghost-btn">下移</button>
              <button class="ghost-btn">步骤模板</button>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title" style="font-size:20px; margin-bottom:16px;">营养与贴士</div>
          <div class="grid-gap-16">
            <textarea class="ghost-textarea" rows="4" placeholder="营养亮点与喂养建议"></textarea>
            <input class="ghost-input" placeholder="关联病症，如 腹泻 / 便秘" />
            <input class="ghost-input" placeholder="过敏原标签" />
          </div>
        </section>
      </div>

      <aside class="panel" style="position:sticky; top:24px;">
        <div class="panel-title" style="font-size:20px; margin-bottom:16px;">实时预览</div>
        <div style="background: #FDF8F3; border-radius: 28px; padding: 18px; min-height: 640px;">
          <div style="font-size: 12px; color: #8A5108;">手机端详情页预览</div>
          <div style="margin-top: 16px; background: #fff; border-radius: 24px; overflow: hidden;">
            <div style="height: 180px; background: linear-gradient(180deg, rgba(255,179,102,0.4), rgba(255,255,255,0.9));"></div>
            <div style="padding: 18px;">
              <div style="font-weight: 800; font-size: 22px;">鳕鱼西兰花软饭</div>
              <div style="margin-top: 10px; color: #6B625B; font-size: 13px; line-height: 1.7;">高蛋白、适合 8-10 月龄，口感软糯。</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
