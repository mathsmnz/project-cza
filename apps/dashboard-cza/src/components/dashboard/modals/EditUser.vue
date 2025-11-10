<script setup lang="ts">
import type {
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  UserResponse,
} from '@/types/types.ts'
import { ref, onMounted } from 'vue'

const { user } = defineProps<{ user: UserResponse | null }>()
const emit = defineEmits(['cancel', 'save', 'create-recoveryRequest'])

const formData = ref<Partial<UserResponse>>({ ...user })
const isLoading = ref(false)
const hasLink = ref<boolean>(false)
const isCopied = ref<boolean>(false)
const generatedLink = ref<string | null>(null)

const handleSubmit = () => {
  emit('save', formData.value)
}

const handleCreateRecoveryRequest = () => {
  const email = formData.value.email
  isLoading.value = true
  if (email) {
    const recoveryRequest = ref<PasswordRecoveryRequest>({ email: email })
    emit(
      'create-recoveryRequest',
      recoveryRequest.value,
      (response: string) => {
        generatedLink.value = response
        console.log(generatedLink.value)
        isLoading.value = false
        hasLink.value = true
      },
      () => {
        isLoading.value = false
      },
    )
  }
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


onMounted(() => {
  console.log('EditUserModal mounted with user:', user)
})
</script>

<template>
  <!-- Root container for overlay + modal -->
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- BACKDROP -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancel')"
      ></div>
    </transition>

    <!-- MODAL CONTENT -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white shadow-2xl w-full max-w-lg m-4 outline-2 overflow-hidden transform transition-all duration-300 ease-out"
      >
        <form @submit.prevent="handleSubmit">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Editar Usuário</h2>
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
          <div class="p-6 space-y-4">
            <div class="flex items-center space-x-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                <input
                  type="text"
                  readonly
                  :value="formData.id"
                  class="block w-full bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black border py-2 px-3 sm:text-sm cursor-not-allowed"
                />
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <div
                  class="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-2 text-center"
                >
                  {{ formData.role }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Nome</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Sobrenome</label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  class="block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <input
                  v-model="formData.username"
                  type="text"
                  class="block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div v-if="!hasLink">
                <label class="block text-sm font-medium text-gray-600 mb-1">Alterar Senha</label>
                <button
                  type="button"
                  @click="handleCreateRecoveryRequest"
                  class="w-full justify-center inline-flex items-center px-4 py-2 border border-gray-300  border text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    v-if="!isLoading"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 7a5 5 0 1 1 3.61 4.804l-1.903 1.903A1 1 0 0 1 9 14H8v1a1 1 0 0 1-1 1H6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L8.196 8.39A5.002 5.002 0 0 1 8 7Zm5-3a.75.75 0 0 0 0 1.5A1.5 1.5 0 0 1 14.5 7 .75.75 0 0 0 16 7a3 3 0 0 0-3-3Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{isLoading? 'Gerando...' : 'Gerar Nova Senha de Acesso'}}</span>
                </button>
              </div>
              <!-- Generated Link Section (Conditional) -->
              <div v-else class="space-y-2">
                <label class="block text-sm font-medium text-green-700">Link de Recuperação Gerado com Sucesso!</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="text"
                    readonly
                    :value="generatedLink"
                    class="block w-full bg-gray-100 border-gray-300  shadow-sm py-2 px-3 sm:text-sm"
                  />
                  <button
                    @click="copyLink"
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium  shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none"
                  >
                    <span v-if="!isCopied">Copiar</span>
                    <span v-else>Copiado!</span>
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Envie este link para o novo usuário completar o cadastro.</p>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200">
            <button
              :disabled="isLoading"
              type="button"
              @click="$emit('cancel')"
              class="bg-white text-gray-700 py-2 px-4 hover:bg-gray-100 border border-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              :disabled="isLoading"
              type="submit"
              class="bg-black text-white py-2 px-4 hover:bg-gray-900 font-semibold"
            >
              Salvar Alterações
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
