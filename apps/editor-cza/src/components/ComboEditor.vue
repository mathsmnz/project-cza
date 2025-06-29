<template>
    <div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div
        class="bg-white rounded-lg shadow-lg w-96 p-6"
        @keydown.enter.stop.prevent="saveChanges"
      >
        <h2 class="text-lg font-bold mb-4">Edit Combo</h2>
        <form @submit.prevent="saveChanges">
          <!-- Label -->
          <div class="mb-4">
            <label for="label" class="block text-sm font-medium text-gray-700 mb-1">
              Texto da Opção
            </label>
            <input
              id="label"
              type="text"
              v-model="comboData.label"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
  
          <!-- Associated Option -->
          <div class="mb-4">
            <label for="associated" class="block text-sm font-medium text-gray-700 mb-1">
              Identificador da opção
            </label>
            <input
              id="associated"
              type="text"
              placeholder="ex., adicionarQuarto"
              v-model="comboData.associated"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
  
          <!-- Compatible Combos -->
          <div class="mb-4">
            <label for="compat" class="block text-sm font-medium text-gray-700 mb-1">
              Opções compatíveis (Identificador separado por vírgula)
            </label>
            <input
              id="compat"
              type="text"
              v-model="compatString"
              placeholder="ex., a, b, c"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
  
          <!-- Actions -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="$emit('cancel')"
              class="bg-red-500 text-white rounded-md py-2 px-4 hover:bg-red-600 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-green-500 text-white rounded-md py-2 px-4 hover:bg-green-600 focus:outline-none"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from "vue";
  
  export default {
    props: {
      combo: {
        type: Object,
        required: true,
      },
    },
    setup(props, { emit }) {
      // Create reactive state
      const comboData = reactive({
        label: props.combo.label || "",
        associated: props.combo.associated || "",
        compat: props.combo.compat || [],
      });
      const compatString = ref(comboData.compat.join(", ")); // Start as a string for easy editing
  
      // Save changes method
      const saveChanges = () => {
        // Ensure compatString is properly split and clean
        const compatArray = compatString.value
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item); // Remove empty values
  
        // Update the reactive comboData object
        comboData.compat = compatArray;
  
        // Emit updated combo data
        emit("save", { ...comboData });
      };
  
      return {
        comboData,
        compatString,
        saveChanges,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Tailwind handles most of the styling, so additional styles are unnecessary. */
  </style>
  