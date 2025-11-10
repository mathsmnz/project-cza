<script setup lang="ts">
import type { InvitationResponse } from '@/types/types.ts'
import { computed, ref } from 'vue'

const { invites } = defineProps<{ invites: InvitationResponse[] }>()
const emit = defineEmits<{
  (e: 'refresh', email: string): void
  (e: 'delete', token: string): void
  (e: 'revoke', email: string): void
  (e: 'selectionChange', selectedEmails: string[]): void
}>()

// Selection state
const selectedInvites = ref<Set<string>>(new Set())

// Computed properties for selection
const isAllSelected = computed(
  () => invites.length > 0 && selectedInvites.value.size === invites.length,
)

const isSomeSelected = computed(
  () => selectedInvites.value.size > 0 && selectedInvites.value.size < invites.length,
)

// Toggle individual invite selection
const toggleInvite = (email: string) => {
  if (selectedInvites.value.has(email)) {
    selectedInvites.value.delete(email)
  } else {
    selectedInvites.value.add(email)
  }
  emit('selectionChange', Array.from(selectedInvites.value))
}

// Toggle all invites
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedInvites.value.clear()
  } else {
    invites.forEach((invite) => selectedInvites.value.add(invite.email))
  }
  emit('selectionChange', Array.from(selectedInvites.value))
}

const inviteClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
    case 'accepted':
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
              class="w-4 h-4 text-blue-600 bg-gray-200 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Select all invitations"
            />
          </th>
          <th class="py-3 px-6 font-semibold">Email</th>
          <th class="py-3 px-6 font-semibold">Status</th>
          <th class="py-3 px-6 font-semibold">Registration Link</th>
          <th class="py-3 px-6 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody v-if="invites.length">
        <tr
          v-for="invite in invites"
          :key="invite.email"
          class="bg-gray-100 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': selectedInvites.has(invite.email) }"
        >
          <td class="p-4">
            <input
              type="checkbox"
              :checked="selectedInvites.has(invite.email)"
              @change="toggleInvite(invite.email)"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              :aria-label="`Select ${invite.email}`"
            />
          </td>
          <td class="py-4 px-6 font-medium text-gray-900">{{ invite.email }}</td>
          <td class="py-4 px-6">
            <span
              class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium capitalize"
              :class="inviteClass(invite.status)"
            >
              {{ invite.status }}
            </span>
          </td>
          <td class="py-4 px-6">
            <div class="flex items-center gap-2 max-w-xs">
              <span class="truncate text-gray-600 text-xs font-mono">
                {{ invite.registrationLink }}
              </span>
              <button
                @click="copyLink(invite.registrationLink)"
                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                title="Copy link"
                aria-label="Copy registration link"
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
              <!-- Resend/Refresh Invite -->
              <button
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                @click="emit('refresh', invite.email)"
                aria-label="Resend invitation"
                title="Resend invitation"
                :disabled="invite.status.toLowerCase() === 'accepted'"
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

              <!-- Revoke Invite -->
              <button
                class="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                @click="emit('revoke', invite.email)"
                aria-label="Revoke invitation"
                title="Revoke invitation"
                :disabled="
                  invite.status.toLowerCase() === 'revoked' ||
                  invite.status.toLowerCase() === 'accepted'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Delete Invite -->
              <button
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                @click="emit('delete', invite.registrationLink)"
                aria-label="Delete invitation"
                title="Delete invitation"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p class="text-sm font-medium">No invitations found</p>
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
