<script setup lang="ts">
import { useProjectsStore } from '@/stores/projects.ts'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ProjectResponse } from '@/types/types.ts'
import AppNavButton from '@/components/navigation/AppNavButton.vue'

const projectStore = useProjectsStore()
const { projects, currentProject, currentProjectCustomization } = storeToRefs(projectStore)

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
  const dropdown = (event.target as HTMLElement).closest('.project-dropdown')
  if (!dropdown) closeDropdown()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <main class="h-screen w-full flex bg-white">
    <div class="w-full h-full flex flex-col md:flex-row">
      <!-- Image Section with Border -->
      <div
        class="w-full md:w-2/5 h-64 md:h-full relative border-b-2 md:border-b-0 md:border-r-2 border-black"
      >
        <img
          alt="casa"
          rel="preload"
          fetchpriority="high"
          src="/casa.png?url"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Content Section -->
      <div class="flex-1 flex items-center justify-start p-8 md:p-16">
        <div class="max-w-2xl w-full">
          <p class="text-2xl font-bold text-gray-900 mb-2">Você está editando:</p>

          <div v-if="projects.length > 0" class="space-y-8">
            <!-- Project Selector -->
            <div class="relative project-dropdown">
              <button
                @click="toggleDropdown"
                class="group flex items-center gap-3 text-gray-900 hover:text-gray-600 transition-colors"
              >
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-left">
                  {{ currentProject?.name || 'Selecionar projeto' }}
                </h1>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 transition-transform duration-200"
                  :class="{ 'rotate-180': isDropdownOpen }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isDropdownOpen"
                  class="absolute left-0 mt-4 w-full bg-white border-2 border-black shadow-lg z-50"
                >
                  <ul class="py-2">
                    <li
                      v-for="project in projects"
                      :key="project.id"
                      @click="selectProject(project)"
                      class="px-6 py-3 text-lg text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                      :class="{ 'bg-gray-50 font-semibold': currentProject?.id === project.id }"
                    >
                      {{ project.name }}
                    </li>
                  </ul>
                </div>
              </transition>
            </div>

            <!-- Description -->
            <p class="text-lg md:text-xl text-gray-600 leading-relaxed">
              {{ currentProject?.description || 'Selecione um projeto para começar' }}
            </p>

            <!-- Action Button -->
            <AppNavButton
              path="/options"
              :disabled="currentProjectCustomization === null"
            >
              Avançar
            </AppNavButton>
          </div>

          <!-- No Projects State -->
          <div v-else class="text-center">
            <div class="inline-block p-8 border-2 border-gray-300">
              <p class="text-2xl font-bold text-gray-900 mb-2">Sem projetos disponíveis</p>
              <p class="text-gray-600">Crie um projeto para começar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Optional: Add custom scrollbar for dropdown if needed */
.project-dropdown ul {
  max-height: 300px;
  overflow-y: auto;
}
</style>
