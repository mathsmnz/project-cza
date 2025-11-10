<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import type { Project, UserCreationRequest } from '@/types/types.ts'
import CreateUser from '@/components/dashboard/modals/CreateUser.vue'
import { inviteUser } from '@/api/axios.ts'

// Get access to the current route object
const route = useRoute()

const currentTitle = computed(() => {
  const title = route.meta.title || 'Dashboard'
  return String(title).toLowerCase()
})

// Mock available projects - replace with actual data from API
const availableProjects = ref<Project[]>([])

const userToCreate = ref<UserCreationRequest>({
  email: '',
  role: 'USER',
  projectIds: [],
})

const showUserCreator = ref<boolean>(false)
const showProjectCreator = ref<boolean>(false)

const openUserCreation = () => {
  showUserCreator.value = true
  console.log('Opening user creation modal')
}

const openProjectCreation = () => {
  showProjectCreator.value = true
  console.log('Opening project creation modal')
}

const closeModal = () => {
  showUserCreator.value = false
  showProjectCreator.value = false
}

const createUserRequest = async (
  userCreationRequest: UserCreationRequest,
  onSuccess: (invitationLink: string) => void,
  onError: () => void,
) => {
  try {
    const invitationResponse = await inviteUser(userCreationRequest)
    console.log('Invitation created:', invitationResponse)
    onSuccess(invitationResponse.registrationLink)
  } catch (err) {
    console.error('Failed to create user invitation:', err)
    onError()
  }
}

const handleSearch = (query: string) => {
  console.log('Search query:', query)
  // Implement search logic or emit to child components
}
</script>

<template>
  <div class="flex h-full w-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
    <!-- Sidebar -->
    <DashboardSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <DashboardHeader
        v-if="currentTitle !== 'overview'"
        :title="currentTitle"
        @create-user="openUserCreation"
        @create-project="openProjectCreation"
        @search="handleSearch"
      />

      <main class="flex-1 overflow-auto p-8">
        <div class="max-w-7xl mx-auto flex flex-col space-y-6">
          <header class="flex items-center justify-between border-b border-gray-300 pb-4">
            <h1 class="text-3xl font-bold text-gray-900 uppercase tracking-wide">
              {{ currentTitle.charAt(0).toUpperCase() + currentTitle.slice(1) }}
            </h1>
          </header>

          <section class="flex-1">
            <router-view />
          </section>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <create-user
      v-if="showUserCreator"
      :available-projects="availableProjects"
      @cancel="closeModal"
      @create-invitation="createUserRequest"
    />

    <!-- Add CreateProject modal when you have it -->
    <!-- <create-project
      v-if="showProjectCreator"
      @cancel="closeModal"
      @create-project="createProjectRequest"
    /> -->
  </div>
</template>

<style scoped>
/* Ensure the layout takes full height */
.flex {
  min-height: 0;
}
</style>
