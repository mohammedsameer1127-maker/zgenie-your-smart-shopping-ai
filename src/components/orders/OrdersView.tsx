import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  RefreshCw,
  Search,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Copy,
  Inbox,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import {
  getGmailStatus,
  startGmailConnect,
  syncGmailOrders,
  disconnectGmail,
  getShoppingHistory,
  ShoppingOrder,
  GmailStatus,
} from "@/lib/gmail-orders";

const RETAILER_CHIPS = [
  { id: "all", label: "All Stores" },
  { id: "Amazon", label: "Amazon", color: "text-amber-600 border-amber-500/20 bg-amber-500/10" },
  { id: "Flipkart", label: "Flipkart", color: "text-blue-600 border-blue-500/20 bg-blue-500/10" },
  { id: "Myntra", label: "Myntra", color: "text-rose-600 border-rose-500/20 bg-rose-500/10" },
  { id: "Meesho", label: "Meesho", color: "text-pink-600 border-pink-500/20 bg-pink-500/10" },
  { id: "Blinkit", label: "Blinkit", color: "text-yellow-600 border-yellow-500/20 bg-yellow-500/10" },
  { id: "Croma", label: "Croma", color: "text-emerald-600 border-emerald-500/20 bg-emerald-500/10" },
  { id: "Reliance Digital", label: "Reliance Digital", color: "text-red-600 border-red-500/20 bg-red-500/10" },
];

export function OrdersView({ gmailStatusParam, errorParam }: { gmailStatusParam?: string; errorParam?: string }) {
  const { currentUser, requireAuth } = useAuth();
  
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({
    connected: false,
    sync_status: "idle",
    total_orders: 0,
  });
  
  const [orders, setOrders] = useState<ShoppingOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedRetailer, setSelectedRetailer] = useState("all");
  const [selectedStatusTab, setSelectedStatusTab] = useState<"all" | "in_transit" | "delivered" | "returns">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check URL params on redirect from Google OAuth
  useEffect(() => {
    if (gmailStatusParam === "connected") {
      toast.success("Gmail connected successfully! You can now sync your shopping orders.");
      fetchStatusAndOrders();
    } else if (gmailStatusParam === "error") {
      toast.error(`Gmail connection failed: ${errorParam || "Please try again."}`);
    }
  }, [gmailStatusParam, errorParam]);

  const fetchStatusAndOrders = async () => {
    if (!currentUser) {
      setIsLoadingStatus(false);
      return;
    }
    setIsLoadingStatus(true);
    try {
      const status = await getGmailStatus();
      setGmailStatus(status);
      if (status.connected) {
        await loadOrders(1, selectedRetailer, selectedStatusTab, searchQuery);
      }
    } catch (err: any) {
      console.debug("Notice loading Gmail status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatusAndOrders();
  }, [currentUser]);

  const loadOrders = async (
    pageNum = 1,
    retailer = selectedRetailer,
    statusTab = selectedStatusTab,
    query = searchQuery
  ) => {
    setIsLoadingOrders(true);
    try {
      let statusParam: string | undefined = undefined;
      if (statusTab === "in_transit") statusParam = "shipped";
      else if (statusTab === "delivered") statusParam = "delivered";
      else if (statusTab === "returns") statusParam = "refunded";

      const res = await getShoppingHistory({
        page: pageNum,
        limit: 12,
        retailer: retailer !== "all" ? retailer : undefined,
        status: statusParam,
        q: query.trim() || undefined,
      });

      setOrders(res.orders || []);
      setTotalOrders(res.total || 0);
      setPage(res.page || 1);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      console.error("Failed to load shopping history:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleConnectGmail = async () => {
    if (!currentUser) {
      requireAuth(() => {
        handleConnectGmail();
      }, "Sign in to connect Gmail and track your multi-store orders.");
      return;
    }

    setIsConnecting(true);
    try {
      await startGmailConnect();
    } catch (err: any) {
      toast.error(err.message || "Failed to start Google OAuth flow.");
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      toast.info("Scanning Gmail for orders and receipts...");
      const res = await syncGmailOrders();
      toast.success(res.message || "Sync completed successfully!");
      await fetchStatusAndOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to sync Gmail orders.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect Gmail? Your imported shopping history will remain saved.")) {
      return;
    }
    setIsDisconnecting(true);
    try {
      await disconnectGmail();
      toast.success("Gmail disconnected successfully.");
      setGmailStatus({
        connected: false,
        sync_status: "idle",
        total_orders: totalOrders,
      });
    } catch (err: any) {
      toast.error("Failed to disconnect Gmail.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(1, selectedRetailer, selectedStatusTab, searchQuery);
  };

  const copyOrderNumber = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    toast.success(`Copied Order #${orderNum} to clipboard`);
  };

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return "Recent Order";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
              <Package className="mr-1.5 h-3.5 w-3.5" /> Order Intelligence & History
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
              Shopping History
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Centralized orders from Amazon, Flipkart, Meesho, Myntra, Croma, and Reliance Digital imported securely from your Gmail receipts.
            </p>
          </div>

          {/* Connected state header sync button */}
          {gmailStatus.connected && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                size="sm"
                className="rounded-full text-xs font-semibold gap-1.5 h-9 px-4 shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing Receipts..." : "Sync Orders"}
              </Button>
            </div>
          )}
        </div>

        {/* Gmail Connection Status Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          {!gmailStatus.connected ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <GmailBadgeIcon className="h-6 w-6" />
                  <h3 className="text-base font-bold text-foreground">
                    Connect Gmail to Import Shopping History
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ZGenie connects with <strong>read-only permission</strong> to search for purchase receipts and delivery notices from verified retailers. No personal or unrelated emails are ever accessed or stored.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Read-only scope
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> End-to-end encrypted tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% Private
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  onClick={handleConnectGmail}
                  disabled={isConnecting}
                  className="rounded-full text-xs font-bold h-10 px-5 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                >
                  <GmailBadgeIcon className="h-4 w-4" />
                  {isConnecting ? "Redirecting to Google..." : "Connect Gmail"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <GmailBadgeIcon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">Gmail Connected</h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 py-0">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {gmailStatus.email || currentUser?.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Last synced:{" "}
                    <strong className="text-foreground">
                      {gmailStatus.last_synced_at
                        ? new Date(gmailStatus.last_synced_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Not synced yet"}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="rounded-full text-xs font-semibold gap-1.5 h-9 px-4"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Shopping History"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="rounded-full text-xs text-muted-foreground hover:text-rose-600 h-9 px-3"
                >
                  Disconnect Gmail
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Syncing Alert Banner */}
        {isSyncing && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4 flex items-center gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-2xs animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Scanning Gmail for order receipts and updates from Amazon, Flipkart, Meesho, Myntra, Croma, & Reliance Digital...
            </span>
          </div>
        )}

        {/* Status Error Alert if sync failed */}
        {gmailStatus.last_error && !isSyncing && (
          <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-4 flex items-center justify-between gap-3 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>Sync notice: {gmailStatus.last_error}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              className="rounded-full text-xs h-7 px-3 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
            >
              Retry Sync
            </Button>
          </div>
        )}

        {/* Filters & Orders List Section */}
        <div className="space-y-4">
          
          {/* Top Controls: Search & Status Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 overflow-x-auto text-xs">
              {[
                { id: "all", label: "All Orders" },
                { id: "in_transit", label: "In Transit / Shipped" },
                { id: "delivered", label: "Delivered" },
                { id: "returns", label: "Returns & Refunds" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedStatusTab(tab.id as any);
                    loadOrders(1, selectedRetailer, tab.id as any, searchQuery);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatusTab === tab.id
                      ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 max-w-sm w-full">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product, order #..."
                  className="h-9 rounded-full pl-9 pr-3 text-xs border-border/80 bg-background"
                />
              </div>
              <Button type="submit" size="sm" variant="outline" className="rounded-full text-xs h-9 px-3 shrink-0">
                Search
              </Button>
            </form>
          </div>

          {/* Retailer Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {RETAILER_CHIPS.map((chip) => {
              const active = selectedRetailer === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setSelectedRetailer(chip.id);
                    loadOrders(1, chip.id, selectedStatusTab, searchQuery);
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-foreground text-background shadow-xs"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Orders Grid */}
          {isLoadingOrders ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-brand mx-auto" />
              <p className="text-xs text-muted-foreground">Loading shopping history...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id || order.email_message_id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-brand/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Order Card Top: Retailer & Date */}
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-brand" />
                        {order.retailer}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" />
                        {formatTimestamp(order.order_date)}
                      </span>
                    </div>
                  </div>

                  {/* Order Card Middle: Thumbnail & Product Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-border/60 p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                      {order.product_image ? (
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Package className="h-7 w-7 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Title & Price & Items */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                        {order.product_name}
                      </h4>
                      {order.items && order.items.length > 1 && (
                        <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">
                          Includes {order.items.length} items ({order.items.map((i) => i.name).join(", ")})
                        </p>
                      )}
                      {order.amount ? (
                        <p className="text-sm font-black text-foreground">
                          {order.currency === "INR" || order.currency === "₹" ? "₹" : "$"}
                          {order.amount.toLocaleString("en-IN")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium">Price in receipt</p>
                      )}
                    </div>
                  </div>

                  {/* Order Card Bottom: Status Badge & Order Number */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                    {/* Status badge */}
                    <OrderStatusBadge status={order.status} delivered={order.delivered} refunded={order.refunded} returned={order.returned} />

                    {/* Order Number */}
                    {order.order_number && (
                      <button
                        type="button"
                        onClick={() => copyOrderNumber(order.order_number!)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                        title="Click to copy order number"
                      >
                        <span>#{order.order_number.length > 14 ? `${order.order_number.slice(0, 12)}...` : order.order_number}</span>
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/90 bg-card p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No Orders Found</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {gmailStatus.connected
                  ? "No matching orders found for the selected filters. Try searching with a different term or sync again."
                  : "Connect your Gmail account above to import your orders automatically."}
              </p>
              {gmailStatus.connected ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="rounded-full text-xs font-semibold gap-1.5 h-8 mt-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} /> Sync Now
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConnectGmail}
                  disabled={isConnecting}
                  className="rounded-full text-xs font-semibold gap-1.5 h-8 mt-2"
                >
                  <GmailBadgeIcon className="h-3.5 w-3.5" /> Connect Gmail
                </Button>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  loadOrders(prev);
                }}
                disabled={page <= 1 || isLoadingOrders}
                className="rounded-full text-xs h-8 px-3"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  loadOrders(next);
                }}
                disabled={page >= totalPages || isLoadingOrders}
                className="rounded-full text-xs h-8 px-3"
              >
                Next
              </Button>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

function OrderStatusBadge({
  status,
  delivered,
  refunded,
  returned,
}: {
  status: string;
  delivered: boolean;
  refunded: boolean;
  returned: boolean;
}) {
  if (refunded) {
    return (
      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-semibold">
        <RotateCcw className="mr-1 h-3 w-3" /> Refunded
      </Badge>
    );
  }
  if (returned) {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-semibold">
        <RotateCcw className="mr-1 h-3 w-3" /> Returned
      </Badge>
    );
  }
  if (delivered) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Delivered
      </Badge>
    );
  }
  if (status.toLowerCase().includes("shipped") || status.toLowerCase().includes("transit") || status.toLowerCase().includes("delivery")) {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold">
        <Truck className="mr-1 h-3 w-3" /> {status}
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] font-semibold">
      <Package className="mr-1 h-3 w-3" /> {status}
    </Badge>
  );
}

function GmailBadgeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M2 7.5V18a2 2 0 0 0 2 2h3V11.5L2 7.5z" />
      <path fill="#34A853" d="M17 20h3a2 2 0 0 0 2-2V7.5L17 11.5V20z" />
      <path fill="#EA4335" d="M17 4H7L12 8.5 17 4z" />
      <path fill="#FBBC05" d="M2 7.5L12 15l10-7.5V6a2 2 0 0 0-2-2h-3L12 8.5 7 4H4a2 2 0 0 0-2 2v1.5z" />
    </svg>
  );
}
