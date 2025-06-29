// src/stores/telemetryStore.js
import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid' // For generating sessionUserID
import { doc, setDoc } from 'firebase/firestore' // Firebase Firestore functions
import { db, canvasAppId, currentUserId } from '../utilities/firebase' // Import Firebase instances and reactive userId

export const useTelemetryStore = defineStore('telemetry', () => {
  // Session-only identifiers for telemetry
  // These are generated once per browser session/page load for non-Firebase authenticated users
  const sessionUserID = uuidv4()
  const sessionStartTime = Date.now()

  // Reactive telemetry object - this is the state for this store
  const telemetry = reactive({
    // Store the Firebase UID as a field in the document
    userID: sessionUserID, // Initialized with sessionUserID, updated by Firebase currentUserId watcher
    // Store the app ID from the Canvas environment as a field
    appId: canvasAppId,
    sessionId: sessionUserID,
    sessionStart: sessionStartTime,
    groupSelections: {},
    comboSelections: {},
    formSubmissions: 0,
    finalSelection: {},
    formResets: 0,
    get elapsedTime() {
      return Date.now() - this.sessionStart
    },
  })

  // Reactive state to indicate if telemetry is currently being sent
  const isLoading = reactive({ value: false })

  // --- Telemetry Tracking Functions (Update local state) ---
  function trackGroupSelection(groupID) {
    telemetry.groupSelections[groupID] ??= 0 // Initialize if undefined
    telemetry.groupSelections[groupID]++
  }

  function trackComboSelection(comboID) {
    telemetry.comboSelections[comboID] ??= 0 // Initialize if undefined
    telemetry.comboSelections[comboID]++
  }

  function trackFormSubmission() {
    telemetry.formSubmissions++
  }

  function trackFormReset() {
    telemetry.formResets++
  }

  function setFinalSelection(selection) {
    telemetry.finalSelection = selection
  }

  // --- Firebase Persistence Logic (Sends telemetry to Firestore) ---
  async function sendTelemetryToFirebase() {
    // telemetry.userID will be set by the watcher (currentUserId).
    if (!telemetry.appId || !telemetry.sessionId) {
      console.warn("Telemetry: App ID or Session ID missing, cannot send data.");
      return;
    }

    isLoading.value = true;
    try {
      const docRef = doc(db, `telemetry_data`, telemetry.sessionId); // Use sessionId as the document ID

      // Ensure the userID in the telemetry object is the latest from Firebase Auth
      // before sending, in case the watcher hasn't triggered yet or was slow.
      // This is particularly important for the very first send.
      if (currentUserId.value) {
          telemetry.userID = currentUserId.value;
      } else {
          // If no Firebase user, ensure it still uses the session UUID
          telemetry.userID = sessionUserID;
      }


      await setDoc(docRef, telemetry, { merge: true });
      console.log("Telemetry sent to Firestore successfully with session ID:", telemetry.sessionId);
    } catch (error) {
      console.error("Error sending telemetry to Firestore:", error);
    } finally {
      isLoading.value = false;
    }
  }

  // --- Watchers for Automatic Persistence ---

  // 1. Watch for changes in the Firebase currentUserId
  // This updates the telemetry.userID when authentication state changes
  watch(
    currentUserId,
    (newUserId) => {
      if (newUserId) {
        telemetry.userID = newUserId // Use the authenticated Firebase UID
        // Immediately try to send telemetry if user just became authenticated and data might exist
        sendTelemetryToFirebase()
      } else {
        // If no Firebase user (e.g., signed out or auth error), fall back to session-specific UUID
        telemetry.userID = sessionUserID
      }
    },
    { immediate: true },
  ) // `immediate: true` runs the watcher once on store creation

  // 2. Watch the local telemetry object for changes and trigger a send to Firebase
  // This ensures that any update to the local telemetry state gets persisted.
  // Consider debouncing this watch if telemetry updates are extremely frequent
  // to avoid hitting Firestore write limits too quickly.
  watch(
    telemetry,
    () => {
      // Only send if we have a userID and not already in the middle of sending
      if (telemetry.userID && !isLoading.value) {
        sendTelemetryToFirebase()
      }
    },
    { deep: true }, // `deep: true` is essential for watching changes within nested objects (e.g., groupSelections)
  )

  return {
    telemetry,
    isLoading, // Expose loading state for UI
    trackGroupSelection,
    trackComboSelection,
    trackFormSubmission,
    trackFormReset,
    setFinalSelection,
  }
})
