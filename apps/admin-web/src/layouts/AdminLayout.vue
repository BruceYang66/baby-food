<template>
  <div class="admin-shell">
    <SidebarNav />
    <main class="main-stage">
      <AdminHeader />
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from '@/components/layout/SidebarNav.vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
</script>
