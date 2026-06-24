<script lang="ts" setup>
import type { UserResponse } from '@/types/types.ts'
import { computed, ref } from 'vue'

const { users } = defineProps<{ users: UserResponse[] }>()
const emit = defineEmits<{
  (e: 'edit', user: UserResponse): void
  (e: 'delete', user: UserResponse): void
  (e: 'selectionChange', selectedIds: string[]): void
}>()

// Selection state
const selectedUsers = ref<Set<string>>(new Set())
const selectAll = ref(false)

// Computed property for "select all" state
const isAllSelected = computed(() => users.length > 0 && selectedUsers.value.size === users.length)

const isSomeSelected = computed(
  () => selectedUsers.value.size > 0 && selectedUsers.value.size < users.length,
)

// Toggle individual user selection
const toggleUser = (userId: string) => {
  if (selectedUsers.value.has(userId)) {
    selectedUsers.value.delete(userId)
  } else {
    selectedUsers.value.add(userId)
  }
  emit('selectionChange', Array.from(selectedUsers.value))
}

// Toggle all users
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedUsers.value.clear()
  } else {
    users.forEach((user) => selectedUsers.value.add(user.id))
  }
  emit('selectionChange', Array.from(selectedUsers.value))
}

// Utility to choose Tailwind classes per role
const roleClass = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-700 border border-red-300'
    case 'editor':
      return 'bg-blue-100 text-blue-700 border border-blue-300'
    default: // 'user'
      return 'bg-green-100 text-green-700 border border-green-300'
  }
}
</script>

<template>
  <div class="overflow-x-auto border border-gray-300">
    <table class="w-full text-sm text-left text-gray-600">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-300">
        <tr>
          <th class="p-4 w-12 whitespace-nowrap">
            <input
              :checked="isAllSelected"
              :indeterminate="isSomeSelected"
              aria-label="Select all users"
              class="w-4 h-4 text-blue-600 bg-gray-200 border-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              type="checkbox"
              @change="toggleAll"
            />
          </th>
          <th class="py-3 px-6 font-semibold whitespace-nowrap">ID</th>
          <th class="py-3 px-6 font-semibold whitespace-nowrap">Username</th>
          <th class="py-3 px-6 font-semibold whitespace-nowrap">Name</th>
          <th class="py-3 px-6 font-semibold whitespace-nowrap">Email</th>
          <th class="py-3 px-6 font-semibold whitespace-nowrap">Role</th>
          <th class="py-3 px-6 text-right font-semibold whitespace-nowrap">Actions</th>
        </tr>
      </thead>
      <tbody v-if="users.length">
        <tr
          v-for="user in users"
          :key="user.id"
          :class="{ 'bg-blue-50': selectedUsers.has(user.id) }"
          class="bg-gray-100 border-b border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <td class="p-4 whitespace-nowrap">
            <input
              :aria-label="`Select ${user.username}`"
              :checked="selectedUsers.has(user.id)"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              type="checkbox"
              @change="toggleUser(user.id)"
            />
          </td>
          <td class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{{ user.id }}</td>
          <td class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{{ user.username }}</td>
          <td class="py-4 px-6 whitespace-nowrap">{{ user.name }} {{ user.lastName }}</td>
          <td class="py-4 px-6 whitespace-nowrap">{{ user.email }}</td>
          <td class="py-4 px-6 whitespace-nowrap">
            <span
              :class="roleClass(user.role)"
              class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium capitalize"
            >
              {{ user.role }}
            </span>
          </td>
          <td class="py-4 px-6 whitespace-nowrap">
            <div class="flex justify-end items-center gap-1">
              <!-- Edit User -->
              <button
                aria-label="Edit user"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit user"
                @click="emit('edit', user)"
              >
                <svg
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                  />
                  <path
                    clip-rule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    fill-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Delete User -->
              <button
                aria-label="Delete user"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete user"
                @click="emit('delete', user)"
              >
                <svg
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    fill-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td class="py-12 text-center text-gray-500" colspan="7">
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
              <p class="text-sm font-medium">No users found</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Indeterminate checkbox state */
input[type='checkbox']:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10h8'/%3e%3c/svg%3e");
  background-color: currentColor;
  border-color: transparent;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
