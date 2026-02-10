<template>
  <nav class="bg-white text-black font-montserrat border-b-2 border-black shadow-sm">
    <div class="flex items-center justify-between max-w-8xl mx-auto px-4 lg:px-8 py-3">
      <!-- Left Side: Logo & Main Navigation -->
      <div class="flex items-center space-x-8">
        <!-- Logo (CZA+) -->
        <RouterLink
          to="/"
          class="font-semibold text-3xl text-gray-800 hover:text-gray-600 transition-colors"
        >
          CZA+
        </RouterLink>

        <!-- Navigation Links -->
        <div class="hidden md:flex space-x-6">
          <RouterLink
            to="/about"
            class="text-gray-600 hover:text-gray-600 transition-colors text-sm font-medium"
            active-class="text-gray-600 font-semibold"
          >
            Sobre
          </RouterLink>
          <!-- Add other main navigation links here -->
        </div>
      </div>

      <!-- Right Side: Project & User Info -->
      <div v-if="isAuthenticated" class="flex items-center space-x-4">
        <!-- User Info with Dropdown -->
        <div class="relative" ref="dropdownRef">
          <div @click="toggleDropdown" class="flex items-center space-x-2 cursor-pointer group">
            <!-- Profile Picture Placeholder -->
            <img
              v-if="profilePicUrl"
              :src="profilePicUrl"
              alt="User Avatar"
              class="h-8 w-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-500 transition-colors"
            />
            <div
              v-else
              class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-gray-200 group-hover:border-gray-500 transition-colors"
            >
              {{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}
            </div>

            <!-- User Name -->
            <span
              class="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors"
            >
              {{ user?.name + ' ' + user?.lastname }}
            </span>

            <!-- Dropdown Arrow -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-500 transition-transform"
              :class="{ 'rotate-180': isDropdownOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg z-50"
            >
              <div class="p-4 space-y-3">
                <!-- Token Section -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    Token de Confirmação
                  </label>
                  <div v-if="isLoadingToken" class="flex items-center justify-center py-3">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-t-2 border-black border-solid"
                    ></div>
                  </div>
                  <div v-else class="flex items-center space-x-2">
                    <div class="relative flex-1">
                      <input
                        type="text"
                        readonly
                        :value="confirmationToken"
                        :class="{
                          'blur-sm': !isTokenVisible,
                          'cursor-pointer': isTokenVisible,
                          'cursor-not-allowed': !isTokenVisible,
                        }"
                        class="block w-full bg-gray-50 border border-gray-300 py-2 px-3 pr-10 text-sm font-mono select-all"
                        @click="isTokenVisible ? copyToken() : null"
                        :title="isTokenVisible ? 'Clique para copiar' : 'Revelar token primeiro'"
                      />
                      <button
                        @click.stop="toggleTokenVisibility"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <!-- Eye Icon (Visible) -->
                        <svg
                          v-if="isTokenVisible"
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <!-- Eye Slash Icon (Hidden) -->
                        <svg
                          v-else
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{
                      isCopied
                        ? 'Token copiado!'
                        : isTokenVisible
                          ? 'Clique no token para copiar'
                          : 'Clique no ícone do olho para revelar'
                    }}
                  </p>
                </div>

                <!-- Divider -->
                <div class="border-t border-gray-200"></div>

                <!-- Additional Options -->
                <button
                  @click="handleLogout"
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <!-- Placeholder if user not logged in -->
      <div v-else>
        <RouterLink to="/login" class="text-sm font-medium text-gray-600 hover:text-gray-600">
          Login
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchConfirmationKey } from '@/api/axios.ts'

const auth = useAuthStore()
const { isAuthenticated, user } = storeToRefs(auth)

const profilePicUrl = computed(() =>
  user.value?.username
    ? `https://api.dicebear.com/9.x/dylan/svg?seed=${user.value.username}`
    : null,
)

// Dropdown state
const dropdownRef = ref<HTMLElement | null>(null)
const isDropdownOpen = ref(false)
const isTokenVisible = ref(false)
const isCopied = ref(false)
const confirmationToken = ref('')
const isLoadingToken = ref(false)

async function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value

  // Fetch token when opening dropdown (only if not already fetched)
  if (isDropdownOpen.value && !confirmationToken.value && auth.user) {
    isLoadingToken.value = true
    try {
      confirmationToken.value = await fetchConfirmationKey(auth.user.id)
    } catch (error) {
      console.error('Failed to fetch confirmation key:', error)
    } finally {
      isLoadingToken.value = false
    }
  }
}

function toggleTokenVisibility() {
  isTokenVisible.value = !isTokenVisible.value
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(confirmationToken.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy token:', error)
  }
}

function handleLogout() {
  auth.logout()
  isDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
