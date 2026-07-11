/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as WEBIFC from 'web-ifc'
import * as THREE from 'three'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import { setupGizmo } from '@/editor/gizmo/gizmo.ts'
import type { FragmentsGroup } from '@thatopen/fragments'
import { ref } from 'vue'

export type ToggleableIfcEntity = 'IFCROOF' | 'IFCSLAB'

export interface ToggleableIfcElement {
  id: number
  entity: ToggleableIfcEntity
  name: string
}

export interface CaptureScreenshotOptions {
  hiddenElementIds?: number[]
}

const components = new OBC.Components()
const fragments = components.get(OBC.FragmentsManager)
const ifcLoader = components.get(OBC.IfcLoader)
const highlighter = components.get(OBCF.Highlighter)
let culler: OBC.MeshCullerRenderer

let world: OBC.SimpleWorld<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera,
  OBCF.PostproductionRenderer
> | null = null
let grid: OBC.SimpleGrid | null = null
let disposeGizmo: (() => void) | null = null
let isHighlighterSetup = false

export function useEditorModel() {
  let model: FragmentsGroup
  let modelName = ''
  const classifier = components.get(OBC.Classifier)
  const plans = components.get(OBCF.Plans)
  const reactivePlansList = ref<OBCF.PlanView[]>([])
  const toggleableElements = ref<ToggleableIfcElement[]>([])
  const isFileReady = ref(false)
  let debugBoxHelper: THREE.Box3Helper | null = null

  async function _setupWorld(container: HTMLElement) {
    if (!world) {
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
      disposeGizmo = setupGizmo(world)
    } else {
      // Re-attach existing renderer to the new modal's container
      if (!world.renderer) return
      const canvas = world.renderer.three.domElement
      if (canvas.parentElement !== container) {
        container.appendChild(canvas)

        const renderer = world.renderer as any
        if (renderer.container !== undefined) {
          renderer.container = container
        }

        // Force resize now and observe
        if (renderer.resize) renderer.resize()

        const ro = new ResizeObserver(() => {
          if (renderer.resize) renderer.resize()
        })
        ro.observe(container)
      }
    }
  }

  async function setupFragments() {
    await ifcLoader.setup()

    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
      WEBIFC.IFCSPACE,
      WEBIFC.IFCSITE,
      WEBIFC.IFCGRID,
      WEBIFC.IFCANNOTATION
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
          await refreshToggleableElements()

          isFileReady.value = true

          resolve(bufferArray)
        } catch (error) {
          console.error('Failed to load IFC file:', error)
          isFileReady.value = true
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

    if (!isHighlighterSetup) {
      highlighter.setup({ world })
      highlighter.zoomToSelection = true

      highlighter.events['select']?.onHighlight.add(async (selection) => {
        if (!model) return
        for (const fragId in selection) {
          const itemIds = selection[fragId]
          if (!itemIds) continue
          for (const id of itemIds) {
            try {
              const entityName = await OBC.IfcPropertiesUtils.getEntityName(model, id)
              const props = await model.getProperties(id)
              const entityType = props && props.type ? OBC.IfcCategoryMap[props.type] || 'UnknownType' : 'UnknownType'

              if (entityName && entityName.name) {
                console.log(`[Click] Element: ${entityName.name} (Type: ${entityType}, ExpressID: ${id})`)
              } else {
                console.log(`[Click] Element ExpressID: ${id} (Type: ${entityType}, No Name Found)`)
              }
            } catch (e) {
              console.warn(`[Click] Could not retrieve properties for ID ${id}`, e)
            }
          }
        }
      })

      isHighlighterSetup = true
    }

    if (model) {
      await _planManager()
      await _setupStyling()
      await refreshToggleableElements()
    }
  }

  function _cleanupScene() {
    if (model && world) {
      world.scene.three.remove(model)
      model.dispose()
    }
    toggleableElements.value = []
    plans?.dispose()
    //culler?.dispose()
    fragments?.dispose()
  }

  function setupGrid(world: OBC.SimpleWorld) {
    if (grid) return
    if (world && world.renderer) {
      const grids = _getGrids()
      grid = grids.create(world)

      grid.three.position.y -= 1.5
      grid.config.color.setHex(0x000000)

      // Cast to correct renderer type
      const renderer = world.renderer as any

      // Only access if postproduction exists
      if (renderer.postproduction?.customEffects?.excludedMeshes) {
        renderer.postproduction.customEffects.excludedMeshes.push(grid.three)
      }
    }
  }

  async function _planManager() {
    if (!world) return
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
    if (!world || !world.renderer) {
      return
    }

    world.renderer.postproduction.customEffects.minGloss = 0.1
    highlighter.backupColor = new THREE.Color('white')
    world.scene.three.background = new THREE.Color('white')
    const plansComponent = world.components.get(OBCF.Plans)
    plansComponent.goTo(plan.id)

    if (!debugBoxHelper && model?.boundingBox) {
      debugBoxHelper = new THREE.Box3Helper(model.boundingBox, new THREE.Color(0xff0000))
        ; (debugBoxHelper.material as THREE.LineBasicMaterial).depthTest = false
      world.scene.three.add(debugBoxHelper)
    }
    //culler.needsUpdate = true
  }

  const exitPlanView = () => {
    if (!world || !world.renderer) {
      return
    }
    world.renderer.postproduction.customEffects.minGloss = 0.0
    highlighter.backupColor = null
    highlighter.clear()
    classifier.resetColor(classifier.find({ models: [model.uuid] }))
    world.scene.three.background = new THREE.Color('white')
    const plansComponent = world.components.get(OBCF.Plans)
    plansComponent.exitPlanView()

    if (debugBoxHelper) {
      world.scene.three.remove(debugBoxHelper)
      debugBoxHelper.dispose()
      debugBoxHelper = null
    }
    //culler.needsUpdate = true
  }

  async function _setupStyling() {
    if (!world) return
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
    if (!edges.styles.list.base) {
      edges.styles.create('base', new Set(), world, baseLine, baseFill, baseOutline)
    } else {
      edges.styles.list.base.meshes.clear()
      edges.styles.list.base.fragments = {}
    }

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

    if (!edges.styles.list.thick) {
      edges.styles.create('thick', new Set(), world, blackLine, grayFill, blackOutline)
    } else {
      edges.styles.list.thick.meshes.clear()
      edges.styles.list.thick.fragments = {}
    }

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

    if (!edges.styles.list.thin) {
      edges.styles.create('thin', new Set(), world)
    } else {
      edges.styles.list.thin.meshes.clear()
      edges.styles.list.thin.fragments = {}
    }

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

  function setElementsVisibility(ids: number[], visible: boolean) {
    if (!model) return
    const hider = components.get(OBC.Hider)
    const items = model.getFragmentMap(ids)
    if (items) {
      hider.set(visible, items)
    }
  }

  async function refreshToggleableElements() {
    if (!model) {
      toggleableElements.value = []
      return
    }

    const elements: ToggleableIfcElement[] = []

    for (const entity of ['IFCROOF', 'IFCSLAB'] as ToggleableIfcEntity[]) {
      const entityMap = classifier.find({ entities: [entity] })
      const ids = new Set<number>()

      for (const fragID in entityMap) {
        const expressIDs = entityMap[fragID]
        if (!expressIDs) continue

        for (const expressID of expressIDs) {
          ids.add(expressID)
        }
      }

      for (const id of ids) {
        const properties = await model.getProperties(id)
        const rawName = properties?.Name?.value ?? properties?.Name
        const rawGlobalId = properties?.GlobalId?.value ?? properties?.GlobalId
        const name = String(rawName || rawGlobalId || `${entity} #${id}`)

        elements.push({ id, entity, name })
      }
    }

    toggleableElements.value = elements.sort((a, b) => {
      if (a.entity !== b.entity) return a.entity.localeCompare(b.entity)
      return a.name.localeCompare(b.name, undefined, { numeric: true })
    })
  }

  const captureScreenshot = async (
    container: HTMLElement,
    fileName: string,
    options: CaptureScreenshotOptions = {},
  ) => {
    if (!world || !world.renderer || !container) return

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

    const hiddenElementIds = options.hiddenElementIds ?? []
    const hiddenItems = hiddenElementIds.length ? model.getFragmentMap(hiddenElementIds) : null
    const hider = components.get(OBC.Hider)

    // Hide the grid before capturing
    if (grid) grid.visible = false

    const originalMaterials = new Map<any, any>()

    try {
      if (hiddenItems) {
        hider.set(false, hiddenItems)
      }

      // Set transparent background
      world.renderer.three.setClearColor(0x000000, 0)
      world.scene.three.background = null

      const entityColors: Record<string, number> = {
        IFCSLAB: 0xffffff,
        IFCWALL: 0x373737,
        IFCWALLSTANDARDCASE: 0x373737,
        IFCCOLUMN: 0xeeeeee,
        IFCBEAM: 0xeeeeee,
        IFCSTAIR: 0xeeeeee,
      }

      for (const [entity, colorHex] of Object.entries(entityColors)) {
        const structureItems = classifier.find({ entities: [entity] })

        for (const fragID in structureItems) {
          const foundFrag = fragments.list.get(fragID)
          if (foundFrag && 'mesh' in foundFrag) {
            const mesh = foundFrag.mesh
            if (!originalMaterials.has(mesh)) {
              originalMaterials.set(mesh, mesh.material)
            }

            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(m => {
                const newMat = m.clone()
                if ('color' in newMat) {
                  (newMat as any).color.set(colorHex)
                }
                return newMat
              })
            } else if (mesh.material) {
              const newMat = (mesh.material as any).clone()
              if ('color' in newMat) newMat.color.set(colorHex)
              mesh.material = newMat
            }
          }
        }
      }

      // Use the screen aspect ratio so the final image is landscape,
      // but perfectly centered around the building
      const bbox = model.boundingBox
      const size = new THREE.Vector3()
      bbox.getSize(size)

      const aspect = originalSize.x / originalSize.y
      let trueAspect = aspect
      if (!aspect || !isFinite(aspect) || aspect === 0) trueAspect = 1

      const MAX_RES = 4000
      let width, height
      if (trueAspect > 1) {
        width = MAX_RES
        height = Math.floor(MAX_RES / trueAspect)
      } else {
        height = MAX_RES
        width = Math.floor(MAX_RES * trueAspect)
      }

      const camera = world.camera.three as any
      const isOrtho = camera.isOrthographicCamera
      let origLeft, origRight, origTop, origBottom, origZoom, origAspect

      if (isOrtho) {
        origLeft = camera.left
        origRight = camera.right
        origTop = camera.top
        origBottom = camera.bottom
        origZoom = camera.zoom
      } else {
        origAspect = camera.aspect
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }

      await _fitToPlanView(0.2, true)

      // Wait exactly one animation frame to ensure the scene has settled
      await new Promise(resolve => requestAnimationFrame(resolve))

      // Tighten the ortho frustum exactly to the model bounds so every
      // permutation of the same house gets an identical, minimal framing
      if (isOrtho) {
        _tightenOrthoFrustum(width / height)
      }

      // Use a RenderTarget to capture high-res without resizing the DOM canvas
      const renderTarget = new THREE.WebGLRenderTarget(width, height, { samples: 4 })
      world.renderer.three.setRenderTarget(renderTarget)
      world.renderer.three.setPixelRatio(1)
      world.renderer.three.setViewport(0, 0, width, height)

      // Render the scene into the render target
      world.renderer.three.render(world.scene.three, world.camera.three)

      // Read pixels back
      const buffer = new Uint8Array(width * height * 4)
      world.renderer.three.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer)
      world.renderer.three.setRenderTarget(null)
      renderTarget.dispose()

      // Restore camera aspect ratio
      if (isOrtho) {
        camera.left = origLeft
        camera.right = origRight
        camera.top = origTop
        camera.bottom = origBottom
        camera.zoom = origZoom
        camera.updateProjectionMatrix()
      } else if (origAspect) {
        camera.aspect = origAspect
        camera.updateProjectionMatrix()
      }

      // We must re-fit to the original screen aspect ratio so the UI viewer isn't broken
      await _fitToPlanView()

      // Flip pixels vertically (WebGL is bottom-to-top)
      const flippedBuffer = new Uint8ClampedArray(width * height * 4)
      for (let row = 0; row < height; row++) {
        const srcRow = row * width * 4
        const destRow = (height - 1 - row) * width * 4
        flippedBuffer.set(buffer.subarray(srcRow, srcRow + width * 4), destRow)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      const imgData = new ImageData(flippedBuffer, width, height)
      ctx.putImageData(imgData, 0, 0)

      const screenshot = canvas.toDataURL('image/png')

      // Converts to a base64 file for upload
      const blob = await (await fetch(screenshot)).blob()
      const file = new File([blob], `${fileName.split('.')[0]}.png`)

      // Download the image
      const link = document.createElement('a')
      link.href = screenshot
      const screenshotName = fileName.split('.')[0]
      link.download = `${screenshotName}.png`
      link.click()

      return file
    } finally {
      // Restore original structural materials
      originalMaterials.forEach((originalMat, mesh) => {
        mesh.material = originalMat
      })

      // Restore original renderer settings
      world.renderer.three.setClearColor(originalClearColor, originalAlpha)
      world.renderer.three.setPixelRatio(originalPixelRatio)
      world.renderer.three.setSize(originalSize.x, originalSize.y, false)

      if (hiddenItems) {
        hider.set(true, hiddenItems)
      }

      // Restore original background
      world.scene.three.background = originalSceneBackground

      // Restore grid visibility
      if (grid) grid.visible = true
    }
  }
  // Ajusta o frustum ortográfico exatamente aos limites do modelo, mantendo o
  // aspecto da imagem — o enquadramento depende só da bounding box, então todas
  // as permutações da mesma casa saem alinhadas pixel a pixel
  const _tightenOrthoFrustum = (renderAspect: number, margin = 0.03) => {
    if (!world) return
    const camera = world.camera.three as any
    if (!camera.isOrthographicCamera) return

    camera.updateMatrixWorld(true)
    const toCameraSpace = new THREE.Matrix4().copy(camera.matrixWorld).invert()
    const bbox = model.boundingBox

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const corner = new THREE.Vector3()
    for (let i = 0; i < 8; i++) {
      corner
        .set(
          i & 1 ? bbox.max.x : bbox.min.x,
          i & 2 ? bbox.max.y : bbox.min.y,
          i & 4 ? bbox.max.z : bbox.min.z,
        )
        .applyMatrix4(toCameraSpace)
      minX = Math.min(minX, corner.x)
      maxX = Math.max(maxX, corner.x)
      minY = Math.min(minY, corner.y)
      maxY = Math.max(maxY, corner.y)
    }

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    let halfWidth = ((maxX - minX) / 2) * (1 + margin)
    let halfHeight = ((maxY - minY) / 2) * (1 + margin)

    // Expand the smaller dimension to match the output aspect ratio
    if (halfWidth / halfHeight > renderAspect) {
      halfHeight = halfWidth / renderAspect
    } else {
      halfWidth = halfHeight * renderAspect
    }

    camera.left = centerX - halfWidth
    camera.right = centerX + halfWidth
    camera.top = centerY + halfHeight
    camera.bottom = centerY - halfHeight
    camera.zoom = 1
    camera.updateProjectionMatrix()
  }

  // Função que ajusta o zoom no plano antes da captura
  const _fitToPlanView = async (offset = 0.2, isCapture = false) => {
    if (!world) return
    const boundingBox = model.boundingBox
    const sceneCenter = new THREE.Vector3()
    boundingBox.getCenter(sceneCenter)

    const size = new THREE.Vector3()
    boundingBox.getSize(size)

    const sidebarWidth = isCapture ? 0 : (document.getElementById('menuLateral')?.offsetWidth || 0)
    const viewportWidth = isCapture ? window.innerWidth : (window.innerWidth - sidebarWidth)
    const scaleFactor = isCapture ? 1 : (viewportWidth / window.innerWidth)

    // Calculate offset for centering considering sidebar width
    const xOffset = isCapture ? 0 : ((sidebarWidth / window.innerWidth) * size.x)
    sceneCenter.x += xOffset / 2.0 // Shift center to compensate for sidebar

    // Sphere that encloses the model's actual bounding box, centered on the model
    const radius = (size.length() / 2) * (1 + offset) * scaleFactor
    const sphere = new THREE.Sphere(sceneCenter, radius)

    const controls = world.camera.controls as any

    if (typeof controls?.fitToSphere !== 'function') {
      console.warn('Camera controls do not support fitToSphere')
      return
    }

    await controls.fitToSphere(sphere, false)

  }

  function _setupBoundingBox(modelToFit: FragmentsGroup) {
    if (!world) return
    const fragmentBox = components.get(OBC.BoundingBoxer)

    if (modelToFit) {
      fragmentBox.reset()

      // Force classification so we can filter by architectural categories
      const classifier = components.get(OBC.Classifier)
      classifier.byModel(modelToFit.uuid, modelToFit)
      classifier.byEntity(modelToFit)

      // Only include physical building elements in the bounding box calculation
      const coreEntities = [
        'IFCWALL', 'IFCWALLSTANDARDCASE', 'IFCSLAB', 'IFCCOLUMN',
        'IFCBEAM', 'IFCROOF', 'IFCWINDOW', 'IFCDOOR', 'IFCSTAIR',
        'IFCRAILING', 'IFCFOOTING', 'IFCPLATE', 'IFCMEMBER', 'IFCCOVERING'
      ]

      const coreItems = classifier.find({ entities: coreEntities })
      let hasCoreItems = false
      for (const fragId in coreItems) {
        if ((coreItems[fragId]?.size || 0) > 0) hasCoreItems = true
      }

      if (hasCoreItems) {
        // Add only the core architectural elements to the bounding box
        try {
          fragmentBox.addFragmentIdMap(coreItems)
        } catch (e) {
          console.warn('Fallback to model bounding box', e)
          fragmentBox.add(modelToFit)
        }
      } else {
        // Fallback if the model has no standard architectural elements
        fragmentBox.add(modelToFit)
      }

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
      const camera = world.camera.three as any
      const fov = (camera.fov || 60) * (Math.PI / 180) // Converter FOV para radianos
      const maxDim = Math.max(size.x, size.y, size.z)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))

      cameraZ *= 1.1 // Fator de segurança

      // Definir a posição da câmera e direcioná-la ao centro do modelo
      world.camera.three.position.set(center.x, center.y, cameraZ)
      world.camera.three.lookAt(center)

      // Ajustar os controles da câmera
      if (world.camera.controls) {
        const controls = world.camera.controls as any
        if (typeof controls.setLookAt === 'function') {
          controls.setLookAt(center.x, center.y, cameraZ, center.x, center.y, center.z, false)
        }
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
    _cleanupScene()

    if (world && world.renderer && world.renderer.three.domElement.parentElement) {
      world.renderer.three.domElement.parentElement.removeChild(world.renderer.three.domElement)
    }

    isFileReady.value = false
    reactivePlansList.value = []
    toggleableElements.value = []
  }

  async function toggleProjection(isOrtho: boolean) {
    if (!world) return
    if (world.camera) {
      const projection = isOrtho ? 'Orthographic' : 'Perspective'
      world.camera.projection.set(projection)

      if (isOrtho && model && model.boundingBox) {
        // Move camera to top-down view
        const center = new THREE.Vector3()
        model.boundingBox.getCenter(center)

        const size = new THREE.Vector3()
        model.boundingBox.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)

        world.camera.three.position.set(center.x, center.y + maxDim, center.z)
        await world.camera.controls.setLookAt(
          center.x, center.y + maxDim, center.z, // position
          center.x, center.y, center.z,          // target
          true                                   // smooth
        )
        await _fitToPlanView(0.2, false)
      } else if (!isOrtho) {
        await resetCamera()
      }
    }
  }

  async function fitToScreen() {
    await _fitToPlanView(0.2, false)
  }

  async function resetCamera() {
    if (!world) return
    await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, true)
  }

  async function calculateModelArea(visibleOnly = false): Promise<number> {
    if (!model) return 0

    // --- Approach 1: Bounding Box (Fallback) ---
    const size = new THREE.Vector3()
    if (model.boundingBox) {
      model.boundingBox.getSize(size)
    }
    const bboxArea = parseFloat((size.x * size.z).toFixed(2))

    console.log("--- Calculating Area Alternatives ---")
    console.log(`[Method Bbox] Bounding Box Footprint (X*Z): ${bboxArea} m²`)

    // --- Approach 2: IFC Embedded Quantities ---
    let totalIfcArea = 0
    try {
      const qsets = await model.getAllPropertiesOfType(WEBIFC.IFCELEMENTQUANTITY)
      if (qsets) {
        for (const qsetId in qsets) {
          const qset = qsets[qsetId]
          if (qset && qset.Quantities) {
            for (const q of qset.Quantities) {
              if (q.value) {
                const quantity = await model.getProperties(q.value)
                if (quantity && quantity.type === WEBIFC.IFCQUANTITYAREA) {
                  const areaValueKey = Object.keys(quantity).find(k => k.endsWith('Value'))
                  if (areaValueKey && quantity[areaValueKey] !== undefined) {
                    totalIfcArea += quantity[areaValueKey].value
                  }
                }
              }
            }
          }
        }
      }
      console.log(`[Method Embedded] IFC Embedded Quantities Area: ${totalIfcArea.toFixed(2)} m²`)
    } catch (e) {
      console.warn("Could not get IFC embedded area:", e)
    }

    // --- Approach 3: Mesh Top Surface Area of Slabs (Primary) ---
    let totalSlabArea = 0
    try {
      const slabs = await model.getAllPropertiesOfType(WEBIFC.IFCSLAB)
      if (slabs) {
        const slabIds = Object.keys(slabs).map(Number)

        const p1 = new THREE.Vector3()
        const p2 = new THREE.Vector3()
        const p3 = new THREE.Vector3()
        const tempMatrix = new THREE.Matrix4()
        const cb = new THREE.Vector3()
        const ab = new THREE.Vector3()

        for (const frag of model.items) {
          const mesh = frag.mesh
          const pos = mesh.geometry.attributes.position?.array
          const index = mesh.geometry.index

          if (!index || !pos) continue

          const fragmentSlabIds = Array.from(frag.ids as Iterable<number>).filter(id => slabIds.includes(id))

          for (const id of fragmentSlabIds) {
            if (visibleOnly && frag.hiddenItems && frag.hiddenItems.has(id)) {
              continue
            }
            
            const instances = frag.getInstancesIDs(id)
            if (!instances) continue

            for (const instance of instances) {
              mesh.getMatrixAt(instance, tempMatrix)

              for (let i = 0; i < index.array.length; i += 3) {
                const i1 = index.array[i]! * 3
                const i2 = index.array[i + 1]! * 3
                const i3 = index.array[i + 2]! * 3

                p1.set(pos[i1]!, pos[i1 + 1]!, pos[i1 + 2]!).applyMatrix4(tempMatrix)
                p2.set(pos[i2]!, pos[i2 + 1]!, pos[i2 + 2]!).applyMatrix4(tempMatrix)
                p3.set(pos[i3]!, pos[i3 + 1]!, pos[i3 + 2]!).applyMatrix4(tempMatrix)

                cb.subVectors(p3, p2)
                ab.subVectors(p1, p2)
                cb.cross(ab)

                const area = cb.length() / 2.0
                cb.normalize()

                // If normal points mostly up (Y axis) and is mostly on the ground, add the area
                if (cb.y > 0.9 && p1.y < 0.1) {
                  totalSlabArea += area
                }
              }
            }
          }
        }
      }
      console.log(`[Method Slabs] Mesh Top Surface Area (IfcSlab): ${totalSlabArea.toFixed(2)} m²`)
    } catch (e) {
      console.warn("Could not get surface area:", e)
    }

    const finalSlabArea = parseFloat(totalSlabArea.toFixed(2))
    return finalSlabArea > 0 ? finalSlabArea : bboxArea
  }

  return {
    getPlans: () => reactivePlansList,
    getToggleableElements: () => toggleableElements,
    setElementsVisibility,
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
    toggleProjection,
    fitToScreen,
    resetCamera,
    calculateModelArea,
  }
}
