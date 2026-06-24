<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { fetchPlatformStats, forceRefreshPlatformStats } from '@/api/axios.ts'
import { formatBytes } from '@/util/util.ts'
import { useToastStore } from '@/stores/toast.ts'

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
const isLoading = ref(true)
const error = ref<string | null>(null)
const diskChartRef = ref<HTMLCanvasElement | null>(null)
let diskChartInstance: Chart | null = null

const toastStore = useToastStore()

// --- COMPUTED PROPERTIES ---
const diskUsagePercentage = computed(() => {
  if (!stats.value) return 0
  return Math.round((stats.value.spaceOnDisk / stats.value.maxSpaceOnDisk) * 100)
})

const diskUsageColor = computed(() => {
  const percentage = diskUsagePercentage.value
  if (percentage >= 90) return 'text-red-600'
  return 'text-black'
})

const diskUsageBarColor = computed(() => {
  const percentage = diskUsagePercentage.value
  if (percentage >= 90) return 'bg-red-600'
  return 'bg-black'
})

// --- CHART LOGIC ---
function createOrUpdateDiskUsageChart() {
  if (!diskChartRef.value || !stats.value) return

  const usedSpace = stats.value.spaceOnDisk
  const freeSpace = stats.value.maxSpaceOnDisk - usedSpace

  const percentage = diskUsagePercentage.value
  let usedColor = '#000000' // black
  if (percentage >= 90) usedColor = '#DC2626' // red

  const data = {
    labels: ['Used Space', 'Free Space'],
    datasets: [
      {
        data: [usedSpace, freeSpace],
        backgroundColor: [usedColor, '#E5E7EB'],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }

  if (diskChartInstance) {
    diskChartInstance.data = data
    diskChartInstance.update()
  } else {
    const ctx = diskChartRef.value.getContext('2d') as CanvasRenderingContext2D
    diskChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1F2937',
            padding: 12,
            titleFont: { size: 14, weight: 600 },
            bodyFont: { size: 13 },
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
const loadStats = async (forceRefresh = false, showLoading = true) => {
  try {
    if (showLoading) isLoading.value = true
    stats.value = forceRefresh ? await forceRefreshPlatformStats() : await fetchPlatformStats()
    error.value = null
  } catch (err) {
    console.error('Failed to fetch platform stats', err)
    if (showLoading) error.value = 'Failed to load statistics'
    toastStore.addToast('Falha ao carregar estatísticas.', 'error')
  } finally {
    if (showLoading) isLoading.value = false
  }
}

onMounted(() => {
  // Update on demand when opening the page
  loadStats(true, true)
})

watch(stats, async () => {
  if (stats.value) {
    await nextTick()
    createOrUpdateDiskUsageChart()
  }
}, { deep: true })
</script>

<template>
  <div class="min-fit">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-gray-100 border-2 border-black p-6 animate-pulse"
      >
        <div class="h-4 bg-gray-200 w-24 mb-4"></div>
        <div class="h-8 bg-gray-200 w-16"></div>
      </div>
      <div class="bg-gray-100 border-2 border-black p-6 animate-pulse col-span-1 md:col-span-2 lg:col-span-4">
        <div class="h-6 bg-gray-200 w-32 mb-4"></div>
        <div class="h-48 bg-gray-200"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-2 border-red-500 p-6 text-center">
      <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-red-800 font-semibold">{{ error }}</p>
    </div>

    <!-- Stats Display -->
    <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Projects Card -->
      <div class="bg-gray-100 border-2 border-black p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-bold text-black uppercase tracking-wider">Projects</h3>
          <div class="p-2 bg-black text-white border-2 border-black">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        </div>
        <p class="text-4xl font-bold text-black mt-4">{{ stats.projectCount.toLocaleString() }}</p>
        <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">Total active projects</p>
      </div>

      <!-- Users Card -->
      <div class="bg-gray-100 border-2 border-black p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-bold text-black uppercase tracking-wider">Users</h3>
          <div class="p-2 bg-gray-100 text-black border-2 border-black">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <p class="text-4xl font-bold text-black mt-4">{{ stats.userCount.toLocaleString() }}</p>
        <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">Registered accounts</p>
      </div>

      <!-- Files Card -->
      <div class="bg-gray-100 border-2 border-black p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-bold text-black uppercase tracking-wider">Files</h3>
          <div class="p-2 bg-black text-white border-2 border-black">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p class="text-4xl font-bold text-black mt-4">{{ stats.fileCount.toLocaleString() }}</p>
        <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">Uploaded files</p>
      </div>

      <!-- Disk Usage Card -->
      <div class="bg-gray-100 border-2 border-black p-6 col-span-1 md:col-span-2 lg:col-span-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black">
          <div class="flex items-center gap-4">
            <h3 class="text-xl font-bold text-black uppercase tracking-wider">Storage Overview</h3>
            <button 
              @click="loadStats(true, true)"
              class="p-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors flex-shrink-0"
              title="Refresh stats"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <span
            class="w-max px-4 py-1.5 border-2 border-black text-sm font-bold uppercase tracking-wide"
            :class="[
              diskUsagePercentage >= 90 ? 'bg-red-600 text-white' : 'bg-black text-white'
            ]"
          >
            {{ diskUsagePercentage }}% Used
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <!-- Chart Section -->
          <div class="lg:col-span-1 flex flex-col items-center">
            <div class="relative h-56 w-56 border-2 border-black p-4 bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <canvas ref="diskChartRef"></canvas>
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-4xl font-bold" :class="diskUsageColor">
                  {{ diskUsagePercentage }}%
                </span>
                <span class="text-sm text-gray-600 font-bold uppercase tracking-wider mt-1">USED</span>
              </div>
            </div>
          </div>

          <!-- Stats Section -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Used Space -->
            <div class="bg-gray-100 border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div class="flex justify-between items-baseline mb-3">
                <span class="text-sm font-bold text-black uppercase tracking-wider">Used Space</span>
                <span class="text-xl font-bold" :class="diskUsageColor">
                  {{ formatBytes(stats.spaceOnDisk) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 border-2 border-black h-4 overflow-hidden">
                <div
                  :class="diskUsageBarColor"
                  class="h-full transition-all duration-500"
                  :style="{ width: diskUsagePercentage + '%' }"
                ></div>
              </div>
            </div>

            <!-- Free Space -->
            <div class="bg-gray-100 border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div class="flex justify-between items-baseline mb-2">
                <span class="text-sm font-bold text-black uppercase tracking-wider">Free Space</span>
                <span class="text-xl font-bold text-black">
                  {{ formatBytes(stats.maxSpaceOnDisk - stats.spaceOnDisk) }}
                </span>
              </div>
              <div class="text-xs text-gray-500 font-bold uppercase tracking-wide mt-2">
                Available for new uploads
              </div>
            </div>

            <!-- Total Capacity -->
            <div class="bg-gray-100 border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div class="flex justify-between items-baseline">
                <span class="text-sm font-bold text-black uppercase tracking-wider">Total Capacity</span>
                <span class="text-xl font-bold text-black">
                  {{ formatBytes(stats.maxSpaceOnDisk) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning Alert -->
        <div
          v-if="diskUsagePercentage >= 90"
          class="mt-6 bg-gray-100 border-2 border-red-600 p-4 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
        >
          <div class="flex items-start">
            <svg class="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <h4 class="text-sm font-bold text-red-600 uppercase tracking-wider">Storage Almost Full</h4>
              <p class="text-sm text-black font-semibold mt-1">Your storage is critically low. Please consider upgrading or removing unused files.</p>
            </div>
          </div>
        </div>
        <div
          v-else-if="diskUsagePercentage >= 75"
          class="mt-6 bg-gray-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div class="flex items-start">
            <svg class="w-6 h-6 text-black mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <h4 class="text-sm font-bold text-black uppercase tracking-wider">Storage Running Low</h4>
              <p class="text-sm text-gray-700 font-semibold mt-1">You're using over 75% of your storage. Consider cleaning up old files.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
