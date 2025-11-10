import { defineStore } from 'pinia'
import type { CustomizationSchema, ProjectResponse } from '@/types/types.ts'
import { fetchProjectSelections, fetchUserProjects } from '@/api/axios.ts'

export interface projectState {
  currentProject: ProjectResponse | null
  projects: ProjectResponse[]
  currentProjectCustomization: CustomizationSchema | null
}

export const useProjectsStore = defineStore('Projects', {
  state: (): projectState => ({
    currentProject: null,
    projects: [],
    currentProjectCustomization: null,
  }),

  actions: {
    async setCurrentProject(project: ProjectResponse | null) {
      this.currentProject = project
      if(project){
        const data = await fetchProjectSelections(project.id)
        if(data){
          this.currentProjectCustomization = data
          console.log('setCurrentProjectCustomization', data)
        }else
          this.currentProjectCustomization = null
      }
    },
    setProjects(projects: ProjectResponse[]) {
      this.projects = projects
    },
    async fetchProjects(userId: string) {
      const data = await fetchUserProjects(userId)

      this.setProjects(data)
      if (data?.length) {
        if(data[0]){
          await this.setCurrentProject(data[0])
        }
      }
    },
    clearProjects() {
      this.projects = []
      this.currentProject = null
    },
  },
})
