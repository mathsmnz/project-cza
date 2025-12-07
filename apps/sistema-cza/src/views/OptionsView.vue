<template>
  <div class="h-full w-full overflow-auto bg-white">
    <div class="grid min-h-screen h-full grid-rows-5 md:grid-rows-none md:grid-cols-5">
      <!-- Left Panel (Image) -->
      <div
        class="border-b-2 border-black h-48 md:w-full md:h-dvh md:border-r-2 md:border-b-0 flex justify-center items-center row-span-1 md:col-span-2 p-2"
      >
        <div class="relative w-full h-full flex items-center justify-center">
          <!-- Hidden image to load and draw -->
          <img
            ref="rawImage"
            alt="casa"
            :src="imagePath"
            @error="handleImageError"
            @load="rotateImage"
            class="hidden"
          />
          <canvas ref="canvas" class="max-w-full max-h-full"></canvas>

          <!-- Overlay message on invalid image -->
          <div
            v-if="isInvalidCombination"
            class="absolute inset-0 bg-black opacity-60 flex items-center justify-center text-white text-center p-4 text-lg font-semibold z-10"
          >
            Nenhuma combinação selecionada ou inválida. Experimente outras opções.
          </div>
        </div>
      </div>

      <!-- Right Panel (Options) -->
      <div class="row-span-4 md:col-span-3">
        <OptionSelector
          :optionsData="option"
          :selectionsData="selections"
          v-model="selectedInfo"
          class="md:h-full md:w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import options from '@/data/options.json'
import OptionSelector from '@/components/OptionSelector.vue'
import { useDataStore } from '@/stores/data'
import type { Group, Selection } from '@/types/types'

const store = useDataStore()

const selectedInfo = ref<string[]>([])
const displayId = ref<string>('')
const rawImage = ref<HTMLImageElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isMdOrLarger = ref<boolean>(window.matchMedia('(min-width: 768px)').matches)
const isInvalidCombination = ref<boolean>(false)

const option = computed<Group[]>(() => options.data)
const selections = computed<Selection[]>(() => options.selections)

const imagePath = computed<string>(() => {
  if (!displayId.value) return ''
  return `/images/${displayId.value}.png`
})

const handleResize = (): void => {
  isMdOrLarger.value = window.matchMedia('(min-width: 768px)').matches
  rotateImage()
}

const handleImageError = (): void => {
  isInvalidCombination.value = true
  console.log('NO VALID COMBINATION FOUND')
}

const rotateImage = (): void => {
  const img = rawImage.value
  const canvasEl = canvas.value

  if (!img || !canvasEl) return

  const ctx = canvasEl.getContext('2d')
  if (!ctx) return

  if (!img.complete || img.naturalWidth === 0) return

  // Clear invalid combination flag for non-fallback images
  if (imagePath.value !== '/images/base.png') {
    isInvalidCombination.value = false
  }

  const shouldRotate = isMdOrLarger.value
  canvasEl.width = shouldRotate ? img.naturalHeight : img.naturalWidth
  canvasEl.height = shouldRotate ? img.naturalWidth : img.naturalHeight

  if (shouldRotate) {
    ctx.save()
    ctx.translate(canvasEl.width / 2, canvasEl.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    ctx.restore()
  } else {
    ctx.drawImage(img, 0, 0)
  }
}

// Watch for selected info changes
watch(selectedInfo, (newVal) => {
  if (newVal.length !== 0) {
    const sortedCombos = [...newVal].sort()
    store.getSelectionId(sortedCombos.join(',')).then((uniqueId) => {
      displayId.value = uniqueId
    })
  }
})

onMounted(() => {
  console.log(options)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
