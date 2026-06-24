<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancel', undefined)"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white shadow-2xl w-full max-w-lg m-4 outline-2 overflow-hidden transform transition-all duration-300 ease-out"
      >
        <form @submit.prevent="saveChanges">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Editar Planta</h2>
            <button
              type="button"
              @click="$emit('cancel', undefined)"
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
          <div class="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <!-- Label Input -->
            <div>
              <label for="label" class="block text-sm font-medium text-gray-700 mb-1">
                Nome da Planta
              </label>
              <input
                id="label"
                type="text"
                v-model="plantData.label"
                required
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Digite o nome da planta"
              />
            </div>

            <!-- Description Input -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                v-model="plantData.description"
                rows="3"
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Adicione uma descrição da planta (opcional)"
              ></textarea>
            </div>

            <!-- Exigências KBRS -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Exigências KBRS (Hard Constraints)
              </label>
              
              <div class="space-y-3 border border-gray-200 p-3 bg-gray-50 text-sm">
                <div class="flex items-center">
                  <input
                    id="req-space-front"
                    type="checkbox"
                    v-model="constraints.requiresSpaceFront"
                    class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2 rounded"
                  />
                  <label for="req-space-front" class="text-gray-700 cursor-pointer">
                    Exige espaço frontal no terreno
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="req-space-side"
                    type="checkbox"
                    v-model="constraints.requiresSpaceSide"
                    class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2 rounded"
                  />
                  <label for="req-space-side" class="text-gray-700 cursor-pointer">
                    Exige espaço lateral no terreno
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="req-space-back"
                    type="checkbox"
                    v-model="constraints.requiresSpaceBack"
                    class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2 rounded"
                  />
                  <label for="req-space-back" class="text-gray-700 cursor-pointer">
                    Exige espaço nos fundos do terreno
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="req-vehicle"
                    type="checkbox"
                    v-model="constraints.requiresVehicle"
                    class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2 rounded"
                  />
                  <label for="req-vehicle" class="text-gray-700 cursor-pointer">
                    Exige acesso a veículo (Garagem)
                  </label>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <label for="min-residents" class="block text-gray-700 mb-1">
                    Número mínimo de moradores atendidos
                  </label>
                  <input
                    id="min-residents"
                    type="number"
                    min="0"
                    v-model.number="constraints.minResidentsCount"
                    class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm bg-white"
                    placeholder="Ex: 2"
                  />
                </div>
              </div>
            </div>

            <!-- Tags (CBR) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Atribuir Tags Estruturadas (CBR)
              </label>
              <div class="space-y-4 max-h-60 overflow-y-auto border border-gray-200 p-4 bg-gray-50">
                <div v-if="loadingTags" class="text-sm text-gray-500">Carregando tags...</div>
                <div v-else-if="availableTags.length === 0" class="text-sm text-gray-500">Nenhuma tag encontrada no sistema.</div>
                
                <div v-else class="space-y-2">
                  <div v-for="tag in availableTags" :key="tag.id" class="flex items-center">
                    <input
                      :id="'tag-' + tag.id"
                      type="checkbox"
                      :value="tag.id"
                      v-model="selectedTags"
                      class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2 rounded"
                    />
                    <label :for="'tag-' + tag.id" class="text-sm text-gray-700 cursor-pointer flex-1">
                      {{ tag.name }}
                      <span class="ml-2 text-xs font-mono text-gray-500 bg-gray-200 px-1 rounded">
                        {{ tag.category }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cost and Area -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label for="area" class="block text-sm font-medium text-gray-700 mb-1">
                  Área (m²)
                </label>
                <input
                  id="area"
                  type="number"
                  step="0.01"
                  v-model.number="plantData.area"
                  class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm bg-white"
                  placeholder="Calculado"
                  title="Área extraída automaticamente pelo IFC ou inserida manualmente"
                />
              </div>
              <div>
                <label for="costPerSqm" class="block text-sm font-medium text-gray-700 mb-1">
                  Custo / m² (R$)
                </label>
                <input
                  id="costPerSqm"
                  type="number"
                  step="0.01"
                  v-model.number="costPerSqm"
                  class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label for="cost" class="block text-sm font-medium text-gray-700 mb-1">
                  Custo Total (R$)
                </label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  v-model.number="plantData.cost"
                  class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm bg-gray-50"
                  placeholder="0.00"
                  readonly
                />
              </div>
            </div>

            <!-- ID Field (Readonly + Copy) -->
            <div>
              <label for="plantId" class="block text-sm font-medium text-gray-700 mb-1">
                ID da Planta (Gerado)
              </label>
              <div class="flex items-center">
                <input
                  id="plantId"
                  type="text"
                  :value="plantData.id"
                  readonly
                  class="block w-full border-gray-300 border py-2 px-3 bg-gray-100 sm:text-sm cursor-not-allowed"
                />
                <button
                  type="button"
                  @click="copyToClipboard"
                  title="Copiar ID"
                  class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Combos Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Associar Combinações
              </label>
              <div class="space-y-4 max-h-60 overflow-y-auto border border-gray-200 p-4 bg-gray-50">
                <div v-for="group in availableCombos" :key="group.id">
                  <!-- Group Label -->
                  <span class="font-semibold text-gray-700 block mb-2">{{ group.label }}</span>

                  <!-- Combos for Group -->
                  <div class="pl-4 space-y-2">
                    <div
                      v-for="combo in group.combos"
                      :key="combo.associated"
                      class="flex items-center"
                    >
                      <input
                        :id="'combo-' + combo.associated"
                        type="checkbox"
                        :value="combo.associated"
                        v-model="selectedCombos"
                        class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2"
                      />
                      <label :for="'combo-' + combo.associated" class="text-sm text-gray-600">({{combo.associated}}) {{
                        combo.label
                      }}</label>
                    </div>
                    <div
                      v-if="!group.combos || group.combos.length === 0"
                      class="pl-4 text-sm text-gray-400 italic"
                    >
                      Nenhuma opção neste grupo.
                    </div>
                  </div>
                </div>
                <div
                  v-if="!availableCombos || availableCombos.length === 0"
                  class="text-center text-gray-500 py-4"
                >
                  Não há grupos/combos disponíveis para associar.
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel', undefined)"
              class="bg-white text-gray-700 py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-black text-white py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import type { KbrsConstraints } from '@/types/types'

// Define props
const props = defineProps<{
  selection: {
    id: string
    label: string
    description: string
    relatedCombos: string[]
    relatedGroups: string[]
    groupIds?: string[]
    comboIds?: string[]
    cost?: number
    area?: number
    constraints?: KbrsConstraints
    tags?: string[]
  }
  availableCombos: any[]
  projectId: string
}>()

// Define emits
const emit = defineEmits<{
  (e: 'save', data: any): void
  (e: 'cancel', data?: any): void
}>()

// Reactive data for the modal form
const plantData = reactive({
  id: props.selection.id || '',
  label: props.selection.label || '',
  description: props.selection.description || '',
  relatedCombos: props.selection.relatedCombos || [],
  relatedGroups: props.selection.relatedGroups || [],
  cost: props.selection.cost || 0,
  area: props.selection.area || 0,
})

const constraints = reactive<KbrsConstraints>({
  requiresSpaceFront: props.selection.constraints?.requiresSpaceFront || false,
  requiresSpaceSide: props.selection.constraints?.requiresSpaceSide || false,
  requiresSpaceBack: props.selection.constraints?.requiresSpaceBack || false,
  requiresVehicle: props.selection.constraints?.requiresVehicle || false,
  minResidentsCount: props.selection.constraints?.minResidentsCount || 0,
})

const selectedGroups = ref([...(props.selection.groupIds || [])])
const selectedCombos = ref([...(props.selection.comboIds || [])])
const selectedTags = ref<string[]>([...(props.selection.tags || [])])
const availableTags = ref<any[]>([])
const loadingTags = ref(false)
const costPerSqm = ref<number>(
  plantData.area && plantData.area > 0 && plantData.cost 
    ? Number((plantData.cost / plantData.area).toFixed(2)) 
    : 0
)

// Watch props to update selected values
watch(
  () => [props.selection.relatedGroups, props.selection.relatedCombos],
  ([newGroups, newCombos]) => {
    selectedGroups.value = newGroups || []
    selectedCombos.value = newCombos || []
  },
  { immediate: true },
)

watch(
  () => [costPerSqm.value, plantData.area],
  ([newCost, newArea]) => {
    if (newCost !== undefined && newArea !== undefined) {
      plantData.cost = Number((newCost * newArea).toFixed(2))
    }
  }
)

const saveChanges = () => {
  plantData.relatedCombos = selectedCombos.value
  plantData.relatedGroups = selectedGroups.value

  emit('save', { ...plantData, constraints: { ...constraints }, tags: selectedTags.value })
}

import { fetchAllTagsForProject } from '@/api/axios'

onMounted(async () => {
  console.log('Available Combos:', props.availableCombos)
  
  loadingTags.value = true
  try {
    const response = await fetchAllTagsForProject(props.projectId)
    availableTags.value = response || []
  } catch (error) {
    console.error('Failed to load tags', error)
  } finally {
    loadingTags.value = false
  }
})

// Copy to clipboard
const copyToClipboard = () => {
  navigator.clipboard.writeText(plantData.id).then(() => {
    alert('ID copiado para a área de transferência!')
  })
}
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
