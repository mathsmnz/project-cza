<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <transition name="fade">
      <div
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('close')"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition name="scale-fade" appear>
      <div class="relative bg-white shadow-2xl w-full max-w-2xl m-4 outline-2 overflow-hidden transform transition-all duration-300 ease-out flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Gerenciar Tags do Projeto</h2>
            <p class="text-xs text-gray-500 mt-1">Tags estruturadas para o motor de recomendação</p>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <div class="flex-grow p-6 overflow-y-auto space-y-6">
          
          <!-- Create Tag Form -->
          <div class="bg-gray-50 p-4 border border-gray-200">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Criar Nova Tag</h3>
            <form @submit.prevent="handleCreateTag" class="flex flex-col gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Nome da Tag (ex: orcamento_baixo)</label>
                <input 
                  type="text" 
                  v-model="newTag.name" 
                  required
                  class="w-full border-gray-300 border py-2 px-3 text-sm focus:ring-black focus:border-black"
                  placeholder="Nome único sem espaços especiais"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
                  <select v-model="newTag.category" class="w-full border-gray-300 border py-2 px-3 text-sm focus:ring-black focus:border-black bg-white">
                    <option value="CONSTRAINT">Restrição (CONSTRAINT)</option>
                    <option value="AESTHETIC">Estética (AESTHETIC)</option>
                    <option value="FUNCTIONAL">Funcional (FUNCTIONAL)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Escopo</label>
                  <select v-model="newTag.scope" class="w-full border-gray-300 border py-2 px-3 text-sm focus:ring-black focus:border-black bg-white">
                    <option value="PROJECT_SPECIFIC">Específico do Projeto</option>
                    <!-- Somente admins poderiam criar global, simulando aqui -->
                    <option value="GLOBAL">Global (Todos os projetos)</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                class="self-end mt-2 bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                :disabled="isCreating"
              >
                {{ isCreating ? 'Criando...' : 'Adicionar Tag' }}
              </button>
            </form>
          </div>

          <!-- Existing Tags List -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Tags Disponíveis</h3>
            
            <div v-if="isLoading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>

            <div v-else-if="tags.length === 0" class="text-center py-8 text-gray-500 text-sm italic">
              Nenhuma tag encontrada. Crie uma nova acima.
            </div>

            <div v-else class="space-y-2">
              <div 
                v-for="tag in tags" 
                :key="tag.id"
                class="flex items-center justify-between p-3 border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-sm font-semibold text-gray-900">{{ tag.name }}</span>
                    <span 
                      class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-800': tag.category === 'CONSTRAINT',
                        'bg-pink-100 text-pink-800': tag.category === 'AESTHETIC',
                        'bg-green-100 text-green-800': tag.category === 'FUNCTIONAL'
                      }"
                    >
                      {{ tag.category }}
                    </span>
                    <span 
                      class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-full"
                    >
                      {{ tag.scope === 'GLOBAL' ? 'Global' : 'Projeto' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-gray-400 mt-1 font-mono">ID: {{ tag.id }}</div>
                </div>
                
                <button 
                  @click="handleDeleteTag(tag.id)" 
                  class="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Deletar Tag"
                  :disabled="isDeleting === tag.id"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAllTagsForProject, createTag, deleteTag } from '@/api/axios'
import type { TagResponse, CreateTagRequest, TagCategory, TagScope } from '@/types/types'

const props = defineProps<{
  projectId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toast', message: string, mode: string): void
}>()

const tags = ref<TagResponse[]>([])
const isLoading = ref(true)
const isCreating = ref(false)
const isDeleting = ref<string | null>(null)

const newTag = ref<{
  name: string
  category: TagCategory
  scope: TagScope
}>({
  name: '',
  category: 'CONSTRAINT',
  scope: 'PROJECT_SPECIFIC'
})

const loadTags = async () => {
  try {
    isLoading.value = true
    tags.value = await fetchAllTagsForProject(props.projectId)
  } catch (error) {
    console.error('Failed to load tags:', error)
    emit('toast', 'Erro ao carregar tags', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleCreateTag = async () => {
  if (!newTag.value.name.trim()) return

  try {
    isCreating.value = true
    const request: CreateTagRequest = {
      name: newTag.value.name.trim().toLowerCase().replace(/\s+/g, '_'),
      category: newTag.value.category,
      scope: newTag.value.scope,
      projectId: props.projectId
    }
    
    await createTag(request)
    emit('toast', 'Tag criada com sucesso!', 'success')
    
    // Reset form
    newTag.value.name = ''
    
    // Reload tags
    await loadTags()
  } catch (error) {
    console.error('Failed to create tag:', error)
    emit('toast', 'Erro ao criar tag. Verifique se o nome já existe.', 'error')
  } finally {
    isCreating.value = false
  }
}

const handleDeleteTag = async (id: string) => {
  if (!confirm('Tem certeza que deseja remover esta tag? Ela será removida de todos os módulos que a utilizam.')) return
  
  try {
    isDeleting.value = id
    await deleteTag(id)
    emit('toast', 'Tag removida com sucesso!', 'success')
    await loadTags()
  } catch (error) {
    console.error('Failed to delete tag:', error)
    emit('toast', 'Erro ao remover tag', 'error')
  } finally {
    isDeleting.value = null
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
