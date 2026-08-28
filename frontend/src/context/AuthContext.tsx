import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import api from "../lib/api";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  isAuthModalOpen: boolean;
  authModalMessage: string;
  requireAuth: (action: () => void, message?: string) => void;
  closeAuthModal: () => void;
  onAuthSuccess: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
  getToken: async () => null,
  isAuthModalOpen: false,
  authModalMessage: "",
  requireAuth: () => {},
  closeAuthModal: () => {},
  onAuthSuccess: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal and Pending Action State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          // Instant state update to unblock UI render
          setCurrentUser(user);
          setLoading(false);

          if (user) {
            // Asynchronous, non-blocking background sync
            (async () => {
              try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) {
                  await setDoc(userDocRef, {
                    name: user.displayName || "User",
                    email: user.email || "",
                    createdAt: serverTimestamp(),
                  });
                }
              } catch (firestoreErr) {
                console.debug("[Firestore] Notice:", firestoreErr);
              }

              try {
                await api.post("/users/sync", {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  providerId: user.providerData[0]?.providerId || "password",
                });
              } catch (error) {
                console.debug("[Backend User Sync] Notice:", error);
              }
            })();
          }
        },
        (error) => {
          console.error("Firebase auth error:", error);
          setLoading(false);
        }
      );
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

  const requireAuth = (action: () => void, message: string = "Sign in to unlock ZGenie's AI-powered search, product comparison, and personalized recommendations.") => {
    if (currentUser) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthModalMessage(message);
      setIsAuthModalOpen(true);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const onAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Automatically close modal and run pending action if user state changes to authenticated
  useEffect(() => {
    if (currentUser && isAuthModalOpen) {
      onAuthSuccess();
    }
  }, [currentUser, isAuthModalOpen]);

  const value = {
    currentUser,
    loading,
    logout,
    getToken,
    isAuthModalOpen,
    authModalMessage,
    requireAuth,
    closeAuthModal,
    onAuthSuccess
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
