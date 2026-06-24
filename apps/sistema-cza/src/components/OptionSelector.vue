<template>
  <div class="flex flex-col gap-2 outline-black outline-2">
    <div class="p-6 border-b border-b-black text-center">
      <h1 class="text-2xl font-bold text-gray-800">Escolha o Tipo de Mudança</h1>
      <p class="mt-1 text-sm text-gray-600">
        Será possível alterar sua escolha mais tarde na opção
        <strong class="font-semibold text-gray-800">"Redefinir o tipo de mudança"</strong>.
      </p>
    </div>

    <!-- Seed Profile Constraints -->
    <div class="p-6 border-b border-b-gray-200 bg-gray-50">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Restrições do Projeto</h2>
      
        <!-- Orçamento -->
        <label for="budgetSlider" class="text-sm font-semibold text-gray-700 flex justify-between mt-2">
          <span>Orçamento Máximo</span>
          <span>R$ {{ budgetLimit.toLocaleString('pt-BR') }}</span>
        </label>
        <input 
          id="budgetSlider" 
          type="range" 
          :min="minBudget" 
          :max="maxBudget" 
          step="1000" 
          v-model.number="budgetLimit"
          class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer mb-4"
        />

        <!-- Área -->
        <label for="areaSlider" class="text-sm font-semibold text-gray-700 flex justify-between mt-2">
          <span>Área Máxima</span>
          <span>{{ areaLimit.toFixed(2) }} m²</span>
        </label>
        <input 
          id="areaSlider" 
          type="range" 
          :min="minArea" 
          :max="maxArea" 
          step="1" 
          v-model.number="areaLimit"
          class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer mb-4"
        />

        <!-- Perfil da Família -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-sm font-bold text-gray-800 mb-3">Perfil da Família</h3>
          
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700">Número de Moradores</span>
            <div class="flex items-center space-x-3">
              <button @click="residentsCount > 1 ? residentsCount-- : null" class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold hover:bg-gray-300 text-gray-700">-</button>
              <span class="text-sm font-bold w-4 text-center">{{ residentsCount }}</span>
              <button @click="residentsCount++" class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold hover:bg-gray-300 text-gray-700">+</button>
            </div>
          </div>

          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm font-medium text-gray-700">Possui Veículo (Carro/Moto)</span>
            <input type="checkbox" v-model="hasVehicle" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
          </label>
        </div>

        <!-- Espaço Físico -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <h3 class="text-sm font-bold text-gray-800 mb-3">Espaço no Terreno</h3>
          <p class="text-xs text-gray-500 mb-3">Onde você tem espaço livre para construir?</p>
          
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="spaceFront" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <span class="text-sm text-gray-700">Na frente da casa</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="spaceSide" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <span class="text-sm text-gray-700">Na lateral (corredor)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="spaceBack" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <span class="text-sm text-gray-700">Nos fundos do quintal</span>
            </label>
          </div>
        </div>

        <p class="text-xs text-gray-400 mt-4 text-center">Isso será usado para recomendações inteligentes (KBRS).</p>
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
            selectedGroups.length > 0 && !activeGroups.includes(option.id),
          'opacity-75 cursor-not-allowed bg-gray-50 border-gray-200':
            selectedGroups.length > 0 && !activeGroups.includes(option.id),
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
            :disabled="selectedGroups.length > 0 && !activeGroups.includes(option.id)"
          />
          <span class="text-lg font-semibold text-gray-800">{{ option.label }}</span>
        </label>

        <!-- Nested Combos -->
        <div
          v-for="(combo, comboIndex) in option.combos"
          :key="comboIndex"
          class="pl-8 pt-3 space-y-2"
        >
          <label class="flex items-center gap-2 cursor-pointer" :title="!recommendationStore.isSelectionValid(combo.associated).valid ? recommendationStore.isSelectionValid(combo.associated).reason : ''">
            <input
              type="checkbox"
              :name="combo.id"
              :value="combo.associated"
              v-model="selectedCombos"
              :disabled="!selectedGroups.includes(option.id) || !recommendationStore.isSelectionValid(combo.associated).valid"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:cursor-not-allowed disabled:bg-gray-300"
            />
            <span
              :class="{
                'text-gray-700': selectedGroups.includes(option.id) && recommendationStore.isSelectionValid(combo.associated).valid,
                'text-gray-400 line-through': !recommendationStore.isSelectionValid(combo.associated).valid,
                'text-gray-400': !selectedGroups.includes(option.id) && recommendationStore.isSelectionValid(combo.associated).valid,
              }"
            >
              {{ combo.label }} 
              <span v-if="!recommendationStore.isSelectionValid(combo.associated).valid" class="text-xs text-red-500 ml-2 font-normal no-underline">
                (Bloqueado: {{ recommendationStore.isSelectionValid(combo.associated).reason }})
              </span>
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

const minBudget = computed(() => projectStore.currentProject?.baseCost ?? 50000)
const maxBudget = computed(() => {
  const base = projectStore.currentProject?.baseCost ?? 50000
  const sumOptions = selections.value.reduce((acc, sel) => acc + (sel.cost ?? 0), 0)
  // Ensure max is strictly greater than min
  return sumOptions > 0 ? base + sumOptions : base + 100000
})

const minArea = computed(() => projectStore.currentProject?.baseArea ?? 40)
const maxArea = computed(() => {
  const base = projectStore.currentProject?.baseArea ?? 40
  const sumOptions = selections.value.reduce((acc, sel) => acc + (sel.area ?? 0), 0)
  return sumOptions > 0 ? base + sumOptions : base + 50
})

const recommendationStore = useRecommendationStore()
const { budgetLimit, areaLimit, residentsCount, hasVehicle, spaceFront, spaceSide, spaceBack, activeSelectionIds } = storeToRefs(recommendationStore)

// Initialize local refs with base properties where missing
if (projectStore.currentProject?.baseResidents) {
  residentsCount.value = projectStore.currentProject.baseResidents
}

watch(budgetLimit, (newVal) => {
  telemetryStore.setProblemSpace('maxBudget', newVal.toString())
})

watch(areaLimit, (newVal) => {
  telemetryStore.setProblemSpace('maxArea', newVal.toString())
})

// Update limits when project/selections load
watch([maxBudget, maxArea], ([newMaxBudget, newMaxArea]) => {
  budgetLimit.value = newMaxBudget
  areaLimit.value = newMaxArea
}, { immediate: true })

watch([residentsCount, hasVehicle, spaceFront, spaceSide, spaceBack], () => {
  telemetryStore.setProblemSpace('residentsCount', residentsCount.value.toString())
  telemetryStore.setProblemSpace('hasVehicle', hasVehicle.value.toString())
  telemetryStore.setProblemSpace('spaceFront', spaceFront.value.toString())
  telemetryStore.setProblemSpace('spaceSide', spaceSide.value.toString())
  telemetryStore.setProblemSpace('spaceBack', spaceBack.value.toString())
}, { deep: true, immediate: true })

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

const updateActiveGroups = () => {
  if (selectedGroups.value.length === 0) {
    activeGroups.value = [...props.optionsData.map((option) => option.id)]
    return
  }

  const newActiveGroups = new Set(selectedGroups.value)

  selections.value.forEach((selection) => {
    selection.relatedGroups.forEach((group) => {
      if (selectedGroups.value.includes(group)) {
        selection.relatedGroups.forEach((g) => newActiveGroups.add(g))
      }
    })
  })

  activeGroups.value = [...newActiveGroups]
}

const updateActiveCombos = () => {
  if (selectedCombos.value.length === 0) {
    activeCombos.value = [
      ...props.optionsData.flatMap((option) => option.combos.map((combo) => combo.id)),
    ]
    return
  }

  const newActiveCombos = new Set(selectedCombos.value)

  selections.value.forEach((selection) => {
    selection.relatedCombos.forEach((combo) => {
      if (selectedCombos.value.includes(combo)) {
        selection.relatedCombos.forEach((c) => newActiveCombos.add(c))
      }
    })
  })

  activeCombos.value = [...newActiveCombos]
}

// Track group selections
watch(selectedGroups, (newGroups) => {
  newGroups.forEach((groupId) => {
    //Track group selections
    telemetryStore.trackGroupSelection(groupId)
  })
  updateActiveGroups()
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

  // Sync to RecommendationStore
  activeSelectionIds.value = newCombos

  emit('update:modelValue', newCombos)
  updateActiveCombos()
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
