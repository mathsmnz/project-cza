import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'

export const useRecommendationStore = defineStore('recommendation', () => {
  const projectsStore = useProjectsStore()

  // Seed Profile (User Inputs)
  const budgetLimit = ref<number>(0)
  const areaLimit = ref<number>(0)
  const residentsCount = ref<number>(2)
  const hasVehicle = ref<boolean>(false)
  const spaceFront = ref<boolean>(true)
  const spaceSide = ref<boolean>(true)
  const spaceBack = ref<boolean>(true)

  // Current Selections from Customization Engine
  // (We store the UUIDs of the currently active selections)
  const activeSelectionIds = ref<string[]>([])

  /**
   * Helper to retrieve the actual Selection objects based on IDs
   */
  const activeSelections = computed(() => {
    const allSelections = projectsStore.currentProjectCustomization?.selections || []
    return allSelections.filter((s: any) => activeSelectionIds.value.includes(s.id))
  })

  /**
   * Compute total cost (Base Cost + Sum of Active Selections)
   */
  const currentTotalCost = computed(() => {
    const baseCost = projectsStore.currentProject?.baseCost || 0
    const addOnCost = activeSelections.value.reduce((sum: number, s: any) => sum + (s.cost || 0), 0)
    return baseCost + addOnCost
  })

  /**
   * Compute total area (Base Area + Sum of Active Selections)
   */
  const currentTotalArea = computed(() => {
    const baseArea = projectsStore.currentProject?.baseArea || 0
    const addOnArea = activeSelections.value.reduce((sum: number, s: any) => sum + (s.area || 0), 0)
    return baseArea + addOnArea
  })

  /**
   * Check if adding a module would violate hard constraints.
   * Returns true if valid (allowed), false if invalid (blocked).
   */
  const isSelectionValid = (selectionId: string): { valid: boolean; reason?: string } => {
    // If it's already active, it's considered valid (or we evaluate the next state)
    // To evaluate an unselected option, we simulate adding it.
    const allSelections = projectsStore.currentProjectCustomization?.selections || []
    const selection = allSelections.find((s: any) => s.id === selectionId)

    if (!selection) return { valid: false, reason: 'Seleção não encontrada' }

    // Hard Constraint: Space
    if (selection.constraints?.requiresSpaceFront && !spaceFront.value) {
      return { valid: false, reason: 'Exige recuo frontal' }
    }
    if (selection.constraints?.requiresSpaceSide && !spaceSide.value) {
      return { valid: false, reason: 'Exige recuo lateral' }
    }
    if (selection.constraints?.requiresSpaceBack && !spaceBack.value) {
      return { valid: false, reason: 'Exige recuo no fundo' }
    }

    // Hard Constraint: Vehicle
    if (selection.constraints?.requiresVehicle && !hasVehicle.value) {
      return { valid: false, reason: 'Exige garagem' }
    }

    // Hard Constraint: Residents
    // Min Residents Count implies the family must have AT LEAST this many people to unlock this module
    if (selection.constraints?.minResidentsCount && residentsCount.value < selection.constraints.minResidentsCount) {
      return { valid: false, reason: `Exige família com ${selection.constraints.minResidentsCount}+ pessoas` }
    }

    // Math: Budget & Area
    // Simulate cost and area if this selection were added (only if not already active)
    const isAlreadyActive = activeSelectionIds.value.includes(selectionId)
    const projectedCost = currentTotalCost.value + (isAlreadyActive ? 0 : (selection.cost || 0))
    const projectedArea = currentTotalArea.value + (isAlreadyActive ? 0 : (selection.area || 0))

    // Note: The UI sets budgetLimit to the Max Budget of the project.
    if (budgetLimit.value > 0 && projectedCost > budgetLimit.value) {
      return { valid: false, reason: 'Ultrapassa o orçamento' }
    }

    if (areaLimit.value > 0 && projectedArea > areaLimit.value) {
      return { valid: false, reason: 'Ultrapassa a área máxima' }
    }

    return { valid: true }
  }

  return {
    // State
    budgetLimit,
    areaLimit,
    residentsCount,
    hasVehicle,
    spaceFront,
    spaceSide,
    spaceBack,
    activeSelectionIds,

    // Getters
    currentTotalCost,
    currentTotalArea,

    // Methods
    isSelectionValid
  }
})
