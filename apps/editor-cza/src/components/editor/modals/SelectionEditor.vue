<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay -->
    <transition name="fade">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
           @click="$emit('cancel')"></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white rounded-lg shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 ease-out flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-800">Editar Planta</h2>
          <button type="button" @click="$emit('cancel')"
                  class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <form @submit.prevent="saveChanges" class="p-6 space-y-6 overflow-y-auto">
          <!-- Label Input -->
          <div>
            <label for="label" class="block text-sm font-medium text-gray-700 mb-1">
              Nome da planta
            </label>
            <input id="label" type="text" v-model="plantData.label" required
                   class="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   placeholder="Digite o nome da planta" />
          </div>

          <!-- Description Input -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea id="description" v-model="plantData.description" rows="3"
                      class="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Adicione uma descrição da planta (opcional)"></textarea>
          </div>

          <!-- ID Field (Readonly + Copy) -->
          <div>
            <label for="plantId" class="block text-sm font-medium text-gray-700 mb-1">
              ID da Planta (Gerado)
            </label>
            <div class="flex items-center">
              <input id="plantId" type="text" :value="plantData.id" readonly
                     class="block w-full border-gray-300 rounded-l-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm cursor-not-allowed" />
              <button type="button" @click="copyToClipboard" title="Copiar ID"
                      class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Combos Selection -->
          <div>
            <label class="block text-base font-medium text-gray-800 mb-2">
              Associar Combinações
            </label>
            <div class="space-y-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
              <div v-for="group in availableCombos" :key="group.id">
                <!-- Group Label -->
                <span class="font-semibold text-gray-700 block mb-2">{{ group.label }}</span>

                <!-- Combos for Group -->
                <div class="pl-4 space-y-2">
                  <div v-for="combo in group.combos" :key="combo.associated" class="flex items-center">
                    <input
                      :id="'combo-' + combo.associated"
                      type="checkbox"
                      :value="combo.associated"
                      v-model="selectedCombos"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2" />
                    <label :for="'combo-' + combo.associated" class="text-sm text-gray-600">{{ combo.label }}</label>
                  </div>
                  <div v-if="!group.combos || group.combos.length === 0" class="pl-4 text-sm text-gray-400 italic">
                    Nenhuma opção neste grupo.
                  </div>
                </div>
              </div>
              <div v-if="!availableCombos || availableCombos.length === 0" class="text-center text-gray-500 py-4">
                Não há grupos/combos disponíveis para associar.
              </div>
            </div>
          </div>
        </form>

        <!-- Footer Actions -->
        <div class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button type="button" @click="$emit('cancel')"
                  class="bg-white text-gray-700 rounded-md py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold">
            Cancelar
          </button>
          <button type="button" @click="saveChanges"
                  class="bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 focus:outline-none font-semibold">
            Salvar Alterações
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { ref, reactive, watch } from "vue";

export default {
    props: {
        selection: {
            type: Object,
            required: true,
        },
        availableCombos: {
            type: Array,
            required: true,
        },
    },
    setup(props, { emit }) {
        // Reactive data for the modal form
        const plantData = reactive({
            id: props.selection.id || "",
            label: props.selection.label || "",
            description: props.selection.description || "",
            relatedCombos: props.selection.relatedCombos || [],
            relatedGroups: props.selection.relatedGroups || [], // Ensure relatedGroups are populated
        });

        // State for selected groups and combos (use arrays for reactivity)
        const selectedGroups = ref([...props.selection.groupIds || []]);
        const selectedCombos = ref([...props.selection.comboIds || []]);

        // Watch for changes in the plant's relatedGroups and relatedCombos to update selectedGroups and selectedCombos
        watch([() => props.selection.relatedGroups, () => props.selection.relatedCombos], ([newGroups, newCombos]) => {
            // Initialize the selectedGroups based on relatedGroups
            selectedGroups.value = newGroups || [];

            // Initialize the selectedCombos based on relatedCombos
            selectedCombos.value = newCombos || [];
        }, { immediate: true });

        // Save changes method
        const saveChanges = () => {
            plantData.relatedCombos = selectedCombos.value;
            plantData.relatedGroups = selectedGroups.value;

            emit("save", {
                ...plantData
            });
        };

        // Method to copy plant ID to clipboard
        const copyToClipboard = () => {
            navigator.clipboard.writeText(plantData.id).then(() => {
                alert("ID copiado para a área de transferência!");
            });
        };

        return {
            plantData,
            selectedGroups,
            selectedCombos,
            saveChanges,
            copyToClipboard,
        };
    },
};
</script>
