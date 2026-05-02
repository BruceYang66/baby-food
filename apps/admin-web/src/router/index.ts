import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/login/index.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DashboardPage from '@/pages/dashboard/index.vue'
import RecipeListPage from '@/pages/recipes/list/index.vue'
import RecipeEditorPage from '@/pages/recipes/editor/index.vue'
import KnowledgeListPage from '@/pages/knowledge/list/index.vue'
import KnowledgeEditorPage from '@/pages/knowledge/editor/index.vue'
import ImportsPage from '@/pages/imports/index.vue'
import QuickAddPage from '@/pages/quick-add/index.vue'
import ReviewsPage from '@/pages/reviews/index.vue'
import MaintenancePage from '@/pages/maintenance/index.vue'
import UsersPage from '@/pages/users/index.vue'
import FeedbackPage from '@/pages/feedback/index.vue'
import SettingsPage from '@/pages/settings/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginPage },
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: 'dashboard', component: DashboardPage },
        { path: 'recipes', redirect: '/recipes/list' },
        { path: 'recipes/list', component: RecipeListPage },
        { path: 'recipes/editor', component: RecipeEditorPage },
        { path: 'knowledge', redirect: '/knowledge/list' },
        { path: 'knowledge/list', component: KnowledgeListPage },
        { path: 'knowledge/editor', component: KnowledgeEditorPage },
        { path: 'imports', component: ImportsPage },
        { path: 'quick-add', component: QuickAddPage },
        { path: 'reviews', component: ReviewsPage },
        { path: 'maintenance', component: MaintenancePage },
        { path: 'users', component: UsersPage },
        { path: 'feedback', component: FeedbackPage },
        { path: 'settings', component: SettingsPage }
      ]
    }
  ]
})

export default router
