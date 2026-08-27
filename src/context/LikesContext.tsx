import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";
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

  // Fetch likes from server when user is authenticated
  const fetchLikes = useCallback(async () => {
    if (!currentUser) {
      setLikedProducts([]);
      return;
    }

    const userKey = getUserStorageKey(currentUser.uid);
    // 1. Immediately hydrate from this specific user's cached storage if present
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(userKey);
        if (cached) {
          setLikedProducts(JSON.parse(cached));
        }
      } catch (err) {
        console.warn("Failed to read user cache:", err);
      }
    }

    // 2. Fetch authoritative likes from MongoDB backend for this user
    setLoading(true);
    try {
      const response = await api.get<LikedProduct[]>("/likes");
      if (Array.isArray(response.data)) {
        setLikedProducts(response.data);
        if (typeof window !== "undefined") {
          localStorage.setItem(userKey, JSON.stringify(response.data));
        }
      }
    } catch (error: any) {
      console.debug("Backend likes offline, using local cached likes:", error?.message || error);
    } finally {

      setLoading(false);
    }
  }, [currentUser]);

  // When auth state changes (login/logout/switch user)
  useEffect(() => {
    if (currentUser) {
      fetchLikes();
    } else {
      // User logged out: clear all liked products from state
      setLikedProducts([]);
      // Clean up legacy unscoped keys if any
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("zgenie_liked_products");
        } catch {}
      }
    }
  }, [currentUser, fetchLikes]);

  const isLiked = useCallback(
    (productId: string): boolean => {
      if (!currentUser || !productId) return false;
      return likedProducts.some((p) => p.product_id === productId);
    },
    [currentUser, likedProducts]
  );

  const toggleLike = async (product: LikedProduct): Promise<boolean> => {
    const pId = product.product_id;
    if (!pId) return false;

    // If user is not authenticated, prompt sign-in with email
    if (!currentUser) {
      requireAuth(
        () => {},
        "Sign in with your email to save products to your Wishlist."
      );
      return false;
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

    // 2. Background database sync for this user
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
      console.warn("Background likes sync error:", error);
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
        likesCount: currentUser ? likedProducts.length : 0,
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
