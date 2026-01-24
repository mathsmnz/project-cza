import { defineStore } from 'pinia'
import {
  fetchAllPasswordRecoveries,
  fetchInvitations,
  fetchUserInfo,
  requestPasswordRecovery,
  updateUser,
  deleteUser,
  revokeInvitation,
  refreshInvitation,
  deleteInvitation, refreshRecoveryToken, revokeRecoveryRequest, deleteRecoveryRequest,
} from '@/api/axios.ts'

import type {
  Page,
  UserResponse,
  InvitationResponse,
  PasswordRecoveryResponse,
  PasswordRecoveryRequest,
} from '@/types/types.ts'

// ======================
// Constants & Helpers
// ======================

const EMPTY_PAGE_DATA = {
  content: [],
  pageable: {
    sort: { sorted: false, unsorted: true, empty: true },
    offset: 0,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
    unpaged: false,
  },
  totalPages: 0,
  totalElements: 0,
  last: false,
  size: 10,
  number: 0,
  sort: { sorted: false, unsorted: true, empty: true },
  numberOfElements: 0,
  first: true,
  empty: true,
}

// Helper to create a fresh copy of the empty page structure
// preventing shared reference issues
const createEmptyPage = <T>(): Page<T> => JSON.parse(JSON.stringify(EMPTY_PAGE_DATA))

// ======================
// Store Types
// ======================

export interface AdminState {
  usersPage: Page<UserResponse>
  invitesPage: Page<InvitationResponse>
  recoveriesPage: Page<PasswordRecoveryResponse>
  loading: boolean
}

// ======================
// Store
// ======================

export const useAdminUserStore = defineStore('adminUser', {
  state: (): AdminState => ({
    usersPage: createEmptyPage<UserResponse>(),
    invitesPage: createEmptyPage<InvitationResponse>(),
    recoveriesPage: createEmptyPage<PasswordRecoveryResponse>(),
    loading: false,
  }),

  getters: {
    hasUsers: (state) => state.usersPage.content.length > 0,
    hasInvites: (state) => state.invitesPage.content.length > 0,
    hasRecoveries: (state) => state.recoveriesPage.content.length > 0,
  },

  actions: {
    // -------------------------------------------------------------------------
    // Users
    // -------------------------------------------------------------------------

    /**
     * Loads the users list into state.
     */
    async loadUsers(page = 0, size = 10, sort = ',asc'): Promise<void> {
      this.loading = true
      try {
        // Matches your component logic: 'name' + sort
        this.usersPage = await fetchUserInfo(page, size, 'name' + sort)
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Updates a user and automatically refreshes the list.
     */
    async saveUser(
      user: UserResponse,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await updateUser(user)
        await this.loadUsers(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error('Failed to save user:', error)
        throw error
      }
    },

    /**
     * Deletes a user and automatically refreshes the list.
     * Requires verification code (Admin API Key).
     */
    async removeUser(
      userId: string,
      verificationCode: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await deleteUser(userId, verificationCode)
        await this.loadUsers(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to delete user ${userId}:`, error)
        throw error
      }
    },

    // -------------------------------------------------------------------------
    // Invitations
    // -------------------------------------------------------------------------

    /**
     * Loads the invitations list into state.
     */
    async loadInvites(page = 0, size = 10, sort = ',asc'): Promise<void> {
      this.loading = true
      try {
        // Matches your component logic: 'email' + sort
        this.invitesPage = await fetchInvitations(page, size, 'email' + sort)
      } catch (error) {
        console.error('Failed to load invites:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Revokes an active invitation and refreshes the list.
     */
    async revokeUserInvitation(
      token: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await revokeInvitation(token)
        await this.loadInvites(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to revoke invitation ${token}:`, error)
        throw error
      }
    },

    /**
     * Refreshes (extends) an invitation and refreshes the list.
     */
    async refreshUserInvitation(
      token: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await refreshInvitation(token)
        await this.loadInvites(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to refresh invitation ${token}:`, error)
        throw error
      }
    },

    /**
     * Permanently deletes an invitation and refreshes the list.
     */
    async removeInvitation(
      token: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await deleteInvitation(token)
        await this.loadInvites(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to delete invitation ${token}:`, error)
        throw error
      }
    },

    // -------------------------------------------------------------------------
    // Password Recoveries
    // -------------------------------------------------------------------------

    /**
     * Loads the password recovery requests into state.
     */
    async loadRecoveries(page = 0, size = 10, sort = ',asc'): Promise<void> {
      this.loading = true
      try {
        this.recoveriesPage = await fetchAllPasswordRecoveries(page, size, 'email' + sort)
      } catch (error) {
        console.error('Failed to load recoveries:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Creates a recovery request and returns the token (for display/copying).
     */
    async requestRecovery(request: PasswordRecoveryRequest): Promise<string> {
      try {
        const response = await requestPasswordRecovery(request)
        return response.token
      } catch (error) {
        console.error('Failed to request recovery:', error)
        throw error
      }
    },

    /**
     * Refreshes (Rotate) the recovery request
     */
    async refreshRecoveries(
      token: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await refreshRecoveryToken(token)
        await this.loadRecoveries(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to refresh recoveries:`, error)
        throw error
      }
    },

    /**
     * Revokes an existing Recovery request and refreshes the list
     */
    async revokeRecovery(
      token: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await revokeRecoveryRequest(token)
        await this.loadRecoveries(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to revoke recovery:`, error)
      }
    },

    /**
     * Permanently deletes an invitation and refreshes the list.
     */
    async deleteRecovery(
      token: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = ',asc',
    ): Promise<void> {
      try {
        await deleteRecoveryRequest(token)
        await this.loadRecoveries(currentPage, currentSize, currentSort)
      }catch (error) {
        console.error(`Failed to delete recovery:`, error)
      }
    },

    // -------------------------------------------------------------------------
    // Bulk Operations
    // -------------------------------------------------------------------------

    /**
     * Convenience method to load all dashboard data at once (e.g., on mount).
     */
    async loadAll(page = 0, size = 10, sort = ',asc'): Promise<void> {
      this.loading = true
      try {
        await Promise.all([
          this.loadUsers(page, size, sort),
          this.loadInvites(page, size, sort),
          this.loadRecoveries(page, size, sort),
        ])
      } finally {
        this.loading = false
      }
    },
  },
})
