<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProjectsTable from './ProjectsTable.vue'
import { fetchProjects } from '@/api/axios.ts'
import type { Page, Project } from '@/types/types.ts' // Import the new table component

const projectsPage = ref<Page<Project>>({
  content: [],
  pageable: {
    sort: { sorted: false, unsorted: true, empty: true },
    offset: 0,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
    unpaged: false,
  },
  totalPages: 0,
  totalElements: 0,
  last: false,
  size: 10,
  number: 0,
  sort: { sorted: false, unsorted: true, empty: true },
  numberOfElements: 0,
  first: true,
  empty: true,
})

const page = {
  page: 0,
  size: 10,
  sort: 'name,asc'
}

onMounted(async () => {
  projectsPage.value = await fetchProjects(page.page, page.size, page.sort)
  console.log(projectsPage.value.content)
})


const activeTab = ref('All Projects')
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold text-gray-800 mb-2">Projects</h2>
    <div class="border-b border-gray-300 mb-6">
      <nav class="flex space-x-6 -mb-px">
        <a
          href="#"
          @click.prevent="activeTab = 'All Projects'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'All Projects'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >All Projects</a
        >
        <a
          href="#"
          @click.prevent="activeTab = 'Assets by project'"
          :class="[
            'py-3 px-1 text-gray-500 whitespace-nowrap',
            activeTab === 'Assets by project'
              ? 'border-b-2 border-black text-black font-semibold'
              : 'hover:text-black',
          ]"
          >Assets by project</a
        >
      </nav>
    </div>

    <!-- Use the ProjectsTable component and pass the orders data to it -->
    <ProjectsTable :projects="projectsPage.content" />
  </div>
</template>
