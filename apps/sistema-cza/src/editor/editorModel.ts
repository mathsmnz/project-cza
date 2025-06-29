/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as WEBIFC from 'web-ifc'
import * as THREE from 'three'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import type { FragmentsGroup } from '@thatopen/fragments'
import { ref } from 'vue'

const components = new OBC.Components()
const fragments = components.get(OBC.FragmentsManager)
const fragmentIfcLoader = components.get(OBC.IfcLoader)
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
    _setupGizmo()
  }

  // Declare variables to store the current viewport bounds in canvas top-left coordinates
  let currentViewportLeft_tl = 0 // tl = top-left
  let currentViewportTop_tl = 0
  let currentViewportRight_tl = 0
  let currentViewportBottom_tl = 0

  // Also store the canvas offset for mouse calculations
  let currentCanvasLeft = 0
  let currentCanvasTop = 0

  type FaceState = {
    isIntersecting: boolean
    faceIndex: number
  }

  const faceState = {
    isIntersecting: false,
    faceIndex: -1,
  }

  function _setupGizmoClickAlign(
    renderer: THREE.WebGLRenderer,
    controls: any,
    faceState: FaceState,
  ): () => void {
    const domElement = renderer.domElement

    const faceDirections: Record<number, THREE.Vector3> = {
      0: new THREE.Vector3(1, 0, 0), // RIGHT
      1: new THREE.Vector3(-1, 0, 0), // LEFT
      2: new THREE.Vector3(0, 1, 0), // TOP
      3: new THREE.Vector3(0, -1, 0), // BOTTOM
      4: new THREE.Vector3(0, 0, 1), // FRONT
      5: new THREE.Vector3(0, 0, -1), // BACK
    }

    const onClick = () => {
      if (!faceState.isIntersecting || faceState.faceIndex === null) return

      console.log(faceState)

      const materialIndex = Math.floor(faceState.faceIndex / 2)
      const dir = faceDirections[materialIndex]
      if (!dir) return

      // Get current camera position and target
      const currentPosition = new THREE.Vector3()
      const currentTarget = new THREE.Vector3()
      controls.getPosition(currentPosition)
      controls.getTarget(currentTarget)

      // Compute distance from current camera to target
      const distance = currentPosition.distanceTo(currentTarget)

      // New camera position: move in the face direction from target
      const newPosition = dir.clone().normalize().multiplyScalar(distance).add(currentTarget)

      // Smooth transition to new position
      controls.setLookAt(
        newPosition.x,
        newPosition.y,
        newPosition.z,
        currentTarget.x,
        currentTarget.y,
        currentTarget.z,
        true, // smooth transition
      )
    }

    domElement.addEventListener('click', onClick)

    return () => {
      domElement.removeEventListener('click', onClick)
      console.log('Gizmo face click-to-align removed')
    }
  }

  // The highlighting function, adjusted to use the dynamic viewport bounds in canvas top-left coords
  function _setupGizmoHighlighting(
    cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial[]>,
    camera: THREE.OrthographicCamera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    controls: any,
  ): () => void {
    const raycaster = new THREE.Raycaster()
    raycaster.params.Mesh.threshold = 0.1

    const mouse = new THREE.Vector2()

    console.log(controls)

    const removeClickAlign = _setupGizmoClickAlign(renderer, controls, faceState)

    let highlightedFaceIndex: number = -1
    let originalFaceMaterial: THREE.Material | null = null

    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.7,
    })

    // Marker sphere to visualize hit
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    )
    marker.visible = false
    scene.add(marker)

    const domElement = renderer.domElement

    const onMouseMove = (event: MouseEvent) => {
      const mouseCanvasX = event.clientX - currentCanvasLeft
      const mouseCanvasY = event.clientY - currentCanvasTop

      if (
        mouseCanvasX >= currentViewportLeft_tl &&
        mouseCanvasX < currentViewportRight_tl &&
        mouseCanvasY >= currentViewportTop_tl &&
        mouseCanvasY < currentViewportBottom_tl
      ) {
        const mouseViewportX = mouseCanvasX - currentViewportLeft_tl
        const mouseViewportY = mouseCanvasY - currentViewportTop_tl

        const viewportWidth = currentViewportRight_tl - currentViewportLeft_tl
        const viewportHeight = currentViewportBottom_tl - currentViewportTop_tl

        mouse.x = (mouseViewportX / viewportWidth) * 2 - 1
        mouse.y = -(mouseViewportY / viewportHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(cube, false)

        if (intersects.length > 0) {
          const intersect = intersects[0]
          const faceIndex = intersect.faceIndex ?? -1

          faceState.isIntersecting = true
          // @ts-expect-error the field will be generated during runtime
          faceState.faceIndex = intersects[0].faceIndex

          if (faceIndex !== -1) {
            const materialIndex = Math.floor(faceIndex / 2)

            if (highlightedFaceIndex !== materialIndex) {
              if (highlightedFaceIndex !== -1 && originalFaceMaterial) {
                ;(cube.material as THREE.Material[])[highlightedFaceIndex] = originalFaceMaterial
              }

              highlightedFaceIndex = materialIndex
              originalFaceMaterial = (cube.material as THREE.Material[])[materialIndex]
              ;(cube.material as THREE.Material[])[materialIndex] = highlightMaterial
            }

            // Move and show marker
            marker.position.copy(intersect.point)
            marker.visible = true
            renderer.render(scene, camera)
          }
        } else {
          console.log('outside the viewport')

          // No intersection
          if (highlightedFaceIndex !== -1 && originalFaceMaterial) {
            ;(cube.material as THREE.Material[])[highlightedFaceIndex] = originalFaceMaterial
            highlightedFaceIndex = -1
            originalFaceMaterial = null
            faceState.isIntersecting = false
            faceState.faceIndex = -1
          }

          marker.visible = false
          renderer.render(scene, camera)
        }
      } else {
        // Outside viewport
        if (highlightedFaceIndex !== -1 && originalFaceMaterial) {
          ;(cube.material as THREE.Material[])[highlightedFaceIndex] = originalFaceMaterial
          highlightedFaceIndex = -1
          originalFaceMaterial = null
        }

        marker.visible = false
        renderer.render(scene, camera)
      }
    }

    domElement.addEventListener('mousemove', onMouseMove)

    return () => {
      domElement.removeEventListener('mousemove', onMouseMove)
      if (highlightedFaceIndex !== -1 && originalFaceMaterial) {
        ;(cube.material as THREE.Material[])[highlightedFaceIndex] = originalFaceMaterial
      }
      scene.remove(marker)
      console.log('Gizmo highlighting event listener removed.')
    }
  }

  function _setupGizmo() {
    const overlayScene = new THREE.Scene()
    const overlayCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    overlayCam.position.z = 3

    // === Cube with Labeled Sides ===
    function createLabelTexture(text: string, color: string, bg: string, scL: number) {
      const size = scL
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      ctx.fillStyle = color
      ctx.font = '44px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, size / 2, size / 2 + 5)

      const texture = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearFilter
      return new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    }

    const materials = [
      createLabelTexture('DIREITA', '#000', '#eee', 256), // right
      createLabelTexture('ESQUERDA', '#000', '#eee', 280), // left
      createLabelTexture('CIMA', '#000', '#eee', 256), // top
      createLabelTexture('BAIXO', '#000', '#eee', 256), // bottom
      createLabelTexture('FRENTE', '#000', '#eee', 256), // front
      createLabelTexture('TRÁS', '#000', '#eee', 256), // back
    ]

    const cubeSize = 2
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
    const cube = new THREE.Mesh(geometry, materials)
    cube.name = 'GizmoCube'
    overlayScene.add(cube)

    const edgesGeo = new THREE.EdgesGeometry(geometry)
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x888888,
      linewidth: 1,
    })

    const cubeEdges = new THREE.LineSegments(edgesGeo, edgeMat)
    cubeEdges.name = 'GizmoCubeEdges'
    cube.add(cubeEdges)

    // === Lighting ===
    const light = new THREE.DirectionalLight(0xffffff, 1.5)
    light.position.set(1, 1, 2)
    overlayScene.add(light)
    overlayScene.add(new THREE.AmbientLight(0xffffff, 0.5))

    // Define the vertex where the axes will originate
    const halfSize = cubeSize / 2
    const startVertex = new THREE.Vector3(-halfSize, -halfSize, -halfSize)

    // Define the length of the axes
    const axisLength = 3

    // Function to create axis lines
    function createAxisLine(
      color: string,
      start: THREE.Vector3,
      end: THREE.Vector3,
      parentObject: THREE.Object3D,
    ) {
      const axisMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 10 })
      const points = [start, end]
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const axisLine = new THREE.Line(lineGeometry, axisMaterial)
      axisLine.name = `AxisLine_${color}`
      parentObject.add(axisLine)
    }

    createAxisLine(
      'red',
      startVertex,
      new THREE.Vector3(startVertex.x + axisLength, startVertex.y, startVertex.z),
      cube,
    )
    createAxisLine(
      'green',
      startVertex,
      new THREE.Vector3(startVertex.x, startVertex.y + axisLength, startVertex.z),
      cube,
    )
    createAxisLine(
      'blue',
      startVertex,
      new THREE.Vector3(startVertex.x, startVertex.y, startVertex.z + axisLength),
      cube,
    )

    // === Axis Labels ===
    const createAxisLabel = (text: string, color: string) => {
      const size = 128
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = color
      ctx.font = 'bold 72px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, size / 2, size / 2 + 5)

      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ map: texture, depthTest: false })
      material.transparent = true
      material.opacity = 1.0
      const label = new THREE.Sprite(material)
      label.name = `AxisLabel_${text}`
      return label
    }

    const labelOffsetFromVertex = axisLength + 0.5
    const xLabel = createAxisLabel('X', 'red')
    const yLabel = createAxisLabel('Y', 'green')
    const zLabel = createAxisLabel('Z', 'blue')

    xLabel.position.set(startVertex.x + labelOffsetFromVertex, startVertex.y, startVertex.z)
    yLabel.position.set(startVertex.x, startVertex.y + labelOffsetFromVertex, startVertex.z)
    zLabel.position.set(startVertex.x, startVertex.y, startVertex.z + labelOffsetFromVertex)

    cube.add(xLabel, yLabel, zLabel)

    // === Arrowheads ===
    const createArrowHead = (dir: THREE.Vector3, color: string) => {
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.3, 8),
        new THREE.MeshBasicMaterial({ color }),
      )

      const endOfAxis = startVertex.clone().add(dir.clone().multiplyScalar(axisLength))
      arrow.position.copy(endOfAxis)

      const coneDefaultDir = new THREE.Vector3(0, 1, 0)
      arrow.quaternion.setFromUnitVectors(coneDefaultDir, dir.clone().normalize())
      arrow.name = `ArrowHead_${color}`
      return arrow
    }

    cube.add(
      createArrowHead(new THREE.Vector3(1, 0, 0), 'red'),
      createArrowHead(new THREE.Vector3(0, 1, 0), 'green'),
      createArrowHead(new THREE.Vector3(0, 0, 1), 'blue'),
    )

    // === Render Overlay ===
    if (typeof world !== 'undefined' && world.renderer && world.camera && world.renderer.three) {
      // Call the highlighting setup function
      const disposeHighlighting = _setupGizmoHighlighting(
        cube,
        overlayCam,
        world.renderer.three,
        overlayScene,
        world.camera.controls,
      )

      // Store canvas position initially
      const domElement = world.renderer.three.domElement
      const rect = domElement.getBoundingClientRect()
      currentCanvasLeft = rect.left
      currentCanvasTop = rect.top

      // Add a resize listener to update canvas position if the window/layout changes
      const updateCanvasPosition = () => {
        const rect = domElement.getBoundingClientRect()
        currentCanvasLeft = rect.left
        currentCanvasTop = rect.top
        // You might also need to trigger a render or update if the viewport calculation depends on canvas size
      }
      window.addEventListener('resize', updateCanvasPosition)

      world.renderer.onAfterUpdate.add(() => {
        // @ts-expect-error the field will be generated during runtime
        const renderer = world.renderer.three

        // Get canvas size in CSS pixels (not multiplied by pixel ratio)
        const canvasSize = renderer.getSize(new THREE.Vector2())
        const pixelRatio = renderer.getPixelRatio()

        // Use proportions of canvas width or height
        const relativeGizmoScale = 0.3 // 20% of canvas height (adjust as needed)
        const relativeMargin = 0.05 // 5% of canvas height

        // Final gizmo size and margin in *screen pixels* (not multiplied by pixel ratio)
        const size = canvasSize.y * relativeGizmoScale
        const margin = canvasSize.y * relativeMargin

        //console.log({ canvasSize, pixelRatio, size, margin })

        // === Calculate and Store the current viewport bounds in canvas top-left coordinates ===
        const viewportLeft_bl = canvasSize.x - size - margin // Left edge in THREE.js (lower-left)
        const viewportBottom_bl = canvasSize.y - size - margin // Bottom edge in THREE.js (lower-left)
        const viewportRight_bl = canvasSize.x - margin // Right edge in THREE.js (lower-left)
        const viewportTop_bl = canvasSize.y - margin // Top edge in THREE.js (lower-left)

        currentViewportLeft_tl = viewportLeft_bl // X is the same
        currentViewportRight_tl = viewportRight_bl // X is the same
        currentViewportTop_tl = canvasSize.y - viewportTop_bl // Convert Y top edge to canvas top-left
        currentViewportBottom_tl = canvasSize.y - viewportBottom_bl // Convert Y bottom edge to canvas top-left

        // Sync orientation
        const cameraQuat = world.camera.three.getWorldQuaternion(new THREE.Quaternion())
        cube.quaternion.copy(cameraQuat).invert() // Correct if cube should face the camera

        renderer.autoClear = false
        renderer.clearDepth()
        renderer.setScissorTest(true)

        // Use the lower-left origin for setViewport and setScissor
        renderer.setViewport(viewportLeft_bl, viewportBottom_bl, size, size)
        renderer.setScissor(viewportLeft_bl, viewportBottom_bl, size, size)

        const viewSize = Math.max(cubeSize, startVertex.length() + labelOffsetFromVertex) * 0.8
        overlayCam.left = -viewSize
        overlayCam.right = viewSize
        overlayCam.top = viewSize
        overlayCam.bottom = -viewSize
        overlayCam.updateProjectionMatrix()

        overlayCam.position.set(0, 0, 3)

        renderer.render(overlayScene, overlayCam)

        renderer.setScissorTest(false)
        renderer.setViewport(0, 0, canvasSize.x, canvasSize.y)
        renderer.autoClear = true
      })
    } else {
      console.warn(
        'THREE.js world object, renderer, or camera not found. Cannot set up gizmo rendering or highlighting.',
      )
    }
  }

  async function setupFragments() {
    await fragmentIfcLoader.setup()

    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
    ]

    for (const cat of excludedCats) {
      fragmentIfcLoader.settings.excludedCategories.add(cat)
    }

    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true
  }

  async function loadIfcModel(url: string) {
    const file = await fetch(url)
    const data = await file.arrayBuffer()
    const buffer = new Uint8Array(data)

    const loadedModel = await fragmentIfcLoader.load(buffer)
    loadedModel.name = url

    _setupBoundingBox(loadedModel)

    return loadedModel
  }

  // Load IFC model from file input
  async function loadIFCFile() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.ifc'

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement | null
      if (!target?.files?.[0]) {
        console.error('No file selected.')
        return
      }

      const file = target.files[0]

      try {
        isFileReady.value = false
        const buffer = new Uint8Array(await file.arrayBuffer())

        if (!world) {
          console.error('World is not initialized.')
          return
        }

        _cleanupScene()

        const loadedModel = await fragmentIfcLoader.load(buffer)
        loadedModel.name = file.name

        model = loadedModel
        modelName = file.name

        world.scene.three.add(model)
        await _setupBoundingBox(loadedModel)
        await _planManager()
        await _setupStyling()

        isFileReady.value = true
      } catch (error) {
        console.error('Failed to load IFC file:', error)
      }
    }

    fileInput.click()
  }

  // Save .frag and properties.json
  function saveFile() {
    if (!fragments.groups.size) return

    const group = Array.from(fragments.groups.values())[0]
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

    download(new Blob([data]), `${baseName}.frag`)
  }

  async function setupScene(selectedId: string, container: HTMLElement) {
    await _setupWorld(container)
    if (!world) return

    setupGrid(world)

    const url = `/ifcs/${selectedId}.ifc`
    model = await loadIfcModel(url)
    world.scene.three.add(model)
    modelName = selectedId

    highlighter.setup({ world })
    highlighter.zoomToSelection = true

    await _planManager()
    await _setupStyling()

    isFileReady.value = true
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
      edges.styles.list.base.fragments[fragID] = new Set(modelItems[fragID])
      edges.styles.list.base.meshes.add(mesh)
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
      edges.styles.list.thick.fragments[fragID] = new Set(thickItems[fragID])
      edges.styles.list.thick.meshes.add(mesh)
    }

    edges.styles.create('thin', new Set(), world)

    for (const fragID in thinItems) {
      const foundFrag = frag.list.get(fragID)
      if (!foundFrag) continue
      const { mesh } = foundFrag
      edges.styles.list.thin.fragments[fragID] = new Set(thinItems[fragID])
      edges.styles.list.thin.meshes.add(mesh)
    }

    await edges.update(true)
  }

  const captureScreenshot = async (container: HTMLElement) => {
    if (!world || !world.renderer || !container) return

    // Hide the grid before capturing
    if (grid) grid.visible = false

    let activePlan = plans.currentPlan
    if (!activePlan) {
      activePlan = plans.list[0]
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
    const scaleFactor = 2 // Change to 3 or 4 for even higher quality
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
    const screenshotName = modelName.split('.')[0]
    link.download = `${screenshotName}.png`
    link.click()
  }

  // Função que ajusta o zoom no plano antes da captura
  const _fitToPlanView = async (offset = 0.2) => {
    const boundingBox = model.boundingBox
    const center = new THREE.Vector3()
    boundingBox.getCenter(center)

    const size = new THREE.Vector3()
    boundingBox.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)

    const sidebarWidth = document.getElementById('menuLateral')?.offsetWidth || 0
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
    captureScreenshot,
  }
}
