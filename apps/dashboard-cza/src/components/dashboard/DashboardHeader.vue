<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts'
import { computed, ref } from 'vue'

const auth = useAuthStore()
const props = defineProps<{ title: string }>()

const searchQuery = ref('')

const isProjects = computed(() => props.title === 'projects')
const isUsers = computed(() => props.title === 'users')
const isOverview = computed(() => props.title === 'overview')

const showAction = computed(() => isProjects.value || isUsers.value)

const emit = defineEmits(['createProject', 'createUser', 'search'])

// Emit search event when user types
const handleSearch = () => {
  emit('search', searchQuery.value)
}

// Get page title
const pageTitle = computed(() => {
  if (isProjects.value) return 'Projects'
  if (isUsers.value) return 'Users'
  if (isOverview.value) return 'Dashboard Overview'
  return props.title.charAt(0).toUpperCase() + props.title.slice(1)
})
</script>

<template>
  <header
    class="w-full px-6 py-4 bg-white border-b-2 border-black"
  >
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Left section: Page title or action button -->
      <div class="flex items-center gap-4 min-w-0 flex-shrink-0">
        <transition name="fade" mode="out-in">
          <!-- Action Buttons -->
          <button
            v-if="isProjects"
            key="project-btn"
            class="h-10 flex items-center bg-black text-white font-semibold px-4 border border-black hover:bg-white hover:text-black transition-colors"
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
            class="h-10 flex items-center bg-black text-white font-semibold px-4 border border-black hover:bg-white hover:text-black transition-colors"
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

      <!-- Center/Right: Search bar (only on non-overview pages) -->
      <div v-if="!isOverview" class="relative flex-grow max-w-2xl ml-auto">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          :placeholder="`Search ${pageTitle.toLowerCase()}...`"
          class="h-10 w-full pl-10 pr-4 border border-gray-300 text-sm placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
        />
      </div>
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
