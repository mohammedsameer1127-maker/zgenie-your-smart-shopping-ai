import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export interface LikedProduct {
  id?: string;
  user_id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_url?: string;
  platform?: string;
  price?: number | string;
  original_price?: number | string;
  rating?: number;
  regret_score?: string;
  category?: string;
  liked_at?: string;
}

interface LikesContextType {
  likedProducts: LikedProduct[];
  isLiked: (productId: string) => boolean;
  toggleLike: (product: LikedProduct) => Promise<boolean>;
  loading: boolean;
  actionLoading: Record<string, boolean>;
  refreshLikes: () => Promise<void>;
  likesCount: number;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export function LikesProvider({ children }: { children: ReactNode }) {
  const { currentUser, requireAuth } = useAuth();
  
  // State for the currently authenticated user's liked products
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Helper to get user-specific cache key
  const getUserStorageKey = (uid: string) => `zgenie_user_likes_${uid}`;

  // Fetch likes from server, firestore, and local cache when user is authenticated
  const fetchLikes = useCallback(async () => {
    if (!currentUser) {
      // Check if guest likes exist
      if (typeof window !== "undefined") {
        try {
          const guestCached = localStorage.getItem("zgenie_guest_likes");
          if (guestCached) {
            setLikedProducts(JSON.parse(guestCached));
            return;
          }
        } catch {}
      }
      setLikedProducts([]);
      return;
    }

    const userKey = getUserStorageKey(currentUser.uid);
    let initialLikes: LikedProduct[] = [];

    // 1. Immediately hydrate from this specific user's cached storage if present
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(userKey);
        if (cached) {
          initialLikes = JSON.parse(cached);
          if (Array.isArray(initialLikes) && initialLikes.length > 0) {
            setLikedProducts(initialLikes);
          }
        }

        // Migrate any unauthenticated guest likes to this newly logged in user
        const guestLikesRaw = localStorage.getItem("zgenie_guest_likes");
        if (guestLikesRaw) {
          const guestLikes: LikedProduct[] = JSON.parse(guestLikesRaw);
          if (Array.isArray(guestLikes) && guestLikes.length > 0) {
            const map = new Map<string, LikedProduct>();
            initialLikes.forEach((p) => map.set(p.product_id, p));
            guestLikes.forEach((p) => {
              if (!map.has(p.product_id)) {
                map.set(p.product_id, { ...p, user_id: currentUser.uid, liked_at: new Date().toISOString() });
              }
            });
            initialLikes = Array.from(map.values());
            setLikedProducts(initialLikes);
            localStorage.setItem(userKey, JSON.stringify(initialLikes));
            localStorage.removeItem("zgenie_guest_likes");
          }
        }
      } catch (err) {
        console.warn("[LikesContext] Failed to read local user cache:", err);
      }
    }

    setLoading(true);

    // 2. Fetch from Firestore Cloud Storage (persists across devices/browsers)
    let firestoreLikes: LikedProduct[] = [];
    try {
      const likesDocRef = doc(db, "users", currentUser.uid, "user_data", "likes");
      const snap = await getDoc(likesDocRef);
      if (snap.exists() && Array.isArray(snap.data()?.items)) {
        firestoreLikes = snap.data().items;
      }
    } catch (fsErr) {
      console.debug("[LikesContext] Firestore sync notice:", fsErr);
    }

    // 3. Fetch from MongoDB backend for this user
    let backendLikes: LikedProduct[] = [];
    try {
      const response = await api.get<LikedProduct[]>("/likes");
      if (Array.isArray(response.data) && response.data.length > 0) {
        backendLikes = response.data;
      }
    } catch (error: any) {
      console.debug("[LikesContext] Backend likes API notice:", error?.message || error);
    }

    // 4. Merge all sources safely by product_id so NO user likes are ever wiped
    const mergedMap = new Map<string, LikedProduct>();
    // Add local first
    initialLikes.forEach((p) => p?.product_id && mergedMap.set(p.product_id, p));
    // Merge Firestore
    firestoreLikes.forEach((p) => p?.product_id && mergedMap.set(p.product_id, p));
    // Merge Backend
    backendLikes.forEach((p) => p?.product_id && mergedMap.set(p.product_id, p));

    const finalMerged = Array.from(mergedMap.values());

    setLikedProducts(finalMerged);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(userKey, JSON.stringify(finalMerged));
      } catch {}
    }

    // If local had likes that weren't in Firestore yet, sync to Firestore
    if (finalMerged.length > 0 && finalMerged.length > firestoreLikes.length) {
      try {
        const likesDocRef = doc(db, "users", currentUser.uid, "user_data", "likes");
        await setDoc(likesDocRef, { items: finalMerged, updatedAt: new Date().toISOString() }, { merge: true });
      } catch {}
    }

    setLoading(false);
  }, [currentUser]);

  // When auth state changes (login/logout/switch user)
  useEffect(() => {
    fetchLikes();
  }, [currentUser, fetchLikes]);

  const isLiked = useCallback(
    (productId: string): boolean => {
      if (!productId) return false;
      return likedProducts.some((p) => p.product_id === productId);
    },
    [likedProducts]
  );

  const toggleLike = async (product: LikedProduct): Promise<boolean> => {
    const pId = product.product_id;
    if (!pId) return false;

    // If user is not authenticated, prompt sign-in with email but allow guest like
    if (!currentUser) {
      requireAuth(
        () => {},
        "Sign in with your account to sync your saved likes across all devices."
      );
      // Still persist locally as guest
      const currentlyLiked = isLiked(pId);
      let updated: LikedProduct[] = [];
      if (currentlyLiked) {
        updated = likedProducts.filter((p) => p.product_id !== pId);
        setLikedProducts(updated);
        toast.info(`Removed "${product.product_name}" from saved likes`);
      } else {
        const newItem: LikedProduct = {
          ...product,
          liked_at: new Date().toISOString(),
        };
        updated = [newItem, ...likedProducts.filter((p) => p.product_id !== pId)];
        setLikedProducts(updated);
        toast.success(`Saved "${product.product_name}" to your likes!`);
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("zgenie_guest_likes", JSON.stringify(updated));
        } catch {}
      }
      return !currentlyLiked;
    }

    const currentlyLiked = isLiked(pId);
    const userKey = getUserStorageKey(currentUser.uid);

    // 1. INSTANT optimistic state update for this user
    let updatedLikes: LikedProduct[] = [];
    if (currentlyLiked) {
      updatedLikes = likedProducts.filter((p) => p.product_id !== pId);
      setLikedProducts(updatedLikes);
      toast.info(`Removed "${product.product_name}" from saved likes`);
    } else {
      const newItem: LikedProduct = {
        ...product,
        user_id: currentUser.uid,
        liked_at: new Date().toISOString(),
      };
      updatedLikes = [newItem, ...likedProducts.filter((p) => p.product_id !== pId)];
      setLikedProducts(updatedLikes);
      toast.success(`Saved "${product.product_name}" to your likes!`);
    }

    // Persist to user's scoped cache
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(userKey, JSON.stringify(updatedLikes));
      } catch (err) {
        console.warn("Failed to update user local cache:", err);
      }
    }

    // 2. Background sync to Firestore Cloud Storage
    (async () => {
      try {
        const likesDocRef = doc(db, "users", currentUser.uid, "user_data", "likes");
        await setDoc(likesDocRef, { items: updatedLikes, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (fsErr) {
        console.debug("Firestore likes save notice:", fsErr);
      }
    })();

    // 3. Background database sync for this user to FastAPI backend
    setActionLoading((prev) => ({ ...prev, [pId]: true }));
    try {
      if (currentlyLiked) {
        await api.delete(`/likes/${encodeURIComponent(pId)}`);
      } else {
        await api.post("/likes", {
          product_id: product.product_id,
          product_name: product.product_name,
          product_image: product.product_image || null,
          product_url: product.product_url || null,
          platform: product.platform || "General",
          price: product.price ?? null,
          original_price: product.original_price ?? null,
          rating: product.rating ?? null,
          regret_score: product.regret_score || null,
          category: product.category || null,
        });
      }
    } catch (error: any) {
      console.warn("Background likes backend sync notice:", error);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[pId];
        return next;
      });
    }

    return !currentlyLiked;
  };

  return (
    <LikesContext.Provider
      value={{
        likedProducts,
        isLiked,
        toggleLike,
        loading,
        actionLoading,
        refreshLikes: fetchLikes,
        likesCount: likedProducts.length,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error("useLikes must be used within a LikesProvider");
  }
  return context;
}
