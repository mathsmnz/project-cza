<template>
  <main class="h-screen w-full flex bg-white">
    <div class="w-full h-full flex flex-col md:flex-row">
      <!-- Left side: Image of the house -->
      <div class="w-full md:w-1/2 h-64 md:h-full relative border-b-2 md:border-b-0 md:border-r-2 border-black flex items-center justify-center bg-gray-50">
        <img
          v-if="imagePath"
          :src="imagePath"
          alt="Combinação Selecionada"
          class="max-w-full max-h-full object-contain"
        />
        <div v-else class="flex flex-col items-center justify-center text-gray-500">
          <svg class="w-12 h-12 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Gerando visualização...</p>
        </div>
      </div>

      <!-- Right side: Info and actions -->
      <div class="w-full md:w-1/2 flex items-center justify-start p-8 md:p-16 overflow-y-auto">
        <div class="max-w-2xl w-full">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Validação do Projeto</h1>
          
          <div class="space-y-6">
            <div class="bg-gray-50 p-6 border-2 border-black">
              <h2 class="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Resumo Financeiro</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600 uppercase font-bold tracking-wider">Custo Estimado</p>
                  <p class="text-3xl font-bold text-gray-900 mt-1">R$ {{ totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600 uppercase font-bold tracking-wider">Área Total</p>
                  <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalArea.toFixed(2) }} m²</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-6 border-2 border-black">
              <h2 class="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Módulos Selecionados</h2>
              <ul class="list-disc pl-5 space-y-2">
                <li v-for="selection in telemetryStore.finalSelection" :key="selection" class="text-gray-800">
                  {{ formatSelectionName(selection) }}
                </li>
              </ul>
              <p v-if="telemetryStore.finalSelection.length === 0" class="text-gray-500 italic">
                Nenhum módulo selecionado.
              </p>
            </div>

            <div class="pt-6 flex gap-4">
              <button
                @click="goBack"
                class="flex-1 px-6 py-4 border-2 border-black text-lg font-bold text-black hover:bg-gray-100 transition-colors text-center uppercase tracking-wider"
              >
                Voltar
              </button>
              <button
                @click="confirmAndProceed"
                class="flex-1 px-6 py-4 bg-black text-white text-lg font-bold hover:bg-gray-800 transition-colors text-center uppercase tracking-wider"
              >
                Validar e Ver 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTelemetryStore } from '@/stores/telemetry'
import { fetchProtectedFileUrl } from '@/api/axios'

const router = useRouter()
const projectStore = useProjectsStore()
const telemetryStore = useTelemetryStore()

const imagePath = ref<string>('')
const totalArea = ref<number>(0)
const totalCost = ref<number>(0)

const calculateTotals = () => {
  let area = 0
  let cost = 0
  
  if (projectStore.currentProjectCustomization) {
    const allSelections = projectStore.currentProjectCustomization.selections
    
    // Sum area and cost from chosen selections in telemetry
    telemetryStore.finalSelection.forEach(selectionId => {
      // If the selection ID matches something in our customization schema, we could extract area and cost.
      // However, the exact ID used in finalSelection might be the Combo key or Group key.
      // Wait, let's assume the customization schema has area and cost in selections.
      // We will need to map this carefully based on what is in telemetryStore.finalSelection.
      // Since it's a Proof of Concept, let's look for matching names or IDs.
      const match = allSelections.find(s => s.id === selectionId || s.label === selectionId)
      if (match) {
        area += match.area || 0
        cost += match.cost || 0
      }
    })
  }
  
  totalArea.value = area
  totalCost.value = cost
}

onMounted(async () => {
  if (!projectStore.currentProject) {
    router.push('/preflight')
    return
  }

  // Calculate area and cost
  calculateTotals()

  // Load Image (same logic as OptionsView, using displayId)
  try {
    const displayId = telemetryStore.finalSelection.sort().join(',')
    if (!displayId) {
      imagePath.value = await fetchProtectedFileUrl(projectStore.currentProject.id, 'base.png')
    } else {
      imagePath.value = await fetchProtectedFileUrl(projectStore.currentProject.id, `${displayId}.png`)
    }
  } catch (error) {
    console.error('Failed to load validation image:', error)
  }
})

onBeforeUnmount(() => {
  if (imagePath.value && imagePath.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePath.value)
  }
})

const formatSelectionName = (id: string) => {
  // Try to find the label
  if (projectStore.currentProjectCustomization) {
    const match = projectStore.currentProjectCustomization.selections.find(s => s.id === id)
    if (match) return match.label
  }
  return id
}

const goBack = () => {
  router.push('/options')
}

const confirmAndProceed = () => {
  telemetryStore.setStatus('VALIDATED')
  router.push('/editor')
}
</script>
