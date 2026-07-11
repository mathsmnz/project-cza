<template>
  <main class="h-screen w-full bg-white overflow-y-auto md:overflow-hidden">
    <div class="w-full flex flex-col md:flex-row md:h-full">
      <!-- Left side: Image of the house -->
      <div ref="imagePanelRef" class="w-full md:w-1/2 h-64 shrink-0 md:h-full relative border-b-2 md:border-b-0 md:border-r-2 border-black flex items-center justify-center bg-gray-50">
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

        <!-- Fullscreen expand button (mobile only) -->
        <button
          v-if="imagePath"
          @click="showFullscreen = true"
          class="absolute bottom-3 right-3 z-10 md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium active:bg-black/70 transition-colors"
          aria-label="Ampliar imagem"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
          </svg>
          Ampliar
        </button>
      </div>

      <!-- Right side: Info and actions -->
      <div class="w-full md:w-1/2 flex items-center justify-start p-8 md:p-16 md:overflow-y-auto">
        <div class="max-w-2xl w-full">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Validação do Projeto</h1>
          
          <div class="space-y-6">
            <div class="bg-gray-50 p-6 border-2 border-black">
              <h2 class="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Resumo Financeiro</h2>

              <div class="grid grid-cols-2 gap-6">
                <!-- Delta: the headline number -->
                <div>
                  <p class="text-sm uppercase font-bold tracking-wider mb-1"
                     :class="costDelta > 0 ? 'text-red-500' : costDelta < 0 ? 'text-green-600' : 'text-gray-500'">
                    {{ costDelta > 0 ? 'Acréscimo' : costDelta < 0 ? 'Economia' : 'Sem alteração' }}
                  </p>
                  <p class="text-3xl font-bold"
                     :class="costDelta > 0 ? 'text-red-500' : costDelta < 0 ? 'text-green-600' : 'text-gray-400'">
                    {{ costDelta > 0 ? '+' : '' }}R$ {{ costDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </p>
                </div>

                <!-- Area -->
                <div>
                  <p class="text-sm text-gray-600 uppercase font-bold tracking-wider mb-1">Área Total</p>
                  <p class="text-3xl font-bold text-gray-900">{{ totalArea.toFixed(2) }} m²</p>
                </div>
              </div>
            </div>

            <div v-if="selectionDescription" class="bg-gray-50 p-6 border-2 border-black">
              <h2 class="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Descrição do Projeto</h2>
              <p class="text-gray-800 whitespace-pre-line">{{ selectionDescription }}</p>
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

    <!-- Fullscreen image viewer (mobile) -->
    <ImageFullscreenViewer
      :visible="showFullscreen"
      :src="imagePath"
      @close="showFullscreen = false"
    />

    <!-- Floating "Ver planta" pill (appears when image scrolls out of view, mobile only) -->
    <Transition name="fab-slide">
      <button
        v-if="!isMdOrLarger && isImageOutOfView && !showFullscreen"
        class="fixed bottom-24 right-4 z-30 flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-gray-900/80 backdrop-blur-md text-white text-sm font-medium shadow-lg active:bg-gray-900 transition-colors"
        @click="showFullscreen = true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
        Ver planta
      </button>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTelemetryStore } from '@/stores/telemetry'
import { useDataStore } from '@/stores/data'
import { fetchProtectedFileUrl } from '@/api/axios'
import ImageFullscreenViewer from '@/components/ImageFullscreenViewer.vue'

const router = useRouter()
const projectStore = useProjectsStore()
const telemetryStore = useTelemetryStore()
const dataStore = useDataStore()

const showFullscreen = ref(false)
const imagePath = ref<string>('')
const totalArea = ref<number>(0)
const totalCost = ref<number>(0)
const baseCost = ref<number>(0)
const costDelta = ref<number>(0)
const selectionDescription = ref<string>('')

const isMdOrLarger = ref<boolean>(window.matchMedia('(min-width: 768px)').matches)
const isImageOutOfView = ref(false)
const imagePanelRef = ref<HTMLElement | null>(null)
let imageObserver: IntersectionObserver | null = null

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

const handleResize = debounce((): void => {
  isMdOrLarger.value = window.matchMedia('(min-width: 768px)').matches
}, 150)

const calculateTotals = () => {
  const displayId = dataStore.selectionId
  const base = projectStore.currentProject?.baseCost ?? 0
  baseCost.value = base
  console.log("Base Cost: ", baseCost.value)
  console.log("Display ID: ", displayId)

  if (projectStore.currentProjectCustomization && displayId) {
    const match = projectStore.currentProjectCustomization.selections.find(s => s.id === displayId)
    console.log("Match: ", match)
    if (match) {
      totalArea.value = match.area || 0
      totalCost.value = match.cost || 0
      console.log("Total Cost: ", totalCost.value)
      costDelta.value = (match.cost || 0) - base
      selectionDescription.value = match.description || ''
      console.log("Cost Delta: ", costDelta.value)
      console.log("Description: ", selectionDescription.value)
      console.log("Area: ", totalArea.value)
      return
    }
  }

  totalArea.value = 0
  totalCost.value = base
  costDelta.value = 0
  selectionDescription.value = ''
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    if (imagePanelRef.value) {
      imageObserver = new IntersectionObserver(
        ([entry]) => {
          if (!isMdOrLarger.value && entry) {
            isImageOutOfView.value = !entry.isIntersecting
          } else {
            isImageOutOfView.value = false
          }
        },
        { threshold: 0.1 }
      )
      imageObserver.observe(imagePanelRef.value)
    }
  })

  if (!projectStore.currentProject) {
    router.push('/preflight')
    return
  }

  // Calculate area and cost based on the exact Selection ID
  calculateTotals()

  // Load Image using the hash ID from dataStore
  try {
    const displayId = dataStore.selectionId
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
  window.removeEventListener('resize', handleResize)
  if (imageObserver && imagePanelRef.value) {
    imageObserver.unobserve(imagePanelRef.value)
    imageObserver.disconnect()
  }

  if (imagePath.value && imagePath.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePath.value)
  }
})

const formatSelectionName = (comboId: string) => {
  if (projectStore.currentProjectCustomization) {
    for (const group of projectStore.currentProjectCustomization.groups) {
      const combo = group.combos.find(c => c.associated === comboId)
      if (combo) return combo.label
    }
  }
  return comboId
}

const goBack = () => {
  router.push('/options')
}

const confirmAndProceed = () => {
  telemetryStore.setStatus('VALIDATED')
  router.push('/editor')
}
</script>
