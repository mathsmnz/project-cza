import { type Ref } from 'vue'
import { useEditorModel } from '@/editor/editorModel'

export function useEditorController(container: Ref<HTMLDivElement | null>) {
  const {
    getPlans,
    setupScene,
    setupFragments,
    loadIfcModel,
    loadIFCFile,
    saveFile,
    activatePlan,
    dispose,
    exitPlanView,
    captureScreenshot,
    isFileReady,
  } = useEditorModel()

  const plans = getPlans()
  const isEditorReady = isFileReady


  /**
   * Initializes the editor with a default IFC file (e.g., 'base.ifc')
   */
  async function setupEditor(fileName: string, fileUrl: string) {

    if (container.value) {
      console.log("Setting up editor for:", fileName)
      await setupFragments()
      await setupScene(fileName, fileUrl, container.value)
    } else {
      console.warn('Container element is not available.')
    }
  }

  /**
   * Initializes the editor with a default IFC file (e.g., 'base.ifc')
   */
  async function setupEditorByBlob(fileName: string, fileUrl: Blob) {

    if (container.value) {
      console.log("Setting up editor for:", fileName)
      await setupFragments()
      await setupScene(fileName, fileUrl, container.value)
    } else {
      console.warn('Container element is not available.')
    }
  }

  /**
   * Allows selecting and loading a local .IFC file
   */
  const loadFromFile = () => loadIFCFile()

  /**
   * Loads an IFC model from a given URL
   */
  async function loadFromURL(url: string) {
    const model = await loadIfcModel(url)
    if (model && container.value) {
      await setupScene(model.name, url, container.value)
    }
  }

  /**
   * Saves the current model as .frag and .json
   */
  function exportFragments() {
    saveFile()
  }

  /**
   * Switches to a selected plan view
   */
  function selectPlan(planId: string) {
    activatePlan({ id: planId })
  }

  /**
   * Exits from plan view mode
   */
  function resetPlanView() {
    exitPlanView()
  }

  /**
   * Captures a high-resolution screenshot of the model view
   */
  async function captureView(fileName: string){
    if (container.value) {
      return await captureScreenshot(container.value, fileName)
    } else {
      console.warn('Container element not found for screenshot.')
      return null
    }
  }

  /**
   * Disposes editor
   */
  async function disposeEditor(){
    if (container.value) {
      dispose()
    }
  }
  return {
    plans,
    setupEditor,
    loadFromFile,
    loadFromURL,
    exportFragments,
    selectPlan,
    resetPlanView,
    captureView,
    disposeEditor,
    isEditorReady
  }
}
