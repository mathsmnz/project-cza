<script setup lang="ts">
defineProps<{
  path: string
  disabled: boolean
}>()
</script>

<template>
  <div>
    <!-- Enabled state -->
    <router-link
      v-if="!disabled"
      :to="path"
      class="inline-block bg-black text-white font-medium text-lg px-12 py-4 hover:bg-gray-800 transition-colors duration-200"
    >
      <slot />
    </router-link>

    <!-- Disabled state (accessible button) -->
    <button
      v-else
      disabled
      class="inline-block bg-gray-300 text-gray-600 font-medium text-lg px-12 py-4 cursor-not-allowed"
    >
      <slot />
    </button>
  </div>
</template>
