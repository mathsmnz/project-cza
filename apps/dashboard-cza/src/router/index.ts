// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import AboutView from '@/views/AboutView.vue'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/DashboardView.vue'
import OverviewPanel from '@/components/dashboard/overview/OverviewPanel.vue'
import ProjectsPanel from '@/components/dashboard/projects/ProjectsPanel.vue'
import UsersPanel from '@/components/dashboard/users/UsersPanel.vue'
import AnalyticsPanel from '@/components/dashboard/analytics/AnalyticsPanel.vue'
import ActivateView from '@/views/ActivateView.vue'
import PasswordView from '@/views/PasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/activate', name: 'activate', component: ActivateView },
    {path: '/password', name: 'password', component: PasswordView },
    { path: '/about', name: 'about', component: AboutView },
    {
      path: '/dashboard',
      component: DashboardView, // This component is the layout
      meta: { requiresAuth: true },
      // Redirect /dashboard to its first child
      redirect: '/dashboard/overview',
      children: [
        // --- FIX: Paths are now relative ---
        {
          path: 'overview', // Renders at /dashboard/overview
          name: 'DashboardOverview',
          meta: { title: 'overview' },
          component: OverviewPanel,
        },
        {
          path: 'projects', // Renders at /dashboard/projects
          name: 'DashboardProjects',
          meta: { title: 'projects' },
          component: ProjectsPanel,
        },
        {
          path: 'users', // Renders at /dashboard/users
          name: 'DashboardUsers',
          meta: { title: 'users' },
          component: UsersPanel,
        },
        {
          path: 'analytics', // Renders at /dashboard/analytics
          name: 'DashboardAnalytics',
          meta: { title: 'Analytics' },
          component: AnalyticsPanel,
        },
      ],
    },
  ],
})

// Global navigation guard (remains the same)
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (auth.isAuthenticated) {
      return next()
    }
    const success = await auth.attemptRefresh()
    if (success) {
      return next()
    }
    return next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    return next()
  }
})

export default router
