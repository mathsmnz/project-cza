<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import type { Project, UserCreationRequest } from '@/types/types.ts'
import CreateUser from '@/components/dashboard/modals/CreateUser.vue'
import { inviteUser } from '@/api/axios.ts'
import { useAdminUserStore } from '@/stores/adminUser.ts'
import { useToastStore } from '@/stores/toast.ts'
import ToastNotification from '@/components/ToastNotification.vue'
import { useProjectStore } from '@/stores/adminProjects.ts'
import { storeToRefs } from 'pinia'
import CreateProject from '@/components/dashboard/modals/CreateProject.vue'

// Get access to the current route object
const route = useRoute()

const adminUserStore = useAdminUserStore()
const toastStore = useToastStore()
const adminProjectStore = useProjectStore()

const currentTitle = computed(() => {
  const title = route.meta.title || 'Dashboard'
  return String(title).toLowerCase()
})

const { projectsPage: projectsPage } = storeToRefs(adminProjectStore)
const { usersPage: usersPage } = storeToRefs(adminUserStore)

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

const closeProjectCreation = () => {
  showProjectCreator.value = false
}

const closeUserCreation = async () => {
  showUserCreator.value = false
  await adminUserStore.loadInvites()
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

onMounted(async () => {
  await adminProjectStore.loadProjects()
})

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
      :available-projects="projectsPage.content"
      @cancel="closeUserCreation"
      @create-invitation="createUserRequest"
    />
    <create-project
      v-if="showProjectCreator"
      :available-users="usersPage.content"
      @cancel="closeProjectCreation"
    />

    <ToastNotification
      :show="toastStore.isVisible"
      :message="toastStore.activeToast?.message || ''"
      :mode="toastStore.activeToast?.mode || 'success'"
      :duration="toastStore.activeToast?.duration || 3000"
      @close="toastStore.onToastClosed"
    />
  </div>
</template>

<style scoped>
/* Ensure the layout takes full height */
.flex {
  min-height: 0;
}
</style>
