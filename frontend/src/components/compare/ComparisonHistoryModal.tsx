import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Clock, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export interface ComparisonHistoryItem {
  id: string;
  query: string;
  productNames: string[];
  lowestPrice?: number;
  lowestPlatform?: string;
  storeCount: number;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = "zgenie_comparison_history";

export function getComparisonHistory(): ComparisonHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse comparison history:", e);
    return [];
  }
}

export function saveComparisonToHistory(item: Omit<ComparisonHistoryItem, "id" | "timestamp">) {
  try {
    const current = getComparisonHistory();
    // Filter out duplicates with same query to bump to top
    const filtered = current.filter(
      (h) => h.query.toLowerCase().trim() !== item.query.toLowerCase().trim()
    );
    const newItem: ComparisonHistoryItem = {
      ...item,
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, 30); // keep last 30 comparisons
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("zgenie_history_updated"));
  } catch (e) {
    console.error("Failed to save comparison to history:", e);
  }
}

export function deleteComparisonItem(id: string) {
  try {
    const current = getComparisonHistory();
    const updated = current.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("zgenie_history_updated"));
  } catch (e) {
    console.error("Failed to delete comparison history item:", e);
  }
}

export function clearComparisonHistory() {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.dispatchEvent(new Event("zgenie_history_updated"));
  } catch (e) {
    console.error("Failed to clear comparison history:", e);
  }
}

interface ComparisonHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComparisonHistoryModal({ open, onOpenChange }: ComparisonHistoryModalProps) {
  const [history, setHistory] = useState<ComparisonHistoryItem[]>([]);
  const navigate = useNavigate();

  const reloadHistory = () => {
    setHistory(getComparisonHistory());
  };

  useEffect(() => {
    if (open) {
      reloadHistory();
    }
  }, [open]);

  useEffect(() => {
    const handler = () => reloadHistory();
    window.addEventListener("zgenie_history_updated", handler);
    return () => window.removeEventListener("zgenie_history_updated", handler);
  }, []);

  const handleOpenComparison = (query: string) => {
    onOpenChange(false);
    navigate({
      to: "/compare",
      search: { q: query },
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComparisonItem(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    clearComparisonHistory();
    setHistory([]);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor((now.getTime() - date.getTime()) / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col rounded-3xl p-0 gap-0 overflow-hidden border-border bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Comparison History</span>
                  {history.length > 0 && (
                    <Badge variant="secondary" className="rounded-full text-xs font-semibold px-2 py-0.5">
                      {history.length} {history.length === 1 ? "record" : "records"}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Review your previously compared products and live store deals
                </DialogDescription>
              </div>
            </div>

            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl gap-1 h-8"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center px-4 space-y-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/10 text-brand border border-brand/20">
                  <Scale className="h-8 w-8" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border text-[10px]">
                  0
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-bold text-foreground">No Comparison History Found</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You haven't compared any products yet. Search for phones, electronics, or laptops to compare live prices across stores.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/compare", search: { q: "" } });
                  }}
                  className="rounded-2xl px-5 text-xs font-semibold bg-brand text-white hover:bg-brand/90 shadow-sm gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Start Comparing Products</span>
                </Button>
              </div>
            </div>
          ) : (
            /* History Items List */
            <div className="space-y-2.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenComparison(item.query)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/80 hover:border-brand/40 bg-background/50 hover:bg-brand/[0.02] transition-all cursor-pointer gap-3 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                        {item.query}
                      </span>
                      {item.storeCount > 0 && (
                        <Badge variant="outline" className="text-[10px] rounded-full py-0 px-2 font-medium bg-muted/40">
                          {item.storeCount} Stores Checked
                        </Badge>
                      )}
                    </div>

                    {item.productNames && item.productNames.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.productNames.join(" vs ")}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.timestamp)}
                      </span>

                      {item.lowestPrice && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Best: ₹{item.lowestPrice.toLocaleString("en-IN")}
                          {item.lowestPlatform ? ` (${item.lowestPlatform})` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 rounded-xl text-xs font-semibold gap-1.5 group-hover:bg-brand group-hover:text-white transition-all"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground px-6">
            <span>Click any comparison to view live updated prices</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/compare", search: { q: "" } });
              }}
              className="rounded-xl text-xs font-medium h-7"
            >
              New Search
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
