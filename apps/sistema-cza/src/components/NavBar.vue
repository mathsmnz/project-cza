<template>
  <nav class="bg-white text-black font-montserrat border-b-2 border-black shadow-sm">
    <div class="flex items-center justify-between max-w-8xl mx-auto px-4 lg:px-8 py-3">
      <!-- Left Side: Logo & Main Navigation -->
      <div class="flex items-center space-x-8">
        <!-- Logo (CZA+) -->
        <RouterLink to="/" class="font-semibold text-3xl text-gray-800 hover:text-indigo-600 transition-colors">
          CZA+
        </RouterLink>

        <!-- Navigation Links -->
        <div class="hidden md:flex space-x-6">
          <RouterLink
            to="/sobre"
            class="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
            active-class="text-indigo-600 font-semibold"
          >
            Sobre
          </RouterLink>
          <!-- Add other main navigation links here -->
        </div>
      </div>

      <!-- Right Side: Project & User Info -->
      <div v-if="currentUser && currentProject" class="flex items-center space-x-4">
        <!-- Project Name -->
        <div class="flex items-center space-x-1 text-gray-700">
          <span class="font-medium text-sm">{{ currentProject.name }}</span>
          <!-- Dropdown Arrow -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-300"></div>

        <!-- User Info -->
        <div class="flex items-center space-x-2 cursor-pointer group">
          <!-- Profile Picture Placeholder -->
          <img
            v-if="currentUser.profilePicUrl"
            :src="currentUser.profilePicUrl"
            alt="User Avatar"
            class="h-8 w-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-indigo-500 transition-colors"
          />
          <div v-else class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm border-2 border-gray-200 group-hover:border-indigo-500 transition-colors">
            {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?' }} <!-- Initial -->
          </div>

          <!-- User Name -->
          <span class="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
            {{ currentUser.name }}
          </span>
        </div>
      </div>
      <!-- Placeholder if user not logged in -->
      <div v-else>
        <RouterLink to="/login" class="text-sm font-medium text-gray-600 hover:text-indigo-600">Login</RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const currentUser = { name: 'Admin User', profilePicUrl: 'https://placehold.co/40x40/E0E7FF/4F46E5?text=AU' }
const currentProject = { name: 'Project Alpha' }
</script>
