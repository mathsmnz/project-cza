import { Ref } from 'vue';

// Define the structure of your telemetry data
export interface TelemetryData {
  userID: string;
  sessionStart: number;
  groupSelections: Record<string, number>;
  comboSelections: Record<string, number>;
  formSubmissions: number;
  finalSelection: string[];
  formResets: number;
  elapsedTime: number; // This is a getter, but will be a number when exposed/serialized
}

export const useTelemetryStore: () => {
  telemetry: TelemetryData;
  isLoading: Ref<boolean>; // Use Ref for the primitive boolean
  trackGroupSelection: (groupID: string) => void;
  trackComboSelection: (comboID: string) => void;
  trackFormSubmission: () => void;
  trackFormReset: () => void;
  setFinalSelection: (selection: string[]) => void; // Match TelemetryData type
};

export default useTelemetryStore;