<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Popup -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
        @click="handleClose"
      ></div>
    </transition>

    <transition name="scale-fade w-[900px] h-[600px]" appear>

    </transition>

    <div class="relative bg-white rounded-lg shadow-2xl w-[900px] h-[600px] transform transition-all duration-300 ease-out">
      <!-- Close button -->
      <button
        @click="handleClose"
        class="absolute top-2 right-2 text-black hover:text-red-500 z-50"
      >
        ✖
      </button>

      <!-- Buttons -->
      <div class="absolute bottom-4 right-4 flex gap-2 z-50">
        <button
          @click="loadFromFile()"
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Carregar IFC
        </button>
        <button
          @click="() => captureImage()"
          class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Capturar
        </button>
      </div>

      <!-- Viewer container -->
      <div ref="viewerContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEditorController } from '@/editor/editorController.ts'
import { uploadProjectFile } from '@/api/axios.ts'

const props = defineProps<{
  ifcFile: string | null
  projectId: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const viewerContainer = ref<HTMLDivElement | null>(null)

const {
  plans,
  setupEditor,
  loadFromFile,
  selectPlan,
  resetPlanView,
  captureView,
  disposeEditor
} = useEditorController(viewerContainer)

function handleClose(){
    disposeEditor()
    emit('close')
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
  await new Promise(resolve => setTimeout(resolve, 300))

  // Capture screenshot
  if (!props.ifcFile) {
    console.warn('No IFC file provided to capture.');
    return;
  }
  const file = await captureView(props.ifcFile)
  console.log(file)

  try{
    if(file && props.projectId){
      const response = await uploadProjectFile(file, props.projectId)
      console.log(response)
    }
  }catch(error){
    console.error(error)
  }finally {
    // Reset plan view
    resetPlanView()
  }
}

onMounted(async () => {
  await setupEditor("base","/base.ifc")
})

</script>
