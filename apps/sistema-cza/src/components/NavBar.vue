<template>
    <nav class="bg-white text-black font-montserrat border-b-2 border-black">
      <div class="flex items-center justify-between max-w-8xl mx-auto px-4 lg:px-8 py-4">
        <!-- Logo (CZA+) -->
        <RouterLink to="/" class="font-400 text-4xl hover:font-600">
          CZA+
        </RouterLink>
        
        <!-- Navigation Links -->
        <div class="flex space-x-8">
          <RouterLink to="/sobre" class="font-200 text-2xl hover:text-gray-600">
            Sobre
          </RouterLink>
        </div>
      </div>
    </nav>
  </template>
  