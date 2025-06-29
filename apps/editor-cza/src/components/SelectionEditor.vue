<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg h-2/3 p-6 relative overflow-auto"
            @keydown.enter.stop.prevent="saveChanges">
            <!-- Close Button -->
            <button @click="$emit('cancel')"
                class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                aria-label="Close modal">
            </button>

            <!-- Modal Header -->
            <h2 id="modal-title" class="text-2xl font-bold mb-6 text-center">
                Editar Planta
            </h2>

            <!-- Modal Body -->
            <form @submit.prevent="saveChanges" class="space-y-6">
                <!-- Label Input -->
                <div>
                    <label for="label" class="block text-sm font-medium text-gray-700 mb-1">
                        Nome da planta
                    </label>
                    <input id="label" type="text" v-model="plantData.label"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Digite o nome da planta" />
                </div>

                <!-- Description Input -->
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                    </label>
                    <textarea id="description" v-model="plantData.description" rows="4"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Adicione uma descrição da planta"></textarea>
                </div>

                <!-- ID Field (Clipboardable) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        ID da Planta
                    </label>
                    <div class="flex items-center">
                        <input id="plantId" type="text" :value="plantData.id" readonly
                            class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm" />
                        <button type="button" @click="copyToClipboard"
                            class="ml-2 bg-blue-500 text-white rounded-md py-1 px-3 hover:bg-blue-600 focus:outline-none">
                            Copiar
                        </button>
                    </div>
                </div>

                <!-- Combos Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Combinações
                    </label>
                    <div v-for="group in availableCombos" :key="group.id" class="mb-4">
                        <!-- Group Selection -->
                        <div class="flex items-center">
                            <input type="checkbox" :value="group.id" v-model="selectedGroups" class="mr-2" />
                            <span class="font-medium">{{ group.label }}</span>
                        </div>

                        <!-- Combos for Selected Group -->
                        <div class="pl-6 mt-2">
                            <div v-for="combo in group.combos" :key="combo.associated" class="flex items-center">
                                <input type="checkbox" :value="combo.associated" v-model="selectedCombos"
                                    :disabled="!selectedGroups.includes(group.id)" class="mr-2" />
                                <label>{{ combo.label }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <!-- Modal Footer -->
            <div class="flex justify-end space-x-4 mt-6">
                <button type="button" @click="$emit('cancel')"
                    class="bg-red-500 text-white rounded-md py-2 px-4 hover:bg-red-600 focus:outline-none">
                    Cancelar
                </button>
                <button type="submit"
                    class="bg-green-500 text-white rounded-md py-2 px-4 hover:bg-green-600 focus:outline-none"
                    @click="saveChanges">
                    Salvar
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, watch } from "vue";

export default {
    props: {
        selection: {
            type: Object,
            required: true,
        },
        availableCombos: {
            type: Array,
            required: true,
        },
    },
    setup(props, { emit }) {
        // Reactive data for the modal form
        const plantData = reactive({
            id: props.selection.id || "",
            label: props.selection.label || "",
            description: props.selection.description || "",
            relatedCombos: props.selection.relatedCombos || [],
            relatedGroups: props.selection.relatedGroups || [], // Ensure relatedGroups are populated
        });

        // State for selected groups and combos (use arrays for reactivity)
        const selectedGroups = ref([...props.selection.groupIds || []]);
        const selectedCombos = ref([...props.selection.comboIds || []]);

        // Watch for changes in the plant's relatedGroups and relatedCombos to update selectedGroups and selectedCombos
        watch([() => props.selection.relatedGroups, () => props.selection.relatedCombos], ([newGroups, newCombos]) => {
            // Initialize the selectedGroups based on relatedGroups
            selectedGroups.value = newGroups || [];

            // Initialize the selectedCombos based on relatedCombos
            selectedCombos.value = newCombos || [];
        }, { immediate: true });

        // Save changes method
        const saveChanges = () => {
            plantData.relatedCombos = selectedCombos.value;
            plantData.relatedGroups = selectedGroups.value;

            emit("save", {
                ...plantData
            });
        };

        // Method to copy plant ID to clipboard
        const copyToClipboard = () => {
            navigator.clipboard.writeText(plantData.id).then(() => {
                alert("ID copiado para a área de transferência!");
            });
        };

        return {
            plantData,
            selectedGroups,
            selectedCombos,
            saveChanges,
            copyToClipboard,
        };
    },
};
</script>