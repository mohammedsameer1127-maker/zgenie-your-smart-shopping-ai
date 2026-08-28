import api from "./api";
import { auth } from "./firebase";

export interface OrderItem {
  name: string;
  price?: number | null;
  quantity: number;
  image?: string | null;
}

export interface ShoppingOrder {
  id?: string;
  user_id: string;
  retailer: string;
  platform?: string;
  product_name: string;
  product_image?: string | null;
  order_number?: string | null;
  order_id?: string | null;
  items?: OrderItem[];
  order_date?: string | null;
  order_time?: string | null;
  amount?: number | null;
  currency: string;
  status: string;
  delivered: boolean;
  returned: boolean;
  refunded: boolean;
  refund_amount?: number | null;
  source: string;
  email_message_id?: string | null;
  source_email_id?: string | null;
  email_subject?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GmailStatus {
  connected: boolean;
  email?: string | null;
  connected_at?: string | null;
  last_synced_at?: string | null;
  sync_status: "idle" | "syncing" | "success" | "error";
  total_orders: number;
  last_error?: string | null;
}

export interface ShoppingHistoryResponse {
  orders: ShoppingOrder[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  connected: boolean;
  last_synced_at?: string | null;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  total_found: number;
  imported: number;
  updated: number;
  last_synced_at: string;
}

/**
 * Fetch current Gmail connection and sync status for authenticated user
 */
export async function getGmailStatus(): Promise<GmailStatus> {
  try {
    const res = await api.get<GmailStatus>("/auth/google/status", { timeout: 3000 });
    return res.data;
  } catch {
    try {
      const fallbackRes = await api.get<GmailStatus>("/gmail/status", { timeout: 3000 });
      return fallbackRes.data;
    } catch {
      return {
        connected: false,
        sync_status: "idle",
        total_orders: 0,
      };
    }
  }
}

/**
 * Generates instant Google OAuth authorization URL directly without network delay
 */
export function buildClientGoogleOAuthUrl(userId: string, origin?: string): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "680504054704-of1n56fp3h03jrn7a63cas2jneplsmcc.apps.googleusercontent.com";
  const redirectUri = "http://localhost:8000/auth/google/callback";
  const targetOrigin = origin || window.location.origin;

  const statePayload = {
    user_id: userId,
    origin: targetOrigin,
    nonce: Math.random().toString(36).substring(2),
    ts: Math.floor(Date.now() / 1000),
  };
  const state = btoa(JSON.stringify(statePayload));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
    access_type: "offline",
    prompt: "consent",
    state: state,
    include_granted_scopes: "true",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Start the Google OAuth flow by redirecting instantaneously to Google OAuth.
 */
export async function startGmailConnect(origin?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to connect Gmail. Please sign in first.");
  }
  
  const targetOrigin = origin || window.location.origin;
  
  // Instant direct redirect (0ms delay)
  const authUrl = buildClientGoogleOAuthUrl(user.uid, targetOrigin);
  window.location.href = authUrl;
}

/**
 * Trigger background or manual sync of shopping orders from Gmail
 */
export async function syncGmailOrders(): Promise<SyncResponse> {
  try {
    const res = await api.post<SyncResponse>("/auth/google/sync");
    return res.data;
  } catch {
    const fallbackRes = await api.post<SyncResponse>("/gmail/sync");
    return fallbackRes.data;
  }
}

/**
 * Disconnect Gmail and remove stored access/refresh credentials
 */
export async function disconnectGmail(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.delete<{ success: boolean; message: string }>("/auth/google/disconnect");
    return res.data;
  } catch {
    const fallbackRes = await api.delete<{ success: boolean; message: string }>("/gmail/disconnect");
    return fallbackRes.data;
  }
}

/**
 * Fetch imported shopping orders with optional filters and pagination
 */
export async function getShoppingHistory(params: {
  page?: number;
  limit?: number;
  retailer?: string;
  status?: string;
  q?: string;
}): Promise<ShoppingHistoryResponse> {
  try {
    const res = await api.get<ShoppingHistoryResponse>("/shopping-history", { params });
    return res.data;
  } catch {
    return {
      orders: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20,
      total_pages: 1,
      connected: false,
      last_synced_at: null,
    };
  }
}
