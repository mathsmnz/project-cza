<template>
  <div class="relative" v-if="projects?.length">
    <!-- Dropdown trigger -->
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
    >
      <span class="font-medium text-sm">
        {{ currentProject?.name || 'Selecionar projeto' }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isDropdownOpen"
      class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50"
    >
      <ul class="py-1">
        <li
          v-for="project in projects"
          :key="project.id"
          @click="selectProject(project)"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          {{ project.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import type { ProjectResponse } from '@/types/types.ts'

const projectStore = useProjectsStore()
const { currentProject, projects } = storeToRefs(projectStore)

const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function selectProject(project: ProjectResponse) {
  console.log(project.name)
  projectStore.setCurrentProject(project)
  closeDropdown()
}

function handleClickOutside(event: MouseEvent) {
  const dropdown = (event.target as HTMLElement).closest('.relative')
  if (!dropdown) closeDropdown()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
