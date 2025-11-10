<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancel')"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white rounded-lg shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 ease-out flex flex-col max-h-[90vh]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-800">Editar Opção (Combo)</h2>
          <button
            type="button"
            @click="$emit('cancel')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
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

        <!-- Body (Scrollable) -->
        <form @submit.prevent="saveChanges" class="p-6 space-y-6 overflow-y-auto">
          <!-- Label Input -->
          <div>
            <label for="label" class="block text-sm font-medium text-gray-700 mb-1">
              Texto da Opção
            </label>
            <input
              id="label"
              type="text"
              v-model="comboData.label"
              required
              class="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: Adicionar Quarto"
            />
          </div>

          <!-- Associated Identifier Input -->
          <div>
            <label for="associated" class="block text-sm font-medium text-gray-700 mb-1">
              Identificador Único
            </label>
            <input
              id="associated"
              type="text"
              v-model="comboData.associated"
              required
              class="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: adicionarQuarto (sem espaços ou acentos)"
            />
            <p class="mt-1 text-xs text-gray-500">Usado internamente. Deve ser único.</p>
          </div>

          <!-- Compatible Combos Input -->
          <div>
            <label for="compat" class="block text-sm font-medium text-gray-700 mb-1">
              Opções Compatíveis
            </label>
            <input
              id="compat"
              type="text"
              v-model="compatString"
              class="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: adicionarGaragem, removerParede"
            />
            <p class="mt-1 text-xs text-gray-500">Separe os identificadores por vírgula.</p>
          </div>
        </form>

        <!-- Footer Actions -->
        <div
          class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0"
        >
          <button
            type="button"
            @click="$emit('cancel')"
            class="bg-white text-gray-700 rounded-md py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            @click="saveChanges"
            class="bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 focus:outline-none font-semibold"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { reactive, ref } from 'vue'

export default {
  props: {
    combo: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const comboData = reactive({
      label: props.combo.label || '',
      associated: props.combo.associated || '',
      compat: props.combo.compat || [],
    })
    const compatString = ref(comboData.compat.join(', '))

    // Save changes method
    const saveChanges = () => {
      // Update the reactive comboData object
      comboData.compat = compatString.value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item)

      // Emit updated combo data
      emit('save', { ...comboData })
    }

    return {
      comboData,
      compatString,
      saveChanges,
    }
  },
}
</script>
