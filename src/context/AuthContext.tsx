import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../lib/api";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
  getToken: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        // If a user logs in, immediately sync them with our MongoDB backend
        if (user) {
          try {
            // Token is automatically injected by the Axios interceptor in api.ts
            await api.post('/users/sync', {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              providerId: user.providerData[0]?.providerId || "password"
            });
          } catch (error) {
            console.error("Failed to sync user with backend:", error);
          }
        }
        
        setLoading(false);
      }, (error) => {
        console.error("Firebase auth error:", error);
        setLoading(false);
      });
    } catch (error) {
      console.error("Failed to initialize auth listener:", error);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const getToken = async () => {
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  const value = {
    currentUser,
    loading,
    logout,
    getToken
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
