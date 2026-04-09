<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menus = [
  { label: '数据看板', path: '/dashboard' },
  { label: '食谱库管理', path: '/recipes' },
  { label: '编辑食谱', path: '/recipes/editor' },
  { label: '批量导入', path: '/imports' },
  { label: '快速添加', path: '/quick-add' },
  { label: '内容审核', path: '/reviews' },
  { label: '食谱维护', path: '/maintenance' },
  { label: '用户管理', path: '/users' },
  { label: '系统设置', path: '/settings' }
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand-box panel" style="background: linear-gradient(180deg, var(--admin-primary), var(--admin-primary-container)); color: #fff; margin-bottom: 18px;">
      <div style="font-size: 12px; letter-spacing: 0.12em; opacity: 0.72;">BABY FOOD CMS</div>
      <div class="panel-title" style="font-size: 26px; margin-top: 8px;">宝宝辅食生成器</div>
      <div style="margin-top: 12px; font-size: 13px; line-height: 1.7; opacity: 0.9;">运营、营养师、审核员统一协作的食谱生命周期平台。</div>
    </div>

    <nav class="grid-gap-16">
      <RouterLink
        v-for="menu in menus"
        :key="menu.path"
        :to="menu.path"
        class="panel"
        :style="route.path === menu.path ? 'background: var(--admin-surface-lowest); color: var(--admin-primary); font-weight: 700;' : 'background: transparent; color: var(--admin-text-muted); padding: 16px 18px;'"
      >
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
