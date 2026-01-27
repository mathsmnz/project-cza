<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminUserStore } from '@/stores/adminUser.ts' // Adjust path if needed
import type { UserResponse, PasswordRecoveryRequest } from '@/types/types.ts'

// Components
import UsersTable from '@/components/dashboard/users/UsersTable.vue'
import EditUser from '@/components/dashboard/modals/EditUser.vue'
import InvitesTable from '@/components/dashboard/users/InvitesTable.vue'
import PasswordRecoveryTable from '@/components/dashboard/users/PasswordRecoveryTable.vue'
import DeleteUser from '@/components/dashboard/modals/DeleteUser.vue'
import { useAuthStore } from '@/stores/auth.ts'
import { useToastStore } from '@/stores/toast.ts'

// ======================
// Store Setup
// ======================
const adminUserStore = useAdminUserStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const {
  usersPage: usersInfoPage,
  invitesPage: invitesInfoPage,
  recoveriesPage: recoveryInfoPage,
} = storeToRefs(adminUserStore)

const currentUser = authStore.user

// ======================
// Local UI State
// ======================
const showUserEditor = ref<boolean>(false)
const showUserDeletion = ref<boolean>(false)
const userToEdit = ref<UserResponse | null>(null)
const activeTab = ref('All Users')

const pageConfig = {
  page: 0,
  size: 10,
  sort: ',asc',
}

// ======================
// Methods
// ======================

const editCurrentUser = (user: UserResponse): void => {
  userToEdit.value = user
  showUserEditor.value = true
}

const openUserDeletion = (userToDelete: UserResponse): void => {
  if (currentUser) {
    if (currentUser.username === userToDelete.username) {
      toastStore.addToast('You can’t delete your own account.', 'error')
      return
    }
    userToEdit.value = userToDelete
    showUserDeletion.value = true
  }
}

const attemptUserDeletion = async (confirmationCode: string): Promise<void> => {
  if (!userToEdit.value) {
    return
  }

  try {
    const username = userToEdit.value.username

    console.log('Attempting to deletion...')
    console.log(userToEdit.value)
    console.log(confirmationCode)
    await adminUserStore.removeUser(userToEdit.value.id, confirmationCode)

    closeModal()

    toastStore.addToast(`Usuário ${username} apagado com sucesso.`, 'success')
  } catch (error) {
    if (error instanceof Error) {
      toastStore.addToast(error.message, 'error')
    } else {
      toastStore.addToast('Erro inesperado.', 'error')
    }
    console.error(error)
  }
}

const closeModal = (): void => {
  showUserEditor.value = false
  showUserDeletion.value = false
  userToEdit.value = null
}

const saveUser = async (updatedUser: UserResponse): Promise<void> => {
  await adminUserStore.saveUser(updatedUser, pageConfig.page, pageConfig.size)

  showUserEditor.value = false
  userToEdit.value = null
}

// Invitations
const refreshInvites = (token: string) => adminUserStore.refreshUserInvitation(token)
const revokeInvite = (token: string) => adminUserStore.revokeUserInvitation(token)
const deleteInvite = (token: string) => adminUserStore.removeInvitation(token)

// Recovery
const refreshRecovery = (token: string) => adminUserStore.refreshRecoveries(token)
const revokeRecovery = (token: string) => adminUserStore.revokeRecovery(token)
const deleteRecovery = (token: string) => adminUserStore.deleteRecovery(token)

const createRecoveryRequest = async (
  request: PasswordRecoveryRequest,
  onSuccess: (recoveryToken: string) => void,
  onError: () => void,
): Promise<void> => {
  try {
    const token = await adminUserStore.requestRecovery(request)
    console.log('Recovery Token:', token)
    onSuccess(token)
  } catch (error) {
    console.error(error)
    onError()
  }
}

// ======================
// Lifecycle
// ======================
onMounted(async () => {
  // Load all data on mount
  await adminUserStore.loadAll(pageConfig.page, pageConfig.size, pageConfig.sort)

  console.log('Users:', usersInfoPage.value.content)
  console.log('Invites:', invitesInfoPage.value.content)
  console.log('Recoveries:', recoveryInfoPage.value.content)
})
</script>

<template>
  <div>
    <div class="border-b border-b-gray-300 mb-6">
      <nav class="flex space-x-6 -mb-px">
        <a
          href="#"
          @click.prevent="activeTab = 'All Users'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'All Users'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >All Users</a
        >
        <a
          href="#"
          @click.prevent="activeTab = 'Invites'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'Invites'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >Invites</a
        >
        <a
          href="#"
          @click.prevent="activeTab = 'Recovery Requests'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'Recovery Requests'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >Recovery Requests</a
        >
      </nav>
    </div>
  </div>

  <div v-if="adminUserStore.loading" class="text-center py-4 text-gray-500">Loading data...</div>

  <template v-else>
    <users-table
      v-if="activeTab == 'All Users'"
      :users="usersInfoPage.content"
      @edit="editCurrentUser"
      @delete="openUserDeletion"
    />

    <invites-table
      v-if="activeTab == 'Invites'"
      :invites="invitesInfoPage.content"
      @refresh="refreshInvites"
      @revoke="revokeInvite"
      @delete="deleteInvite"
    />

    <password-recovery-table
      v-if="activeTab == 'Recovery Requests'"
      :requests="recoveryInfoPage.content"
      @refresh="refreshRecovery"
      @revoke="revokeRecovery"
      @delete="deleteRecovery"
    />
  </template>

  <edit-user
    v-if="showUserEditor"
    :user="userToEdit"
    @cancel="closeModal"
    @save="saveUser"
    @createRecoveryRequest="createRecoveryRequest"
  />

  <delete-user
    v-if="showUserDeletion"
    :userName="userToEdit ? userToEdit.username : 'INVALID NAME'"
    @cancel="closeModal"
    @confirm="attemptUserDeletion"
  />
</template>

<style scoped></style>
