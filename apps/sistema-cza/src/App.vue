<script setup lang="ts">
import NavBar from '@/components/navigation/NavBar.vue'
import { useAuthWatcher } from '@/util/authWatcher.ts'
import { onMounted } from 'vue'

onMounted(() => {
  useAuthWatcher()
})
</script>

<template>
  <div class="flex flex-col grow h-screen w-screen font-montserrat">
    <header>
      <NavBar />
    </header>

    <main class="overflow-hidden flex-1">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
