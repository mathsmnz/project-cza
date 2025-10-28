<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ChartOptions } from 'chart.js'
import { fetchPlatformStats } from '@/api/axios.ts'
import { formatBytes } from '@/util/util.ts'

Chart.register(...registerables)

interface PlatformStats {
  id: number
  projectCount: number
  userCount: number
  fileCount: number
  spaceOnDisk: number
  maxSpaceOnDisk: number
}

// --- STATE MANAGEMENT ---
const stats = ref<PlatformStats | null>(null)
const diskChartRef = ref<HTMLCanvasElement | null>(null)
let diskChartInstance: Chart | null = null

// --- CHART LOGIC ---
/**
 * Creates or updates the disk usage doughnut chart.
 */
function createOrUpdateDiskUsageChart() {
  if (!diskChartRef.value || !stats.value) return

  const usedSpace = stats.value.spaceOnDisk
  const freeSpace = stats.value.maxSpaceOnDisk - usedSpace

  const data = {
    labels: ['Used Space', 'Free Space'],
    datasets: [
      {
        data: [usedSpace, freeSpace],
        backgroundColor: ['#2563EB', '#031e50'], // Blue for used, Gray for free
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  // If chart already exists, update its data and refresh
  if (diskChartInstance) {
    diskChartInstance.data = data
    diskChartInstance.update()
  } else {
    // Otherwise, create a new chart instance
    const ctx = diskChartRef.value.getContext('2d') as CanvasRenderingContext2D
    diskChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12,
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || ''
                const value = context.raw as number
                return `${label}: ${formatBytes(value)}`
              },
            },
          },
        },
      },
    })

  }
}

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  try {
    stats.value = await fetchPlatformStats()
  } catch (err) {
    console.error('Failed to fetch initial platform stats', err)
  }
})

// Watch for changes in stats and update the chart accordingly
watch(stats, async () => {
  if (stats.value) {
    await nextTick();
    createOrUpdateDiskUsageChart()
  }
}, { deep: true })

</script>

<template>
  <div class="min-fit">

    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <div class="bg-white border border-gray-200  p-6  outline outline-black-sm flex flex-col justify-between">
        <h3 class="text-gray-500 font-medium">Total Projects</h3>
        <p class="text-3xl font-semibold text-gray-900 mt-2">{{ stats.projectCount }}</p>
      </div>

      <div class="bg-white border border-gray-200  p-6  outline outline-black-sm flex flex-col justify-between">
        <h3 class="text-gray-500 font-medium">Registered Users</h3>
        <p class="text-3xl font-semibold text-gray-900 mt-2">{{ stats.userCount }}</p>
      </div>

      <div class="bg-white border border-gray-200  p-6  outline outline-black-sm flex flex-col justify-between">
        <h3 class="text-gray-500 font-medium">Total Files</h3>
        <p class="text-3xl font-semibold text-gray-900 mt-2">{{ stats.fileCount }}</p>
      </div>

      <div class="bg-white border border-gray-200  p-6  outline outline-black-sm col-span-1 md:col-span-2 lg:col-span-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Disk Usage</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div class="md:col-span-1 h-48 sm:h-56">
            <canvas ref="diskChartRef"></canvas>
          </div>
          <div class="md:col-span-2 text-gray-700 space-y-3">
            <div class="flex justify-between items-baseline border-b pb-2">
              <span class="font-medium text-blue-600">Used Space:</span>
              <span class="font-semibold text-lg">{{ formatBytes(stats.spaceOnDisk) }}</span>
            </div>
            <div class="flex justify-between items-baseline border-b pb-2">
              <span class="font-medium text-gray-500">Free Space:</span>
              <span class="font-semibold text-lg">{{ formatBytes(stats.maxSpaceOnDisk - stats.spaceOnDisk) }}</span>
            </div>
            <div class="flex justify-between items-baseline pt-2">
              <span class="font-bold">Total Capacity:</span>
              <span class="font-bold text-lg text-gray-800">{{ formatBytes(stats.maxSpaceOnDisk) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div v-else class="text-center text-gray-500">
      Loading platform statistics...
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles can be added here if needed, but Tailwind covers most cases. */
</style>
