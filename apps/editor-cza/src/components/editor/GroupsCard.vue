<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Group } from '@/types/types.ts'

const props = defineProps<{
  groups: Group[]
  selectedGroup: Group | null
}>()

const emit = defineEmits<{
  selectGroup: [group: Group]
  editGroup: [group: Group]
  addGroup: []
  deleteGroup: []
}>()
</script>

<template>
  <!-- Column 1: Groups -->
  <div class="lg:col-span-1 bg-white border-2 border-black flex flex-col">
    <div class="p-4 border-b-2 border-black bg-gray-50">
      <h2 class="text-lg font-bold text-gray-900 uppercase">Grupos</h2>
    </div>
    <div class="grow p-4 space-y-2 overflow-y-auto min-h-[400px]">
      <div v-if="groups.length === 0" class="text-center text-gray-500 py-12">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="font-medium">Sem grupos adicionados</p>
      </div>
      <div
        v-else
        v-for="group in groups"
        :key="group.id"
        @click="emit('selectGroup', group)"
        class="group p-3 cursor-pointer border-2 flex justify-between items-center transition-colors"
        :class="{
          'bg-black text-white border-black': group.id === selectedGroup?.id,
          'border-gray-300 hover:border-black': group.id !== selectedGroup?.id,
        }"
      >
        <span class="font-medium">{{ group.label }}</span>
        <button
          @click.stop="emit('editGroup', group)"
          title="Edit Group"
          class="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          :class="group.id === selectedGroup?.id ? 'text-white hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
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
      </div>
    </div>
    <div class="p-4 border-t-2 border-black bg-gray-50 space-y-2">
      <button
        @click="emit('addGroup')"
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
        Adicionar Grupo
      </button>
      <button
        @click="emit('deleteGroup')"
        :disabled="!selectedGroup"
        class="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-red-500 text-sm font-semibold text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        Apagar Grupo
      </button>
    </div>
  </div>
</template>
