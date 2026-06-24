<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllTelemetry } from '@/api/axios.ts'
import type { TelemetryData } from '@/types/types.ts'
import { useToastStore } from '@/stores/toast.ts'

const telemetryEntries = ref<TelemetryData[]>([])
const isLoading = ref<boolean>(true)
const errorMessage = ref<string | null>(null)
const selectedEntry = ref<TelemetryData | null>(null)

const toastStore = useToastStore()

const fetchTelemetryData = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const currentEntryId = selectedEntry.value?.id
    const entries = await getAllTelemetry()

    telemetryEntries.value = entries.sort((a, b) => {
      return Date.parse(b.sessionStart) - Date.parse(a.sessionStart)
    })

    selectedEntry.value =
      telemetryEntries.value.find((entry) => entry.id === currentEntryId) ??
      telemetryEntries.value[0] ??
      null
  } catch (error) {
    console.error('Failed to load telemetry analytics:', error)
    telemetryEntries.value = []
    selectedEntry.value = null
    errorMessage.value = 'Não foi possível carregar os dados de telemetria.'
    toastStore.addToast('Falha ao carregar dados de telemetria.', 'error')
  } finally {
    isLoading.value = false
  }
}

const formatElapsedTime = (ms: number): string => {
  if (!ms) return 'N/A'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes} min ${seconds} seg`
}

const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date.toLocaleString('pt-BR')
}

const formatUserSuffix = (userId: string): string => {
  return userId.length > 6 ? `...${userId.slice(-6)}` : userId
}

const getGroupSelections = (entry: TelemetryData): Record<string, number> => {
  return entry.groupSelections ?? {}
}

const getComboSelections = (entry: TelemetryData): Record<string, number> => {
  return entry.comboSelections ?? {}
}

const getFinalSelection = (entry: TelemetryData): string[] => {
  return entry.finalSelection ?? []
}

const selectEntry = (entry: TelemetryData) => {
  selectedEntry.value = entry
}

onMounted(fetchTelemetryData)
</script>

<template>
  <div class="flex-grow">

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center p-12">
      <svg class="animate-spin mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <p class="mt-2 text-sm text-gray-500">Carregando dados de telemetria...</p>
    </div>

    <!-- Main Content Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Coluna 1: Lista de Sessões -->
      <div class="md:col-span-1 bg-gray-100 border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden flex flex-col">
        <div class="p-4 border-b-2 border-black bg-gray-200">
          <h2 class="text-lg font-bold text-black uppercase tracking-wider">Sessões Registradas</h2>
        </div>
        <div class="flex-grow overflow-y-auto max-h-[70vh]">
          <div v-if="errorMessage" class="text-center text-red-600 py-6 font-bold">
            {{ errorMessage }}
          </div>
          <div v-else-if="telemetryEntries.length === 0" class="text-center text-gray-500 py-6 font-bold uppercase tracking-wider">
            Nenhum dado de telemetria encontrado.
          </div>
          <!-- Session List Item -->
          <div v-else v-for="entry in telemetryEntries" :key="entry.id" @click="selectEntry(entry)"
            class="p-4 cursor-pointer border-b-2 border-black transition-all duration-200 last:border-b-0" :class="{
              'bg-black text-white': entry.id === selectedEntry?.id,
              'bg-gray-100 text-black hover:bg-gray-200': entry.id !== selectedEntry?.id,
            }">
            <p class="text-sm font-bold uppercase tracking-wide truncate" :title="String(entry.id)">
              Sessão #{{ entry.id }}
            </p>
            <p class="text-xs mt-1" :class="entry.id === selectedEntry?.id ? 'text-gray-300' : 'text-gray-500'">
              Início: {{ formatTimestamp(entry.sessionStart) }}
            </p>
            <p class="text-xs" :class="entry.id === selectedEntry?.id ? 'text-gray-300' : 'text-gray-500'">
              Usuário: {{ formatUserSuffix(entry.userId) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Detalhes da Sessão Selecionada -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="!selectedEntry" class="bg-gray-100 border-2 border-black shadow-[4px_4px_0_0_#000] p-8 text-center text-black font-bold uppercase tracking-wider">
          Selecione uma sessão na lista para ver os detalhes.
        </div>

        <div v-else>
          <!-- Card: Métricas Principais -->
          <div class="bg-gray-100 border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
            <div class="p-4 border-b-2 border-black bg-gray-200">
              <h2 class="text-lg font-bold text-black uppercase tracking-wider">
                Detalhes da Sessão #{{ selectedEntry.id }}
              </h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-[2px] bg-black border-b-2 border-black">
              <div class="text-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tempo Decorrido</p>
                <p class="text-2xl font-black text-black">
                  {{ formatElapsedTime(selectedEntry.elapsedTime) }}
                </p>
              </div>
              <div class="text-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Envios</p>
                <p class="text-2xl font-black text-black">
                  {{ selectedEntry.formSubmissions }}
                </p>
              </div>
              <div class="text-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Resets</p>
                <p class="text-2xl font-black text-black">{{ selectedEntry.formResets }}</p>
              </div>
              <div class="text-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Seleções</p>
                <p class="text-2xl font-black text-black">
                  {{ getFinalSelection(selectedEntry).length }}
                </p>
              </div>
            </div>
            <div class="p-4 text-sm text-black font-medium">
              <p><strong class="uppercase text-xs text-gray-500 tracking-wider">Usuário ID:</strong> {{ selectedEntry.userId }}</p>
              <p>
                <strong class="uppercase text-xs text-gray-500 tracking-wider">Início da Sessão:</strong> {{ formatTimestamp(selectedEntry.sessionStart) }}
              </p>
              <p><strong class="uppercase text-xs text-gray-500 tracking-wider">ID da Sessão:</strong> {{ selectedEntry.id }}</p>
            </div>
          </div>

          <!-- Card: Seleções (Grupos, Combos, Final) -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <!-- Group Selections -->
            <div class="bg-gray-100 border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden flex flex-col">
              <div class="p-4 border-b-2 border-black bg-gray-200">
                <h3 class="font-bold text-black uppercase tracking-wider">Cliques em Grupos</h3>
              </div>
              <ul class="flex-grow p-4 space-y-2 text-sm">
                <li v-for="(count, group) in getGroupSelections(selectedEntry)" :key="group" class="flex justify-between items-center border-b border-dashed border-gray-300 pb-1">
                  <span class="font-medium">{{ group }}</span> <span class="font-bold bg-black text-white px-2 py-0.5 text-xs">{{ count }}</span>
                </li>
                <li v-if="Object.keys(getGroupSelections(selectedEntry)).length === 0" class="text-gray-500 font-medium uppercase tracking-widest text-xs">
                  Nenhum
                </li>
              </ul>
            </div>
            <!-- Combo Selections -->
            <div class="bg-gray-100 border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden flex flex-col">
              <div class="p-4 border-b-2 border-black bg-gray-200">
                <h3 class="font-bold text-black uppercase tracking-wider">Cliques em Combos</h3>
              </div>
              <ul class="flex-grow p-4 space-y-2 text-sm max-h-48 overflow-y-auto">
                <li v-for="(count, combo) in getComboSelections(selectedEntry)" :key="combo" class="flex justify-between items-center border-b border-dashed border-gray-300 pb-1">
                  <span class="font-medium">{{ combo }}</span> <span class="font-bold bg-black text-white px-2 py-0.5 text-xs">{{ count }}</span>
                </li>
                <li v-if="Object.keys(getComboSelections(selectedEntry)).length === 0" class="text-gray-500 font-medium uppercase tracking-widest text-xs">
                  Nenhum
                </li>
              </ul>
            </div>
            <!-- Final Selection -->
            <div class="bg-gray-100 border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden flex flex-col">
              <div class="p-4 border-b-2 border-black bg-gray-200">
                <h3 class="font-bold text-black uppercase tracking-wider">Seleção Final</h3>
              </div>
              <ul class="flex-grow p-4 space-y-2 text-sm">
                <li v-for="item in getFinalSelection(selectedEntry)" :key="item" class="font-medium border-l-4 border-black pl-2 py-0.5 bg-gray-200">
                  {{ item }}
                </li>
                <li v-if="getFinalSelection(selectedEntry).length === 0" class="text-gray-500 font-medium uppercase tracking-widest text-xs">
                  Nenhuma
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Adicione estilos específicos se necessário */
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
  /* Certifique-se que a fonte está carregada */
}
</style>
