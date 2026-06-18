<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-sm bg-white p-8 outline-2">
      <h2 class="text-2xl font-semibold text-center mb-6 text-gray-800">Login</h2>

      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="E-mail"
          class="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          @click="login"
          class="w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 transition duration-200"
        >
          Login
        </button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-4">
        Não possui conta?
        <a href="#" class="text-blue-600 hover:underline">Fale com um Admin</a>
      </p>
    </div>
  </div>
  <ToastNotification
    :show="toastState.show"
    :message="toastState.message"
    :mode="toastState.mode"
    :duration="toastState.duration"
    @close="hideToast"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'
import type { LoginUserRequest } from '@/types/types.ts'
import ToastNotification from '@/components/ToastNotification.vue'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const auth = useAuthStore()

const toastState = reactive({
  show: false,
  message: '',
  mode: 'success',
  duration: 3000,
})

const showToast = (message: string, mode = 'success', duration = 3000) => {
  toastState.message = message
  toastState.mode = mode
  toastState.duration = duration
  toastState.show = true
}

const hideToast = () => {
  toastState.show = false
}

async function login() {
  try {
    const credentials = {
      email: email.value,
      password: password.value,
    } as LoginUserRequest
    const success = await auth.login(credentials)

    if (success) {
      const redirectPath = (route.query.redirect as string) || '/'
      showToast('Login realizado com sucesso!', 'success')
      await router.push(redirectPath)
    } else {
      showToast('Falha no login. Verifique suas credenciais.', 'error')
    }
  } catch (error) {
    showToast('Ocorreu um erro durante o login.', 'error')
  }
}
</script>

<style scoped></style>
