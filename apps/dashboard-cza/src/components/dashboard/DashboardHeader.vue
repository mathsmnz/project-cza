<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts'
import { computed } from 'vue'

const auth = useAuthStore()
const props = defineProps<{ title: string }>()

const isProjects = computed(() => props.title === "projects");
const isUsers = computed(() => props.title === "users");
const isOverview = computed(() => props.title === "overview");

const showAction = computed(() => isProjects.value || isUsers.value);

const emit = defineEmits(['createProject', 'createUser'])
</script>

<template>
  <header
    class="flex items-center justify-between w-full px-6 py-4 bg-white border-b border-black transition-all duration-300"
  >
    <!-- Left section: contextual actions -->
    <div
      class="flex items-center transition-all duration-300"
      :class="{
        'min-w-[150px]': showAction,
        'min-w-[0] w-0 overflow-hidden': !(showAction),
      }"
    >
      <transition name="fade">
        <button
          v-if="isProjects"
          key="project-btn"
          class="h-10 flex items-center bg-black text-white font-medium px-4 hover:bg-gray-800 transition-colors"
          @click="emit('createProject')"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Project
        </button>

        <button
          v-else-if="isUsers"
          key="user-btn"
          class="h-10 flex items-center bg-black text-white font-medium px-4 hover:bg-gray-800 transition-colors"
          @click="emit('createUser')"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add User
        </button>
      </transition>
    </div>

    <!-- Right: search bar (expands when left is empty) -->
    <div
      class="relative transition-all duration-300 flex-grow max-w-full mx-6"
      v-if="!isOverview"

    >
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search for anything..."
        class="h-10 w-full pl-10 pr-4 border border-gray-300 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
