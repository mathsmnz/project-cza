<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import type { UserCreationRequest } from '@/types/types.ts'
import CreateUser from '@/components/dashboard/modals/CreateUser.vue'
import { inviteUser } from '@/api/axios.ts'

// Get access to the current route object
const route = useRoute()

const currentTitle = computed(() => route.meta.title || 'Dashboard')

const userToCreate = ref<UserCreationRequest>({
  email: '',
  role: 'USER',
  projectIds: [],
})
const showUserCreator = ref<boolean>(false)
const showProjectCreator = ref<boolean>(false)

const openCreationModal = (mode: number) => {
  showUserCreator.value = true
  console.log('Open creation modal')
}

const closeModel = () => {
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
    console.log(invitationResponse)
    onSuccess(invitationResponse.registrationLink)
  } catch (err) {
    console.error(err)
    onError()
  }
}
</script>

<template>
  <div class="flex h-full w-screen bg-gray-200 font-sans">
    <DashboardSidebar />

    <main class="flex-grow p-6 md:p-8 overflow-auto">
      <div class="w-full bg-white p-6 md:p-8 border-2 border-black">
        <DashboardHeader :title="currentTitle" @create-user="openCreationModal" />
        <create-user
          v-if="showUserCreator"
          :user="userToCreate"
          @cancel="closeModel"
          @create-invitation="createUserRequest"
        />
        <router-view />
      </div>
    </main>
  </div>
</template>
