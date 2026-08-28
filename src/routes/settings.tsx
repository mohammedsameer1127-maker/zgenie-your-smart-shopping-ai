import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Shield,
  Bell,
  Mail,
  CheckCircle2,
  RefreshCw,
  Unlink,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getGmailStatus,
  startGmailConnect,
  syncGmailOrders,
  disconnectGmail,
  GmailStatus,
} from "@/lib/gmail-orders";

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): { gmail_status?: string; error?: string } => {
    return {
      gmail_status: typeof search.gmail_status === "string" ? search.gmail_status : undefined,
      error: typeof search.error === "string" ? search.error : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Account Settings & Gmail Sync — ZGenie" },
      {
        name: "description",
        content: "Manage notification preferences and connect Gmail to sync multi-store shopping receipts.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const search = Route.useSearch();
  const { currentUser, requireAuth } = useAuth();

  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({
    connected: false,
    sync_status: "idle",
    total_orders: 0,
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchStatus = async () => {
    if (!currentUser) {
      setIsLoadingStatus(false);
      return;
    }
    setIsLoadingStatus(true);
    try {
      const status = await getGmailStatus();
      setGmailStatus(status);
    } catch (err) {
      console.debug("Notice fetching Gmail status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (search.gmail_status === "connected") {
      toast.success("Gmail connected successfully! Your order confirmations can now be synced.");
      fetchStatus();
    } else if (search.gmail_status === "error") {
      toast.error(`Gmail connection error: ${search.error || "Please try connecting again."}`);
    }
  }, [search.gmail_status, search.error]);

  useEffect(() => {
    fetchStatus();
  }, [currentUser]);

  const handleConnect = async () => {
    requireAuth(async () => {
      setIsConnecting(true);
      try {
        await startGmailConnect(window.location.origin);
      } catch (err: any) {
        toast.error(err?.message || "Failed to start Google OAuth flow.");
        setIsConnecting(false);
      }
    }, "Please sign in to connect your Gmail account.");
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncGmailOrders();
      toast.success(res.message || "Synced shopping order receipts!");
      await fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Sync failed. Please check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Gmail? Your stored credentials will be revoked immediately.")) {
      return;
    }
    setIsDisconnecting(true);
    try {
      await disconnectGmail();
      toast.success("Gmail disconnected successfully. Stored tokens revoked.");
      await fetchStatus();
    } catch (err: any) {
      toast.error("Failed to disconnect Gmail.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge className="rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 text-xs font-bold">
            <Settings className="mr-1.5 h-3.5 w-3.5" /> Preferences & Integrations
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            Account Settings & Preferences
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your AI preferences, deal alert notifications, and optional Gmail order syncing.
          </p>
        </div>

        {/* 1. Connect Gmail for Unified Purchase Timeline Card */}
        <div className="rounded-3xl border-2 border-brand/20 bg-linear-to-br from-brand/5 via-card to-background p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-inner">
                <Mail className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-foreground sm:text-lg">
                    Connect Gmail (Read-Only Order Sync)
                  </h2>
                  {gmailStatus.connected ? (
                    <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-muted text-muted-foreground border border-border text-[10px] font-semibold">
                      Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  ZGenie automatically builds your unified <strong>Purchase Timeline</strong> by parsing order-confirmation receipts from <strong>Amazon, Flipkart, Myntra, Meesho, Blinkit, Croma, and Reliance Digital</strong>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {gmailStatus.connected ? (
                <>
                  <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    size="sm"
                    className="rounded-xl font-bold text-xs gap-1.5 shadow-xs bg-brand text-white hover:bg-brand/90 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 cursor-pointer"
                  >
                    <Unlink className="h-3.5 w-3.5 mr-1" />
                    <span>Disconnect</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="rounded-xl px-5 font-bold text-xs gap-2 shadow-xs bg-brand text-white hover:bg-brand/90 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>{isConnecting ? "Connecting..." : "Connect Gmail"}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Connection Metadata / Status */}
          {gmailStatus.connected && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-brand/10 text-xs">
              <div className="rounded-2xl bg-card p-3 border border-border/80 space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-medium">Connected Account</span>
                <div className="font-bold text-foreground truncate">{gmailStatus.email || "Google Account"}</div>
              </div>
              <div className="rounded-2xl bg-card p-3 border border-border/80 space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-medium">Orders Imported</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  {gmailStatus.total_orders} orders tracked
                </div>
              </div>
              <div className="rounded-2xl bg-card p-3 border border-border/80 space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-medium">Last Synced</span>
                <div className="font-bold text-foreground">
                  {gmailStatus.last_synced_at
                    ? new Date(gmailStatus.last_synced_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Just now"}
                </div>
              </div>
            </div>
          )}

          {/* Privacy / Security Notice */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-muted/40 p-4 border border-border/60 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Privacy & Security Promise:</span>
              <p>
                Access is strictly <strong>read-only</strong> scoped only to finding shopping order receipts. ZGenie never sends, modifies, or deletes emails. Tokens are encrypted at rest with AES-128 Fernet encryption, and you can revoke access at any time.
              </p>
            </div>
          </div>

          {gmailStatus.connected && (
            <div className="pt-1 flex justify-end">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>View Unified Purchase Timeline →</span>
              </Link>
            </div>
          )}
        </div>

        {/* 2. Notification Preferences Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand" />
            <h2 className="text-base font-bold text-foreground">Notification Preferences</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-foreground">AI Price Drop Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive instant notifications when items on your watchlist drop in price.</p>
              </div>
              <Switch defaultChecked onCheckedChange={(v) => toast.success(`Price drop alerts ${v ? "enabled" : "disabled"}`)} />
            </div>

            <div className="border-t border-border/60 pt-4 flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-foreground">AI Buyer Regret Warning Badges</Label>
                <p className="text-xs text-muted-foreground">Display AI risk warnings on products with high return rates.</p>
              </div>
              <Switch defaultChecked onCheckedChange={(v) => toast.success(`Regret warnings ${v ? "enabled" : "disabled"}`)} />
            </div>

            <div className="border-t border-border/60 pt-4 flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-foreground">Weekly Deal Digests</Label>
                <p className="text-xs text-muted-foreground">Receive weekly curated product deal comparisons and coupons.</p>
              </div>
              <Switch defaultChecked onCheckedChange={(v) => toast.success(`Deal digests ${v ? "enabled" : "disabled"}`)} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
