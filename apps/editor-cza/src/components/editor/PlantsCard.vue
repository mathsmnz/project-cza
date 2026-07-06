<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { Selection } from '@/types/types.ts'

const props = defineProps<{
  selections: Selection[]
  hasBaseFile: boolean
}>()

const emit = defineEmits<{
  editIfc: [id: string]
  editSelection: [selection: Selection]
  deleteSelection: [index: number]
  addSelection: []
}>()
</script>

<template>
  <div class="lg:col-span-3 bg-white border-2 border-black flex flex-col">
    <div class="p-4 border-b-2 border-black bg-gray-50">
      <h2 class="text-lg font-bold text-gray-900 uppercase">Seleções (Planta)</h2>
    </div>
    <div class="grow p-4 space-y-2 overflow-y-auto min-h-[300px]">
      <!-- Empty State -->
      <div v-if="selections.length === 0" class="text-center text-gray-500 py-12">
        <svg
          class="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <p class="font-medium">Sem seleções adicionadas</p>
      </div>

      <!-- Plants List -->
      <div
        v-else
        v-for="(selection, index) in selections"
        :key="selection.id"
        class="group p-3 border-2 border-gray-300 hover:border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="font-semibold text-gray-900">{{ selection.label }}</span>
          <div class="flex items-center gap-1">
            <!-- Image Icon -->
            <svg
              :class="selection.hasImage ? 'text-green-600' : 'text-gray-300'"
              :title="selection.hasImage ? 'Imagem gerada' : 'Sem imagem'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <!-- IFC Icon -->
            <svg
              :class="selection.hasIfc ? 'text-green-600' : 'text-gray-300'"
              :title="selection.hasIfc ? 'IFC associado' : 'Sem IFC'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="emit('editIfc', selection.id)"
            title="Associate/Edit Files"
            :class="[
              'px-3 py-1.5 text-xs font-bold uppercase transition-colors inline-flex items-center',
              !hasBaseFile
                ? 'opacity-50 pointer-events-none border-2 border-gray-500 text-gray-500 bg-gray-100'
                : (selection.hasIfc && selection.hasImage)
                  ? 'border-2 border-green-600 text-green-800 bg-green-100 hover:bg-green-200'
                  : 'border-2 border-black text-black bg-white hover:bg-black hover:text-white'
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            {{ (selection.hasIfc && selection.hasImage) ? 'Editar Arquivos' : 'Associar Arquivos' }}
          </button>
          <button
            @click="emit('editSelection', selection)"
            title="Edit Plant"
            class="p-1.5 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
              />
              <path
                fill-rule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            @click="emit('deleteSelection', index)"
            title="Delete Plant"
            class="p-1.5 text-gray-400 hover:text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Button -->
    <div class="p-4 border-t-2 border-black bg-gray-50">
      <button
        @click="emit('addSelection')"
        class="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-black text-sm font-semibold text-white bg-black hover:bg-white hover:text-black transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Adicionar Seleção
      </button>
    </div>
  </div>
</template>
