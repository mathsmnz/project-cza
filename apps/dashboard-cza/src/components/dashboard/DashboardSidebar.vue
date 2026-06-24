<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts'

const auth = useAuthStore()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <aside class="w-64 flex-shrink-0 bg-black text-gray-400 flex flex-col border-r-2 border-black">
    <!-- Logo/Brand Section -->
    <div class="p-6 border-b-2 border-gray-800">
      <h1 class="text-2xl font-bold text-white uppercase tracking-wider">
        Dashboard
      </h1>
      <p class="text-xs text-gray-500 mt-1 uppercase">Admin Panel</p>
    </div>

    <!-- Navigation -->
    <nav class="flex-grow p-4">
      <ul class="space-y-1">
        <li>
          <router-link
            to="/dashboard/overview"
            @click="emit('close')"
            class="flex items-center py-3 px-4 font-bold transition-colors hover:bg-gray-800 hover:text-white border-l-4 border-transparent hover:border-white uppercase tracking-wider"
            active-class="bg-gray-200 text-black border-white"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Overview
          </router-link>
        </li>
        <li>
          <router-link
            to="/dashboard/analytics"
            @click="emit('close')"
            class="flex items-center py-3 px-4 font-bold transition-colors hover:bg-gray-800 hover:text-white border-l-4 border-transparent hover:border-white uppercase tracking-wider"
            active-class="bg-gray-200 text-black border-white"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Analytics
          </router-link>
        </li>
        <li>
          <router-link
            to="/dashboard/projects"
            @click="emit('close')"
            class="flex items-center py-3 px-4 font-bold transition-colors hover:bg-gray-800 hover:text-white border-l-4 border-transparent hover:border-white uppercase tracking-wider"
            active-class="bg-gray-200 text-black border-white"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            Projects
          </router-link>
        </li>
        <li>
          <router-link
            to="/dashboard/users"
            @click="emit('close')"
            class="flex items-center py-3 px-4 font-bold transition-colors hover:bg-gray-800 hover:text-white border-l-4 border-transparent hover:border-white uppercase tracking-wider"
            active-class="bg-gray-200 text-black border-white"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Users
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
