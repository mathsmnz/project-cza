<script setup lang="ts">
import NavBar from './components/NavBar.vue';
import { onMounted } from 'vue'
import { useAuthWatcher } from '@/util/authWatcher.ts'
onMounted(() => {
  useAuthWatcher()
})
</script>

<template>
  <div class="flex flex-col grow h-screen w-screen font-montserrat">
    <header>
      <NavBar />
    </header>

    <main class="overflow-hidden h-full">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
