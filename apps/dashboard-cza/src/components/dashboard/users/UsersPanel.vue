<script setup lang="ts">
import UsersTable from '@/components/dashboard/users/UsersTable.vue'
import EditUser from '@/components/dashboard/modals/EditUser.vue'
import { onMounted, ref } from 'vue'
import {
  fetchAllPasswordRecoveries,
  fetchInvitations,
  fetchUserInfo, requestPasswordRecovery,
  updateUser,
} from '@/api/axios.ts'
import type {
  InvitationResponse,
  Page,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  UserResponse,
} from '@/types/types.ts'
import InvitesTable from '@/components/dashboard/users/InvitesTable.vue'
import PasswordRecoveryTable from '@/components/dashboard/users/PasswordRecoveryTable.vue'

const showUserEditor = ref<boolean>(false)
const userToEdit = ref<UserResponse | null>(null)

const usersInfoPage = ref<Page<UserResponse>>({
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
})
const invitesInfoPage = ref<Page<InvitationResponse>>({
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
})
const recoveryInfoPage = ref<Page<PasswordRecoveryResponse>>({
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
})

const page = {
  page: 0,
  size: 10,
  sort: ',asc',
  sortParam: '',
}

const editCurrentUser = (user: UserResponse): void => {
  userToEdit.value = user
  showUserEditor.value = true
}

const cancelEdit = (): void => {
  showUserEditor.value = false
  userToEdit.value = null
}

const saveUser = async (updatedUser: UserResponse): Promise<void> => {
  await updateUser(updatedUser)

  showUserEditor.value = false
  userToEdit.value = null

  usersInfoPage.value = await fetchUserInfo(page.page, page.size, page.sort)
}

const createRecoveryRequest = async (
  request: PasswordRecoveryRequest,
  onSuccess: (recoveryToken: string) => void,
  onError: () => void,
): Promise<void> => {
  try{
    const recoveryResponse = await requestPasswordRecovery(request)
    console.log(recoveryResponse)
    onSuccess(recoveryResponse.token)
  }catch(error){
    console.log(error)
    onError()
  }
}

onMounted(async () => {
  usersInfoPage.value = await fetchUserInfo(page.page, page.size, 'name' + page.sort)
  invitesInfoPage.value = await fetchInvitations(page.page, page.size, 'email' + page.sort)
  recoveryInfoPage.value = await fetchAllPasswordRecoveries(
    page.page,
    page.size,
    'email' + page.sort,
  )
  console.log(usersInfoPage.value.content)
  console.log(invitesInfoPage.value.content)
  console.log(recoveryInfoPage.value.content)
})

const activeTab = ref('All Users')
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
  <users-table
    v-if="activeTab == 'All Users'"
    :users="usersInfoPage.content"
    @edit="editCurrentUser"
  />
  <invites-table v-if="activeTab == 'Invites'" :invites="invitesInfoPage.content" />
  <password-recovery-table
    v-if="activeTab == 'Recovery Requests'"
    :requests="recoveryInfoPage.content"
  />
  <edit-user
    v-if="showUserEditor"
    :user="userToEdit"
    @cancel="cancelEdit"
    @save="saveUser"
    @createRecoveryRequest="createRecoveryRequest"
  />
</template>

<style scoped></style>
