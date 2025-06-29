<template>
  <div class="flex flex-col gap-2 p-6 bg-gray-100 outline-black outline-2">
    <!-- Section Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-800">Escolha o Tipo de Mudança</h1>
      <p class="text-lg text-gray-600">
        Será possível alterar sua escolha mais tarde na opção
        <strong class="font-semibold text-gray-800">"Redefinir o tipo de mudança"</strong>.
      </p>
    </div>

    <!-- Options Section -->
    <div class="flex flex-col gap-2">
      <div v-for="(option, index) in options" :key="index"
        class="bg-white p-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
        :class="{ 'opacity-50': selectedGroups.length > 0 && !activeGroups.includes(option.id) }">

        <!-- Main Option -->
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" :name="option.id" :value="option.id" v-model="selectedGroups"
            class="h-5 w-5 text-blue-600 focus:ring focus:ring-blue-300 rounded disabled:cursor-not-allowed"
            :disabled="selectedGroups.length > 0 && !activeGroups.includes(option.id)" />
          <span class="text-xl font-semibold text-gray-800">{{ option.label }}</span>
        </label>

        <!-- Nested Combos -->
        <div v-for="(combo, comboIndex) in option.combos" :key="comboIndex" class="ml-6 mt-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :name="combo.id" :value="combo.associated" v-model="selectedCombos"
              :disabled="!selectedGroups.includes(option.id)"
              class="h-4 w-4 text-blue-500 focus:ring focus:ring-blue-200 rounded disabled:cursor-not-allowed" />
            <span :class="{
              'text-gray-700': selectedGroups.includes(option.id),
              'text-gray-400': !selectedGroups.includes(option.id),
            }">
              {{ combo.label }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-row w-full gap-2 mt-4">
      <button @click="submitForm" :disabled="selectedCombos.length === 0"
        class="w-5/6 p-4 bg-black text-white rounded-xl disabled:text-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400">
        Prosseguir
      </button>
      <button @click="resetForm" class="p-4 bg-black text-white rounded-xl">
        Redefinir
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useDataStore } from '@/stores/data';
import { useTelemetryStore } from "@/stores/telemetryStore";

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
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const router = useRouter();
    const store = useDataStore();
    const telemetryStore = useTelemetryStore();

    const options = ref(props.optionsData);
    const selections = ref(props.selectionsData);
    const selectedGroups = ref([]);
    const selectedCombos = ref([...props.modelValue]);

    const activeGroups = ref([...props.optionsData.map(option => option.id)]);
    const activeCombos = ref([...props.optionsData.flatMap(option => option.combos.map(combo => combo.id))]);

    const updateActiveGroups = () => {
      if (selectedGroups.value.length === 0) {
        activeGroups.value = [...props.optionsData.map(option => option.id)];
        return;
      }

      const newActiveGroups = new Set(selectedGroups.value);

      selections.value.forEach(selection => {
        selection.relatedGroups.forEach(group => {
          if (selectedGroups.value.includes(group)) {
            selection.relatedGroups.forEach(g => newActiveGroups.add(g));
          }
        });
      });

      activeGroups.value = [...newActiveGroups];
    };

    const updateActiveCombos = () => {
      if (selectedCombos.value.length === 0) {
        activeCombos.value = [...props.optionsData.flatMap(option => option.combos.map(combo => combo.id))];
        return;
      }

      const newActiveCombos = new Set(selectedCombos.value);

      selections.value.forEach(selection => {
        selection.relatedCombos.forEach(combo => {
          if (selectedCombos.value.includes(combo)) {
            selection.relatedCombos.forEach(c => newActiveCombos.add(c));
          }
        });
      });

      activeCombos.value = [...newActiveCombos];
    };

    // Track group selections
    watch(selectedGroups, (newGroups) => {
      newGroups.forEach(groupId => {
        telemetryStore.trackGroupSelection(groupId);
      });
      updateActiveGroups();
    });

    // Track combo selections
    watch(selectedCombos, (newCombos) => {
      newCombos.forEach(comboId => {
        telemetryStore.trackComboSelection(comboId);
      });

      emit("update:modelValue", newCombos);
      updateActiveCombos();
    });

    const resetForm = () => {
      selectedGroups.value = [];
      selectedCombos.value = [];
      activeGroups.value = [...props.optionsData.map(option => option.id)];
      activeCombos.value = [...props.optionsData.flatMap(option => option.combos.map(combo => combo.id))];

      store.trackFormReset();
      console.log("Telemetry (reset):", store.telemetry);
    };

    const submitForm = () => {
      telemetryStore.trackFormSubmission();
      telemetryStore.setFinalSelection(selectedCombos.value)
      console.log("Formulário enviado!", selectedCombos.value);
      console.log("Telemetry (submit):", store.telemetry);
      console.log("Store selectionID:", store.selectionID);
      router.push("/editor");
    };

    return {
      options,
      selections,
      selectedGroups,
      selectedCombos,
      activeGroups,
      activeCombos,
      resetForm,
      submitForm,
    };
  },
};
</script>
