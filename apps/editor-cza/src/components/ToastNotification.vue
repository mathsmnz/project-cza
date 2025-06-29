<template>
  <div class="fixed top-5 right-5 z-50 transform transition-all duration-300 ease-out"
       :class="showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'">
    <div :class="toastClasses" class="min-w-[280px] max-w-md rounded-lg shadow-xl">
      <div class="flex items-center p-4">
        <div class="flex-shrink-0 mr-3">
          <svg v-if="props.mode === 'success'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <svg v-if="props.mode === 'error'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <svg v-if="props.mode === 'alert'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div class="text-white text-sm font-medium flex-grow">
          {{ props.message }}
        </div>
        <button
          @click="dismiss"
          type="button"
          class="ml-3 -mr-1 -my-1 flex-shrink-0 p-1.5 text-white rounded-lg hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors"
          aria-label="Fechar"
        >
          <span class="sr-only">Fechar</span>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted, computed, ref, watch } from 'vue';

const props = defineProps({
  show: { // Controlled by parent to trigger the toast
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: 'success', // 'success', 'error', 'alert'
    validator: (value) => ['success', 'error', 'alert'].includes(value),
  },
  duration: { // Timer in milliseconds
    type: Number,
    default: 3000,
  },
});

const emit = defineEmits(['close']);

const showToast = ref(false); // Internal visibility for transition
let timeoutId = null;

// Dynamically compute toast classes based on mode
const toastClasses = computed(() => {
  let modeBgClass = '';
  switch (props.mode) {
    case 'success':
      modeBgClass = 'bg-green-500'; // Green for success
      break;
    case 'error':
      modeBgClass = 'bg-red-600'; // Red for error
      break;
    case 'alert':
      modeBgClass = 'bg-blue-500'; // Blue for alert/info (yellow-500 could also be used for warning)
      break;
    default:
      modeBgClass = 'bg-gray-700';
  }
  return `${modeBgClass}`;
});

// Function to dismiss the toast
const dismiss = () => {
  clearTimeout(timeoutId);
  showToast.value = false; // Trigger fade-out animation
  // Wait for animation to complete before emitting close
  setTimeout(() => {
    emit('close');
  }, 300); // Match transition duration
};

// Watch the `show` prop from parent
watch(() => props.show, (newValue) => {
  if (newValue) {
    showToast.value = true; // Trigger fade-in animation
    clearTimeout(timeoutId); // Clear any existing timer
    if (props.duration > 0) { // Only set timer if duration is positive
      timeoutId = setTimeout(() => {
        dismiss();
      }, props.duration);
    }
  } else {
    showToast.value = false;
  }
});

// Clean up timer when component is unmounted
onUnmounted(() => {
  clearTimeout(timeoutId);
});
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
