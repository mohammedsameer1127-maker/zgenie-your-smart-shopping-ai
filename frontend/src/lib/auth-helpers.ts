import { 
  signInWithRedirect, 
  signInWithPopup,
  AuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";

export const handleProviderSignIn = async (provider: AuthProvider): Promise<void> => {
  if (provider.providerId === 'google.com') {
    (provider as any).setCustomParameters({
      prompt: 'select_account'
    });
  }
  
  try {
    // Attempt standard popup flow first
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error(`[Firebase] Popup authentication failed. Error Code: ${error.code}, Message: ${error.message}`);
    
    // If the browser blocks the popup or the environment doesn't support it, 
    // gracefully fall back to the redirect method.
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/unauthorized-domain' ||
      error.message.includes('popup')
    ) {
      console.log("[Firebase] Falling back to redirect authentication...");
      await signInWithRedirect(auth, provider);
    } else {
      // Re-throw if it's a genuine credentials/network error so the UI can toast it
      throw error;
    }
  }
};
