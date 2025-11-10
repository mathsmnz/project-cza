<template>
  <div class="flex h-full w-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
    <div class="flex-grow overflow-auto p-6">
      <div class="max-w-7xl mx-auto">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        >
          <h1 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Schema Editor</h1>
          <div class="flex items-center gap-3">
            <button
              @click="loadFile"
              class="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:border-black hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Load JSON
            </button>
            <button
              @click="saveFile"
              class="inline-flex items-center px-4 py-2 border-2 border-black text-sm font-semibold text-white bg-black hover:bg-white hover:text-black transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Downlaod JSON
            </button>
            <button
              @click="uploadSelection"
              class="inline-flex items-center px-4 py-2 border-2 border-black text-sm font-semibold text-white bg-black hover:bg-white hover:text-black transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save Project
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <groups-card
            :groups="data"
            :selected-group="selectedGroup"
            @select-group="selectGroup"
            @edit-group="editGroup"
            @add-group="addGroup"
            @delete-group="deleteGroup"
          />

          <combo-card
            :selected-group="selectedGroup"
            @edit-combo="editCombo"
            @delete-combo="deleteCombo"
            @add-combo="addCombo"
          />

          <div class="lg:col-span-3 bg-white border-2 border-black flex flex-col">
            <div class="p-4 border-b-2 border-black bg-gray-50">
              <h2 class="text-lg font-bold text-gray-900 uppercase">Plants</h2>
            </div>
            <div class="flex-grow p-4 space-y-2 overflow-y-auto min-h-[300px]">
              <div v-if="selections.length === 0" class="text-center text-gray-500 py-12">
                <svg
                  class="w-12 h-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
                <p class="font-medium">No plants added</p>
              </div>
              <div
                v-else
                v-for="(selection, index) in selections"
                :key="selection.id"
                class="group p-3 border-2 border-gray-300 hover:border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
              >
                <span class="font-semibold text-gray-900">{{ selection.label }}</span>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    @click="editIfc(selection.id)"
                    title="Associate Plant"
                    class="px-3 py-1.5 text-xs font-bold uppercase border-2 border-green-500 text-green-700 bg-green-50 hover:bg-green-100 transition-colors inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Associate
                  </button>
                  <button
                    @click="editSelection(selection)"
                    title="Edit Plant"
                    class="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteSelection(index)"
                    title="Delete Plant"
                    class="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="p-4 border-t-2 border-black bg-gray-50">
              <button
                @click="addSelection"
                class="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-black text-sm font-semibold text-white bg-black hover:bg-white hover:text-black transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Add Plant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <selection-editor
      v-if="editingSelection"
      :selection="editingSelection"
      :available-combos="data"
      @save="saveSelection"
      @cancel="cancelEdit"
    />
    <group-editor
      v-if="editingGroup"
      :group="editingGroup"
      @save="saveGroup"
      @cancel="cancelEdit"
    />
    <combo-editor
      v-if="editingCombo"
      :combo="editingCombo"
      @save="saveCombo"
      @cancel="cancelEdit"
    />
    <ToastNotification
      :show="toastState.show"
      :message="toastState.message"
      :mode="toastState.mode"
      :duration="toastState.duration"
      @close="hideToast"
    />
    <IfcEditor v-if="showViewer" :project-id="currentProject.id" :ifc-file="currentFile" @close="showViewer = false" />
  </div>
</template>

<script lang="ts">
import { reactive, ref, watch } from 'vue'
import GroupEditor from '@/components/editor/modals/GroupEditor.vue'
import ComboEditor from '@/components/editor/modals/ComboEditor.vue'
import SelectionEditor from '@/components/editor/modals/SelectionEditor.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import IfcEditor from '@/components/editor/modals/IfcEditor.vue'
import GroupsCard from '@/components/editor/GroupsCard.vue'
import ComboCard from '@/components/editor/ComboCard.vue'
import type { Combo, CustomizationSchema, Group, Selection } from '@/types/types.ts'
import { generateUniqueId } from '@/util/util.ts'
import { useProjectsStore } from '@/stores/projects.ts'
import { storeToRefs } from 'pinia'
import { setProjectSelections } from '@/api/axios.ts'

export default {
  components: {
    ComboCard,
    GroupsCard,
    GroupEditor,
    ComboEditor,
    SelectionEditor,
    ToastNotification,
    IfcEditor,
  },
  setup() {
    const data = ref<Group[]>([])
    const selectedGroup = ref<Group | null>(null)
    const editingGroup = ref<Group | null>(null)
    const editingCombo = ref<Combo | null>(null)
    const selections = ref<Selection[]>([])
    const editingSelection = ref<Selection | null>(null)
    const selectedIndex = ref<number | null>(null)
    const toastState = reactive({
      show: false,
      message: '',
      mode: 'success', // 'success', 'error', 'alert'
      duration: 3000, // Default duration
    })

    const projectStore = useProjectsStore()
    const { currentProject, currentProjectCustomization } = storeToRefs(projectStore)

    const currentFile = ref<string | null>(null)
    const showViewer = ref(false)

    const showToast = (message: string, mode = 'success', duration = 3000) => {
      toastState.message = message
      toastState.mode = mode
      toastState.duration = duration
      toastState.show = true
    }

    const hideToast = () => {
      toastState.show = false
    }

    const loadFile = () => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'application/json'
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const rawData = JSON.parse(reader.result as string)

            if (!rawData.data || !Array.isArray(rawData.data)) {
              showToast('Falha ao carregar o arquivo JSON. Verifique o formato.', 'error')
              throw new Error("Invalid JSON structure: 'data' is missing or not an array.")
            }

            data.value = rawData.data.map((group: Group) => ({
              id: group.id || Math.random().toString(36).substr(2, 9), // Generate fallback ID
              label: group.label || 'Sem Nome',
              combos:
                group.combos?.map((combo: Combo) => ({
                  id: combo.id || Math.random().toString(36).substr(2, 9), // Unique fallback ID
                  label: combo.label || 'Sem Nome',
                  associated: combo.associated || '',
                  compat: Array.isArray(combo.compat) ? combo.compat : [],
                })) || [],
            }))

            selections.value = rawData.selections || []
            console.log('Loaded and transformed JSON data:', selections.value)
          } catch (err) {
            console.error('Error loading JSON:', err)
            showToast('Falha ao carregar o arquivo JSON. Verifique o formato.', 'error')
          }
        }
        reader.readAsText(file)
      }
      fileInput.click()
    }

    const saveFile = () => {
      const blob = new Blob(
        [JSON.stringify({ data: data.value, selections: selections.value }, null, 2)],
        { type: 'application/json' },
      )
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'options.json'
      link.click()
      showToast('Ação completada com sucesso!', 'success')
    }

    const editIfc = (id: string) => {
      console.log(id)
      showViewer.value = true
      currentFile.value = id
    }

    const renameFile = (id: string) => {
      console.log(id)
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.ifc, image/*'
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]

        if (file) {
          const fileType = file.name.split('.')[1]

          currentFile.value = file.name

          console.log(fileType)
          const newFile = new File([file], `${id}.${fileType}`, {
            type: `.${fileType}`,
          })

          // Create a download link for the renamed file
          const downloadLink = document.createElement('a')
          downloadLink.href = URL.createObjectURL(newFile)
          downloadLink.download = newFile.name // Specify the new filename
          downloadLink.click() // Trigger the download
        }
      }

      fileInput.click()
    }

    const selectGroup = (group: Group | null) => {
      selectedGroup.value = group
      console.log('Selected group:', selectedGroup.value)
    }

    const addGroup = () => {
      const newGroup: Group = {
        id: String.fromCharCode(65 + data.value.length),
        label: 'Novo grupo',
        combos: [],
      }
      data.value.push(newGroup)
      console.log('Added new group:', newGroup)
    }

    const deleteGroup = () => {
      if (selectedGroup.value) {
        data.value = data.value.filter((group) => group.id !== selectedGroup.value?.id)
        console.log('Deleted group:', selectedGroup.value)
        selectedGroup.value = null
      }
    }

    const addCombo = () => {
      if (selectedGroup.value) {
        // Generate a new combo with the necessary fields
        const newCombo: Combo = {
          id: String.fromCharCode(97 + selectedGroup.value.combos.length), // Lowercase letter ('a', 'b', 'c', etc.)
          label: 'Nova opção',
          associated: '', // Default associated value (can be updated by user later)
          compat: [], // Initialize compat as an empty array
        }

        selectedGroup.value.combos.push(newCombo)
        console.log('Added new combo:', newCombo)
      }
    }

    const deleteCombo = (index: number) => {
      if (selectedGroup.value) {
        const deletedCombo = selectedGroup.value.combos.splice(index, 1)
        console.log('Deleted combo:', deletedCombo)
      }
    }

    const editCombo = (index: number) => {
      if (selectedGroup.value && selectedGroup.value.combos && selectedGroup.value.combos[index]) {
        console.log('Editing combo:', selectedGroup.value.combos[index])
        // Ensure you create a deep copy if 'compat' array can be mutated in the editor
        editingCombo.value = JSON.parse(JSON.stringify(selectedGroup.value.combos[index]))
        selectedIndex.value = index
      } else {
        console.error('Combo not found!')
      }
    }

    const saveCombo = (updatedCombo: Combo) => {
      console.log('Attempting to save combo:', updatedCombo)

      if (!selectedGroup.value || selectedIndex.value == null) {
        console.error(
          'Save failed: Invalid state. No selected group or combo index.',
          'Selected Group:',
          selectedGroup.value,
          'Selected Index:',
          selectedIndex.value,
        )
        editingCombo.value = null
        selectedIndex.value = null
        return
      }

      console.log(
        'Saving combo at index:',
        selectedIndex.value,
        'in group:',
        selectedGroup.value.label,
      )

      selectedGroup.value.combos[selectedIndex.value] = { ...updatedCombo }

      editingCombo.value = null
      selectedIndex.value = null
    }

    const cancelEdit = () => {
      console.log('Edit canceled')
      editingGroup.value = null
      editingCombo.value = null
      editingSelection.value = null
    }

    // Function to edit group
    const editGroup = (group: Group) => {
      editingGroup.value = { ...group }
    }

    // Save edited group
    const saveGroup = (updatedGroup: Group) => {
      const index = data.value.findIndex((group) => group.id === updatedGroup.id)
      if (index !== -1) {
        data.value[index] = { ...updatedGroup }
        console.log('Saved group:', updatedGroup)
      }
      editingGroup.value = null
    }

    const addSelection = () => {
      const newSelection: Selection = {
        id: selections.value.length.toString(), // This will be replaced on first save
        label: 'Nova Planta ' + (selections.value.length + 1),
        description: '',
        relatedCombos: [],
        relatedGroups: [],
      }

      // Add the selection object to the selections array
      selections.value.push(newSelection)
      console.log('Added selection:', newSelection)
    }

    // Save an edited selection.
    const saveSelection = async (updatedSelection: Selection) => {
      const index = selections.value.findIndex((sel) => sel.id === updatedSelection.id)

      if (index !== -1) {
        if (updatedSelection.relatedCombos.length > 0) {
          console.log('Generating ID for combos:', updatedSelection.relatedCombos)

          // Generate unique hash for combo IDs
          const uniqueId = await generateUniqueId(updatedSelection.relatedCombos)
          console.log('Generated unique ID:', uniqueId)

          // Update the selection ID
          updatedSelection.id = uniqueId
        }

        selections.value[index] = { ...updatedSelection }
        console.log('Updated selection:', updatedSelection)
      } else {
        console.error('Could not find selection to update:', updatedSelection)
      }

      editingSelection.value = null
    }

    const editSelection = (selection: Selection) => {
      console.log('Editing:', selection)
      // Use deep copy to prevent mutations in the editor
      // from affecting the main list before saving
      editingSelection.value = JSON.parse(JSON.stringify(selection))
    }

    const deleteSelection = (index: number) => {
      const deletedSelection = selections.value.splice(index, 1)
      console.log('deleted:', deletedSelection)
    }

    const uploadSelection = async (): Promise<void> => {
      if (!currentProject.value) {
        console.error('No project selected — cannot upload selections.')
        return
      }

      if (!data.value || !Array.isArray(data.value)) {
        console.error('Invalid or missing group data.')
        return
      }

      if (!selections.value || !Array.isArray(selections.value)) {
        console.error('Invalid or missing selections data.')
        return
      }

      const customizationSchema: CustomizationSchema = {
        id: null,
        label: currentProject.value.description ?? '',
        groups: data.value ?? [],
        selections: selections.value ?? [],
        projectId: currentProject.value.id,
      }

      try {
        console.info(`Uploading customization schema for project ${currentProject.value.id}...`)
        const updated = await setProjectSelections(currentProject.value.id, customizationSchema)
        console.info('Selections uploaded successfully:', updated)
        showToast('Ação completada com sucesso!', 'success')
      } catch (err) {
        console.error(`Failed to upload selections for project ${currentProject.value.id}:`, err)
      }
    }

    watch(
      currentProjectCustomization,
      () => {
        if (currentProjectCustomization.value) {
          data.value = currentProjectCustomization.value.groups
          selections.value = currentProjectCustomization.value.selections
        } else {
          data.value = []
          selections.value = []
        }
      },
      { immediate: true }, // logs immediately when component is mounted
    )

    return {
      data,
      selectedGroup,
      editingSelection,
      selections,
      editingGroup,
      editingCombo,
      loadFile,
      uploadSelection,
      saveFile,
      selectGroup: selectGroup,
      addGroup,
      deleteGroup,
      addCombo,
      editIfc,
      deleteCombo,
      editCombo,
      saveCombo,
      cancelEdit,
      editGroup,
      saveGroup,
      addSelection,
      editSelection,
      currentProject,
      saveSelection,
      currentFile,
      showViewer,
      deleteSelection,
      renameFile,
      toastState,
      hideToast,
    }
  },
}
</script>

<style scoped></style>
