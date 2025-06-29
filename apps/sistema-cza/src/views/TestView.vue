<template>
  <div class="bg-gray-900 text-white h-full w-full relative">
    <!-- Viewer Container -->
    <div ref="viewerContainer" class="fixed h-full w-full z-0"></div>

    <!-- Menu Lateral -->
    <div id="menuLateral" class="relative top-0 left-0 w-72 h-full bg-gray-800 p-4 shadow-lg overflow-y-auto z-10">
      <!-- Botões de Controle -->
      <button @click="loadFromFile"
        class="w-full text-left bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600">
        Carregar Novo IFC
      </button>
      <button @click="exportFragments"
        class="w-full text-left bg-green-500 text-white p-2 mt-4 rounded shadow hover:bg-green-600">
        Salvar IFC
      </button>
      <button @click="captureView"
        class="w-full text-left bg-purple-500 text-white p-2 mt-4 rounded shadow hover:bg-purple-600">
        Capturar Tela
      </button>

      <!-- Instrução -->
      <div class="text-center mt-6 px-4">
        <p class="text-gray-300 text-sm">
          Carregue um arquivo IFC para visualizar o modelo 3D.
        </p>
      </div>

      <!-- Seção de Planos -->
      <h2 class="text-lg font-semibold mt-6 mb-2 text-gray-100">Planos</h2>

      <div v-if="!plans || plans.length === 0" class="text-gray-400">
        Carregando planos...
      </div>

      <div v-else class="space-y-2">
        <button v-for="plan in plans" :key="plan.id"
          class="w-full text-left bg-gray-700 p-2 rounded shadow hover:bg-gray-600" @click="selectPlan(plan.id)">
          {{ plan.name }}
        </button>
        <button class="w-full text-left bg-red-500 text-white p-2 mt-4 rounded shadow hover:bg-red-600"
          @click="resetPlanView">
          Sair
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEditorController } from '@/editor/editorController'
import { useDataStore } from '@/stores/data.js'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = useDataStore();

// 3D container reference
const viewerContainer = ref<HTMLDivElement | null>(null)

// Get controller functions
const {
  plans,
  setupEditor,
  loadFromFile,
  exportFragments,
  selectPlan,
  resetPlanView,
  captureView
} = useEditorController(viewerContainer)

// Setup scene on mount
onMounted(() => {
  console.log(plans)
  setupEditor('base')
})

</script>
