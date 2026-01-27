<script setup lang="ts">
import { ref } from 'vue'

import type { UserResponse, CreateProjectRequest } from '@/types/types.ts'

// --- Props & Emits ---
const props = defineProps<{
  availableUsers: UserResponse[]
}>()

const emit = defineEmits(['cancel', 'create-project'])

// --- Component State ---
const formData = ref<CreateProjectRequest>({
  name: '',
  description: '',
  userIds: [],
})

const isLoading = ref<boolean>(false)

// --- Methods ---
const handleCreateProject = () => {
  isLoading.value = true

  emit(
    'create-project',
    formData.value,
    () => {
      // Success callback
      isLoading.value = false
      emit('cancel') // Close modal on success
    },
    () => {
      // Error callback
      isLoading.value = false
    },
  )
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancel')"
      ></div>
    </transition>

    <transition name="scale-fade" appear>
      <div
        class="relative bg-white outline-2 shadow-2xl w-full max-w-lg m-4 overflow-hidden transform transition-all duration-300 ease-out"
      >
        <form @submit.prevent="handleCreateProject">
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Criar Novo Projeto</h2>
            <button
              type="button"
              @click="$emit('cancel')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24"
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

          <div class="p-6 space-y-6">
            <div>
              <label for="projectName" class="block text-sm font-medium text-gray-700 mb-1">
                Nome do Projeto
              </label>
              <input
                id="projectName"
                v-model="formData.name"
                type="text"
                required
                placeholder="Ex: Condomínio Serra Clara"
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                placeholder="Uma breve descrição sobre deste projeto..."
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Adicionar Membros
              </label>
              <div class="border border-gray-300 bg-gray-50 max-h-48 overflow-y-auto">
                <div
                  v-if="props.availableUsers.length === 0"
                  class="p-4 text-center text-gray-500 text-sm"
                >
                  Nenhum usuário disponível para adicionar.
                </div>

                <label
                  v-for="user in props.availableUsers"
                  :key="user.id"
                  class="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-200 last:border-b-0"
                  :class="{ 'bg-gray-100': formData.userIds?.includes(user.id) }"
                >
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :value="user.id"
                      v-model="formData.userIds"
                      class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-3"
                    />
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-700">{{ user.name }}</span>
                    </div>
                  </div>

                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded border"
                    :class="{
                      'bg-blue-100 text-blue-800 border-blue-200': user.role === 'ADMIN',
                      'bg-green-100 text-green-800 border-green-200': user.role === 'EDITOR',
                      'bg-gray-100 text-gray-600 border-gray-200': user.role === 'USER',
                    }"
                  >
                    {{ user.role }}
                  </span>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Selecione os usuários que terão acesso a este projeto.
              </p>
            </div>
          </div>

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
              :disabled="isLoading"
              class="bg-black text-white py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold flex items-center"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ isLoading ? 'Criando...' : 'Criar Projeto' }}</span>
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

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
  transition: all 0.3s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
