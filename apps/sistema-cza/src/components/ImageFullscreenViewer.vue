<template>
  <Teleport to="body">
    <Transition name="viewer">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] bg-black flex flex-col select-none"
      >
        <!-- Top bar -->
        <div class="flex items-center justify-between px-4 py-3 shrink-0 z-10">
          <span class="text-white/50 text-sm font-medium tabular-nums">{{ zoomLabel }}</span>
          <button
            @click="$emit('close')"
            class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/25 transition-colors"
            aria-label="Fechar visualização"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Image area -->
        <div
          ref="containerRef"
          class="flex-1 min-h-0 overflow-hidden relative"
          style="touch-action: none;"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @wheel.prevent="onWheel"
        >
          <img
            v-if="src"
            :src="src"
            alt="Visualização ampliada do projeto"
            draggable="false"
            class="absolute top-1/2 left-1/2 max-w-full max-h-full object-contain pointer-events-none"
            :class="isGesturing ? '' : 'transition-transform duration-200 ease-out'"
            :style="transformStyle"
          />

          <!-- Hint overlay (auto-hides after 3s) -->
          <Transition name="hint">
            <div
              v-if="showHint"
              class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white/70 text-xs whitespace-nowrap"
            >
              Dois dedos para zoom · Toque duplo para ampliar
            </div>
          </Transition>
        </div>

        <!-- Bottom controls -->
        <div class="flex items-center justify-center gap-3 px-4 py-4 shrink-0">
          <button
            @click="zoomOut"
            :disabled="scale <= MIN_SCALE"
            class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/25 disabled:opacity-30 transition-colors"
            aria-label="Diminuir zoom"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <button
            @click="resetZoom"
            class="px-5 py-2.5 rounded-full bg-white/10 text-white/80 text-sm font-medium active:bg-white/25 transition-colors"
          >
            Resetar
          </button>
          <button
            @click="zoomIn"
            :disabled="scale >= MAX_SCALE"
            class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/25 disabled:opacity-30 transition-colors"
            aria-label="Aumentar zoom"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  visible: boolean
  src: string
}>()

defineEmits<{ close: [] }>()

const containerRef = ref<HTMLElement | null>(null)

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isGesturing = ref(false)
const showHint = ref(false)

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const ZOOM_STEP = 0.5

const zoomLabel = computed(() => `${Math.round(scale.value * 100)}%`)

const transformStyle = computed(() => ({
  transform: `translate(-50%, -50%) translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
}))

// ─── Touch state ─────────────────────────────────────────────────────────────
let lastTapTime = 0
let lastTapX = 0
let lastTapY = 0
let pinchStartDist = 0
let pinchStartScale = 1
let panStartX = 0
let panStartY = 0
let startTX = 0
let startTY = 0

function touchDist(t1: Touch, t2: Touch): number {
  return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    e.preventDefault()
    isGesturing.value = true
    pinchStartDist = touchDist(e.touches[0]!, e.touches[1]!)
    pinchStartScale = scale.value
  } else if (e.touches.length === 1) {
    isGesturing.value = true
    panStartX = e.touches[0]!.clientX
    panStartY = e.touches[0]!.clientY
    startTX = translateX.value
    startTY = translateY.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const d = touchDist(e.touches[0]!, e.touches[1]!)
    scale.value = clamp(pinchStartScale * (d / pinchStartDist))
  } else if (e.touches.length === 1 && scale.value > 1) {
    e.preventDefault()
    translateX.value = startTX + (e.touches[0]!.clientX - panStartX)
    translateY.value = startTY + (e.touches[0]!.clientY - panStartY)
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length === 0) {
    isGesturing.value = false

    // Double-tap detection
    const now = Date.now()
    const touch = e.changedTouches[0]!
    const tapX = touch.clientX
    const tapY = touch.clientY

    if (now - lastTapTime < 300 && Math.hypot(tapX - lastTapX, tapY - lastTapY) < 30) {
      onDoubleTap(tapX, tapY)
    }
    lastTapTime = now
    lastTapX = tapX
    lastTapY = tapY

    // Snap back when zoomed out
    if (scale.value < 1) {
      scale.value = 1
      translateX.value = 0
      translateY.value = 0
    }
    if (scale.value <= 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }
}

function onDoubleTap(x: number, y: number) {
  if (scale.value > 1.1) {
    resetZoom()
  } else {
    const container = containerRef.value
    if (!container) return
    const rect = container.getBoundingClientRect()
    scale.value = 2.5
    translateX.value = (rect.width / 2 - x) * 1.5
    translateY.value = (rect.height / 2 - y) * 1.5
  }
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  scale.value = clamp(scale.value + delta)
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

function clamp(v: number): number {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, v))
}

function zoomIn() {
  isGesturing.value = false
  scale.value = clamp(scale.value + ZOOM_STEP)
}

function zoomOut() {
  isGesturing.value = false
  scale.value = clamp(scale.value - ZOOM_STEP)
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

function resetZoom() {
  isGesturing.value = false
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
let hintTimer: ReturnType<typeof setTimeout>

watch(() => props.visible, (v) => {
  if (v) {
    resetZoom()
    document.body.style.overflow = 'hidden'
    showHint.value = true
    hintTimer = setTimeout(() => { showHint.value = false }, 3000)
  } else {
    document.body.style.overflow = ''
    showHint.value = false
    clearTimeout(hintTimer)
  }
})

// Reset zoom when the image source changes
watch(() => props.src, () => {
  resetZoom()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  clearTimeout(hintTimer)
})
</script>

<style scoped>
.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.2s ease;
}
.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.4s ease;
}
.hint-enter-from,
.hint-leave-to {
  opacity: 0;
}
</style>
