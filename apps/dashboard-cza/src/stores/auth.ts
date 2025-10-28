import { defineStore } from 'pinia'
import axios  from 'axios'
import type { AxiosInstance } from 'axios'

// ======================
// Types
// ======================

export interface User {
  email: string
  lastname: string
  name: string
  username: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
  user?: User
}

export interface AuthState {
  accessToken: string | null
  user: User | null
}

// ======================
// Axios instance
// ======================
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_PATH,
  withCredentials: true, // necessary for refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
})

// ======================
// Store
// ======================

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete api.defaults.headers.common['Authorization']
      }
    },

    setUser(user: User | null) {
      this.user = user
    },

    /**
     * Logs in and retrieves access token + user.
     * Refresh token is set in a secure HttpOnly cookie by the server.
     */
    async login(email: string, password: string): Promise<LoginResponse> {
      try {
        const response = await api.post<LoginResponse>('/api/auth/v1/login', {
          email,
          password,
        })

        this.setAccessToken(response.data.accessToken)
        this.setUser(response.data.user)
        return response.data
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
        await api.post('/api/auth/v1/logout')
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
        const response = await api.post<RefreshResponse>('/api/auth/v1/refresh', {}, {
          withCredentials: true,
        })

        this.setAccessToken(response.data.accessToken)
        if (response.data.user) this.setUser(response.data.user)
        return response.data.accessToken
      } catch (error) {
        this.setAccessToken(null)
        this.setUser(null)
        throw new Error('Refresh failed')
      }
    },

    /**
     * Tries a silent refresh (used on app startup or route navigation).
     * Returns true if successful, false if user must log in again.
     */
    async attemptRefresh(): Promise<boolean> {
      try{
        await this.refresh()
        return true
      }catch(error){
        this.setAccessToken(null)
        this.setUser(null)
        console.error(error)
        return false
      }
    },
  },
})
