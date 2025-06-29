<script setup>
import NavBar from './components/NavBar.vue';
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
