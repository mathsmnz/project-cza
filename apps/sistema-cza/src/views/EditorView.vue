<template>
  <div class="bg-gray-50 h-full w-full relative">
    <!-- Viewer Container -->
    <div ref="viewerContainer" class="fixed h-full w-full z-0">
      <!-- Loading Overlay -->
      <div v-if="!isEditorReady" class="absolute inset-0 flex flex-col justify-center items-center bg-gray-900/50 backdrop-blur-sm z-20">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>
        <p class="text-gray-700 mt-4 font-medium">Carregando modelo 3D...</p>
      </div>
    </div>

    <!-- Floating Menu -->
    <div class="fixed top-20 left-4 z-20">
      <div class="bg-white border border-gray-200 shadow-2xl overflow-hidden" :class="isMenuExpanded ? 'w-72' : 'w-auto'">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 v-if="isMenuExpanded" class="text-sm font-bold text-gray-800">Visualizador IFC</h2>
          <button
            @click="toggleMenu"
            class="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
            :class="{ 'ml-auto': !isMenuExpanded }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 transition-transform"
              :class="{ 'rotate-180': isMenuExpanded }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Menu Content -->
        <transition name="menu-expand">
          <div v-if="isMenuExpanded" class="p-4 space-y-3">
            <!-- Control Buttons -->
            <button
              @click="loadFromFile"
              class="w-full flex items-center space-x-3 bg-white border border-gray-300 text-gray-700 p-3 hover:bg-gray-100 focus:outline-none font-semibold transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Importar Arquivo IFC</span>
            </button>

            <button
              @click="exportFragments"
              class="w-full flex items-center space-x-3 bg-black text-white p-3 hover:bg-gray-900 focus:outline-none font-semibold transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Exportar Modelo</span>
            </button>

            <button
              @click="captureView(selectionId)"
              class="w-full flex items-center space-x-3 bg-black text-white p-3 hover:bg-gray-900 focus:outline-none font-semibold transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Gerar Imagem</span>
            </button>

            <!-- Divider -->
            <div class="border-t border-gray-200 my-3"></div>

            <!-- Plants Section -->
            <div>
              <button
                @click="togglePlants"
                class="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-2"
              >
                <span>Plantas Disponíveis</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': isPlantsExpanded }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <transition name="dropdown">
                <div v-if="isPlantsExpanded">
                  <div v-if="!plans || plans.length === 0" class="text-gray-500 text-sm py-2 px-3">
                    Carregando plantas...
                  </div>

                  <div v-else class="space-y-2">
                    <button
                      v-for="plan in plans"
                      :key="plan.id"
                      @click="selectPlan(plan.id)"
                      class="w-full text-left bg-gray-50 border border-gray-200 text-gray-700 p-2 hover:bg-gray-100 focus:outline-none transition-colors text-sm"
                    >
                      {{ plan.name }}
                    </button>

                    <button
                      @click="resetPlanView"
                      class="w-full flex items-center space-x-2 bg-red-600 text-white p-2 hover:bg-red-700 focus:outline-none font-semibold transition-colors text-sm mt-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Resetar Visualização</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Helper Text -->
            <div class="pt-3 border-t border-gray-200">
              <p class="text-gray-600 text-xs leading-relaxed">
                Importe um arquivo IFC para começar a visualização.
              </p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data.js'
import { useEditorController } from '@/editor/editorController.ts'
import { useProjectsStore } from '@/stores/projects.ts'
import { storeToRefs } from 'pinia'
import { getProjectFileUrl } from '@/api/axios.ts'

const store = useDataStore()
const selectionId = store.getSelectionId

const projectStore = useProjectsStore()
const { currentProject } = storeToRefs(projectStore)

// 3D container reference
const viewerContainer = ref<HTMLDivElement | null>(null)

// Menu state
const isMenuExpanded = ref(true)
const isPlantsExpanded = ref(false)

// Get controller functions
const {
  plans,
  setupEditor,
  loadFromFile,
  exportFragments,
  isEditorReady,
  selectPlan,
  resetPlanView,
  captureView
} = useEditorController(viewerContainer)

// Menu controls
function toggleMenu() {
  isMenuExpanded.value = !isMenuExpanded.value
  if (!isMenuExpanded.value) {
    isPlantsExpanded.value = false
  }
}

function togglePlants() {
  isPlantsExpanded.value = !isPlantsExpanded.value
}

// Setup scene on mount
onMounted(() => {
  if (!currentProject.value) return
  const selectionStr = selectionId
  const projectFileUrl = getProjectFileUrl(currentProject.value.id, `${selectionStr}.ifc`)
  console.log(projectFileUrl)
  setupEditor({
    fileName: selectionStr,
    fileSource: projectFileUrl
  })
})
</script>

<style scoped>
/* Menu expand animation */
.menu-expand-enter-active,
.menu-expand-leave-active {
  transition: all 0.3s ease;
}

.menu-expand-enter-from,
.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.dropdown-enter-to,
.dropdown-leave-from {
  max-height: 500px;
}
</style>
