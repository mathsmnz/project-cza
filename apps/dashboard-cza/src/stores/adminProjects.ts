import { defineStore } from 'pinia'
import { fetchProjects, saveProject, deleteProject, fetchProjectFiles } from '@/api/axios.ts'

import type { Page, ProjectResponse, FileResponse } from '@/types/types.ts'

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
const createEmptyPage = <T>(): Page<T> => JSON.parse(JSON.stringify(EMPTY_PAGE_DATA))

// ======================
// Store Types
// ======================

export interface ProjectState {
  projectsPage: Page<ProjectResponse>
  filesPage: Page<FileResponse> // Stores files for the currently selected project
  loading: boolean
}

// ======================
// Store
// ======================

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projectsPage: createEmptyPage<ProjectResponse>(),
    filesPage: createEmptyPage<FileResponse>(),
    loading: false,
  }),

  getters: {
    hasProjects: (state) => state.projectsPage.content.length > 0,
    hasFiles: (state) => state.filesPage.content.length > 0,
  },

  actions: {
    // -------------------------------------------------------------------------
    // Project Management
    // -------------------------------------------------------------------------

    /**
     * Loads the paginated list of projects.
     */
    async loadProjects(page = 0, size = 10, sort = 'name,asc'): Promise<void> {
      this.loading = true
      try {
        this.projectsPage = await fetchProjects(page, size, sort)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Saves a project (create or update) and refreshes the list.
     */
    async saveProject(
      project: ProjectResponse,
      currentPage = 0,
      currentSize = 10,
      currentSort = 'name,asc',
    ): Promise<void> {
      try {
        await saveProject(project)
        // Refresh list to show new/updated item
        await this.loadProjects(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error('Failed to save project:', error)
        throw error
      }
    },

    /**
     * Deletes a project and refreshes the list.
     */
    async removeProject(
      projectId: string,
      confirmationCode: string,
      currentPage = 0,
      currentSize = 10,
      currentSort = 'name,asc',
    ): Promise<void> {
      try {
        await deleteProject(projectId, confirmationCode)
        await this.loadProjects(currentPage, currentSize, currentSort)
      } catch (error) {
        console.error(`Failed to delete project ${projectId}:`, error)
        throw error
      }
    },

    // -------------------------------------------------------------------------
    // File Management
    // -------------------------------------------------------------------------

    /**
     * Fetches files for a specific project.
     * Useful when opening a "Project Details" or "File Manager" view.
     */
    async loadFiles(projectId: string, page = 0, size = 10, sort = 'name,asc'): Promise<void> {
      this.loading = true
      try {
        this.filesPage = await fetchProjectFiles(projectId, page, size, sort)
      } catch (error) {
        console.error(`Failed to load files for project ${projectId}:`, error)
        // Reset files page on error to avoid showing stale data
        this.filesPage = createEmptyPage<FileResponse>()
      } finally {
        this.loading = false
      }
    },

    /**
     * Clears the current files list.
     * Call this when closing a project modal to clean up state.
     */
    clearFiles() {
      this.filesPage = createEmptyPage<FileResponse>()
    },
  },
})
