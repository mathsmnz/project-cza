import { type Ref } from 'vue'
import { useEditorModel } from '@/editor/editorModel'

export interface EditorSetupOptions {
  /** File identifier/name */
  fileName: string
  /** URL to IFC file or Blob */
  fileSource?: string | Blob
}

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
   * Validates that the container element is available
   * @returns true if container is ready, false otherwise
   */
  function validateContainer(): boolean {
    if (!container.value) {
      console.warn('Container element is not available.')
      return false
    }
    return true
  }

  /**
   * Initializes the editor with optional IFC file
   *
   * @param options - Configuration for editor setup
   * @param options.fileName - Name/ID of the file
   * @param options.fileSource - Optional URL string or Blob of the IFC file
   *
   * @example
   * ```ts
   * // Empty editor
   * await setupEditor({ fileName: 'new-project' })
   *
   * // With URL
   * await setupEditor({
   *   fileName: 'project-123',
   *   fileSource: 'https://api.com/model.ifc'
   * })
   *
   * // With Blob
   * const blob = await downloadProjectFile(projectId, 'model.ifc')
   * await setupEditor({ fileName: 'project-123', fileSource: blob })
   * ```
   */
  async function setupEditor(options: EditorSetupOptions): Promise<void> {
    if (!validateContainer()) return

    const { fileName, fileSource } = options
    console.log('Setting up editor for:', fileName)

    await setupFragments()

    // Determine setup type based on fileSource
    if (!fileSource) {
      // Empty scene
      await setupScene(container.value!)
    } else if (typeof fileSource === 'string') {
      // URL-based setup
      await setupScene(container.value!, {
        fileUrl: fileSource,
        selectedId: fileName
      })
    } else {
      // Blob-based setup (TODO: implement blob loading in setupScene)
      console.warn('Blob loading not yet implemented in setupScene')
      // await setupScene(container.value!, {
      //   fileBlob: fileSource,
      //   selectedId: fileName
      // })
    }
  }

  /**
   * Loads an IFC file from user's local filesystem
   * Opens file picker dialog
   */
  function loadFromFile(): Promise<ArrayBuffer> {
    return loadIFCFile()
  }

  /**
   * Loads an IFC model from a given URL
   *
   * @param url - URL to the IFC file
   *
   * @example
   * ```ts
   * await loadFromURL('https://api.com/files/model.ifc')
   * ```
   */
  async function loadFromURL(url: string): Promise<void> {
    const model = await loadIfcModel(url)
    if (model && validateContainer()) {
      await setupScene(container.value!, {
        fileUrl: url,
        selectedId: model.name
      })
    }
  }

  /**
   * Exports the current model as .frag and .json fragments
   */
  function exportFragments(): void {
    saveFile()
  }

  /**
   * Activates a specific floor plan view
   *
   * @param planId - ID of the plan to activate
   *
   * @example
   * ```ts
   * selectPlan('floor-1')
   * ```
   */
  function selectPlan(planId: string): void {
    activatePlan({ id: planId })
  }

  /**
   * Exits the current plan view and returns to 3D model view
   */
  function resetPlanView(): void {
    exitPlanView()
  }

  /**
   * Captures a high-resolution screenshot of the current view
   *
   * @param fileName - Name for the screenshot file
   * @returns Promise resolving to the screenshot file/blob, or null if failed
   *
   * @example
   * ```ts
   * const screenshot = await captureView('project-view')
   * if (screenshot) {
   *   // Save or display screenshot
   * }
   * ```
   */
  async function captureView(fileName: string): Promise<File | null> {
    if (!validateContainer()) return null

    const result = await captureScreenshot(container.value!, fileName)
    return result ?? null
  }

  /**
   * Disposes of the editor and cleans up resources
   * Should be called before component unmount
   */
  function disposeEditor(): void {
    dispose()
  }

  return {
    // State
    plans,
    isEditorReady,

    // Setup
    setupEditor,

    // Loading
    loadFromFile,
    loadFromURL,

    // Actions
    exportFragments,
    selectPlan,
    resetPlanView,
    captureView,

    // Cleanup
    disposeEditor,
  }
}
