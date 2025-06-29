import { Ref } from 'vue';

type Selection = string[]; // Or whatever your currentSelection type actually is

export const useDataStore: () => {
  currentSelection: Ref<Selection>;
  selectionID: Ref<string>; // selectionID is a ref, so its type should be Ref<string>

  getSelectionId: (selection: string) => Promise<string>;
  getCurrentSelection: () => Selection;
  getSelectionID: () => string;
  setCurrentSelection: (value: Selection) => void;
  setSelectionID: (value: string) => void;

  // Removed all telemetry related properties and functions
};

export default useDataStore;