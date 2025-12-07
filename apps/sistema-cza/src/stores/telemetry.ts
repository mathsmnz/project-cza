import { defineStore } from 'pinia'
import { createTelemetry } from '@/api/axios.ts'
import type { CreateTelemetryRequest } from '@/types/types.ts'
import type { AxiosError } from 'axios'

export interface TelemetryState {
  userId: string
  startTime: number
  sessionStart: string
  groupSelections: Record<string, number>
  comboSelections: Record<string, number>
  finalSelection: string[]
  formSubmissions: number
  formResets: number
  isSubmitting: boolean
  error: string | null
}

export const useTelemetryStore = defineStore('telemetry', {
  state: (): TelemetryState => ({
    userId: '',
    startTime: Date.now(),
    sessionStart: new Date().toISOString(),
    groupSelections: {},
    comboSelections: {},
    finalSelection: [],
    formSubmissions: 0,
    formResets: 0,
    isSubmitting: false,
    error: null,
  }),

  getters: {
    /**
     * Returns the current anonymous User ID.
     */
    getUserId(): string {
      return this.userId
    },

    /**
     * Calculates the elapsed time in milliseconds from session start to now.
     */
    currentElapsedTime(): number {
      return Date.now() - this.startTime
    },
  },

  actions: {
    /**
     * Initializes the session.
     * Generates a new UUID v4 if one doesn't exist in session storage.
     */
    initSession(): void {
      const storedId = sessionStorage.getItem('telemetry_anon_id')

      if (storedId) {
        this.userId = storedId
      } else {
        const newId = crypto.randomUUID()
        this.userId = newId
        sessionStorage.setItem('telemetry_anon_id', newId)
      }

      this.startTime = Date.now()
      this.sessionStart = new Date().toISOString()
      this.error = null
    },

    /**
     * Tracks a selection made in a Group.
     */
    trackGroupSelection(groupKey: string): void {
      if (!this.groupSelections[groupKey]) {
        this.groupSelections[groupKey] = 0
      }
      this.groupSelections[groupKey]++
    },

    /**
     * Tracks a selection made in a Combo box.
     */
    trackComboSelection(comboKey: string): void {
      if (!this.comboSelections[comboKey]) {
        this.comboSelections[comboKey] = 0
      }
      this.comboSelections[comboKey]++
    },

    /**
     * Records a form reset event.
     */
    trackReset(): void {
      this.formResets++
    },

    /**
     * Sets the final selection list that was submitted.
     */
    setFinalSelection(selections: string[]): void {
      this.finalSelection = selections
    },

    /**
     * Submits the gathered telemetry data to the backend.
     */
    async submitSession(): Promise<void> {
      if (!this.userId) {
        this.initSession()
      }

      this.isSubmitting = true
      this.error = null
      this.formSubmissions++ // Increment count on attempt

      const elapsedTime = Date.now() - this.startTime

      const payload: CreateTelemetryRequest = {
        userId: this.userId,
        sessionStart: this.sessionStart,
        groupSelections: this.groupSelections,
        comboSelections: this.comboSelections,
        formSubmissions: this.formSubmissions,
        finalSelection: this.finalSelection,
        formResets: this.formResets,
        elapsedTime: elapsedTime,
      }

      try {
        await createTelemetry(payload)
        this.resetStore()
      } catch (err) {
        const axiosError = err as AxiosError
        this.error = axiosError.message || 'Failed to submit telemetry'
        console.error('Telemetry submission failed', err)
        throw err
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * Resets the store state for a fresh tracking session.
     * Keeps the userId intact to track multiple submissions by the same anonymous user.
     */
    resetStore(): void {
      this.startTime = Date.now()
      this.sessionStart = new Date().toISOString()
      this.groupSelections = {}
      this.comboSelections = {}
      this.finalSelection = []
      this.formSubmissions = 0
      this.formResets = 0
      this.error = null
      this.isSubmitting = false
    },
  },
})
