<template>
  <main class="h-screen w-full flex bg-white">
    <div class="w-full h-full flex flex-col md:flex-row">
      <!-- Image Section with Border -->
      <div
        class="w-full md:w-2/5 h-64 md:h-full relative border-b-2 md:border-b-0 md:border-r-2 border-black"
      >
        <img
          alt="casa"
          rel="preload"
          fetchpriority="high"
          src="/casa.png?url"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Content Section -->
      <div class="flex-1 flex items-center justify-start p-8 md:p-16">
        <div class="max-w-2xl w-full">
          <h1 class="text-5xl font-semibold">CZA+</h1>
          <br />

          <!-- Descrição curta -->
          <p class="text-xl text-gray-600 leading-relaxed">
            Customização em massa de projetos para habitações
          </p>
          <br />

          <!-- Descrição completa -->
          <p class="text-xl text-gray-600 leading-relaxed">
            Uma proposta de sistema de co-design para a edição <br class="hidden md:inline-block" />
            e visualização dos arquivos IFC de projetos BIM
          </p>
          <br />

          <!-- Botão para iniciar -->
          <router-link
            to="/editor"
            class="bg-black text-white py-4 px-12 inline-block hover:bg-gray-900"
          >
            Começar
          </router-link>
          <br /><br />

          <!-- Rodapé com informações de desenvolvimento -->
          <p class="text-sm text-gray-500">Msmenezes Dev. / GEGRADI / UFPel / 2025</p>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
</script>
