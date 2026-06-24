<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancel')"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div
        class="relative bg-white shadow-2xl w-full max-w-lg m-4 outline-2 overflow-hidden transform transition-all duration-300 ease-out"
      >
        <form @submit.prevent="saveChanges">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Editar Grupo</h2>
            <button
              type="button"
              @click="$emit('cancel')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <div>
              <label for="label" class="block text-sm font-medium text-gray-700 mb-1">
                Texto do Grupo
              </label>
              <input
                id="label"
                type="text"
                v-model="groupData.label"
                required
                class="block w-full border-gray-300 border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm"
                placeholder="Ex: Acabamentos Premium"
              />
            </div>

            <!-- Tags Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Atribuir Tags Estruturadas
              </label>
              
              <div v-if="isLoadingTags" class="text-xs text-gray-500 py-2">Carregando tags...</div>
              
              <div v-else-if="availableTags.length === 0" class="text-xs text-gray-500 py-2 italic">
                Nenhuma tag cadastrada neste projeto. Acesse 'Gerenciar Tags' no painel principal.
              </div>
              
              <div v-else class="space-y-3 max-h-40 overflow-y-auto border border-gray-200 p-3 bg-gray-50">
                <div v-for="tag in availableTags" :key="tag.id" class="flex items-center">
                  <input
                    :id="'tag-' + tag.id"
                    type="checkbox"
                    :value="tag.id"
                    v-model="selectedTags"
                    class="h-4 w-4 text-black focus:ring-2 focus:ring-black border-gray-300 mr-2 rounded"
                  />
                  <label :for="'tag-' + tag.id" class="text-sm text-gray-700 flex-1 flex items-center justify-between cursor-pointer">
                    <span class="font-mono font-medium">{{ tag.name }}</span>
                    <span 
                      class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ml-2"
                      :class="{
                        'bg-blue-100 text-blue-800': tag.category === 'CONSTRAINT',
                        'bg-pink-100 text-pink-800': tag.category === 'AESTHETIC',
                        'bg-green-100 text-green-800': tag.category === 'FUNCTIONAL'
                      }"
                    >
                      {{ tag.category }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end space-x-4 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel')"
              class="bg-white text-gray-700 py-2 px-4 hover:bg-gray-100 focus:outline-none border border-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-black text-white py-2 px-4 hover:bg-gray-900 focus:outline-none font-semibold"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAllTagsForProject } from '@/api/axios'
import type { TagResponse } from '@/types/types'

export default {
  props: {
    group: {
      type: Object,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    }
  },
  setup(props, { emit }) {
    // Create a reactive copy of the input group to avoid direct mutation
    const groupData = ref({ ...props.group })
    
    const selectedTags = ref([...(props.group.tags || [])])
    const availableTags = ref<TagResponse[]>([])
    const isLoadingTags = ref(false)

    onMounted(async () => {
      if (props.projectId) {
        try {
          isLoadingTags.value = true
          availableTags.value = await fetchAllTagsForProject(props.projectId)
        } catch (e) {
          console.error('Failed to fetch tags', e)
        } finally {
          isLoadingTags.value = false
        }
      }
    })

    // Method to save changes and emit updated data
    const saveChanges = () => {
      groupData.value.tags = selectedTags.value
      emit('save', groupData.value)
    }

    return {
      groupData,
      selectedTags,
      availableTags,
      isLoadingTags,
      saveChanges,
    }
  },
}
</script>

<style scoped>
/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal content scale + fade */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
