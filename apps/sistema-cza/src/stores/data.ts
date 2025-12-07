import { defineStore } from 'pinia'

export interface DataState {
  currentSelection: string
  selectionId: string
}

export const useDataStore = defineStore('data', {
  state: (): DataState => ({
    currentSelection: '',
    selectionId: '',
  }),
  getters: {
    getSelectionId(): string{
      return this.selectionId
    }
  },

  actions: {
    setCurrentSelection(selection: string): void {
      this.currentSelection = selection
    },
    setSelectionId(id: string): void {
      this.selectionId = id
    },
    async computeSelectionId(selection: string): Promise<string> {
      this.setCurrentSelection(selection)
      const encoder = new TextEncoder();
      const encodedText = encoder.encode(String(selection));
      const hash = await window.crypto.subtle.digest('SHA-256', encodedText);
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      this.setSelectionId(hashHex);
      console.log(hashHex);
      return hashHex;
    },
  },
})
