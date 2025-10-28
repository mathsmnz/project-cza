<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { fetchAllPasswordRecoveries } from '@/api/axios.ts'

const route = useRoute()
const router = useRouter()

const props = defineProps<{ token: string }>()

const isLoading = ref(false)
const error = ref<string | null>(null)
const passwordMismatch = ref(false)

const formData = ref({
  email: 'teste@mail.com',
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  const token = route.query.token as string | undefined
  if(token){
    fetchAllPasswordRecoveries()
  }else{
    error.value = 'Link de convite inválido ou ausente.'
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-montserrat">
    <div class="bg-white outline-2 w-full max-w-md">
      <div class="p-6 border-b border-gray-200 text-center">
        <h1 class="text-2xl font-bold text-gray-800">Recupere sua Senha</h1>
        <p v-if="formData.email" class="mt-1 text-sm text-gray-600">
          Você solicitou para que sua senha fosse redefinida
        </p>
        <p v-else-if="!isLoading && error" class="mt-1 text-sm text-red-600">
          {{ error }}
        </p>
        <p v-else-if="isLoading" class="mt-1 text-sm text-gray-500">Verificando token...</p>
      </div>

      <form autocomplete="on" method="post" class="p-6 space-y-5">
        <!-- Hidden duplicate field to help Chrome recognize the user -->
        <input
          type="text"
          name="username"
          autocomplete="username"
          :value="formData.email"
          class="hidden"
          tabindex="-1"
          aria-hidden="true"
        />

        <!-- Visible readonly email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            :value="formData.email"
            readonly
            class="block w-full border-gray-300 border py-2 px-3 bg-gray-100 sm:text-sm cursor-not-allowed"
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
            class="block w-full border-gray-300 border py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Mínimo 8 caracteres"
          />
          <p id="passwordHelp" class="mt-1 text-xs text-gray-500">
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
              'block w-full border-gray-300 border py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
              { 'border-red-500 focus:ring-red-500 focus:border-red-500': passwordMismatch },
            ]"
            placeholder="Repita a nova senha"
          />
        </div>

        <!-- Submit button -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{{ isLoading ? 'Salvando...' : 'Redefinir senha' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
