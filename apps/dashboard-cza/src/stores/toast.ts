import { defineStore } from 'pinia'

export type ToastMode = 'success' | 'error' | 'alert'

export interface ToastItem {
  id: string
  message: string
  mode: ToastMode
  duration: number
}

export interface ToastState {
  queue: ToastItem[]
  activeToast: ToastItem | null
  isVisible: boolean
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    queue: [],
    activeToast: null,
    isVisible: false,
  }),

  getters: {
    hasActiveToast: (state) => !!state.activeToast,
  },

  actions: {

    addToast(message: string, mode: ToastMode = 'success', duration: number = 3000) {
      const id = Date.now().toString() + Math.random().toString()
      const newItem: ToastItem = { id, message, mode, duration }

      this.queue.push(newItem)
      this.processQueue()
    },

    processQueue() {
      if (this.isVisible || this.activeToast) return

      if (this.queue.length === 0) return

      const nextToast = this.queue.shift()

      if (nextToast) {
        this.activeToast = nextToast
        this.isVisible = true
      }
    },

    onToastClosed() {
      // 1. Reset visibility
      this.isVisible = false

      // 2. Clear the active data
      this.activeToast = null

      // 3. Small buffer to ensure the DOM updates before the next one starts
      setTimeout(() => {
        this.processQueue()
      }, 100)
    },


    dismissCurrent() {
      this.isVisible = false
    },
  },
})
