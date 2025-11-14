<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue' // Assumindo que você tem uma NavBar

// --- TypeScript Interface based on Firestore structure ---
interface TelemetryData {
  appId: string
  comboSelections: Record<string, number> // Map<String, Number>
  elapsedTime: number // Milliseconds?
  finalSelection: string[] // Array<String>
  formResets: number
  formSubmissions: number
  groupSelections: Record<string, number> // Map<String, Number>
  sessionId: string
  sessionStart: number // Timestamp?
  userId: string
}

// --- Component State ---
const telemetryEntries = ref<TelemetryData[]>([])
const isLoading = ref<boolean>(true)
const selectedEntry = ref<TelemetryData | null>(null)

// --- Mock Data Fetching (Replace with your actual API call) ---
const fetchTelemetryData = async () => {
  isLoading.value = true
  // Simular chamada de API
  await new Promise((resolve) => setTimeout(resolve, 1000))
  telemetryEntries.value = [
    {
      appId: 'cza-main',
      comboSelections: {
        cozinhaFrenteLado: 7,
        adicionarLavanderia: 1,
        cozinhalado: 4,
        separarCozinha: 7,
      },
      elapsedTime: 3958739, // Exemplo: ~66 minutos
      finalSelection: ['cozinhaFrenteLado', 'separarCozinha'],
      formResets: 0,
      formSubmissions: 2,
      groupSelections: { A: 4, D: 3 }, // Adicionado outro grupo para exemplo
      sessionId: '54e8d4a2-6d86-4e8b-a4e6-fec186a01c38',
      sessionStart: 1748305241736, // Exemplo de timestamp
      userId: 'VKJQUmePZdfPinDkyjSDKdzqI1',
    },
    // Adicione mais entradas mockadas se desejar testar a lista
    {
      appId: 'cza-main',
      comboSelections: {
        salaEstarAmpliada: 5,
        adicionarVaranda: 3,
      },
      elapsedTime: 1205000, // ~20 minutos
      finalSelection: ['salaEstarAmpliada'],
      formResets: 1,
      formSubmissions: 1,
      groupSelections: { B: 5 },
      sessionId: 'another-session-id-123',
      sessionStart: 1748306000000,
      userId: 'WdBWlHPUppXZn8gH8Hw1OmNAtz22',
    },
  ]
  // Seleciona a primeira entrada por padrão ao carregar
  if (telemetryEntries.value.length > 0) {
    const firstEntry = telemetryEntries.value[0]
    if (firstEntry !== undefined) {
      selectedEntry.value = firstEntry
    }
  }
  isLoading.value = false
}

// --- Helper Functions ---
const formatElapsedTime = (ms: number): string => {
  if (!ms) return 'N/A'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes} min ${seconds} seg`
}

const formatTimestamp = (ts: number): string => {
  if (!ts) return 'N/A'
  return new Date(ts).toLocaleString('pt-BR')
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
      <div class="md:col-span-1 bg-white outline outline-black overflow-hidden flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text font-semibold text-gray-700">Sessões Registradas</h2>
        </div>
        <div class="flex-grow p-4 space-y-2 overflow-y-auto max-h-[70vh]">
          <div v-if="telemetryEntries.length === 0" class="text-center text-gray-500 py-6">
            Nenhum dado de telemetria encontrado.
          </div>
          <!-- Session List Item -->
          <div v-else v-for="entry in telemetryEntries" :key="entry.sessionId" @click="selectEntry(entry)"
            class="p-3 -md cursor-pointer border transition-colors duration-150" :class="{
              'bg-gray-50 border-l-4 border-gray-500 text-gray-800 font-medium':
                entry.sessionId === selectedEntry?.sessionId,
              'border-gray-200 hover:bg-gray-100': entry.sessionId !== selectedEntry?.sessionId,
            }">
            <p class="text-sm font-medium truncate" :title="entry.sessionId">
              Sessão: ...{{ entry.sessionId.slice(-8) }}
            </p>
            <p class="text-xs text-gray-500">Início: {{ formatTimestamp(entry.sessionStart) }}</p>
            <p class="text-xs text-gray-500">Usuário: ...{{ entry.userId.slice(-6) }}</p>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Detalhes da Sessão Selecionada -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="!selectedEntry" class="bg-white outline outline-black p-6 text-center text-gray-500">
          Selecione uma sessão na lista para ver os detalhes.
        </div>

        <div v-else>
          <!-- Card: Métricas Principais -->
          <div class="bg-white outline outline-black overflow-hidden">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text font-semibold text-gray-700">
                Detalhes da Sessão: ...{{ selectedEntry.sessionId.slice(-8) }}
              </h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
              <div class="text-center p-3 bg-gray-50">
                <p class="text-xs text-gray-500 uppercase">Tempo Decorrido</p>
                <p class="text-xl font-semibold text-black">
                  {{ formatElapsedTime(selectedEntry.elapsedTime) }}
                </p>
              </div>
              <div class="text-center p-3 bg-gray-50">
                <p class="text-xs text-gray-500 uppercase">Envios</p>
                <p class="text-xl font-semibold text-gray-700">
                  {{ selectedEntry.formSubmissions }}
                </p>
              </div>
              <div class="text-center p-3 bg-gray-50">
                <p class="text-xs text-gray-500 uppercase">Resets</p>
                <p class="text-xl font-semibold text-gray-700">{{ selectedEntry.formResets }}</p>
              </div>
              <div class="text-center p-3 bg-gray-50">
                <p class="text-xs text-gray-500 uppercase">Seleções Finais</p>
                <p class="text-xl font-semibold text-gray-700">
                  {{ selectedEntry.finalSelection.length }}
                </p>
              </div>
            </div>
            <div class="p-4 border-t border-gray-200 text-sm text-gray-500">
              <p><strong>Usuário ID:</strong> {{ selectedEntry.userId }}</p>
              <p>
                <strong>Início da Sessão:</strong> {{ formatTimestamp(selectedEntry.sessionStart) }}
              </p>
              <p><strong>App ID:</strong> {{ selectedEntry.appId }}</p>
            </div>
          </div>

          <!-- Card: Seleções (Grupos, Combos, Final) -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4">
            <!-- Group Selections -->
            <div class="bg-white outline outline-black overflow-hidden">
              <div class="p-4 border-b border-gray-200">
                <h3 class="font-semibold text-gray-700">Cliques em Grupos</h3>
              </div>
              <ul class="p-4 space-y-1 text-sm">
                <li v-for="(count, group) in selectedEntry.groupSelections" :key="group" class="flex justify-between">
                  <span>{{ group }}:</span> <span class="font-medium">{{ count }}</span>
                </li>
                <li v-if="Object.keys(selectedEntry.groupSelections).length === 0" class="text-gray-400 italic">
                  Nenhum
                </li>
              </ul>
            </div>
            <!-- Combo Selections -->
            <div class="bg-white outline outline-black overflow-hidden">
              <div class="p-4 border-b border-gray-200">
                <h3 class="font-semibold text-gray-700">Cliques em Combos</h3>
              </div>
              <ul class="p-4 space-y-1 text-sm max-h-48 overflow-y-auto">
                <li v-for="(count, combo) in selectedEntry.comboSelections" :key="combo" class="flex justify-between">
                  <span>{{ combo }}:</span> <span class="font-medium">{{ count }}</span>
                </li>
                <li v-if="Object.keys(selectedEntry.comboSelections).length === 0" class="text-gray-400 italic">
                  Nenhum
                </li>
              </ul>
            </div>
            <!-- Final Selection -->
            <div class="bg-white outline outline-black overflow-hidden">
              <div class="p-4 border-b border-gray-200">
                <h3 class="font-semibold text-gray-700">Seleção Final</h3>
              </div>
              <ul class="p-4 space-y-1 text-sm">
                <li v-for="item in selectedEntry.finalSelection" :key="item">{{ item }}</li>
                <li v-if="selectedEntry.finalSelection.length === 0" class="text-gray-400 italic">
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
