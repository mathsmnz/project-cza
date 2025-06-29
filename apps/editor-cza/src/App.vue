<template>
  <div class="flex flex-col grow h-screen font-montserrat">
    <div class="max-w-8xl px-4 lg:px-8 py-4 border-b-2 border-black">
      <span class="font-400 text-4xl hover:font-600">CZA+ Editor</span>
    </div>

    <div class="p-4">
      <div class="actions mb-6 flex justify-start space-x-4">
        <button @click="loadFile" class="rounded-lg p-4 bg-black text-white hover:bg-slate-900">Load JSON</button>
        <button @click="saveFile" class="rounded-lg p-4 bg-black text-white hover:bg-slate-900">Save JSON</button>
      </div>

      <div class="flex">
        <!-- Groups List -->
        <div class="w-1/3 bg-gray-50 p-4 border-t-2 border-l-2 border-r-2 border-black">
          <h2 class="text-xl font-semibold mb-4">Grupos</h2>
          <div v-if="data.length === 0" class="p-4 text-center text-gray-500">
            Nenhum grupo adicionado. Clique em "Adicionar Grupo" para começar.
          </div>
          <div v-else>
            <ul>
              <li v-for="group in data" :key="group.id" @click="selectGroup(group)"
                class="group-item p-3 mb-2 cursor-pointer border-b border-black hover:bg-gray-200"
                :class="{ 'bg-gray-200': group.id === selectedGroup?.id }">
                {{ group.label }}
                <button @click.stop="editGroup(group)"
                  class="ml-4 px-2 py-1 bg-black text-white rounded">Editar</button>
              </li>
            </ul>
          </div>
          <div class="mt-4">
            <button @click="addGroup" class="rounded-lg p-4 bg-black text-white w-full">Adicionar Grupo</button>
            <button @click="deleteGroup" class="rounded-lg p-4 w-full mt-2 bg-red-500 hover:bg-red-600">Deletar
              Grupo</button>
          </div>
        </div>

        <!-- Combos List -->
        <div class="w-2/3 bg-gray-50 p-4 border-t-2  border-r-2 border-black">
          <h2 class="text-xl font-semibold mb-4 ">{{ selectedGroup?.label ? `Opções para "${selectedGroup.label}"` :
            'Nenhum grupo selecionado' }}</h2>
          <div v-if="selectedGroup && selectedGroup.combos.length === 0" class="p-4 text-center text-gray-500">
            Este grupo não possui opções. Clique em "Adicionar Opção".
          </div>
          <div v-else-if="!selectedGroup" class="p-4 text-center text-gray-500">
            Selecione um grupo para ver as opções.
          </div>
          <div v-else>
            <ul>
              <li v-for="(combo, index) in selectedGroup?.combos || []" :key="index"
                class="p-3 mb-2  border-b border-black hover:bg-gray-100 flex justify-between items-center">
                <span>{{ combo.label }}</span>
                <div class="space-x-2">
                  <button @click="editCombo(index)" class="px-2 py-1 bg-black text-white rounded">Editar</button>
                  <button @click="deleteCombo(index)"
                    class="px-2 py-1 rounded bg-red-500 hover:bg-red-600">Deletar</button>
                </div>
              </li>
            </ul>
          </div>
          <button @click="addCombo" class="w-full rounded-lg p-4 bg-black text-white hover:bg-slate-900 mt-4" :class="{ 'hidden': selectedGroup === null }">Adicionar
            Opção</button>
        </div>
      </div>

      <div class="flex flex-col w-full border-2 border-black gap-4 p-4">
        <span class="text-xl font-semibold mb-2">Plantas</span>
        <div v-for="(selection, index) in selections"
          class="border-b border-black p-4 cursor-pointer hover:bg-gray-200">
          <div class="flex flex-row justify-between items-center">
            <span class="w-fit h-fit">{{ selection.label }}</span>
            <div class="w-fit flex gap-2 justify-end h-full">
              <button @click="renameFile(selection.id)"
                class="bg-green-600 text-white h-full px-2 py-1 rounded">Associar
                Planta</button>
              <button @click="editSelection(selection)"
                class="bg-black h-full text-white px-2 py-1 rounded">Editar</button>
              <button @click="deleteSelection(index)" class="bg-red-500 h-full  px-2 py-1 rounded">Deletar</button>
            </div>
          </div>
        </div>
        <div class="w-full flex gap-4 justify-around">
          <button @click="addSelection" class="p-4 w-1/2 bg-black text-white rounded-lg">Adicionar Planta</button>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <selection-editor v-if="editingSelection" :selection="editingSelection" :available-combos="data"
      @save="saveSelection" @cancel="cancelEdit" />
    <group-editor v-if="editingGroup" :group="editingGroup" @save="saveGroup" @cancel="cancelEdit" />
    <combo-editor v-if="editingCombo" :combo="editingCombo" @save="saveCombo" @cancel="cancelEdit" />
    <ToastNotification :show="toastState.show" :message="toastState.message" :mode="toastState.mode"
      :duration="toastState.duration" @close="hideToast" />
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import GroupEditor from './components/GroupEditor.vue';
import ComboEditor from './components/ComboEditor.vue';
import SelectionEditor from './components/SelectionEditor.vue';
import ToastNotification from './components/ToastNotification.vue';

export default {
  components: {
    GroupEditor,
    ComboEditor,
    SelectionEditor,
    ToastNotification
  },
  setup() {
    const data = ref([]);
    const selectedGroup = ref(null);
    const editingGroup = ref(null);
    const editingCombo = ref(null);
    const selections = ref([]);
    const editingSelection = ref(null);
    const selectedIndex = ref(null);
    const toastState = reactive({
      show: false,
      message: '',
      mode: 'success', // 'success', 'error', 'alert'
      duration: 3000,  // Default duration
    });

    const showToast = (message, mode = 'success', duration = 3000) => {
      toastState.message = message;
      toastState.mode = mode;
      toastState.duration = duration;
      toastState.show = true;
    };

    const hideToast = () => {
      toastState.show = false;
    };

    const loadFile = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const rawData = JSON.parse(reader.result);

            if (!rawData.data || !Array.isArray(rawData.data)) {
              showToast('Falha ao carregar o arquivo JSON. Verifique o formato.', 'error');
              throw new Error("Invalid JSON structure: 'data' is missing or not an array.");
            }

            const transformedData = rawData.data.map((group) => ({
              id: group.id || Math.random().toString(36).substr(2, 9), // Generate fallback ID
              label: group.label || "Sem Nome",
              combos: group.combos?.map((combo) => ({
                id: combo.id || Math.random().toString(36).substr(2, 9), // Unique fallback ID
                label: combo.label || "Sem Nome",
                associated: combo.associated || "",
                compat: Array.isArray(combo.compat) ? combo.compat : [],
              })) || [],
            }));

            data.value = transformedData;
            selections.value = rawData.selections || [];
            console.log("Loaded and transformed JSON data:", data.value);
          } catch (err) {
            console.error("Error loading JSON:", err);
            showToast('Falha ao carregar o arquivo JSON. Verifique o formato.', 'error');

          }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };

    const saveFile = () => {
      const blob = new Blob([JSON.stringify({ data: data.value, selections: selections.value }, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'options.json';
      link.click();
       showToast('Ação completada com sucesso!', 'success');
    };

    const renameFile = (id) => {
      console.log(id);
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.ifc, image/*';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];

        if (file) {
          const fileType = file.name.split(".")[1];
          console.log(fileType)
          const newFile = new File([file], `${id}.${fileType}`, {
            type: `.${fileType}`
          });

          // Create a download link for the renamed file
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(newFile);
          downloadLink.download = newFile.name; // Specify the new filename
          downloadLink.click(); // Trigger the download
        }
      };

      fileInput.click();
    }

    const selectGroup = (group) => {
      selectedGroup.value = group;
      console.log('Selected group:', selectedGroup.value);
    };

    const addGroup = () => {
      const newGroup = {
        id: String.fromCharCode(65 + data.value.length),
        group: `Group ${data.value.length + 1}`,
        label: 'Novo grupo',
        combos: []
      };
      data.value.push(newGroup);
      console.log('Added new group:', newGroup);
    };

    const deleteGroup = () => {
      if (selectedGroup.value) {
        data.value = data.value.filter((group) => group.id !== selectedGroup.value.id);
        console.log('Deleted group:', selectedGroup.value);
        selectedGroup.value = null;
      }
    };

    const addCombo = () => {
      if (selectedGroup.value) {
        // Generate a new combo with the necessary fields
        const newCombo = {
          id: String.fromCharCode(97 + selectedGroup.value.combos.length), // Lowercase letter ('a', 'b', 'c', etc.)
          label: 'Nova opção',
          associated: '', // Default associated value (can be updated by user later)
          compat: [] // Initialize compat as an empty array
        };

        selectedGroup.value.combos.push(newCombo);
        console.log('Added new combo:', newCombo);
      }
    };

    const deleteCombo = (index) => {
      if (selectedGroup.value) {
        const deletedCombo = selectedGroup.value.combos.splice(index, 1);
        console.log('Deleted combo:', deletedCombo);
      }
    };

    const editCombo = (index) => {
      if (selectedGroup.value && selectedGroup.value.combos && selectedGroup.value.combos[index]) {
        console.log('Editing combo:', selectedGroup.value.combos[index]);
        editingCombo.value = { ...selectedGroup.value.combos[index] };
        selectedIndex.value = index;
      } else {
        console.error('Combo not found!');
      }
    };

    const saveCombo = (updatedCombo) => {
      console.log('Saving updated combo:', updatedCombo);
      console.log(selectedIndex.value);
      selectedGroup.value.combos[selectedIndex.value] = { ...updatedCombo };
      editingCombo.value = null;
      selectedIndex.value = null;
    };

    const cancelEdit = () => {
      console.log('Edit canceled');
      editingGroup.value = null;
      editingCombo.value = null;
      editingSelection.value = null;
    };

    // Function to edit group
    const editGroup = (group) => {
      editingGroup.value = { ...group };
    };

    // Save edited group
    const saveGroup = (updatedGroup) => {
      const index = data.value.findIndex((group) => group.id === updatedGroup.id);
      if (index !== -1) {
        data.value[index] = { ...updatedGroup };
        console.log('Saved group:', updatedGroup);
      }
      editingGroup.value = null;
    };

    const addSelection = () => {
      const newSelection = {
        label: "Nova Planta ",
        description: "",
        id: selections.value.length.toString(),
        relatedCombos: [],
        relatedGroups: []
      };

      // Add the selection object to the selections array
      selections.value.push(newSelection);
      console.log('Added selection:', newSelection);
    };

    async function generateUniqueId(sortedCombos) {
      const rawId = sortedCombos.join(",");
      const encoder = new TextEncoder();
      const data = encoder.encode(rawId);

      // Use SubtleCrypto to hash the input
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);

      // Convert the hash buffer to a hexadecimal string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      return hashHex; // Hash is deterministic and filename-safe
    }

    // Save an edited selection.
    const saveSelection = async (updatedSelection) => {
      const index = selections.value.findIndex((sel) => sel.id === updatedSelection.id);

      if (index !== -1) {
        if (updatedSelection.relatedCombos.length != 0) {
          console.log(updatedSelection);

          // Generate unique hash for combo IDs
          const sortedCombos = [...updatedSelection.relatedCombos].sort(); // Use spread operator for proper sorting
          const uniqueId = await generateUniqueId(sortedCombos); // Await the unique ID

          console.log(uniqueId);

          // Update the selection ID
          updatedSelection.id = uniqueId;
        }

        selections.value[index] = { ...updatedSelection };
        console.log('Updated selection:', updatedSelection);
      }

      editingSelection.value = null;
    };


    const editSelection = (selection) => {
      console.log('Ediding:', selection);
      editingSelection.value = { ...selection }
    };

    const deleteSelection = (index) => {
      const deletedSelection = selections.value.splice(index, 1);
      console.log('deleted:', deletedSelection);
    };

    return {
      data,
      selectedGroup,
      editingSelection,
      selections,
      editingGroup,
      editingCombo,
      loadFile,
      saveFile,
      selectGroup,
      addGroup,
      deleteGroup,
      addCombo,
      deleteCombo,
      editCombo,
      saveCombo,
      cancelEdit,
      editGroup,
      saveGroup,
      addSelection,
      editSelection,
      saveSelection,
      deleteSelection,
      renameFile,
      toastState,
      hideToast
    };
  },
};
</script>

<style scoped></style>