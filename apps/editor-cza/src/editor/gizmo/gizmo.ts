/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { SimpleWorld } from '@thatopen/components'

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

export function setupGizmo(world: SimpleWorld): () => void {
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

    return () => {
      disposeHighlighting()
      window.removeEventListener('resize', updateCanvasPosition)
    }
  } else {
    console.warn(
      'THREE.js world object, renderer, or camera not found. Cannot set up gizmo rendering or highlighting.',
    )
    return () => {}
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
        if (!intersect) {
          // safety fallback if somehow undefined, clear state and exit
          if (highlightedFaceIndex !== -1 && originalFaceMaterial) {
            ;(cube.material as THREE.Material[])[highlightedFaceIndex] = originalFaceMaterial
            highlightedFaceIndex = -1
            originalFaceMaterial = null
          }
          marker.visible = false
          faceState.isIntersecting = false
          faceState.faceIndex = -1
          renderer.render(scene, camera)
          return
        }

        const faceIndex = intersect.faceIndex ?? -1

        faceState.isIntersecting = true
        faceState.faceIndex = faceIndex

        if (faceIndex !== -1) {
          const materialIndex = Math.floor(faceIndex / 2)

          if (highlightedFaceIndex !== materialIndex) {
            if (highlightedFaceIndex !== -1 && originalFaceMaterial) {
              ;(cube.material as THREE.Material[])[highlightedFaceIndex] = originalFaceMaterial
            }

            highlightedFaceIndex = materialIndex
            // Ensure we never assign `undefined` to originalFaceMaterial (it must be Material | null)
            originalFaceMaterial = (cube.material as THREE.Material[])[materialIndex] ?? null
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
