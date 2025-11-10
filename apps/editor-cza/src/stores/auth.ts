import { defineStore } from 'pinia'
import type { AuthState, LoginResponse, UserInfo, LoginUserRequest } from '@/types/types.ts'
import { apiLogin, apiLogout, apiRefresh } from '@/api/axios'

// ======================
// Store
// ======================

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && state.user !== null,
  },

  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token
    },

    setUser(user: UserInfo | null) {
      this.user = user
    },

    /**
     * Logs in and retrieves access token + user.
     * Refresh token is set in a secure HttpOnly cookie by the server.
     */
    async login(credentials: LoginUserRequest): Promise<LoginResponse> {
      try {
        const responseData = await apiLogin(credentials)

        this.setAccessToken(responseData.accessToken)
        this.setUser(responseData.user)
        return responseData
      } catch (error: any) {
        console.error('Login failed:', error)
        throw new Error(error.response?.data?.message || 'Login failed')
      }
    },

    /**
     * Logs the user out and clears local state.
     * Also requests backend to revoke the refresh token cookie.
     */
    async logout(): Promise<void> {
      try {
        await apiLogout()
      } catch (error) {
        console.error('Logout failed', error)
      } finally {
        this.setAccessToken(null)
        this.setUser(null)
      }
    },

    /**
     * Requests a new access token using the refresh cookie.
     */
    async refresh(): Promise<string> {
      try {
        const responseData = await apiRefresh()

        this.setAccessToken(responseData.accessToken)

        if (responseData.user) this.setUser(responseData.user)

        return responseData.accessToken
      } catch (error) {

        this.setAccessToken(null)
        this.setUser(null)

        throw new Error('Refresh failed: ' + error)
      }
    },

    /**
     * Tries a silent refresh (used on app startup or route navigation).
     * Returns true if successful, false if user must log in again.
     */
    async attemptRefresh(): Promise<boolean> {
      try {
        await this.refresh()
        return true
      } catch (error) {
        this.setAccessToken(null)
        this.setUser(null)
        console.error(error)
        return false
      }
    },
  },
})
