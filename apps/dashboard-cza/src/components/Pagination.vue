<script setup lang="ts">
import type { Page } from '@/types/types.ts'

defineProps<{
  pageData: Page<any>
}>()

const emit = defineEmits(['page-change'])

const changePage = (pageNumber: number) => {
  emit('page-change', pageNumber)
}
</script>

<template>
  <nav
    class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-lg"
    aria-label="Pagination"
  >
    <div class="hidden sm:block">
      <p class="text-sm text-gray-700">
        Showing
        <span class="font-medium">{{ pageData.pageable.offset + 1 }}</span>
        to
        <span class="font-medium">{{ pageData.pageable.offset + pageData.numberOfElements }}</span>
        of
        <span class="font-medium">{{ pageData.totalElements }}</span>
        results
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end">
      <button
        @click="changePage(pageData.number - 1)"
        :disabled="pageData.first"
        class="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        @click="changePage(pageData.number + 1)"
        :disabled="pageData.last"
        class="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </nav>
</template>
