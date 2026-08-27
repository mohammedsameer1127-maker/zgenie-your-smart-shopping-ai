import api from "./api";
import { auth } from "./firebase";

export interface ShoppingOrder {
  id?: string;
  user_id: string;
  retailer: string;
  product_name: string;
  product_image?: string | null;
  order_number?: string | null;
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
  const res = await api.get<GmailStatus>("/gmail/status");
  return res.data;
}

/**
 * Start the Google OAuth flow by obtaining authorization URL and redirecting user.
 * Sends token securely in Authorization header (prevents URI Too Long).
 */
export async function startGmailConnect(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to connect Gmail. Please sign in first.");
  }
  
  const res = await api.post<{ auth_url: string }>("/gmail/connect");
  
  if (res.data?.auth_url) {
    window.location.href = res.data.auth_url;
    return;
  }

  throw new Error("Failed to generate Google authorization URL.");
}

/**
 * Trigger background or manual sync of shopping orders from Gmail
 */
export async function syncGmailOrders(): Promise<SyncResponse> {
  const res = await api.post<SyncResponse>("/gmail/sync");
  return res.data;
}

/**
 * Disconnect Gmail and remove stored access/refresh credentials
 */
export async function disconnectGmail(): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<{ success: boolean; message: string }>("/gmail/disconnect");
  return res.data;
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
  const res = await api.get<ShoppingHistoryResponse>("/shopping-history", { params });
  return res.data;
}
