<script setup lang="ts">
import type { PasswordRecoveryResponse } from '@/types/types.ts'
import { ref, computed } from 'vue'

const { requests } = defineProps<{ requests: PasswordRecoveryResponse[] }>()
const emit = defineEmits<{
  (e: 'refresh', email: string): void
  (e: 'delete', token: string): void
  (e: 'selectionChange', selectedEmails: string[]): void
}>()

// Selection state
const selectedRequests = ref<Set<string>>(new Set())

// Computed properties for selection
const isAllSelected = computed(
  () => requests.length > 0 && selectedRequests.value.size === requests.length,
)

const isSomeSelected = computed(
  () => selectedRequests.value.size > 0 && selectedRequests.value.size < requests.length,
)

// Toggle individual request selection
const toggleRequest = (email: string) => {
  if (selectedRequests.value.has(email)) {
    selectedRequests.value.delete(email)
  } else {
    selectedRequests.value.add(email)
  }
  emit('selectionChange', Array.from(selectedRequests.value))
}

// Toggle all requests
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedRequests.value.clear()
  } else {
    requests.forEach((request) => {
      if (request.email) {
        selectedRequests.value.add(request.email)
      }
    })
  }
  emit('selectionChange', Array.from(selectedRequests.value))
}

const recoveryStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
    case 'used':
      return 'bg-green-100 text-green-700 border border-green-300'
    case 'revoked':
      return 'bg-red-100 text-red-700 border border-red-300'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300'
  }
}

// Copy link to clipboard
const copyLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link)
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}
</script>

<template>
  <div class="overflow-x-auto border border-gray-300">
    <table class="w-full text-sm text-left text-gray-600">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-300">
        <tr>
          <th class="p-4 w-12">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isSomeSelected"
              @change="toggleAll"
              class="w-4 h-4 text-blue-600 bg-gray-200 border-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Select all recovery requests"
            />
          </th>
          <th class="py-3 px-6 font-semibold">Email</th>
          <th class="py-3 px-6 font-semibold">Status</th>
          <th class="py-3 px-6 font-semibold">Recovery Link</th>
          <th class="py-3 px-6 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody v-if="requests.length">
        <tr
          v-for="request in requests"
          :key="request.email"
          class="bg-gray-100 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': selectedRequests.has(request.email) }"
        >
          <td class="p-4">
            <input
              type="checkbox"
              :checked="selectedRequests.has(request.email)"
              @change="toggleRequest(request.email)"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              :aria-label="`Select ${request.email}`"
            />
          </td>
          <td class="py-4 px-6 font-medium text-gray-900">{{ request.email }}</td>
          <td class="py-4 px-6">
            <span
              class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium capitalize"
              :class="recoveryStatus(request.status)"
            >
              {{ request.status }}
            </span>
          </td>
          <td class="py-4 px-6">
            <div class="flex items-center gap-2 max-w-xs">
              <span class="truncate text-gray-600 text-xs font-mono">
                {{ request.token }}
              </span>
              <button
                @click="copyLink(request.token)"
                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Copy link"
                aria-label="Copy recovery link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path
                    d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                  />
                </svg>
              </button>
            </div>
          </td>
          <td class="py-4 px-6">
            <div class="flex justify-end items-center gap-1">
              <!-- Resend Recovery Link -->
              <button
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                @click="emit('refresh', request.email)"
                aria-label="Resend recovery link"
                title="Resend recovery link"
                :disabled="request.status.toLowerCase() === 'used'"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Delete Recovery Request -->
              <button
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                @click="emit('delete', request.token)"
                aria-label="Delete recovery request"
                title="Delete recovery request"
              >
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
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="py-12 text-center text-gray-500">
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <p class="text-sm font-medium">No recovery requests found</p>
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

/* Disabled button styles */
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: transparent;
  color: inherit;
}
</style>
