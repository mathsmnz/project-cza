<template>
  <div class="flex flex-col gap-2 outline-black outline-2">
    <!-- Section Header -->
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
          'bg-indigo-50 border-indigo-300': selectedGroups === option,
          'bg-white border-black hover:shadow-sm':  selectedGroups.length > 0 && !activeGroups.includes(option.id),
          'opacity-75 cursor-not-allowed bg-gray-50 border-gray-200':  selectedGroups.length > 0 && !activeGroups.includes(option.id),
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
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :name="combo.id"
              :value="combo.associated"
              v-model="selectedCombos"
              :disabled="!selectedGroups.includes(option.id)"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:cursor-not-allowed disabled:bg-gray-300"
            />
            <span
              :class="{
                'text-gray-700': selectedGroups.includes(option.id),
                'text-gray-400': !selectedGroups.includes(option.id),
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
      <button @click="resetForm" class="p-4 bg-black text-white rounded-xl">

        Redefinir

      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useTelemetryStore } from '@/stores/telemetryStore'

export default {
  props: {
    optionsData: {
      type: Array,
      required: true,
    },
    selectionsData: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const router = useRouter()
    const store = useDataStore()
    const telemetryStore = useTelemetryStore()

    const options = ref(props.optionsData)
    const selections = ref(props.selectionsData)
    const selectedGroups = ref([])
    const selectedCombos = ref([...props.modelValue])

    const activeGroups = ref([...props.optionsData.map((option) => option.id)])
    const activeCombos = ref([
      ...props.optionsData.flatMap((option) => option.combos.map((combo) => combo.id)),
    ])

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
        telemetryStore.trackGroupSelection(groupId)
      })
      updateActiveGroups()
    })

    // Track combo selections
    watch(selectedCombos, (newCombos) => {
      newCombos.forEach((comboId) => {
        telemetryStore.trackComboSelection(comboId)
      })

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

      store.trackFormReset()
      console.log('Telemetry (reset):', store.telemetry)
    }

    const submitForm = () => {
      telemetryStore.trackFormSubmission()
      telemetryStore.setFinalSelection(selectedCombos.value)
      console.log('Formulário enviado!', selectedCombos.value)
      console.log('Telemetry (submit):', store.telemetry)
      console.log('Store selectionID:', store.selectionID)
      router.push('/editor')
    }

    return {
      options,
      selections,
      selectedGroups,
      selectedCombos,
      activeGroups,
      activeCombos,
      resetForm,
      submitForm,
    }
  },
}
</script>
