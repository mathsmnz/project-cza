import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import { useAuthStore } from '@/stores/auth.ts'
import LoginView from '@/views/LoginView.vue'
import PreflightView from '@/views/PreflightView.vue'
import OptionsView from '@/views/OptionsView.vue'
import EditorView from '@/views/EditorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/preflight', name: 'preflight', component: PreflightView, meta: { requiresAuth: true }, },
    { path: '/options', name: 'options', component: OptionsView, meta: { requiresAuth: true } },
    { path: '/editor', name: 'editor', component: EditorView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (auth.isAuthenticated) {
      await auth.attemptRefresh()
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
