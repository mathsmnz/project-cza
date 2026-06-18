<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { fetchRecoveryToken, resetPassword } from '@/api/axios.ts'
import type { PasswordResetRequest, TokenValidationResponse } from '@/types/types.ts'
import { useToastStore } from '@/stores/toast.ts'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

// Form state
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const passwordMismatch = ref(false)

const formData = ref({
  token: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleResetPassword = async (token: string) => {
  error.value = null
  successMessage.value = null
  passwordMismatch.value = false

  if (formData.value.password !== formData.value.confirmPassword) {
    passwordMismatch.value = true
    error.value = 'As senhas não coincidem.'
    return
  }

  isLoading.value = true
  try {
    const request: PasswordResetRequest = {
      token,
      password: formData.value.password,
    }

    await resetPassword(request)
    successMessage.value = 'Senha redefinida com sucesso! Redirecionando...'
    toastStore.addToast('Senha redefinida com sucesso!', 'success')

    // Delay navigation a bit for UX
    setTimeout(() => router.push('/login'), 2000)
  } catch (err: any) {
    console.error(err)
    error.value = 'Falha ao redefinir senha. O link pode estar expirado ou inválido.'
    toastStore.addToast('Falha ao redefinir senha. O link pode estar expirado ou inválido.', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    const token = (route.query.token as string) || ''
    if (!token) {
      error.value = 'Token ausente no link de recuperação.'
      toastStore.addToast('Token ausente no link de recuperação.', 'error')
      return
    }

    const response: TokenValidationResponse = await fetchRecoveryToken(token)

    if (!response.valid || !response.recovery) {
      error.value = 'Este link de recuperação é inválido ou expirou.'
      toastStore.addToast('Este link de recuperação é inválido ou expirou.', 'error')
      return
    }

    formData.value.token = token
    formData.value.email = response.recovery.email
  } catch (err) {
    console.error(err)
    error.value = 'Erro ao validar o token. Tente novamente mais tarde.'
    toastStore.addToast('Erro ao validar o token. Tente novamente mais tarde.', 'error')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-montserrat">
    <div class="bg-white w-full max-w-md outline-2 shadow-md overflow-hidden">
      <div class="p-6 border-b border-gray-200 text-center">
        <h1 class="text-2xl font-bold text-gray-800">Redefinir Senha</h1>
        <p v-if="formData.email" class="mt-1 text-sm text-gray-600">
          Olá, <span class="font-semibold">{{ formData.email }}</span> — escolha sua nova senha abaixo.
        </p>
        <p v-else-if="isLoading" class="mt-1 text-sm text-gray-500">Verificando link de recuperação...</p>
        <p v-else-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="p-6 bg-green-50 text-green-700 text-center">
        {{ successMessage }}
      </div>

      <!-- Form -->
      <form
        v-if="!successMessage && formData.email && !isLoading"
        autocomplete="on"
        method="post"
        class="p-6 space-y-5"
        @submit.prevent="handleResetPassword(formData.token)"
      >
        <!-- Hidden email to help Chrome autofill -->
        <input
          type="text"
          name="username"
          autocomplete="username"
          :value="formData.email"
          class="hidden"
          tabindex="-1"
          aria-hidden="true"
        />

        <!-- Email (readonly) -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            :value="formData.email"
            readonly
            class="block w-full border-gray-300 border py-2 px-3 bg-gray-100 sm:text-sm cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <!-- Nova senha -->
        <div>
          <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            name="new-password"
            autocomplete="new-password"
            v-model="formData.password"
            required
            minlength="8"
            class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
            placeholder="Mínimo 8 caracteres"
          />
          <p class="mt-1 text-xs text-gray-500">
            A senha deve conter no mínimo 8 caracteres.
          </p>
        </div>

        <!-- Confirmar senha -->
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
            Confirmar nova senha
          </label>
          <input
            id="confirm-password"
            type="password"
            name="confirm-password"
            autocomplete="new-password"
            v-model="formData.confirmPassword"
            required
            :class="[
              'block w-full border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm',
              passwordMismatch ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
            ]"
            placeholder="Repita a nova senha"
          />
          <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">
            As senhas não coincidem.
          </p>
        </div>

        <!-- Submit button -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 transition duration-200"
          >
            <span>{{ isLoading ? 'Salvando...' : 'Redefinir senha' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Optional: refine background & transitions */
input {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
</style>
