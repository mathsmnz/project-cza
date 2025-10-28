<script setup lang="ts">
import type { Project, UserResponse } from '@/types/types.ts'
import { ref } from 'vue'

const { users } = defineProps<{ users: UserResponse[] }>()
const emit = defineEmits<{
  (e: 'edit', project: UserResponse): void
  (e: 'delete', id: number): void
}>()

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
  <div class="overflow-x-auto">
    <table class="w-full text-sm text-left text-gray-600">
      <thead class="text-xs text-gray-700 uppercase bg-gray-100">
        <tr>
          <th class="p-4">
            <input
              type="checkbox"
              class="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
            />
          </th>
          <th class="py-3 px-6">ID</th>
          <th class="py-3 px-6">Username</th>
          <th class="py-3 px-6">Name</th>
          <th class="py-3 px-6">Email</th>
          <th class="py-3 px-6">Role</th>
          <th class="py-3 px-6 text-right">Actions</th>
        </tr>
      </thead>
      <tbody v-if="users.length">
        <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
          <td class="p-4">
            <input
              type="checkbox"
              class="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
            />
          </td>
          <td class="py-4 px-6">{{ user.id }}</td>
          <td class="py-4 px-6">{{ user.username }}</td>
          <td class="py-4 px-6">{{ user.name + ' ' + user.lastName }}</td>
          <td class="py-4 px-6">{{ user.email }}</td>
          <td class="py-4 px-6">
            <!-- Role badge -->
            <span class="px-2 py-1 text-xs font-medium capitalize" :class="roleClass(user.role)">
              {{ user.role }}
            </span>
          </td>
          <td class="py-4 px-6 text-right">
            <div class="flex justify-end items-center space-x-2">
              <button class="text-gray-500 hover:text-black" @click="emit('edit', user)">
                <!-- edit icon -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>

              <button class="text-gray-500 hover:text-red-600" @click="emit('delete', user.id)">
                <!-- trash icon -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* optional subtle hover for clarity */
tr:hover td {
  transition: background 0.15s ease;
}
</style>
