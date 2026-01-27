<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProjectsTable from './ProjectsTable.vue'
import type { ProjectResponse } from '@/types/types.ts'
import EditProject from '@/components/dashboard/modals/EditProject.vue'
import { useAdminUserStore } from '@/stores/adminUser.ts'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/adminProjects.ts'
import DeleteProject from '@/components/dashboard/modals/DeleteProject.vue'
import { useToastStore } from '@/stores/toast.ts' // Import the new table component

const page = {
  page: 0,
  size: 10,
  sort: 'name,asc',
}

const userStore = useAdminUserStore()
const projectStore = useProjectStore()
const toastStore = useToastStore()
const { usersPage: usersPage } = storeToRefs(userStore)
const { projectsPage: projectsPage } = storeToRefs(projectStore)

const showProjectEditor = ref<boolean>(false)
const showProjectDeletion = ref<boolean>(false)
const projectToEdit = ref<ProjectResponse | null>(null)

const openProjectEditor = async (project: ProjectResponse) => {
  await userStore.loadUsers()
  projectToEdit.value = project
  showProjectEditor.value = true
}

const openProjectDeletion = async (project: ProjectResponse) => {
  projectToEdit.value = project
  showProjectDeletion.value = true
}

const closeModal = () => {
  showProjectEditor.value = false
  showProjectDeletion.value = false
}

const saveProject = async (project: ProjectResponse) => {
  await projectStore.saveProject(project)
  showProjectEditor.value = false
  projectToEdit.value = null
}

const attemptProjectDeletion = async (confirmationCode: string) => {
  try {
    if (projectToEdit.value) {
      const projectName = projectToEdit.value.name
      await projectStore.removeProject(projectToEdit.value.id, confirmationCode)

      closeModal()

      toastStore.addToast(`Projeto ${projectName} apagado com sucesso.`, 'success')
    }
  } catch (error) {
    if (error instanceof Error) {
      toastStore.addToast(error.message, 'error')
    } else {
      toastStore.addToast('Erro inesperado.', 'error')
    }
    console.error(error)
  }
}

onMounted(async () => {
  await projectStore.loadProjects(page.page, page.size, page.sort)
})

const activeTab = ref('All Projects')
</script>

<template>
  <div>
    <div class="border-b border-gray-300 mb-6">
      <nav class="flex space-x-6 -mb-px">
        <a
          href="#"
          @click.prevent="activeTab = 'All Projects'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'All Projects'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >All Projects</a
        >
        <a
          href="#"
          @click.prevent="activeTab = 'Assets by project'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'Assets by project'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >Assets by project</a
        >
      </nav>
    </div>

    <ProjectsTable
      :projects="projectsPage.content"
      @edit="openProjectEditor"
      @delete="openProjectDeletion"
    />

    <edit-project
      v-if="showProjectEditor"
      :current-project="projectToEdit"
      :available-users="usersPage.content"
      @edit-project="saveProject"
      @cancel="closeModal"
    />

    <delete-project
      v-if="showProjectDeletion"
      :project-name="projectToEdit ? projectToEdit.name : 'INVALID NAME'"
      @confirm="attemptProjectDeletion"
      @cancel="closeModal"
    />
  </div>
</template>
