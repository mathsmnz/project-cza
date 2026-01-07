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
          <h2 class="text-xl font-bold text-gray-800">Visualizador IFC</h2>
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

        <!-- Footer Actions -->
        <div
          class="absolute bottom-0 left-0 right-0 flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200 z-50"
        >
          <button
            @click="loadIfcFile()"
            class="bg-white text-gray-700 py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold"
          >
            Carregar IFC
          </button>
          <button
            @click="() => uploadIfcFile()"
            class="bg-black text-white py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold"
          >
            Salvar IFC
          </button>
          <button
            @click="() => captureImage()"
            class="bg-black text-white py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold"
          >
            Gerar Imagem
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEditorController } from '@/editor/editorController.ts'
import { uploadProjectFile } from '@/api/axios.ts'

const props = defineProps<{
  ifcFile: string | null
  projectId: string | null
  hasFile: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const viewerContainer = ref<HTMLDivElement | null>(null)
const loadedIfc = ref<ArrayBuffer | null>(null)

const { plans, setupEditor, loadFromFile, selectPlan, resetPlanView, captureView, disposeEditor } =
  useEditorController(viewerContainer)

function handleClose() {
  disposeEditor()
  emit('close')
}

async function loadIfcFile() {
  try {
    const buffer = await loadFromFile()
    loadedIfc.value = buffer
    console.log(buffer)
  } catch (error) {
    console.log(error)
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
    }
  } catch (error) {
    console.log(error)
  }
}

async function captureImage() {
  console.log(plans.value)

  const currentPlan = plans.value[0]?.id
  if (!currentPlan) {
    console.warn('No plans available to capture.')
    return
  }

  // Activate plan view
  selectPlan(currentPlan)

  // Wait for scene to update/render
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Capture screenshot
  if (!props.ifcFile) {
    console.warn('No IFC file provided to capture.')
    return
  }
  const file = await captureView(props.ifcFile)
  console.log(file)

  try {
    if (file && props.projectId) {
      const response = await uploadProjectFile(file, props.projectId)
      console.log(response)
    }
  } catch (error) {
    console.error(error)
  } finally {
    // Reset plan view
    resetPlanView()
  }
}

onMounted(async () => {
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
