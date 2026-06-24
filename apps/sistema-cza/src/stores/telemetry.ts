import { defineStore } from 'pinia'
import { createTelemetry } from '@/api/axios.ts'
import type { CreateTelemetryRequest, TelemetryStatus } from '@/types/types.ts'
import type { AxiosError } from 'axios'

export interface TelemetryState {
  userId: string
  sessionId: string
  status: TelemetryStatus
  startTime: number
  sessionStart: string
  groupSelections: Record<string, number>
  comboSelections: Record<string, number>
  finalSelection: string[]
  abandonedSelections: string[]
  problemSpace: Record<string, string>
  formSubmissions: number
  formResets: number
  isSubmitting: boolean
  error: string | null
  pingIntervalId: number | null
}

export const useTelemetryStore = defineStore('telemetry', {
  state: (): TelemetryState => ({
    userId: '',
    sessionId: '',
    status: 'PROFILE_STARTED',
    startTime: Date.now(),
    sessionStart: new Date().toISOString(),
    groupSelections: {},
    comboSelections: {},
    finalSelection: [],
    abandonedSelections: [],
    problemSpace: {},
    formSubmissions: 0,
    formResets: 0,
    isSubmitting: false,
    error: null,
    pingIntervalId: null,
  }),

  getters: {
    getUserId(): string {
      return this.userId
    },
    currentElapsedTime(): number {
      return Date.now() - this.startTime
    },
  },

  actions: {
    initSession(): void {
      const storedUserId = sessionStorage.getItem('telemetry_anon_id')
      if (storedUserId) {
        this.userId = storedUserId
      } else {
        const newId = crypto.randomUUID()
        this.userId = newId
        sessionStorage.setItem('telemetry_anon_id', newId)
      }

      this.sessionId = crypto.randomUUID()
      this.status = 'PROFILE_STARTED'
      this.startTime = Date.now()
      this.sessionStart = new Date().toISOString()
      this.groupSelections = {}
      this.comboSelections = {}
      this.finalSelection = []
      this.abandonedSelections = []
      this.problemSpace = {}
      this.error = null

      this.startPeriodicPings()
    },

    setStatus(newStatus: TelemetryStatus): void {
      this.status = newStatus
      this.submitSession() // Force ping on status change
    },

    setProblemSpace(key: string, value: string): void {
      this.problemSpace[key] = value
    },

    trackGroupSelection(groupKey: string): void {
      if (!this.groupSelections[groupKey]) {
        this.groupSelections[groupKey] = 0
      }
      this.groupSelections[groupKey]++
      this.checkStatusUpgrade()
    },

    trackComboSelection(comboKey: string): void {
      if (!this.comboSelections[comboKey]) {
        this.comboSelections[comboKey] = 0
      }
      this.comboSelections[comboKey]++
      this.checkStatusUpgrade()
    },

    trackAbandonedSelection(selection: string): void {
      if (!this.abandonedSelections.includes(selection)) {
        this.abandonedSelections.push(selection)
      }
    },

    checkStatusUpgrade() {
      if (this.status === 'PROFILE_STARTED') {
        this.setStatus('CUSTOMIZING')
      }
    },

    trackReset(): void {
      this.formResets++
      this.submitSession()
    },

    setFinalSelection(selections: string[]): void {
      this.finalSelection = selections
    },

    startPeriodicPings() {
      if (this.pingIntervalId !== null) {
        window.clearInterval(this.pingIntervalId)
      }
      // Send a ping every 10 seconds
      this.pingIntervalId = window.setInterval(() => {
        this.submitSession()
      }, 10000)
    },

    stopPeriodicPings() {
      if (this.pingIntervalId !== null) {
        window.clearInterval(this.pingIntervalId)
        this.pingIntervalId = null
      }
    },

    async submitSession(): Promise<void> {
      if (!this.userId || !this.sessionId) {
        return
      }

      this.isSubmitting = true
      this.error = null
      this.formSubmissions++ 

      const elapsedTime = Date.now() - this.startTime

      const payload: CreateTelemetryRequest = {
        userId: this.userId,
        sessionId: this.sessionId,
        status: this.status,
        sessionStart: this.sessionStart,
        groupSelections: this.groupSelections,
        comboSelections: this.comboSelections,
        formSubmissions: this.formSubmissions,
        finalSelection: this.finalSelection,
        abandonedSelections: this.abandonedSelections,
        problemSpace: this.problemSpace,
        formResets: this.formResets,
        elapsedTime: elapsedTime,
      }

      try {
        await createTelemetry(payload)
      } catch (err) {
        const axiosError = err as AxiosError
        this.error = axiosError.message || 'Failed to submit telemetry'
        console.error('Telemetry submission failed', err)
      } finally {
        this.isSubmitting = false
      }
    },

    resetStore(): void {
      this.stopPeriodicPings()
      this.sessionId = ''
      this.status = 'PROFILE_STARTED'
      this.startTime = Date.now()
      this.sessionStart = new Date().toISOString()
      this.groupSelections = {}
      this.comboSelections = {}
      this.finalSelection = []
      this.abandonedSelections = []
      this.problemSpace = {}
      this.formSubmissions = 0
      this.formResets = 0
      this.error = null
      this.isSubmitting = false
    },
  },
})
