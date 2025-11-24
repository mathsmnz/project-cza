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
        <!-- Project Name -->
        <project-selector/>
        <!-- Separator -->
        <div class="h-6 w-px bg-gray-300"></div>

        <!-- User Info -->
        <div class="flex items-center space-x-2 cursor-pointer group">
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
            <!-- Initial -->
          </div>

          <!-- User Name -->
          <span
            class="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors"
          >
            {{ user?.name + ' ' + user?.lastname }}
          </span>
        </div>
      </div>
      <!-- Placeholder if user not logged in -->
      <div v-else>
        <RouterLink to="/login" class="text-sm font-medium text-gray-600 hover:text-gray-600"
        >Login</RouterLink
        >
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const auth = useAuthStore()

const { isAuthenticated, user } = storeToRefs(auth)

const profilePicUrl = computed(() =>
  user.value?.username
    ? `https://api.dicebear.com/9.x/dylan/svg?seed=${user.value.username}`
    : null,
)
</script>
