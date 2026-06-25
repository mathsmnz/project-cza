<template>
  <div class="flex flex-col gap-2 outline-black outline-2">
    <div class="p-6 border-b border-b-black text-center">
      <h1 class="text-2xl font-bold text-gray-800">Escolha o Tipo de Mudança</h1>
      <p class="mt-1 text-sm text-gray-600">
        Será possível alterar sua escolha mais tarde na opção
        <strong class="font-semibold text-gray-800">"Redefinir o tipo de mudança"</strong>.
      </p>
    </div>


    <!-- Options Section -->
    <div class="p-6 space-y-4 bg-white">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="p-4 border transition-all duration-200 ease-in-out"
        :class="{
          'bg-indigo-50 border-indigo-300': selectedGroups.includes(option.id),
          'bg-white border-black hover:shadow-sm':
            !selectedGroups.includes(option.id) && activeGroups.includes(option.id),
          'opacity-75 cursor-not-allowed bg-gray-50 border-gray-200':
            !activeGroups.includes(option.id),
        }"
      >
        <!-- Main Option -->
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :name="option.id"
            :value="option.id"
            v-model="selectedGroups"
            class="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:cursor-not-allowed disabled:text-gray-400"
            :disabled="!activeGroups.includes(option.id)"
          />
          <span class="text-lg font-semibold text-gray-800">{{ option.label }}</span>
        </label>

        <!-- Nested Combos -->
        <div
          v-for="(combo, comboIndex) in option.combos"
          :key="comboIndex"
          class="pl-8 pt-3 space-y-2"
        >
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :name="combo.id"
              :value="combo.associated"
              v-model="selectedCombos"
              :disabled="!selectedGroups.includes(option.id) || !activeCombos.includes(combo.associated)"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:cursor-not-allowed disabled:bg-gray-300"
            />
            <span
              :class="{
                'text-gray-700': selectedGroups.includes(option.id) && activeCombos.includes(combo.associated),
                'text-gray-400': !selectedGroups.includes(option.id) || !activeCombos.includes(combo.associated)
              }"
            >
              {{ combo.label }} 
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div
      class="flex items-center justify-end space-x-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg"
    >
      <button
        @click="submitForm"
        :disabled="selectedCombos.length === 0"
        class="w-5/6 p-4 bg-black text-white rounded-xl disabled:text-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Prosseguir
      </button>
      <button @click="resetForm" class="p-4 bg-black text-white rounded-xl">Redefinir</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from 'vue-router'
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Group, Selection } from '@/types/types'
import { useTelemetryStore } from '@/stores/telemetry.ts'
import { useProjectsStore } from '@/stores/projects.ts'
import { useRecommendationStore } from '@/stores/recommendation.ts'

interface Props {
  optionsData: Group[]
  selectionsData: Selection[]
  modelValue?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const router = useRouter()

const options = ref(props.optionsData)
const selections = ref(props.selectionsData)
const selectedGroups = ref<string[]>([])
const selectedCombos = ref<string[]>([...props.modelValue])

const telemetryStore = useTelemetryStore()
const projectStore = useProjectsStore()

const activeGroups = ref<string[]>([])
const activeCombos = ref<string[]>([])

const recommendationStore = useRecommendationStore()
const { activeSelectionIds } = storeToRefs(recommendationStore)
// Watch for props updates (e.g. project change or initial load after API responds)
watch(
  () => props.optionsData,
  (newOptions) => {
    options.value = newOptions
    activeGroups.value = [...newOptions.map((option) => option.id)]
    activeCombos.value = [...newOptions.flatMap((option) => option.combos.map((combo) => combo.id))]
    // Reset selected state when project configuration changes
    selectedGroups.value = []
    selectedCombos.value = []
  },
  { immediate: true }
)

watch(
  () => props.selectionsData,
  (newSelections) => {
    selections.value = newSelections
  },
  { immediate: true }
)

const updateActiveState = () => {
  const newActiveGroups = new Set<string>()
  const newActiveCombos = new Set<string>()

  if (selectedGroups.value.length === 0 && selectedCombos.value.length === 0) {
    selections.value.forEach(s => {
      s.relatedGroups.forEach(g => newActiveGroups.add(g))
      s.relatedCombos.forEach(c => newActiveCombos.add(c))
    })
    activeGroups.value = [...newActiveGroups]
    activeCombos.value = [...newActiveCombos]
    return
  }

  selections.value.forEach((selection) => {
    const hasAllGroups = selectedGroups.value.every(sg => selection.relatedGroups.includes(sg))
    const hasAllCombos = selectedCombos.value.every(sc => selection.relatedCombos.includes(sc))
    
    if (hasAllGroups && hasAllCombos) {
      selection.relatedGroups.forEach(g => newActiveGroups.add(g))
      selection.relatedCombos.forEach(c => newActiveCombos.add(c))
    }
  })

  activeGroups.value = [...newActiveGroups]
  activeCombos.value = [...newActiveCombos]
}

// Track group selections
watch(selectedGroups, (newGroups, oldGroups) => {
  // If a group was deselected, deselect all its combos
  const removedGroups = oldGroups?.filter(g => !newGroups.includes(g)) || []
  if (removedGroups.length > 0) {
    const combosToRemove = props.optionsData
      .filter(opt => removedGroups.includes(opt.id))
      .flatMap(opt => opt.combos.map(c => c.associated))
    
    if (combosToRemove.length > 0) {
      selectedCombos.value = selectedCombos.value.filter(c => !combosToRemove.includes(c))
    }
  }

  newGroups.forEach((groupId) => {
    telemetryStore.trackGroupSelection(groupId)
  })
  updateActiveState()
})

// Track combo selections
watch(selectedCombos, (newCombos, oldCombos) => {
  // Track new additions
  newCombos.forEach((comboId) => {
    if (!oldCombos?.includes(comboId)) {
      telemetryStore.trackComboSelection(comboId)
    }
  })

  // Track removed (abandoned) selections
  oldCombos?.forEach((comboId) => {
    if (!newCombos.includes(comboId)) {
      telemetryStore.trackAbandonedSelection(comboId)
    }
  })

  activeSelectionIds.value = newCombos
  emit('update:modelValue', newCombos)
  updateActiveState()
})

const resetForm = () => {
  selectedGroups.value = []
  selectedCombos.value = []
  activeGroups.value = [...props.optionsData.map((option) => option.id)]
  activeCombos.value = [
    ...props.optionsData.flatMap((option) => option.combos.map((combo) => combo.id)),
  ]

  telemetryStore.resetStore()
}

const submitForm = () => {
  telemetryStore.setFinalSelection(selectedCombos.value)
  console.log('Formulário enviado!', selectedCombos.value)
  router.push('/validation')
}
</script>
