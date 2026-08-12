import { 
  signInWithRedirect, 
  AuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";

export const handleProviderSignIn = async (provider: AuthProvider): Promise<void> => {
  if (provider.providerId === 'google.com') {
    provider.setCustomParameters({
      prompt: 'select_account'
    });
  }
  
  // This will redirect the page to the provider's login screen
  await signInWithRedirect(auth, provider);
};
