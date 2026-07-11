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
              @click="handleUploadBaseImage"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Imagem Base
            </button>

            <button
              @click="openBaseModelEditor"
              class="inline-flex items-center px-4 py-2 border-2 border-black text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurar Casa Base
            </button>

            <button
              @click="showTagsManager = true"
              class="inline-flex items-center px-4 py-2 border-2 border-black text-sm font-semibold text-white bg-blue-800 hover:bg-blue-300 hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Gerenciar Tags
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
            @upload-image="handleUploadImage"
          />
        </div>
      </div>
    </div>

    <selection-editor
      v-if="editingSelection"
      :selection="editingSelection"
      :available-combos="data"
      :project-id="currentProject?.id ?? ''"
      :base-value="currentProject?.baseValue ?? 0"
      @save="saveSelection"
      @cancel="cancelEdit"
    />
    <group-editor
      v-if="editingGroup"
      :group="editingGroup"
      :project-id="currentProject?.id ?? ''"
      @save="saveGroup"
      @cancel="cancelEdit"
    />
    <BaseModelEditor
      v-if="showBaseModelEditor"
      :base-cost="currentProject?.baseCost ?? null"
      :base-value="currentProject?.baseValue ?? null"
      :base-area="baseModelArea"
      :base-residents="currentProject?.baseResidents ?? null"
      :base-ifc-file-id="'base.ifc'"
      @save="saveBaseModel"
      @cancel="showBaseModelEditor = false"
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
      :display-name="viewerDisplayName"
      @close="handleViewerClose"
      @area-calculated="handleAreaCalculated"
    />
    <TagsManager
      v-if="showTagsManager"
      :project-id="currentProject?.id ?? ''"
      @close="showTagsManager = false"
      @toast="showToast"
    />
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import GroupEditor from '@/components/editor/modals/GroupEditor.vue'
import ComboEditor from '@/components/editor/modals/ComboEditor.vue'
import SelectionEditor from '@/components/editor/modals/SelectionEditor.vue'
import BaseModelEditor from '@/components/editor/modals/BaseModelEditor.vue'
import TagsManager from '@/components/editor/modals/TagsManager.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import IfcEditor from '@/components/editor/modals/IfcEditor.vue'
import GroupsCard from '@/components/editor/GroupsCard.vue'
import ComboCard from '@/components/editor/ComboCard.vue'
import type { Combo, CustomizationSchema, Group, Selection } from '@/types/types.ts'
import { generateUniqueId } from '@/util/util.ts'
import { useProjectsStore } from '@/stores/projects.ts'
import { storeToRefs } from 'pinia'
import { downloadProjectFile, setProjectSelections, updateProjectBaseModel, fetchProjectSelections, uploadProjectFile } from '@/api/axios.ts'
import PlantsCard from '@/components/editor/PlantsCard.vue'

export default {
  components: {
    PlantsCard,
    ComboCard,
    GroupsCard,
    GroupEditor,
    ComboEditor,
    SelectionEditor,
    BaseModelEditor,
    TagsManager,
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
    const editingSelectionOriginalId = ref<string | null>(null)
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
    const viewerDisplayName = ref<string>('')

    const viewerMode = ref<string>('base-card')
    const showTagsManager = ref(false)

    const handleViewerClose = async () => {
      showViewer.value = false
      if (currentProject.value) {
        try {
          const customizations = await fetchProjectSelections(currentProject.value.id)
          if (customizations && customizations.selections) {
            for (const localSel of selections.value) {
              const remoteSel = customizations.selections.find(s => s.id === localSel.id)
              if (remoteSel) {
                localSel.hasImage = remoteSel.hasImage
                localSel.hasIfc = remoteSel.hasIfc
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch customizations for updating file states', error)
        }
      }
    }

    watch(currentProject, async () => {
      await checkBaseFile()
    })

    onMounted(async () => {
      await checkBaseFile()
      if (currentProject.value?.baseArea != null) {
        baseModelArea.value = currentProject.value.baseArea
      }
    })

    const checkBaseFile = async () => {
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
      viewerDisplayName.value = 'Casa Base'
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
      const sel = selections.value.find(s => s.id === id)
      viewerDisplayName.value = sel?.label ?? id
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

    const handleUploadImage = (id: string) => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/png, image/jpeg'
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          if (!currentProject.value?.id) {
            showToast('Projeto não encontrado', 'error')
            return
          }
          
          showToast('Enviando imagem...', 'success')

          const newFile = new File([file], `${id}.png`, { type: 'image/png' })
          await uploadProjectFile(newFile, currentProject.value.id)

          const index = selections.value.findIndex(s => s.id === id)
          if (index !== -1 && selections.value[index]) {
            selections.value[index].hasImage = true
          }

          showToast('Imagem enviada com sucesso!', 'success')
        } catch (error) {
          showToast('Erro ao enviar imagem', 'error')
        }
      }
      fileInput.click()
    }

    const handleUploadBaseImage = () => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/png, image/jpeg'
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          if (!currentProject.value?.id) {
            showToast('Projeto não encontrado', 'error')
            return
          }

          showToast('Enviando imagem base...', 'success')

          const newFile = new File([file], 'base.png', { type: 'image/png' })
          await uploadProjectFile(newFile, currentProject.value.id)

          showToast('Imagem base enviada com sucesso!', 'success')
        } catch (error) {
          showToast('Erro ao enviar imagem base', 'error')
        }
      }
      fileInput.click()
    }

    const handleAreaCalculated = (area: number) => {
      console.log(`Received calculated area: ${area} for file: ${currentFile.value}`)
      if (currentFile.value === 'base.ifc') {
        baseModelArea.value = area
        showToast(`Área extraída: ${area}m² atribuída à Casa Base.`, 'success')
      } else if (currentFile.value) {
        // currentFile.value is the selection ID (e.g. '0', '1', unique hash)
        const index = selections.value.findIndex(s => s.id === currentFile.value)
        if (index !== -1 && selections.value[index]) {
          selections.value[index].area = area
          showToast(`Área extraída: ${area}m² atribuída à planta.`, 'success')
        }
      }
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
      showToast('Grupo adicionado!', 'success')
    }

    const deleteGroup = () => {
      if (selectedGroup.value) {
        data.value = data.value.filter((group) => group.id !== selectedGroup.value?.id)
        console.log('Deleted group:', selectedGroup.value)
        selectedGroup.value = null
        showToast('Grupo removido!', 'success')
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
        showToast('Opção adicionada!', 'success')
      }
    }

    const deleteCombo = (index: number) => {
      if (selectedGroup.value) {
        const deletedCombo = selectedGroup.value.combos.splice(index, 1)
        console.log('Deleted combo:', deletedCombo)
        showToast('Opção removida!', 'success')
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
        showToast('Erro ao salvar a opção.', 'error')
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
      showToast('Opção salva com sucesso!', 'success')
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

    const saveSelection = async (updatedSelection: Selection) => {
      // Use the original ID (before any regeneration on open) to locate the entry.
      const lookupId = editingSelectionOriginalId.value ?? updatedSelection.id
      const index = selections.value.findIndex((sel) => sel.id === lookupId)

      if (index !== -1) {
        if (updatedSelection.relatedCombos.length > 0) {
          console.log('Generating ID for combos:', updatedSelection.relatedCombos)

          // Sort before hashing so the ID is deterministic regardless of check order,
          // matching the same canonical format used in sistema-cza (OptionsView).
          const sortedCombos = [...updatedSelection.relatedCombos].sort()
          const uniqueId = await generateUniqueId(sortedCombos)
          console.log('Generated unique ID:', uniqueId)

          // Update the selection ID
          updatedSelection.id = uniqueId
        }

        selections.value[index] = { ...updatedSelection }
        console.log('Updated selection:', updatedSelection)
        showToast('(' + updatedSelection.label + ')' + ' - Planta salva com sucesso!', 'success')
      } else {
        console.error('Could not find selection to update:', updatedSelection)
        showToast('Erro ao salvar a planta.', 'error')
      }

      editingSelection.value = null
      editingSelectionOriginalId.value = null
    }

    const showBaseModelEditor = ref(false)
    const baseModelArea = ref<number | null>(null)

    const openBaseModelEditor = () => {
      showBaseModelEditor.value = true
    }

    const saveBaseModel = async (payload: {
      baseCost: number
      baseValue: number
      baseArea: number
      baseResidents: number
      baseIfcFileId: string
    }) => {
      if (!currentProject.value) return
      try {
        const updatedProject = await updateProjectBaseModel(currentProject.value.id, payload)
        currentProject.value.baseCost = updatedProject.baseCost
        currentProject.value.baseValue = updatedProject.baseValue
        currentProject.value.baseArea = updatedProject.baseArea
        currentProject.value.baseResidents = updatedProject.baseResidents
        currentProject.value.baseIfcFileId = updatedProject.baseIfcFileId
        showToast('Casa base configurada com sucesso.', 'success')
        showBaseModelEditor.value = false
      } catch (err) {
        showToast('Erro ao atualizar a Casa Base', 'error')
      }
    }

    const saveGroup = (updatedGroup: Group) => {
      const index = data.value.findIndex((group) => group.id === updatedGroup.id)
      if (index !== -1) {
        data.value[index] = { ...updatedGroup }
        console.log('Saved group:', updatedGroup)
        showToast('Grupo salvo com sucesso!', 'success')
      } else {
        showToast('Erro ao salvar o grupo.', 'error')
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
      showToast('Nova planta adicionada!', 'success')
    }

    const editSelection = async (selection: Selection) => {
      console.log('Editing:', selection)
      const copy: Selection = JSON.parse(JSON.stringify(selection))

      // Remember the original ID so saveSelection can find this entry in the
      // selections array even after the ID is regenerated below.
      editingSelectionOriginalId.value = selection.id

      // Regenerate the ID from the current sorted combos before opening the modal.
      // This corrects any selection whose ID was saved with a non-canonical combo order,
      // ensuring it matches the hash that sistema-cza would compute for the same combos.
      if (copy.relatedCombos && copy.relatedCombos.length > 0) {
        const sortedCombos = [...copy.relatedCombos].sort()
        copy.id = await generateUniqueId(sortedCombos)
      }

      editingSelection.value = copy
    }

    const deleteSelection = (index: number) => {
      const deletedSelection = selections.value.splice(index, 1)
      console.log('deleted:', deletedSelection)
      showToast('Planta removida!', 'success')
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
        showToast('Falha ao publicar projeto.', 'error')
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
      handleUploadImage,
      handleUploadBaseImage,
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
      handleViewerClose,
      hasFile,
      deleteSelection,
      renameFile,
      toastState,
      hideToast,
      setBaseFile,
      viewerMode,
      viewerDisplayName,
      handleAreaCalculated,
      showTagsManager,
      showToast,
      showBaseModelEditor,
      baseModelArea,
      openBaseModelEditor,
      saveBaseModel,
    }
  },
}
</script>

<style scoped></style>
