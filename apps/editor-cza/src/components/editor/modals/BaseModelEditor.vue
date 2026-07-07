<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancel')"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white shadow-2xl w-full max-w-md m-4 outline-2 overflow-hidden transform transition-all duration-300 ease-out"
      >
        <form @submit.prevent="saveChanges">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-xl font-bold text-gray-800">Configuração da Casa Base</h2>
            <button
              type="button"
              @click="$emit('cancel')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <div class="bg-blue-50 text-blue-800 p-3 text-sm rounded border border-blue-100">
              Esses valores definem o ponto de partida do projeto (ex: orçamento inicial). O KBRS bloqueará opções se a soma (Base + Módulos) ultrapassar o perfil do usuário.
            </div>

            <!-- Base File ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Arquivo IFC Base
              </label>
              <input
                type="text"
                :value="baseIfcFileId"
                readonly
                class="block w-full border-gray-300 border py-2 px-3 sm:text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            <!-- Base Area -->
            <div>
              <label for="baseArea" class="block text-sm font-medium text-gray-700 mb-1">
                Área Base (m²)
              </label>
              <input
                id="baseArea"
                type="number"
                step="0.01"
                v-model.number="localArea"
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Ex: 45.00"
                required
              />
              <p class="text-xs text-gray-500 mt-1" v-if="!localArea">
                O valor lido automaticamente do arquivo ifc será pré-preenchido se existir.
              </p>
            </div>

            <!-- Base Value -->
            <div>
              <label for="baseValue" class="block text-sm font-medium text-gray-700 mb-1">
                Valor Base (R$ / m²)
              </label>
              <input
                id="baseValue"
                type="number"
                step="0.01"
                v-model.number="localBaseValue"
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Ex: 1500.00"
                required
              />
            </div>

            <!-- Base Cost -->
            <div>
              <label for="baseCost" class="block text-sm font-medium text-gray-700 mb-1">
                Custo Total da Casa Base (R$)
              </label>
              <input
                id="baseCost"
                type="number"
                step="0.01"
                v-model.number="localCost"
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Ex: 85000.00"
                required
              />
            </div>

            <!-- Base Residents -->
            <div>
              <label for="baseResidents" class="block text-sm font-medium text-gray-700 mb-1">
                Moradores da Casa Base (Capacidade Inicial)
              </label>
              <input
                id="baseResidents"
                type="number"
                min="0"
                step="1"
                v-model.number="localResidents"
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Ex: 2"
                required
              />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel')"
              class="bg-white text-gray-700 py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-black text-white py-2 px-6 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black font-semibold"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  baseCost: number | null
  baseValue: number | null
  baseArea: number | null
  baseResidents: number | null
  baseIfcFileId: string
}>()

const emit = defineEmits<{
  (e: 'save', payload: { baseCost: number; baseValue: number; baseArea: number; baseResidents: number; baseIfcFileId: string }): void
  (e: 'cancel'): void
}>()

const localCost = ref<number | null>(props.baseCost)
const localBaseValue = ref<number | null>(props.baseValue)
const localArea = ref<number | null>(props.baseArea)
const localResidents = ref<number | null>(props.baseResidents)

watch(
  [localBaseValue, localArea],
  ([newVal, newArea]) => {
    if (newVal != null && newArea != null) {
      localCost.value = parseFloat((newVal * newArea).toFixed(2))
    }
  }
)

watch(
  () => props.baseArea,
  (newArea) => {
    if (newArea != null && localArea.value == null) {
      localArea.value = newArea
    }
  }
)

const saveChanges = () => {
  emit('save', {
    baseCost: localCost.value ?? 0,
    baseValue: localBaseValue.value ?? 0,
    baseArea: localArea.value ?? 0,
    baseResidents: localResidents.value ?? 0,
    baseIfcFileId: props.baseIfcFileId,
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
