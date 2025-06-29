// src/firebase.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import ref from Vue to create reactive variables
import { ref } from 'vue';

const firebaseConfig = {
  apiKey: "AIzaSyDewve-3mmMdxuZ5pdfhUnmuWxB-pXYzlY",
  authDomain: "czam-e32db.firebaseapp.com",
  projectId: "czam-e32db",
  storageBucket: "czam-e32db.firebasestorage.app",
  messagingSenderId: "326379221289",
  appId: "1:326379221289:web:d9cb99db4370fb08d0c738", // This is the Firebase client registration ID
  measurementId: "G-GWGSW9J19X"
};

const canvasAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-canvas-app-id'; // Renamed to avoid confusion with firebaseConfig.appId
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

console.log("Using Firebase Config.");
console.log("Canvas App ID received:", canvasAppId);
console.log("Initial Auth Token received:", initialAuthToken ? "Present" : "Not present");

// --- Initialize Firebase App ---
const app = initializeApp(firebaseConfig);

// --- Get Firebase Service Instances ---
const db = getFirestore(app); // Firestore database instance
const auth = getAuth(app);   // Authentication service instance

// --- Reactive User ID State ---
export const currentUserId = ref(null);

// --- Firebase Authentication Setup ---
const setupFirebaseAuth = async () => {
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Firebase Auth: Signed in with custom token.");
    } else {
      await signInAnonymously(auth);
      console.log("Firebase Auth: Signed in anonymously.");
    }
  } catch (error) {
    console.error("Firebase authentication error:", error);
    // Handle UI feedback for auth errors
  }
};

// --- Listen for Authentication State Changes ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId.value = user.uid;
    console.log("Firebase Auth State: User signed in. UID:", user.uid);
  } else {
    currentUserId.value = null;
    console.log("Firebase Auth State: No user signed in.");
  }
});

// --- Execute the Authentication Setup ---
setupFirebaseAuth();

// --- Export Firebase Service Instances and the Canvas App ID ---
// Make sure to export the canvasAppId to be used in your Firestore paths
export { db, auth, canvasAppId };