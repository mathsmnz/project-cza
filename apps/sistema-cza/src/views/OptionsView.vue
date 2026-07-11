<template>
  <!-- On mobile: outer div scrolls. On desktop: overflow is hidden, panels manage their own scroll -->
  <div class="h-full w-full overflow-y-auto md:overflow-hidden bg-white">
    <div class="flex flex-col md:grid md:h-full md:grid-rows-1 md:grid-cols-5">

      <!-- Left Panel (Image): sticky on mobile so it persists while scrolling options -->
      <div
        class="sticky top-0 z-10 md:static aspect-[16/9] md:aspect-auto md:h-full md:min-h-0 border-b-2 border-black md:border-b-0 md:border-r-2 flex justify-center items-center md:col-span-2 p-2 bg-white"
      >
        <div class="relative w-full h-full flex items-center justify-center overflow-hidden">

          <!-- Hidden image used to draw on canvas -->
          <img
            ref="rawImage"
            alt="casa"
            :src="imagePath"
            @error="handleImageError"
            @load="rotateImage"
            class="hidden"
          />

          <!-- Skeleton shimmer shown while image is fetching/loading -->
          <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded"></div>
          </div>

          <!-- Canvas -->
          <canvas
            ref="canvas"
            class="w-full h-full object-contain"
            :class="isLoading ? 'opacity-0' : 'opacity-100'"
          ></canvas>

          <!-- Invalid combination state: icon + two-line message (readable at any size) -->
          <div
            v-if="isInvalidCombination && !isLoading"
            class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center p-4 z-10 gap-2"
          >
            <svg class="w-8 h-8 md:w-12 md:h-12 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p class="text-sm md:text-lg font-semibold leading-snug">Combinação inválida</p>
            <p class="text-xs md:text-sm opacity-70">Experimente outras opções.</p>
          </div>

          <!-- Fullscreen expand button (mobile only) -->
          <button
            v-if="!isLoading && !isInvalidCombination"
            @click="showFullscreen = true"
            class="absolute bottom-3 right-3 z-10 md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium active:bg-black/70 transition-colors"
            aria-label="Ampliar imagem"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
            </svg>
            Ampliar
          </button>
        </div>
      </div>

      <!-- Right Panel (Options): scrollable on desktop, flows naturally on mobile -->
      <div class="md:col-span-3 md:h-full md:overflow-y-auto md:min-h-0">
        <OptionSelector
          :optionsData="option"
          :selectionsData="selections"
          v-model="selectedInfo"
          class="h-full w-full"
        />
      </div>

      <!-- Fullscreen image viewer (mobile) -->
      <ImageFullscreenViewer
        :visible="showFullscreen"
        :src="imagePath"
        @close="showFullscreen = false"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OptionSelector from '@/components/OptionSelector.vue'
import ImageFullscreenViewer from '@/components/ImageFullscreenViewer.vue'
import { useProjectsStore } from '@/stores/projects.ts'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data.ts'
import { fetchProtectedFileUrl } from '@/api/axios.ts'
import { useTelemetryStore } from '@/stores/telemetry.ts'

const selectedInfo = ref<string[]>([])
const displayId = ref<string>('')
const rawImage = ref<HTMLImageElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isMdOrLarger = ref<boolean>(window.matchMedia('(min-width: 768px)').matches)
const isInvalidCombination = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const showFullscreen = ref<boolean>(false)

const projectStore = useProjectsStore()
const { currentProjectCustomization, currentProject } = storeToRefs(projectStore)

const dataStore = useDataStore()
const telemetryStore = useTelemetryStore()

const option = computed(() => currentProjectCustomization.value?.groups ?? [])
const selections = computed(() => currentProjectCustomization.value?.selections ?? [])

const imagePath = ref<string>('')

// ─── Debounce helper ──────────────────────────────────────────────────────────
// Prevents resize events from firing rotateImage dozens of times while the
// mobile browser's address bar animates in/out during scroll.
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

// ─── Image path watcher ───────────────────────────────────────────────────────
// Whenever the project or the selected combo hash changes, fetch a new image
// URL and enter the loading state so the skeleton is shown.
watch([currentProject, displayId], async ([project, displayIdValue]) => {
  if (imagePath.value) {
    URL.revokeObjectURL(imagePath.value)
  }
  if (!project) {
    imagePath.value = ''
    return
  }

  isLoading.value = true
  isInvalidCombination.value = false

  try {
    if (!displayIdValue) {
      imagePath.value = await fetchProtectedFileUrl(project.id, `base.png`)
    } else {
      imagePath.value = await fetchProtectedFileUrl(project.id, `${displayIdValue}.png`)
    }
  } catch (error) {
    console.error('Failed to load image for OptionsView:', error)
    isLoading.value = false
    isInvalidCombination.value = true
  }
}, { immediate: true })

// ─── Canvas draw ─────────────────────────────────────────────────────────────
const rotateImage = (): void => {
  const img = rawImage.value
  const canvasEl = canvas.value
  if (!img || !canvasEl) return
  if (!img.complete || img.naturalWidth === 0) return

  isInvalidCombination.value = false

  const ctx = canvasEl.getContext('2d')
  if (!ctx) return

  const shouldRotate = isMdOrLarger.value
  canvasEl.width  = shouldRotate ? img.naturalHeight : img.naturalWidth
  canvasEl.height = shouldRotate ? img.naturalWidth  : img.naturalHeight

  // High-quality downscaling on small screens
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (shouldRotate) {
    ctx.save()
    ctx.translate(canvasEl.width / 2, canvasEl.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    ctx.restore()
  } else {
    ctx.drawImage(img, 0, 0)
  }

  isLoading.value = false
}

const handleImageError = (): void => {
  isInvalidCombination.value = true
  isLoading.value = false
  console.log('NO VALID COMBINATION FOUND')
}

// Debounced so mobile browser viewport jitter during scroll doesn't flood redraws
const handleResize = debounce((): void => {
  isMdOrLarger.value = window.matchMedia('(min-width: 768px)').matches
  rotateImage()
}, 150)

// ─── Selection watcher ───────────────────────────────────────────────────────
watch(selectedInfo, (newVal: string[]) => {
  if (newVal.length !== 0) {
    const sortedCombos = [...newVal].sort()
    dataStore.computeSelectionId(sortedCombos.join(',')).then((uniqueId: string) => {
      displayId.value = uniqueId
    })
  } else {
    displayId.value = ''
  }
})

onMounted(() => {
  telemetryStore.initSession()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  telemetryStore.submitSession()
  window.removeEventListener('resize', handleResize)
  if (imagePath.value) {
    URL.revokeObjectURL(imagePath.value)
  }
})
</script>

<style scoped>
/* Shimmer animation for the skeleton loader */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.animate-shimmer {
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
</style>
