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
        <form @submit.prevent="handleDelete">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Confirmar Exclusão</h2>
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

          <!-- Body -->
          <div class="p-6 space-y-6">
            <!-- Warning Message -->
            <div class="flex items-start space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p class="text-gray-700 font-semibold mb-1">Esta ação é irreversível!</p>
                <p class="text-gray-600 text-sm">
                  Você está prestes a apagar permanentemente o usuário
                  <span class="font-semibold">{{ userName }}</span
                  >. Todos os dados associados serão perdidos.
                </p>
              </div>
            </div>

            <!-- Confirmation Code Input -->
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
                Digite o código de confirmação
              </label>
              <input
                id="code"
                v-model="codeInput"
                type="text"
                required
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                :placeholder="`Digite: ${confirmationCode}`"
              />
              <p class="text-xs text-gray-500 mt-1">
                Código: <span class="font-mono font-semibold">{{ confirmationCode }}</span>
              </p>
            </div>

            <!-- APAGAR Confirmation Input -->
            <div>
              <label for="confirm" class="block text-sm font-medium text-gray-700 mb-1">
                Digite "APAGAR" para confirmar
              </label>
              <input
                id="confirm"
                v-model="confirmInput"
                type="text"
                required
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                placeholder="APAGAR"
              />
              <p class="text-xs text-gray-500 mt-1">
                Digite exatamente "APAGAR" em letras maiúsculas.
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="p-3 bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {{ errorMessage }}
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
              :disabled="!isValid"
              class="bg-red-600 text-white py-2 px-4 hover:bg-red-700 focus:outline-none font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Apagar Usuário
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  userName: string
}>()

const emit = defineEmits<{
  confirm: [confirmCode: string]
  cancel: []
}>()

const codeInput = ref('')
const confirmInput = ref('')
const errorMessage = ref('')

const confirmationCode = ref('')

const isValid = computed(() => {
  const codeValid = codeInput.value !== ''
  const confirmValid = confirmInput.value === 'APAGAR'
  return codeValid && confirmValid
})

function handleDelete() {
  errorMessage.value = ''

  // Validate APAGAR text
  if (confirmInput.value !== 'APAGAR') {
    errorMessage.value = 'Você deve digitar "APAGAR" exatamente como mostrado.'
    return
  }

  // All validations passed
  emit('confirm', codeInput.value)
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
