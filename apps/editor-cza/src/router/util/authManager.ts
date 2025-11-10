// src/router/authManager.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const authManager = {
  /**
   * Returns a navigation guard that attempts silent auth and
   * redirects to log in if it fails.
   */
  attemptAuth() {
    console.log('authManager.attemptAuth()')

    return async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      const auth = useAuthStore()

      if (auth.isAuthenticated) {
        console.log('You are logged in')
        return next()
      }

      const success = await auth.attemptRefresh()
      if (success) {
        return next()
      }

      // redirect to log in with the intended path preserved
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  },
  sayAuth() {
    console.log('You are logged not')
  },
}
