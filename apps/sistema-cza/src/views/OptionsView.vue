<template>
  <div class="h-full w-full overflow-auto bg-white">
    <div class="grid min-h-screen h-full grid-rows-5 md:grid-rows-none md:grid-cols-5">

      <!-- Left Panel (Image) -->
      <div
        class="border-b-2 border-black h-48 md:w-full md:h-dvh md:border-r-2 md:border-b-0 flex justify-center items-center row-span-1 md:col-span-2 p-2">
        <div class="relative w-full h-full flex items-center justify-center">
          <!-- Hidden image to load and draw -->
          <img ref="rawImage" alt="casa" :src="imagePath" @error="handleImageError" @load="rotateImage"
            class="hidden" />
          <canvas ref="canvas" class="max-w-full max-h-full"></canvas>

          <!-- Overlay message on invalid image -->
          <div v-if="isInvalidCombination"
            class="absolute inset-0 bg-black opacity-60 flex items-center justify-center text-white text-center p-4 text-lg font-semibold z-10">
            Nenhuma combinação selecionada ou inválida. Experimente outras opções.
          </div>
        </div>
      </div>

      <!-- Right Panel (Options) -->
      <div class="row-span-4 md:col-span-3">
        <OptionSelector :optionsData="option" :selectionsData="selections" v-model="selectedInfo"
          class="md:h-full md:w-full" />
      </div>

    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import options from '@/data/options.json'
import OptionSelector from '@/components/OptionSelector.vue'
import { useDataStore } from '@/stores/data'

export default {
  components: {
    OptionSelector,
  },
  setup() {
    const store = useDataStore()
    const selectedInfo = ref([])
    const option = ref(options.data)
    const selections = ref(options.selections)
    const displayId = ref('')
    const imagePath = ref('')
    const rawImage = ref(null)
    const canvas = ref(null)
    const isMdOrLarger = ref(window.matchMedia('(min-width: 768px)').matches)
    const isInvalidCombination = ref(false)

    const handleResize = () => {
      isMdOrLarger.value = window.matchMedia('(min-width: 768px)').matches
      rotateImage()
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    watch(selectedInfo, (newVal) => {
      if (newVal.length !== 0) {
        const sortedCombos = [newVal].sort()
        store.getSelectionId(sortedCombos.join(',')).then((uniqueId) => {
          displayId.value = uniqueId
        })
      }
    })

    watch(displayId, (newVal) => {
      const basePath = '/images/'
      imagePath.value = basePath + newVal + '.png'
    })

    const handleImageError = () => {
      imagePath.value = '/images/base.png'
      isInvalidCombination.value = true
      console.log('NO VALID COMBINATION FOUND')
    }

    const rotateImage = () => {
      const img = rawImage.value
      const canvasEl = canvas.value
      if (!img || !canvasEl) return
      const ctx = canvasEl.getContext('2d')

      if (!img.complete || img.naturalWidth === 0) return

      // If it's not the fallback image, remove the overlay
      if (imagePath.value !== '/images/base.png') {
        isInvalidCombination.value = false
      }

      if (isMdOrLarger.value) {
        canvasEl.width = img.naturalHeight
        canvasEl.height = img.naturalWidth

        ctx.save()
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        ctx.translate(canvasEl.width / 2, canvasEl.height / 2)
        ctx.rotate(90 * Math.PI / 180)
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
        ctx.restore()
      } else {
        canvasEl.width = img.naturalWidth
        canvasEl.height = img.naturalHeight

        ctx.save()
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        ctx.drawImage(img, 0, 0)
        ctx.restore()
      }
    }

    return {
      selectedInfo,
      displayId,
      option,
      selections,
      imagePath,
      handleImageError,
      rawImage,
      canvas,
      rotateImage,
      isMdOrLarger,
      isInvalidCombination,
    }
  },
}
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
