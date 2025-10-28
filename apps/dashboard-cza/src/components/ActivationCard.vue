<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { completeRegistration, getInvitationByToken } from '@/api/axios.ts'
import type { CompleteRegistrationRequest } from '@/types/types.ts' // Para pegar o token da URL

// Define a estrutura para os dados do formulário
interface RegistrationData {
  token: string | null
  email: string
  username: string
  name: string
  lastName: string
  password: string
  confirmPassword: string
}

const route = useRoute()
const router = useRouter()

const props = defineProps<{ token: string }>()

const formData = ref<RegistrationData>({
  token: props.token,
  email: '',
  username: '',
  name: '',
  lastName: '',
  password: '',
  confirmPassword: '',
})

const submitData = ref<CompleteRegistrationRequest>({
  name: '',
  lastName: '',
  username: '',
  password: '',
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const passwordMismatch = ref(false)

const fetchInvitationDetails = async (token: string) => {
  isLoading.value = true
  error.value = null
  try {
    const invitation = await getInvitationByToken(token)
    formData.value.email = invitation.email
    formData.value.token = token
  } catch (err) {
    console.error('Erro ao buscar detalhes do convite:', err)
    error.value = 'Link de convite inválido ou expirado.'
  } finally {
    isLoading.value = false
  }
}

const handleRegistration = async (token: string) => {
  error.value = null
  passwordMismatch.value = false

  if (formData.value.password !== formData.value.confirmPassword) {
    passwordMismatch.value = true
    error.value = 'As senhas não coincidem.'
    return
  }

  isLoading.value = true
  try {
    console.log('Submitting registration:', formData.value)

    submitData.value.password = formData.value.password
    submitData.value.lastName = formData.value.lastName
    submitData.value.username = formData.value.username
    submitData.value.name = formData.value.name

    await completeRegistration(token, submitData.value)

    alert('Cadastro concluído com sucesso! Você será redirecionado para o login.') // Use um toast/notificação
    await router.push('/login') // Ou para onde for apropriado
  } catch (err) {
    console.error('Erro ao completar cadastro:', err)
    error.value = 'Não foi possível completar o cadastro. Tente novamente.' // Ou pegue erro da API
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const token = route.query.token as string | undefined
  if (token) {
    fetchInvitationDetails(token)
  } else {
    error.value = 'Link de convite inválido ou ausente.'
    isLoading.value = false // Garante que o loading pare se não houver token
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-montserrat">
    <div class="bg-white outline-2 w-full max-w-md">
      <!-- Cabeçalho -->
      <div class="p-6 border-b  border-gray-200 text-center">
        <h1 class="text-2xl font-bold text-gray-800">Complete seu Cadastro</h1>
        <p v-if="formData.email" class="mt-1 text-sm text-gray-600">
          Você foi convidado para se juntar à plataforma.
        </p>
        <p v-else-if="!isLoading && error" class="mt-1 text-sm text-red-600">
          {{ error }}
        </p>
        <p v-else-if="isLoading" class="mt-1 text-sm text-gray-500">Verificando convite...</p>
      </div>

      <!-- Formulário (só mostra se não houver erro inicial e não estiver carregando) -->
      <form
        v-if="!error && !isLoading && formData.token"
        @submit.prevent="handleRegistration(formData.token)"
        class="p-6 space-y-5"
      >
        <!-- Email (Readonly) -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1 "
            >Email (Convidado)</label
          >
          <input
            id="email"
            type="email"
            :value="formData.email"
            readonly
            class="block w-full border-gray-300 border py-2 px-3 bg-gray-100 sm:text-sm cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1"
            >Username</label
          >
          <input
            id="username"
            type="text"
            autocomplete="username"
            v-model="formData.username"
            required
            class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
            placeholder="Escolha um nome de usuário"
          />
        </div>

        <!-- Nome e Sobrenome -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              id="name"
              type="text"
              autocomplete="given-name"
              v-model="formData.name"
              required
              class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
              placeholder="Seu primeiro nome"
            />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1"
              >Sobrenome</label
            >
            <input
              id="lastName"
              type="text"
              autocomplete="family-name"
              v-model="formData.lastName"
              required
              class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
              placeholder="Seu sobrenome"
            />
          </div>
        </div>

        <!-- Senha -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            id="password"
            type="password"
            autocomplete="new-password"
            v-model="formData.password"
            required
            minlength="8"
            class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <!-- Confirmar Senha -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1"
            >Confirmar Senha</label
          >
          <input
            id="confirmPassword"
            type="password"
            autocomplete="new-password"
            v-model="formData.confirmPassword"
            required
            :class="[
              'block w-full border-gray-300  border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm',
              { 'border-red-500 focus:ring-red-500 focus:border-red-500': passwordMismatch },
            ]"
            placeholder="Repita a senha"
          />
          <p v-if="passwordMismatch" class="mt-1 text-xs text-red-600">As senhas não coincidem.</p>
        </div>

        <!-- Mensagem de Erro Geral -->
        <div v-if="error && !passwordMismatch" class="p-3 bg-red-50 text-red-700 text-sm">
          {{ error }}
        </div>

        <!-- Botão de Ação -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>{{ isLoading ? 'Registrando...' : 'Completar Cadastro' }}</span>
          </button>
        </div>
      </form>
      <!-- Rodapé (opcional) -->
      <div
        v-if="!error && !isLoading && formData.token"
        class="p-4 text-center text-xs text-gray-400 border-t border-gray-200"
      >
        Ao se registrar, você concorda com nossos Termos de Serviço.
      </div>
    </div>
  </div>
</template>
