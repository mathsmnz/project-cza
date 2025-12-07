// useAuthWatcher.ts
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

export function useAuthWatcher() {
  const auth = useAuthStore()
  const projects = useProjectsStore()
  const { isAuthenticated } = storeToRefs(auth)

  watch(isAuthenticated, async (val) => {
    if (val) {
      if(auth.user){
        const id = auth.user.id
        await projects.fetchProjects(id)
      }
    } else {
      projects.clearProjects()
    }
  })
}
