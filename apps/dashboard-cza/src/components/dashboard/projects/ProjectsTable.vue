<script setup lang="ts">
import type { Project } from '@/types/types.ts'
import { formatDisplayDate } from '@/util/util.ts'
import { ref, computed } from 'vue'

const { projects } = defineProps<{ projects: Project[] }>()
const emit = defineEmits<{
  (e: 'edit', project: Project): void
  (e: 'delete', id: number): void
  (e: 'selectionChange', selectedIds: number[]): void
}>()

// Selection state
const selectedProjects = ref<Set<number>>(new Set())

// Computed properties for selection
const isAllSelected = computed(
  () => projects.length > 0 && selectedProjects.value.size === projects.length,
)

const isSomeSelected = computed(
  () => selectedProjects.value.size > 0 && selectedProjects.value.size < projects.length,
)

// Toggle individual project selection
const toggleProject = (id: number) => {
  if (selectedProjects.value.has(id)) {
    selectedProjects.value.delete(id)
  } else {
    selectedProjects.value.add(id)
  }
  emit('selectionChange', Array.from(selectedProjects.value))
}

// Toggle all projects
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedProjects.value.clear()
  } else {
    projects.forEach((project) => selectedProjects.value.add(project.id))
  }
  emit('selectionChange', Array.from(selectedProjects.value))
}
</script>

<template>
  <div class="overflow-x-auto   border border-gray-300">
    <table class="w-full text-sm text-left text-gray-600">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-300">
        <tr>
          <th class="p-4 w-12">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isSomeSelected"
              @change="toggleAll"
              class="w-4 h-4 text-blue-600 bg-gray-200 border-gray-400  focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Select all projects"
            />
          </th>
          <th class="py-3 px-6 font-semibold">ID</th>
          <th class="py-3 px-6 font-semibold">Project</th>
          <th class="py-3 px-6 font-semibold">Created</th>
          <th class="py-3 px-6 font-semibold">Description</th>
          <th class="py-3 px-6 text-right font-semibold">Actions</th>
        </tr>
      </thead>

      <tbody v-if="projects.length">
        <tr
          v-for="project in projects"
          :key="project.id"
          class="bg-gray-100 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': selectedProjects.has(project.id) }"
        >
          <td class="p-4">
            <input
              type="checkbox"
              :checked="selectedProjects.has(project.id)"
              @change="toggleProject(project.id)"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  focus:ring-2 focus:ring-blue-500 cursor-pointer"
              :aria-label="`Select ${project.name}`"
            />
          </td>

          <td class="py-4 px-6 font-medium text-gray-900">{{ project.id }}</td>
          <td class="py-4 px-6">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ project.name }}</span>
            </div>
          </td>
          <td class="py-4 px-6 text-gray-600 whitespace-nowrap">
            {{ formatDisplayDate(project.createdAt) }}
          </td>
          <td class="py-4 px-6">
            <div class="max-w-xs">
              <p class="text-gray-600 truncate" :title="project.description">
                {{ project.description || '—' }}
              </p>
            </div>
          </td>
          <td class="py-4 px-6">
            <div class="flex justify-end items-center gap-1">
              <!-- Edit Project -->
              <button
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50   transition-colors"
                @click="emit('edit', project)"
                aria-label="Edit project"
                title="Edit project"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Delete Project -->
              <button
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50   transition-colors"
                @click="emit('delete', project.id)"
                aria-label="Delete project"
                title="Delete project"
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
          <td colspan="6" class="py-12 text-center text-gray-500">
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <p class="text-sm font-medium">No projects found</p>
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
