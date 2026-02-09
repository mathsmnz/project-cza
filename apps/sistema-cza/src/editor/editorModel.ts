/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as WEBIFC from 'web-ifc'
import * as THREE from 'three'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import { setupGizmo } from '@/editor/gizmo/gizmo.ts'
import type { FragmentsGroup } from '@thatopen/fragments'
import { ref } from 'vue'

const components = new OBC.Components()
const fragments = components.get(OBC.FragmentsManager)
const ifcLoader = components.get(OBC.IfcLoader)
const highlighter = components.get(OBCF.Highlighter)
let culler: OBC.MeshCullerRenderer

export function useEditorModel() {
  let grid: OBC.SimpleGrid
  let world: OBC.SimpleWorld<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBCF.PostproductionRenderer
  >
  let model: FragmentsGroup
  let modelName = ''
  const classifier = components.get(OBC.Classifier)
  const plans = components.get(OBCF.Plans)
  const reactivePlansList = ref<OBCF.PlanView[]>([])
  const isFileReady = ref(false)

  async function _setupWorld(container: HTMLElement) {
    const worlds = _getWorld()
    world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBCF.PostproductionRenderer
    >()

    world.scene = new OBC.SimpleScene(components)
    world.renderer = new OBCF.PostproductionRenderer(components, container)
    world.camera = new OBC.OrthoPerspectiveCamera(components)

    world.renderer.postproduction.enabled = true

    components.init()

    await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10)

    world.scene.setup()
    world.scene.three.background = new THREE.Color(0xffffff)

    // === Overlay Gizmo ===
    setupGizmo(world)
  }

  async function setupFragments() {
    await ifcLoader.setup()

    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
    ]

    for (const cat of excludedCats) {
      ifcLoader.settings.excludedCategories.add(cat)
    }

    ifcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true
  }

  async function loadIfcModel(url: string) {
    const file = await fetch(url)
    const data = await file.arrayBuffer()
    const buffer = new Uint8Array(data)

    const loadedModel = await ifcLoader.load(buffer)
    loadedModel.name = url

    _setupBoundingBox(loadedModel)

    return loadedModel
  }

  // Load IFC model from file input
  async function loadIFCFile(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.ifc'

      fileInput.onchange = async (e) => {
        const target = e.target as HTMLInputElement | null
        if (!target?.files?.[0]) {
          console.error('No file selected.')
          reject(new Error('No file selected'))
          return
        }

        const file = target.files[0]

        try {
          isFileReady.value = false

          const bufferArray = await file.arrayBuffer()
          const buffer = new Uint8Array(bufferArray)

          if (!world) {
            reject(new Error('World is not initialized'))
            return
          }

          _cleanupScene()

          const loadedModel = await ifcLoader.load(buffer)
          loadedModel.name = file.name

          model = loadedModel
          modelName = file.name

          world.scene.three.add(model)
          _setupBoundingBox(loadedModel)
          await _planManager()
          await _setupStyling()

          isFileReady.value = true

          resolve(bufferArray)
        } catch (error) {
          console.error('Failed to load IFC file:', error)
          reject(error)
        }
      }

      fileInput.click()
    })
  }

  // Save .frag and properties.json
  function saveFile() {
    if (!fragments.groups.size) return

    const group = Array.from(fragments.groups.values())[0]
    if (!group) return
    const data = fragments.export(group)
    const baseName = modelName.split('.')[0] || 'model'

    const download = (blob: Blob, name: string) => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = name
      link.click()
      URL.revokeObjectURL(link.href)
    }

    const properties = group.getLocalProperties()
    if (properties) {
      download(new Blob([JSON.stringify(properties)]), `${baseName}.json`)
    }
    /*  */
    download(
      new Blob([new Uint8Array(data)], { type: 'application/octet-stream' }),
      `${baseName}.frag`,
    )
  }

  interface SceneSetupOptions {
    selectedId?: string
    fileUrl?: string
  }

  async function setupScene(
    container: HTMLElement,
    options: SceneSetupOptions = {},
  ): Promise<void> {
    const { selectedId, fileUrl } = options

    await _setupWorld(container)
    if (!world) return

    setupGrid(world)

    // Load IFC model if both ID and URL are provided
    if (selectedId && fileUrl) {
      model = await loadIfcModel(fileUrl)
      world.scene.three.add(model)
      modelName = selectedId
    }

    await _initializeCommonFeatures()

    isFileReady.value = true
  }

  async function _initializeCommonFeatures(): Promise<void> {
    if (!world) return

    highlighter.setup({ world })
    highlighter.zoomToSelection = true

    await _planManager()
    await _setupStyling()
  }

  function _cleanupScene() {
    if (model) {
      world.scene.three.remove(model)
      model.dispose()
    }
    plans?.dispose()
    //culler?.dispose()
    fragments?.dispose()
  }

  function setupGrid(world: OBC.SimpleWorld) {
    if (world && world.renderer) {
      const grids = _getGrids()
      grid = grids.create(world)

      grid.three.position.y -= 1.5
      grid.config.color.setHex(0x000000)

      // Cast to correct renderer type
      const renderer = world.renderer

      // Only access if postproduction exists
      // @ts-expect-error the field will be generated during runtime
      renderer.postproduction?.customEffects.excludedMeshes.push(grid.three)
    }
  }

  async function _planManager() {
    plans.world = world
    await plans.generate(model)

    reactivePlansList.value = [...plans.list]

    // const cullers = components.get(OBC.Cullers)
    // culler = cullers.create(world)
    // for (const fragment of model.items) {
    //   culler.add(fragment.mesh)
    // }

    // culler.needsUpdate = true

    // world.camera.controls.addEventListener('sleep', () => {
    //   culler.needsUpdate = true
    // })
  }

  const activatePlan = (plan: { id: string }) => {
    if (!world.renderer) {
      return
    }

    world.renderer.postproduction.customEffects.minGloss = 0.1
    highlighter.backupColor = new THREE.Color('white')
    world.scene.three.background = new THREE.Color('white')
    const plansComponent = world.components.get(OBCF.Plans)
    plansComponent.goTo(plan.id)
    //culler.needsUpdate = true
  }

  const exitPlanView = () => {
    if (!world.renderer) {
      return
    }
    world.renderer.postproduction.customEffects.minGloss = 0.0
    highlighter.backupColor = null
    highlighter.clear()
    classifier.resetColor(classifier.find({ models: [model.uuid] }))
    world.scene.three.background = new THREE.Color('white')
    const plansComponent = world.components.get(OBCF.Plans)
    plansComponent.exitPlanView()
    //culler.needsUpdate = true
  }

  async function _setupStyling() {
    const edges = components.get(OBCF.ClipEdges)

    classifier.byModel(model.uuid, model)
    classifier.byEntity(model)

    const modelItems = classifier.find({ models: [model.uuid] })
    const thickItems = classifier.find({
      entities: ['IFCWALLSTANDARDCASE', 'IFCWALL'],
    })

    const thinItems = classifier.find({
      entities: ['IFCDOOR', 'IFCWINDOW', 'IFCPLATE', 'IFCMEMBER', 'IFCFURNISHINGELEMENT'],
    })

    // Define material style for the base model
    const baseFill = new THREE.MeshBasicMaterial({ color: 'black', side: 2 })
    const baseLine = new THREE.LineBasicMaterial({ color: 'black' })
    const baseOutline = new THREE.MeshBasicMaterial({
      color: 'black',
      opacity: 0.2,
      side: 2,
      transparent: true,
    })

    // Create the base edge style
    edges.styles.create('base', new Set(), world, baseLine, baseFill, baseOutline)

    // Assign items to the base style
    for (const fragID in modelItems) {
      const foundFrag = fragments.list.get(fragID)
      if (!foundFrag || !('mesh' in foundFrag)) continue
      const { mesh } = foundFrag
      if (edges.styles.list.base) {
        edges.styles.list.base.fragments[fragID] = new Set(modelItems[fragID])
        edges.styles.list.base.meshes.add(mesh)
      }
    }

    const grayFill = new THREE.MeshBasicMaterial({ color: 'gray', side: 2 })
    const blackLine = new THREE.LineBasicMaterial({ color: 'black' })
    const blackOutline = new THREE.MeshBasicMaterial({
      color: 'black',
      opacity: 0.5,
      side: 2,
      transparent: true,
    })

    edges.styles.create('thick', new Set(), world, blackLine, grayFill, blackOutline)

    const frag = fragments

    for (const fragID in thickItems) {
      const foundFrag = frag.list.get(fragID)
      if (!foundFrag) continue
      const { mesh } = foundFrag
      if (edges.styles.list.thick) {
        edges.styles.list.thick.fragments[fragID] = new Set(thickItems[fragID])
        edges.styles.list.thick.meshes.add(mesh)
      }
    }

    edges.styles.create('thin', new Set(), world)

    for (const fragID in thinItems) {
      const foundFrag = frag.list.get(fragID)
      if (!foundFrag) continue
      const { mesh } = foundFrag
      if (edges.styles.list.thin) {
        edges.styles.list.thin.fragments[fragID] = new Set(thinItems[fragID])
        edges.styles.list.thin.meshes.add(mesh)
      }
    }

    await edges.update(true)
  }

  const captureScreenshot = async (container: HTMLElement, fileName: string) => {
    if (!world || !world.renderer || !container) return

    // Hide the grid before capturing
    if (grid) grid.visible = false

    let activePlan = plans.currentPlan
    if (!activePlan) {
      activePlan = plans.list[0] ?? null
      console.warn('Nenhuma planta ativa para captura.')
    }

    // Store original background color and resolution settings
    const originalClearColor = world.renderer.three.getClearColor(new THREE.Color())
    const originalAlpha = world.renderer.three.getClearAlpha()
    const originalPixelRatio = world.renderer.three.getPixelRatio()
    const originalSize = new THREE.Vector2()
    world.renderer.three.getSize(originalSize)

    // Store the original background
    const originalSceneBackground = world.scene.three.background

    // Set transparent background
    world.renderer.three.setClearColor(0x000000, 0)
    world.scene.three.background = null

    // Increase screenshot resolution (e.g., 2x or 4x the original size)
    const scaleFactor = 2
    const width = originalSize.x * scaleFactor
    const height = originalSize.y * scaleFactor

    // Set renderer size and pixel ratio for better quality
    world.renderer.three.setPixelRatio(window.devicePixelRatio * scaleFactor)
    world.renderer.three.setSize(width, height, false)

    //_setupBoundingBox(model)
    await _fitToPlanView()

    // Render the scene at high resolution
    world.renderer.three.render(world.scene.three, world.camera.three)

    const canvas = container.querySelector('canvas')

    if (!canvas) {
      return
    }

    // Capture the image at high resolution
    const screenshot = canvas.toDataURL('image/png')

    // Converts to a base64 file for upload
    const blob = await (await fetch(screenshot)).blob()
    const file = new File([blob], `${fileName.split('.')[0]}.jpg`)

    // Restore original renderer settings
    world.renderer.three.setClearColor(originalClearColor, originalAlpha)
    world.renderer.three.setPixelRatio(originalPixelRatio)
    world.renderer.three.setSize(originalSize.x, originalSize.y, false)

    // Restore original background
    world.scene.three.background = originalSceneBackground

    // Restore grid visibility
    if (grid) grid.visible = true

    // Download the image
    const link = document.createElement('a')
    link.href = screenshot
    const screenshotName = fileName.split('.')[0]
    link.download = `${screenshotName}.png`
    link.click()

    return file
  }

  // Função que ajusta o zoom no plano antes da captura
  const _fitToPlanView = async (offset = 0.2) => {
    const boundingBox = model.boundingBox
    const center = new THREE.Vector3()
    boundingBox.getCenter(center)

    const size = new THREE.Vector3()
    boundingBox.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)

    const sidebarWidth = 0
    const viewportWidth = window.innerWidth - sidebarWidth
    const scaleFactor = viewportWidth / window.innerWidth

    const box = new THREE.Box3(
      new THREE.Vector3(-maxDim, -maxDim, -maxDim),
      new THREE.Vector3(maxDim, maxDim, maxDim),
    )
    const sceneSize = new THREE.Vector3()
    box.getSize(sceneSize)
    const sceneCenter = new THREE.Vector3()
    box.getCenter(sceneCenter)

    // Calculate offset for centering considering sidebar width
    const xOffset = (sidebarWidth / window.innerWidth) * sceneSize.x
    sceneCenter.x += xOffset / 2.0 // Shift center to compensate for sidebar

    const radius = Math.max(sceneSize.x, sceneSize.y, sceneSize.z) * offset * scaleFactor
    const sphere = new THREE.Sphere(sceneCenter, radius)

    const controls = world.camera.controls as any

    if (typeof controls?.fitToSphere !== 'function') {
      console.warn('Camera controls do not support fitToSphere')
      return
    }

    await controls.fitToSphere(sphere, false)

    // Garante que a câmera está olhando para o modelo
    world.camera.three.lookAt(sceneCenter)
  }

  function _setupBoundingBox(modelToFit: FragmentsGroup) {
    const fragmentBox = components.get(OBC.BoundingBoxer)

    if (modelToFit) {
      fragmentBox.add(modelToFit)

      // Obter o mesh da caixa delimitadora
      const bboxMesh = fragmentBox.getMesh()

      // Garantir que a bounding box seja computada corretamente
      bboxMesh.geometry.computeBoundingBox()
      const boundingBox = bboxMesh.geometry.boundingBox

      if (!boundingBox) {
        return
      }

      // Calcular o centro e o tamanho da caixa delimitadora
      const center = new THREE.Vector3()
      boundingBox.getCenter(center)

      const size = new THREE.Vector3()
      boundingBox.getSize(size)

      modelToFit.boundingBox = boundingBox

      // Calcular a distância ideal da câmera para enquadrar o modelo
      // @ts-expect-error the field will be generated during runtime
      const fov = world.camera.three.fov * (Math.PI / 180) // Converter FOV para radianos
      const maxDim = Math.max(size.x, size.y, size.z)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))

      cameraZ *= 1.1 // Fator de segurança

      // Definir a posição da câmera e direcioná-la ao centro do modelo
      world.camera.three.position.set(center.x, center.y, cameraZ)
      world.camera.three.lookAt(center)

      // Ajustar os controles da câmera
      if (world.camera.controls) {
        // @ts-expect-error the field will be generated during runtime
        world.camera.controls.target = [center.x, center.y, center.z]
        // @ts-expect-error the field will be generated during runtime
        world.camera.controls.position = [center.x, center.y, cameraZ]
      }

      fragmentBox.reset() // Limpar o BoundingBoxer após o uso
    }
  }

  function _getWorld() {
    return components.get(OBC.Worlds)
  }

  function _getGrids() {
    return components.get(OBC.Grids)
  }

  function dispose() {
    world.camera.dispose()
  }

  return {
    getPlans: () => reactivePlansList,
    setupScene,
    setupFragments,
    loadIfcModel,
    loadIFCFile,
    saveFile,
    activatePlan,
    exitPlanView,
    isFileReady,
    dispose,
    captureScreenshot,
  }
}
