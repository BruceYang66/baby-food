<template>
  <div style="min-height: 100vh; display:grid; grid-template-columns: 1.1fr 0.9fr; background: var(--admin-surface);">
    <section style="padding: 64px; display:flex; flex-direction:column; justify-content:space-between; background: linear-gradient(180deg, rgba(0,93,170,0.94), rgba(0,117,213,0.9)); color:#fff;">
      <div>
        <div style="font-size: 13px; letter-spacing: 0.18em; opacity: 0.8;">BABY FOOD GENERATOR</div>
        <h1 class="panel-title" style="font-size: 54px; line-height: 1.12; margin: 18px 0 0;">优化后的管理后台</h1>
        <p style="max-width: 520px; margin-top: 20px; font-size: 16px; line-height: 1.9; opacity: 0.92;">面向运营与营养师的一体化食谱管理平台，覆盖导入、创建、审核、发布、维护与下架全流程。</p>
      </div>
      <div style="display:grid; gap:14px; max-width: 540px;">
        <div class="panel" style="background: rgba(255,255,255,0.12); color:#fff;">内容全生命周期管理 · 草稿 → 待审 → 已上线 → 下架 → 回收站</div>
        <div class="panel" style="background: rgba(255,255,255,0.12); color:#fff;">批量导入、快速添加、版本维护、角色权限统一协同</div>
      </div>
    </section>

    <section style="display:flex; align-items:center; justify-content:center; padding: 40px;">
      <div class="panel" style="width: 100%; max-width: 460px; box-shadow: var(--admin-floating-shadow);">
        <div class="panel-title" style="font-size: 28px;">欢迎登录</div>
        <div style="margin-top: 8px; color: var(--admin-text-muted); line-height: 1.8;">请输入账号、密码和验证码。首次开通请联系管理员。</div>
        <div class="grid-gap-16" style="margin-top: 24px;">
          <input class="ghost-input" placeholder="账号" />
          <input class="ghost-input" type="password" placeholder="密码" />
          <div style="display:grid; grid-template-columns: 1fr 130px; gap:12px;">
            <input class="ghost-input" placeholder="验证码" />
            <div class="panel" style="display:flex; align-items:center; justify-content:center; background: var(--admin-surface-low); font-weight:700;">A8X7</div>
          </div>
          <button class="primary-btn">登录后台</button>
          <button class="ghost-btn">联系管理员开通账号</button>
          <div style="font-size: 13px; line-height: 1.8; color: var(--admin-text-muted);">安全提示：账号密码仅限本人使用，异常操作将记录到日志。</div>
        </div>
      </div>
    </section>
  </div>
</template>
