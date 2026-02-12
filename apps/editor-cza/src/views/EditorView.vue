<template>
  <div class="flex h-full w-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
    <div class="flex-grow overflow-auto p-6">
      <div class="max-w-7xl mx-auto">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        >
          <h1 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            Editor de Customizações
          </h1>
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
              Carregar JSON
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
              Download JSON
            </button>
            <button
              @click="setBaseFile"
              class="inline-flex items-center px-4 py-2 border-2 border-black text-sm font-semibold text-white bg-green-800 hover:bg-green-300 hover:text-black transition-colors"
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
              Definir IFC base
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
              Publicar Projeto
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

          <plants-card
            :selections="selections"
            :hasBaseFile="hasFile"
            @add-selection="addSelection"
            @edit-selection="editSelection"
            @delete-selection="deleteSelection"
            @edit-ifc="editIfc"
          />
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
    <IfcEditor
      v-if="showViewer"
      :mode="viewerMode"
      :project-id="currentProject?.id ?? null"
      :ifc-file="currentFile"
      :has-file="hasFile"
      @close="showViewer = false"
    />
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
import { downloadProjectFile, setProjectSelections } from '@/api/axios.ts'
import PlantsCard from '@/components/editor/PlantsCard.vue'

export default {
  components: {
    PlantsCard,
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

    const baseFile = ref<ArrayBuffer | null>(null)
    const hasFile = ref<boolean>(false)

    const projectStore = useProjectsStore()
    const { currentProject, currentProjectCustomization } = storeToRefs(projectStore)

    const currentFile = ref<string | null>(null)
    const showViewer = ref(false)

    const viewerMode = ref<string>('base-card')

    watch(currentProject, async () => {
      await checkBasefile()
    })

    const checkBasefile = async () => {
      if (currentProject.value) {
        try {
          const fileResult = await downloadProjectFile(currentProject.value?.id, 'base.ifc')

          if (fileResult) {
            console.log(fileResult)

            baseFile.value = await fileResult.arrayBuffer()
            hasFile.value = true
          } else {
            hasFile.value = false
          }
        } catch (e) {
          console.log('No base file found')
        }
      }
    }

    const setBaseFile = async () => {
      currentFile.value = 'base.ifc'
      showViewer.value = true
    }

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
      editingSelection.value = JSON.parse(JSON.stringify(selection))
    }

    const deleteSelection = (index: number) => {
      const deletedSelection = selections.value.splice(index, 1)
      console.log('deleted:', deletedSelection)
    }

    const uploadBaseFile = async (): Promise<void> => {}

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
      hasFile,
      deleteSelection,
      renameFile,
      toastState,
      hideToast,
      setBaseFile,
      viewerMode,
    }
  },
}
</script>

<style scoped></style>
