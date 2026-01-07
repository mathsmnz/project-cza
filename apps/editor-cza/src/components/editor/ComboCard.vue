<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import type { Group } from '@/types/types.ts'

const props = defineProps<{
  selectedGroup: Group | null
}>()

const emit = defineEmits<{
  editCombo: [index: number]
  deleteCombo: [index: number]
  addCombo: []
}>()

const title = computed(() => {
  if (!props.selectedGroup) return 'Selecione um grupo para começar'
  return `Options for "${props.selectedGroup.label}"`
})
</script>

<template>
  <div class="lg:col-span-2 bg-white border-2 border-black flex flex-col">
    <div class="p-4 border-b-2 border-black bg-gray-50">
      <h2 class="text-lg font-bold text-gray-900 uppercase truncate">
        {{ title }}
      </h2>
    </div>
    <div class="grow p-4 space-y-2 overflow-y-auto min-h-[400px]">
      <!-- No Group Selected -->
      <div v-if="!selectedGroup" class="text-center text-gray-500 py-12">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p class="font-medium">Selecione um grupo para ver as opções</p>
      </div>

      <!-- No Options in Group -->
      <div
        v-else-if="selectedGroup.combos.length === 0"
        class="text-center text-gray-500 py-12"
      >
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="font-medium">Sem opções para este grupo</p>
      </div>

      <!-- Options List -->
      <div
        v-else
        v-for="(combo, index) in selectedGroup.combos"
        :key="combo.id || index"
        class="group p-3 border-2 border-gray-300 hover:border-black flex justify-between items-center transition-colors"
      >
        <span class="font-medium">{{ combo.label }}</span>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="emit('editCombo', index)"
            title="Edit Option"
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
            @click="emit('deleteCombo', index)"
            title="Delete Option"
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

    <!-- Add Button (only shown when group is selected) -->
    <div v-if="selectedGroup" class="p-4 border-t-2 border-black bg-gray-50">
      <button
        @click="emit('addCombo')"
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
        Adicionar opção
      </button>
    </div>
  </div>
</template>
