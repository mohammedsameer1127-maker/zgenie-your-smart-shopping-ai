import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Uses Vite environment variables
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate config securely
const requiredKeys: (keyof typeof config)[] = [
  'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
];

let hasMissingConfig = false;
for (const key of requiredKeys) {
  if (!config[key] || config[key] === "placeholder") {
    // Convert camelCase key to uppercase snake_case for the exact env var name
    const envName = `VITE_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
    console.error(`[Firebase Initialization] ERROR: Missing or incorrectly loaded environment variable: ${envName}`);
    hasMissingConfig = true;
  }
}

if (!hasMissingConfig) {
  console.log("[Firebase Initialization] SUCCESS: All required Firebase configuration values loaded successfully (Keys hidden for security).");
}

// Check and log the current domain for Firebase Authentication Authorized Domains
if (typeof window !== "undefined") {
  const currentHostname = window.location.hostname;
  if (currentHostname !== "localhost" && currentHostname !== "127.0.0.1") {
    console.warn(
      `[Firebase Auth] If Google/Apple sign-in fails, ensure this exact domain is added to Authorized Domains:\n\n` +
      `  ${currentHostname}\n\n` +
      `Go to Firebase Console -> Authentication -> Settings -> Authorized Domains -> Add domain.`
    );
  }
}

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(config) : getApp();

// Initialize Analytics conditionally (it requires a browser environment)
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const appleProvider = new OAuthProvider('apple.com');
