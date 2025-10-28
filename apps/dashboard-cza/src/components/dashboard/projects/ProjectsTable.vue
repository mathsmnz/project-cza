<script setup lang="ts">
import type { Project } from '@/types/types.ts'
import { formatDisplayDate } from '@/util/util.ts'

const { projects } = defineProps<{ projects: Project[] }>()
const emit = defineEmits<{
  (e: 'edit', project: Project): void
  (e: 'delete', id: number): void
}>()
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
          <th class="py-3 px-6">Project</th>
          <th class="py-3 px-6">Creation Date</th>
          <th class="py-3 px-6">Description</th>
          <th class="py-3 px-6 text-right">Actions</th>
        </tr>
      </thead>

      <tbody v-if="projects.length">
        <tr
          v-for="project in projects"
          :key="project.id"
          class="bg-white border-b hover:bg-gray-100"
        >
          <td class="p-4">
            <input
              type="checkbox"
              class="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black"
            />
          </td>

          <td class="py-4 px-6">{{ project.id }}</td>
          <td class="py-4 px-6 font-medium text-gray-900">{{ project.name }}</td>
          <td class="py-4 px-6">{{ formatDisplayDate(project.createdAt) }}</td>
          <td class="py-4 px-6 text-gray-700">{{ project.description }}</td>
          <td class="py-4 px-6 text-right">
            <div class="flex justify-end items-center space-x-2">
              <button class="text-gray-500 hover:text-black" @click="emit('edit', project)">
                <!-- edit icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                  />
                </svg>
              </button>

              <button class="text-gray-500 hover:text-black" @click="emit('delete', project.id)">
                <!-- trash icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td colspan="6" class="py-6 text-center text-gray-500">No projects found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
