<template>
  <main class="h-full w-full flex items-center justify-center bg-white">
    <div class="w-full h-full">
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-8 items-center h-full w-full">

        <!-- Imagem da capa com desfoque -->
        <div
          class="sm:col-span-2 flex justify-center sm:border-b-2 md:border-r-2 border-black sm:justify-start h-full w-full">
          <img alt="casa" rel="preload" fetchpriority="high" src="/casa.png?url" class="w-full h-full object-cover" />
        </div>

        <!-- Texto e informações -->
        <div class="sm:col-span-3 px-8">
          <h1 class="text-5xl font-semibold">CZA+</h1>
          <br>

          <!-- Descrição curta -->
          <p class="text-xl text-gray-600 leading-relaxed">
            Customização em massa de projetos para habitações
          </p>
          <br>

          <!-- Descrição completa -->
          <p class="text-xl text-gray-600 leading-relaxed">
            Uma proposta de sistema de co-design para a edição <br>
            e visualização dos arquivos IFC de projetos BIM
          </p>
          <br>

          <!-- Botão para iniciar -->
          <a href="/opcoes" class="bg-black text-white rounded-full py-4 px-12 inline-block hover:bg-gray-900 ">
            Começar
          </a>
          <br><br>

          <!-- Rodapé com informações de desenvolvimento -->
          <p class="text-sm text-gray-500">
            Carbona Dev. / GEGRADI / UFPel / 2023
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
