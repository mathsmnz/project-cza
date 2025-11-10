<script setup lang="ts">
import { ref } from 'vue'
import type { UserCreationRequest, Project } from '@/types/types.ts'

// --- Props & Emits ---
const props = defineProps<{
  availableProjects: Project[],
}>()

const emit = defineEmits(['cancel', 'create-invitation'])

// --- Component State ---
const formData = ref<Partial<UserCreationRequest>>({
  email: '',
  role: 'USER',
  projectIds: []
})
const generatedLink = ref<string | null>(null)
const hasLink = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isCopied = ref<boolean>(false)

// --- Methods ---
const handleCreateInvitation = () => {
  isLoading.value = true
  // Emit the form data to the parent, which will handle the API call
  emit('create-invitation', formData.value, (invitationLink: string) => {
    // This is a callback function that the parent will call upon success
    generatedLink.value = invitationLink
    console.log(invitationLink)
    isLoading.value = false
    hasLink.value = true
  }, () => {
    // Error callback
    isLoading.value = false
  })
}

const copyLink = () => {
  if (!generatedLink.value) return
  navigator.clipboard.writeText(generatedLink.value).then(() => {
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000) // Reset after 2 seconds
  })
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
        <form @submit.prevent="handleCreateInvitation">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Inserir Novo Usuário</h2>
            <button
              type="button"
              @click="$emit('cancel')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <!-- Email and Role Inputs -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  :disabled="!!hasLink"
                  placeholder="email@exemplo.com"
                  class="block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  id="role"
                  v-model="formData.role"
                  :disabled="!!hasLink"
                  class="block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                >
                  <option>USER</option>
                  <option>EDITOR</option>
                  <option>ADMIN</option>
                </select>
              </div>
            </div>

            <!-- Project Multi-Select -->
            <div>
              <label for="projects" class="block text-sm font-medium text-gray-700 mb-1">
                Associar Projetos (Opcional)
              </label>
              <select
                id="projects"
                v-model="formData.projectIds"
                multiple
                :disabled="!!hasLink"
                class="block w-full h-32 border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
              >
                <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Segure Ctrl (ou Cmd no Mac) para selecionar múltiplos projetos.</p>
            </div>

            <!-- Generated Link Section (Conditional) -->
            <div v-if="hasLink" class="space-y-2">
              <label class="block text-sm font-medium text-green-700">Link de Registro Gerado com Sucesso!</label>
              <div class="flex items-center space-x-2">
                <input
                  type="text"
                  readonly
                  :value="generatedLink"
                  class="block w-full bg-gray-100 border-gray-300  border py-2 px-3 sm:text-sm"
                />
                <button
                  @click="copyLink"
                  type="button"
                  class="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium  border text-white bg-black hover:bg-gray-900 focus:outline-none"
                >
                  <span v-if="!isCopied">Copiar</span>
                  <span v-else>Copiado!</span>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Envie este link para o novo usuário completar o cadastro.</p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel')"
              class="bg-white text-gray-700  py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold"
            >
              Fechar
            </button>
            <button
              v-if="!hasLink"
              type="submit"
              :disabled="isLoading"
              class="bg-black text-white  py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold flex items-center"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Gerando...' : 'Enviar Convite' }}</span>
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

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
