<script setup lang="ts">
import NavBar from '@/components/navigation/NavBar.vue'
import { useAuthWatcher } from '@/util/authWatcher.ts'
import { onMounted } from 'vue'

onMounted(() => {
  useAuthWatcher()
})
</script>

<template>
  <div class="grid grid-rows-[auto_1fr] h-screen w-screen font-montserrat overflow-hidden">
    <header>
      <NavBar />
    </header>

    <main class="overflow-hidden min-h-0 h-full w-full">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
