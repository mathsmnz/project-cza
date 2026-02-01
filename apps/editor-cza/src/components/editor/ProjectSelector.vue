<template>
  <div class="relative" v-if="projects?.length" ref="dropdownRef">
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
        class="h-4 w-4 text-gray-500 transition-transform"
        :class="{ 'rotate-180': isDropdownOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <transition name="dropdown">
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50"
      >
        <ul class="py-1">
          <li
            v-for="project in projects"
            :key="project.id"
            @click="handleProjectSelect(project)"
            class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            :class="{ 'bg-gray-50 font-semibold': project.id === currentProject?.id }"
          >
            {{ project.name }}
          </li>
        </ul>
      </div>
    </transition>
  </div>

  <!-- Confirmation Modal -->
  <ConfirmationModal
    v-if="showConfirmModal"
    :title="modalTitle"
    :message="modalMessage"
    variant="danger"
    @confirm="confirmProjectChange"
    @cancel="cancelProjectChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import type { ProjectResponse } from '@/types/types.ts'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const projectStore = useProjectsStore()
const { currentProject, projects } = storeToRefs(projectStore)

const dropdownRef = ref<HTMLElement | null>(null)
const isDropdownOpen = ref(false)
const showConfirmModal = ref(false)
const pendingProject = ref<ProjectResponse | null>(null)

const modalTitle = 'Trocar de Projeto'
const modalMessage =
  'Você deseja trocar de projeto? Quaisquer modificações não salvas serão apagadas.'

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleProjectSelect(project: ProjectResponse) {
  // If selecting the same project, just close dropdown
  if (project.id === currentProject.value?.id) {
    closeDropdown()
    return
  }

  // Store pending project and show confirmation
  pendingProject.value = project
  showConfirmModal.value = true
  closeDropdown()
}

function confirmProjectChange() {
  if (pendingProject.value) {
    projectStore.setCurrentProject(pendingProject.value)
  }
  showConfirmModal.value = false
  pendingProject.value = null
}

function cancelProjectChange() {
  showConfirmModal.value = false
  pendingProject.value = null
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
