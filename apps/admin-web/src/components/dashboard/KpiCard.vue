<script setup lang="ts">
defineProps<{
  label: string
  value: string
  trend: string
  accent?: 'primary' | 'secondary' | 'warning' | 'danger'
}>()
</script>

<template>
  <div class="panel" :style="accent === 'primary' ? 'background: linear-gradient(180deg, rgba(0,93,170,0.08), #fff);' : ''">
    <div style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--admin-text-muted);">{{ label }}</div>
    <div class="display-text" style="font-size:44px; font-weight:800; margin-top:12px;">{{ value }}</div>
    <div style="margin-top:10px; font-size:13px; color:var(--admin-text-muted);">{{ trend }}</div>
  </div>
</template>
