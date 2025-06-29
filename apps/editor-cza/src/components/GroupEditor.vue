<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg w-80 shadow-lg">
            <h2 class="text-lg font-bold mb-4">Editar Grupo</h2>
            <form @submit.prevent="saveChanges">
                <div class="mb-4">
                    <label for="label" class="block font-bold mb-2">Texto do grupo:</label>
                    <input
                        id="label"
                        type="text"
                        v-model="groupData.label"
                        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
                <div class="flex justify-end gap-2">
                    <button
                        type="submit"
                        class="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                    >
                        Salvar
                    </button>
                    <button
                        type="button"
                        @click="$emit('cancel')"
                        class="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    props: {
        group: {
            type: Object,
            required: true,
        },
    },
    setup(props, { emit }) {
        // Create a reactive copy of the input group to avoid direct mutation
        const groupData = ref({ ...props.group });

        // Method to save changes and emit updated data
        const saveChanges = () => {
            emit('save', groupData.value);
        };

        return {
            groupData,
            saveChanges,
        };
    },
};
</script>
