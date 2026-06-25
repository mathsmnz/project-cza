<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="handleClose"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white shadow-2xl w-[900px] h-[600px] transform transition-all duration-300 ease-out overflow-hidden"
      >
        <!-- Header -->
        <div
          class="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-white border-b border-gray-200 z-50"
        >
          <h2 class="text-xl font-bold text-gray-800">
            Visualizador IFC
            <span v-if="displayName" class="text-gray-400 font-normal"> — {{ displayName }}</span>
          </h2>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Viewer container -->
        <div ref="viewerContainer" class="w-full h-full pt-16 pb-20"></div>

        <!-- Toolbar over Gizmo -->
        <div v-if="canToggleElements" class="absolute right-6 top-[240px] z-50 flex flex-col space-y-2">
          <!-- Reset Camera (Home) -->
          <button
            @click="resetCamera"
            class="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow hover:bg-gray-50 transition-all text-gray-600 hover:text-black"
            title="Vista Inicial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>

          <!-- Fit to Screen -->
          <button
            @click="fitToScreen"
            class="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow hover:bg-gray-50 transition-all text-gray-600 hover:text-black"
            title="Enquadrar Modelo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <!-- Toggle Orthographic -->
          <button
            @click="handleToggleOrtho"
            class="w-9 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow transition-all"
            :class="isOrtho ? 'bg-gray-100 text-black border-gray-400' : 'text-gray-600 hover:bg-gray-50 hover:text-black'"
            :title="isOrtho ? 'Voltar para Visão 3D' : 'Alternar para Visão Topo (2D)'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v16H4V4zm0 8h16M12 4v16" />
            </svg>
          </button>
        </div>

        <div
          v-if="canToggleElements && hideElements"
          class="absolute left-4 bottom-24 z-50 w-80 max-h-56 overflow-hidden bg-white border border-gray-200 shadow-lg"
        >
          <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <span class="text-xs font-semibold uppercase text-gray-600"
              >Elementos para ocultar</span
            >
            <span class="text-xs text-gray-500">
              {{ selectedHiddenElementIds.length }}/{{ toggleableElements.length }}
            </span>
          </div>

          <div v-if="toggleableElements.length > 0" class="max-h-44 overflow-y-auto p-2">
            <label
              v-for="element in toggleableElements"
              :key="element.id"
              class="flex items-start gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                v-model="selectedHiddenElementIds"
                :value="element.id"
                type="checkbox"
                class="mt-0.5 h-4 w-4 accent-black"
              />
              <span class="min-w-0">
                <span class="block font-semibold">{{ element.entity }}</span>
                <span class="block truncate text-gray-500" :title="element.name">
                  {{ element.name }}
                </span>
              </span>
            </label>
          </div>

          <div v-else class="px-3 py-4 text-xs text-gray-500">
            Nenhum IFCROOF ou IFCSLAB encontrado no modelo carregado.
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200 z-50"
        >
          <!-- Level Selector Dropdown -->
          <div class="flex items-center space-x-2">
            <template v-if="plans && plans.length > 0">
              <label for="level-select" class="text-sm font-semibold text-gray-700">Nível:</label>
              <select
                id="level-select"
                v-model="selectedLevelId"
                @change="handleLevelChange"
                class="bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:border-black font-semibold text-sm cursor-pointer transition-colors"
              >
                <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }}
                </option>
              </select>
            </template>
            <span v-else class="text-xs text-gray-500 italic">
              Nenhum nível detectado no modelo IFC.
            </span>
          </div>

          <div
            v-if="canToggleElements"
            class="flex items-center gap-2 text-sm font-semibold text-gray-700"
          >
            <input
              id="EnableElementToggle"
              v-model="hideElements"
              type="checkbox"
              class="h-4 w-4 accent-black"
            />
            <label for="EnableElementToggle" class="cursor-pointer"
              >Ocultar telhados e/ou Slabs</label
            >
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4">
            <button
              @click="loadIfcFile()"
              class="bg-white text-gray-700 py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold transition-colors"
            >
              Carregar IFC
            </button>
            <button
              @click="() => uploadIfcFile()"
              class="bg-black text-white py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold transition-colors"
            >
              Salvar IFC
            </button>
            <button
              @click="() => captureImage()"
              :disabled="plans.length === 0"
              class="bg-black text-white py-2 px-4 hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none font-semibold transition-colors"
            >
              Gerar Imagem
            </button>
          </div>
        </div>
      </div>
    </transition>
    <ToastNotification
      :show="toastState.show"
      :message="toastState.message"
      :mode="toastState.mode"
      :duration="toastState.duration"
      @close="hideToast"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, reactive } from 'vue'
import { useEditorController } from '@/editor/editorController.ts'
import { uploadProjectFile, fetchProtectedFileUrl } from '@/api/axios.ts'
import ToastNotification from '@/components/ToastNotification.vue'

const props = defineProps<{
  mode: string
  ifcFile: string | null
  projectId: string | null
  hasFile: boolean
  displayName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'area-calculated', area: number): void
}>()

const viewerContainer = ref<HTMLDivElement | null>(null)
const loadedIfc = ref<ArrayBuffer | null>(null)
const {
  plans,
  toggleableElements,
  setupEditor,
  loadFromFile,
  selectPlan,
  resetPlanView,
  captureView,
  disposeEditor,
  setElementsVisibility,
  toggleProjection,
  fitToScreen,
  resetCamera,
  calculateModelArea,
} = useEditorController(viewerContainer)

const isOrtho = ref(false)

const handleToggleOrtho = () => {
  isOrtho.value = !isOrtho.value
  if (isOrtho.value) {
    if (selectedLevelId.value) {
      selectPlan(selectedLevelId.value)
    }
  } else {
    resetPlanView()
    resetCamera()
  }
}

const selectedLevelId = ref<string>('')

const handleLevelChange = () => {
  if (isOrtho.value && selectedLevelId.value) {
    selectPlan(selectedLevelId.value)
  }
}
const hideElements = ref<boolean>(false)
const selectedHiddenElementIds = ref<number[]>([])
const canToggleElements = computed(() => Boolean(loadedIfc.value || props.hasFile))
const autoLoadedUrl = ref<string | null>(null)

const toastState = reactive({
  show: false,
  message: '',
  mode: 'success',
  duration: 3000,
})

const showToast = (message: string, mode = 'success', duration = 3000) => {
  toastState.message = message
  toastState.mode = mode
  toastState.duration = duration
  toastState.show = true
}

const hideToast = () => {
  toastState.show = false
}

watch(
  () => plans.value,
  (newPlans) => {
    console.log('Detected levels/plans in IFC:', newPlans)
    if (newPlans && newPlans.length > 0) {
      if (!selectedLevelId.value || !newPlans.some((p) => p.id === selectedLevelId.value)) {
        selectedLevelId.value = newPlans[0]?.id ?? ''
      }
    } else {
      selectedLevelId.value = ''
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => toggleableElements.value,
  (newElements) => {
    const availableIds = new Set(newElements.map((element) => element.id))
    selectedHiddenElementIds.value = selectedHiddenElementIds.value.filter((id) =>
      availableIds.has(id),
    )
  },
  { deep: true },
)

watch(
  () => [hideElements.value, selectedHiddenElementIds.value],
  ([isHidingEnabled, hiddenIds]) => {
    const allIds = toggleableElements.value.map(e => e.id)
    if (!isHidingEnabled) {
      if (allIds.length > 0) setElementsVisibility(allIds, true)
    } else {
      if (allIds.length > 0) setElementsVisibility(allIds, true)
      if (Array.isArray(hiddenIds) && hiddenIds.length > 0) {
        setElementsVisibility(hiddenIds as number[], false)
      }
    }
  },
  { deep: true },
)

function handleClose() {
  if (autoLoadedUrl.value) {
    URL.revokeObjectURL(autoLoadedUrl.value)
    autoLoadedUrl.value = null
  }
  disposeEditor()
  emit('close')
}

async function loadIfcFile() {
  try {
    const buffer = await loadFromFile()
    loadedIfc.value = buffer
    console.log(buffer)
    
    // Calculate and emit the area
    const calculatedArea = calculateModelArea()
    console.log(`Calculated area: ${calculatedArea} m²`)
    emit('area-calculated', calculatedArea)

    showToast('Arquivo IFC carregado com sucesso.', 'success')
  } catch (error) {
    console.log(error)
    showToast('Falha ao carregar arquivo IFC.', 'error')
  }
}

async function uploadIfcFile() {
  console.log('uploadIfcFile()')
  try {
    if (loadedIfc.value && props.ifcFile && props.projectId) {
      const blob = new Blob([loadedIfc.value], { type: 'application/octet-stream' })
      const file = new File([blob], props.ifcFile, {
        type: 'application/octet-stream',
      })

      const newName = file.name.endsWith('.ifc') ? file.name : file.name + '.ifc'

      const fileWithIFC = new File([file], newName, {
        type: file.type,
      })

      const response = await uploadProjectFile(fileWithIFC, props.projectId)
      console.log(response)
      showToast('Arquivo IFC salvo com sucesso.', 'success')
    } else {
      showToast('Nenhum arquivo IFC carregado ou projeto inválido.', 'error')
    }
  } catch (error) {
    console.log(error)
    showToast('Falha ao salvar arquivo IFC.', 'error')
  }
}

async function captureImage() {
  console.log(plans.value)

  const currentPlan = selectedLevelId.value
  if (!currentPlan) {
    console.warn('No level selected to capture.')
    showToast('Nenhum nível selecionado para captura.', 'error')
    return
  }

  // Activate plan view
  selectPlan(currentPlan)

  // Capture screenshot
  if (!props.ifcFile) {
    console.warn('No IFC file provided to capture.')
    showToast('Nenhum arquivo IFC fornecido para captura.', 'error')
    return
  }
  const file = await captureView(props.ifcFile, {
    hiddenElementIds: [],
  })

  console.log(file)

  try {
    if (file && props.projectId) {
      const response = await uploadProjectFile(file, props.projectId)
      console.log(response)
      showToast('Imagem gerada e salva com sucesso.', 'success')
    }
  } catch (error) {
    console.error(error)
    showToast('Falha ao fazer upload da imagem.', 'error')
  } finally {
    // Reset plan view
    resetPlanView()
  }
}

onMounted(async () => {
  // Derive the server filename: 'base.ifc' already has the extension,
  // selection IDs don't — append '.ifc' if missing
  const ifcFileName = props.ifcFile
    ? (props.ifcFile.endsWith('.ifc') ? props.ifcFile : `${props.ifcFile}.ifc`)
    : null

  // Try to load the associated IFC from the server if we have both project and file
  if (ifcFileName && props.projectId) {
    try {
      const fileUrl = await fetchProtectedFileUrl(props.projectId, ifcFileName)
      autoLoadedUrl.value = fileUrl
      await setupEditor({ fileName: ifcFileName, fileSource: fileUrl })
      loadedIfc.value = await (await fetch(fileUrl)).arrayBuffer()

      // Calculate and emit area from the loaded model
      const calculatedArea = calculateModelArea()
      if (calculatedArea > 0) {
        emit('area-calculated', calculatedArea)
      }

      console.log(`Auto-loaded IFC: ${ifcFileName}`)
      return
    } catch (e) {
      console.log(`No existing IFC found for "${ifcFileName}", opening empty editor.`)
    }
  }

  // Fallback: empty scene
  await setupEditor({ fileName: 'base' })
})
</script>

<style scoped>
/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal content scale + fade */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
