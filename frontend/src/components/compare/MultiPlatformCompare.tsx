import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Truck,
  ShieldCheck,
  Tag,
  Sparkles,
  Scale,
  Search,
  Star,
  Share2,
  AlertCircle,
  Loader2,
  Zap,
  Clock,
  Building2,
  XCircle,
  AlertTriangle,
  Bell,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  History,
  Info,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { GroqAnalysisCard } from "./GroqAnalysisCard";
import { saveComparisonToHistory } from "./ComparisonHistoryModal";
import {
  fetchDynamicCompareProducts,
  inferBrand,
  getRealBrandSuggestions,
  getExactProductImage,
  getPlatformSearchUrl,
  getPlatformDomain,
  generateMatchScoreBreakdown,
  getRegretScoreFactors,
  getProductReviewAnalysis,
  generateHelpMeDecideVerdict,
  parseNaturalLanguageSearchIntent,
} from "@/lib/groq";

import {
  VALID_PRODUCTS_DATABASE,
  VERIFIED_AVAILABLE_SUGGESTIONS,
  searchVerifiedProducts,
  findValidProduct,
  getAvailableProductSuggestions,
  type AvailableProductSuggestion,
  type CompareProduct,
  type PlatformDeal,
} from "@/data/verifiedProducts";

export {
  VALID_PRODUCTS_DATABASE,
  VERIFIED_AVAILABLE_SUGGESTIONS,
  searchVerifiedProducts,
  findValidProduct,
  getAvailableProductSuggestions,
};
export type { PlatformDeal, CompareProduct, AvailableProductSuggestion };
export { getPlatformSearchUrl, getPlatformDomain, inferBrand, getRealBrandSuggestions, getExactProductImage };

// Backwards compatibility export
export const SAMPLE_PRODUCTS = VALID_PRODUCTS_DATABASE;

import { scoreProductMatch } from "@/lib/productMatcher";

/**
 * Parses user search query for single or multi-product comparison (e.g. "X vs Y").
 */
export function parseComparisonQuery(query: string): {
  isMultiCompare: boolean;
  results: { term: string; product: CompareProduct | null }[];
} {
  const clean = query.trim();
  if (!clean) {
    return { isMultiCompare: false, results: [] };
  }

  // Check if query is a "vs" comparison
  const vsSplit = clean.split(/\s+vs\.?\s+|\s+versus\s+/i).map((t) => t.trim()).filter(Boolean);

  if (vsSplit.length > 1) {
    return {
      isMultiCompare: true,
      results: vsSplit.map((term) => ({
        term,
        product: findValidProduct(term),
      })),
    };
  }

  // Single product query
  const singleProduct = findValidProduct(clean);
  return {
    isMultiCompare: false,
    results: [{ term: clean, product: singleProduct }],
  };
}

export function MultiPlatformCompare({ initialQuery = "" }: { initialQuery?: string }) {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery.trim());
  const [isLoading, setIsLoading] = useState(false);
  const [compareResults, setCompareResults] = useState<{ term: string; product: CompareProduct | null }[]>(() => {
    if (initialQuery.trim()) {
      return parseComparisonQuery(initialQuery).results;
    }
    return [];
  });

  const [sortOption, setSortOption] = useState<"lowest_price" | "highest_quality" | "fastest_delivery" | "max_discount">("lowest_price");

  // Interactive Modals State
  const [activeWhyMatchProduct, setActiveWhyMatchProduct] = useState<CompareProduct | null>(null);
  const [activeWhyScoreProduct, setActiveWhyScoreProduct] = useState<CompareProduct | null>(null);
  const [activeReviewProduct, setActiveReviewProduct] = useState<CompareProduct | null>(null);
  const [activeAlertProduct, setActiveAlertProduct] = useState<CompareProduct | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState<string>("");
  const [savedAlerts, setSavedAlerts] = useState<{ id: string; name: string; targetPrice: number }[]>(() => {
    try {
      const saved = localStorage.getItem("zgenie_price_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Help Me Decide State
  const [isHelpMeDecideOpen, setIsHelpMeDecideOpen] = useState(false);
  const [decidePriority, setDecidePriority] = useState<"price" | "performance" | "camera" | "battery" | "display" | "gaming" | "productivity">("price");

  // Autocomplete Suggestions State for Verified Products with Accurate Prices
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteSuggestions = searchVerifiedProducts(searchInput, 6);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dynamic verified products strictly derived from current search
  const verifiedProducts = compareResults
    .filter((r) => r.product !== null)
    .map((r) => r.product!);

  const allInvalid = hasSearched && !isLoading && (compareResults.length === 0 || compareResults.every((r) => r.product === null));

  const performSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) {
      toast.error("Please type a product name to compare!");
      return;
    }
    setSearchInput(clean);
    setSubmittedQuery(clean);
    setHasSearched(true);
    setIsLoading(true);
    setCompareResults([]); // Clear previous results immediately for isolated search state!

    try {
      const aiRes = await fetchDynamicCompareProducts(clean);
      if (aiRes.results && aiRes.results.length > 0) {
        setCompareResults(aiRes.results);
        const hasValid = aiRes.results.some((r) => r.product !== null);
        if (hasValid) {
          toast.success(`Comparing live prices for "${clean}" across verified stores!`);
        } else {
          toast.info(`No verified listings found for "${clean}".`);
        }
      } else {
        setCompareResults([{ term: clean, product: null }]);
      }
    } catch (e) {
      console.error("Live Retailer Compare Search Error:", e);
      setCompareResults([{ term: clean, product: null }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  const handleChipClick = (query: string) => {
    performSearch(query);
  };

  const handleSavePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlertProduct) return;
    const target = parseFloat(targetPriceInput.replace(/[^\d.]/g, ""));
    if (isNaN(target) || target <= 0) {
      toast.error("Please enter a valid target alert price!");
      return;
    }

    const newAlerts = [
      ...savedAlerts.filter((a) => a.id !== activeAlertProduct.id),
      { id: activeAlertProduct.id, name: activeAlertProduct.name, targetPrice: target },
    ];
    setSavedAlerts(newAlerts);
    try {
      localStorage.setItem("zgenie_price_alerts", JSON.stringify(newAlerts));
    } catch {
      // Ignore storage errors
    }
    toast.success(`Price alert set for ₹${target.toLocaleString("en-IN")} on ${activeAlertProduct.name}!`);
    setActiveAlertProduct(null);
    setTargetPriceInput("");
  };

  const handleRemovePriceAlert = (id: string) => {
    const updated = savedAlerts.filter((a) => a.id !== id);
    setSavedAlerts(updated);
    try {
      localStorage.setItem("zgenie_price_alerts", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
    toast.info("Price alert removed.");
  };

  const copyShareLink = async () => {
    if (!submittedQuery) return;
    const shareUrl = `${window.location.origin}/compare?q=${encodeURIComponent(submittedQuery)}`;

    const allDeals = verifiedProducts.flatMap((p) => p.platforms);
    const validDeals = allDeals.filter(
      (d) => d.price !== null && d.price > 0 && d.isVerified !== false
    );
    const lowestDeal =
      validDeals.length > 0
        ? validDeals.reduce((min, d) => ((d.price || 999999) < (min.price || 999999) ? d : min), validDeals[0])
        : undefined;

    const lowestText = lowestDeal && lowestDeal.price
      ? ` • Lowest Verified Price: ₹${lowestDeal.price.toLocaleString("en-IN")} on ${lowestDeal.platform}`
      : "";
    const shareTitle = `${submittedQuery} - Live Price Comparison | ZGenie`;
    const shareText = `Compare live prices for ${submittedQuery} across Amazon, Flipkart, Croma, Reliance Digital & Blinkit on ZGenie!${lowestText}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Comparison shared successfully!");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Price comparison link & details copied to clipboard!");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Price comparison link copied to clipboard!");
    }
  };

  // Automatically save successful comparisons to comparison history
  useEffect(() => {
    if (hasSearched && !isLoading && !allInvalid && verifiedProducts.length > 0) {
      const allDeals = verifiedProducts.flatMap((p) => p.platforms);
      const validDeals = allDeals.filter(
        (d) => d.price !== null && d.price > 0 && d.isVerified !== false
      );
      const lowestDeal =
        validDeals.length > 0
          ? validDeals.reduce((min, d) => ((d.price || 999999) < (min.price || 999999) ? d : min), validDeals[0])
          : undefined;

      saveComparisonToHistory({
        query: submittedQuery,
        productNames: verifiedProducts.map((p) => p.name),
        lowestPrice: lowestDeal?.price ?? undefined,
        lowestPlatform: lowestDeal?.platform,
        storeCount: allDeals.length,
      });
    }
  }, [hasSearched, isLoading, allInvalid, submittedQuery, verifiedProducts]);

  // Helper to format real-time last-updated data freshness and label stale cache
  const formatUpdatedTime = (isoString?: string | null, isStale?: boolean): string => {
    if (!isoString) return isStale ? "Cached / Stale" : "Live Verified";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isStale ? "Cached / Stale" : "Live Verified";
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const prefix = isStale ? "Cached (Stale) • " : "Verified • ";
      if (diffMin < 1) return `${prefix}Just now`;
      if (diffMin < 60) return `${prefix}${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${prefix}${diffHours}h ago`;
      return `${prefix}${d.toLocaleDateString("en-IN")}`;
    } catch {
      return isStale ? "Cached / Stale" : "Live Verified";
    }
  };

  // Helper to sort platform deals for a valid product
  const getSortedDeals = (platforms: PlatformDeal[]): PlatformDeal[] => {
    // Separate verified offers with valid price from unverified / missing price offers
    const verifiedWithPrice = platforms.filter(
      (d) => d.price !== null && d.price > 0 && d.isVerified !== false
    );
    const unverifiedOrMissing = platforms.filter(
      (d) => d.price === null || d.price <= 0 || d.isVerified === false
    );

    const inStock = verifiedWithPrice.filter((d) => {
      const stockStr = (d.stock || "").toLowerCase();
      return !stockStr.includes("out of stock") && !stockStr.includes("unavailable");
    });
    const outOfStock = verifiedWithPrice.filter((d) => {
      const stockStr = (d.stock || "").toLowerCase();
      return stockStr.includes("out of stock") || stockStr.includes("unavailable");
    });

    let sorted = [...inStock];

    if (sortOption === "lowest_price") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "highest_quality") {
      sorted.sort((a, b) => b.qualityRating - a.qualityRating);
    } else if (sortOption === "fastest_delivery") {
      const fast = sorted.filter(
        (d) =>
          d.delivery.toLowerCase().includes("same-day") ||
          d.delivery.toLowerCase().includes("1-day") ||
          d.delivery.toLowerCase().includes("tomorrow") ||
          d.delivery.toLowerCase().includes("hours") ||
          d.delivery.toLowerCase().includes("express") ||
          d.delivery.toLowerCase().includes("10-min") ||
          d.delivery.toLowerCase().includes("15 min")
      );
      sorted = fast.length > 0 ? fast : sorted;
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "max_discount") {
      sorted.sort((a, b) => {
        const discA = ((a.originalPrice || a.price || 0) - (a.price || 0));
        const discB = ((b.originalPrice || b.price || 0) - (b.price || 0));
        return discB - discA;
      });
    } else {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    // Keep active in-stock verified items first, then out of stock, then unverified/unavailable offers
    return [...sorted, ...outOfStock, ...unverifiedOrMissing];
  };

  return (
    <div className="space-y-8">
      {/* Search Input Bar for Live Multi-Platform Query */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] font-bold">
              <Scale className="mr-1.5 h-3.5 w-3.5" /> Multi-Platform Price Compare Engine
            </Badge>

            <h2 className="text-xl font-black text-foreground sm:text-2xl mt-1.5">
              Search Product & Compare Live Store Prices
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fetches verified real-time prices across Amazon, Flipkart, Croma, Reliance Digital, Blinkit, Myntra, Meesho, and Tata CLiQ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {verifiedProducts.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHelpMeDecideOpen(true)}
                className="rounded-xl text-xs font-bold gap-1.5 bg-brand/5 border-brand/20 text-brand hover:bg-brand/10"
              >
                <HelpCircle className="h-3.5 w-3.5 text-brand" /> Help Me Decide
              </Button>
            )}

            {hasSearched && !allInvalid && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Comparison
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar Form with Live Verified Product Autocomplete */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div ref={searchDropdownRef} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search verified products with live prices (e.g. iPhone 16 Pro, Galaxy S24 Ultra, MacBook Air)..."
              className="h-11 rounded-xl pl-10 text-xs bg-background"
            />

            {/* Live Autocomplete Suggestions for 100% Accurately Verified Products */}
            {isSearchFocused && autocompleteSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-muted-foreground border-b border-border/40 mb-1">
                  <span className="flex items-center gap-1.5 text-brand">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Products with Accurate Prices
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">Available Data</span>
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {autocompleteSuggestions.map((prod) => {
                    const sortedDeals = [...prod.platforms].sort((a, b) => a.price - b.price);
                    const lowestDeal = sortedDeals[0] || prod.platforms[0];
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevent blur before click
                          setIsSearchFocused(false);
                          performSearch(prod.name);
                        }}
                        className="w-full flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-brand/10 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="h-9 w-9 object-contain rounded-lg bg-muted/40 p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold text-xs shrink-0">
                              {prod.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground group-hover:text-brand truncate">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              {prod.platforms.length} Stores Verified ({lowestDeal?.platform || "In Stock"})
                            </p>
                          </div>
                        </div>
                        {lowestDeal && (
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-emerald-600 block">
                              ₹{lowestDeal.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              on {lowestDeal.platform}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-xl px-6 font-bold text-xs gap-2 shadow-xs bg-brand text-white hover:bg-brand/90 disabled:opacity-75"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scale className="h-4 w-4" />
            )}
            <span>{isLoading ? "Searching & Verifying..." : "Compare Live Prices"}</span>
          </Button>
        </form>

        {/* Dynamic Verified Available Product Suggestions ONLY for CURRENT search results */}
        {hasSearched && !isLoading && verifiedProducts.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-border/40">
            <span className="text-[11px] font-bold text-brand flex items-center gap-1 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Available Products ({verifiedProducts.length}):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {verifiedProducts.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleChipClick(prod.name)}
                  className="rounded-full bg-brand/10 hover:bg-brand/20 text-brand text-[11px] font-bold px-3 py-1 border border-brand/20 transition-all cursor-pointer shadow-2xs hover:scale-105"
                >
                  {prod.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Predefined Popular Comparisons with Accurately Verified Market Prices & Available Data */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-border/60">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand" />
            Verified Comparisons:
          </span>
          {VERIFIED_AVAILABLE_SUGGESTIONS.slice(0, 8).map((chip) => (
            <button
              key={chip.name}
              type="button"
              onClick={() => handleChipClick(chip.name)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 hover:bg-brand hover:text-white px-2.5 py-1 text-[11px] font-medium text-foreground transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
            >
              <span>{chip.query || chip.name}</span>
              <span className="font-bold text-emerald-600 group-hover:text-white/90 bg-emerald-500/10 group-hover:bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                ₹{chip.price.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* State 1: No Search Done Yet */}
      {!hasSearched && (
        <div className="rounded-3xl border border-dashed border-border bg-muted/10 p-8 sm:p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Scale className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">Ready to Compare Live Prices</h3>
            <p className="text-xs text-muted-foreground">
              Search any smartphone or electronic item above to compare prices and check real-time stock across verified retailers.
            </p>
          </div>
        </div>
      )}

      {/* Loading AI State with Multi-Phase Feedback */}
      {isLoading && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-brand/30 bg-linear-to-br from-brand/5 via-card to-background p-6 text-center space-y-3 shadow-xs">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold text-brand animate-pulse">
              <Zap className="h-4 w-4 animate-spin text-brand" />
              <span>Searching across retailers for "{submittedQuery}"...</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Scanning real-time prices, seller authenticity, active bank discounts, and stock availability across Amazon, Flipkart, Croma, Reliance Digital, Blinkit, and Myntra.
            </p>
            <div className="max-w-md mx-auto space-y-2 pt-2">
              <div className="h-2 bg-brand/20 rounded-full animate-pulse w-full"></div>
              <div className="h-2 bg-brand/10 rounded-full animate-pulse w-4/5 mx-auto"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-border/70 bg-card p-5 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-2xl bg-muted"></div>
                  <div className="h-5 w-20 rounded-full bg-muted"></div>
                </div>
                <div className="h-8 w-32 rounded-xl bg-muted"></div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-40 rounded-full bg-muted"></div>
                  <div className="h-3 w-28 rounded-full bg-muted"></div>
                </div>
                <div className="h-10 rounded-2xl bg-muted mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State 2: No Verified Listings Found (Exact Empty State UI) */}
      {hasSearched && !isLoading && allInvalid && (
        <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 sm:p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-foreground">No verified listings found for "{submittedQuery}"</h3>
            <p className="text-xs text-muted-foreground">
              We checked the configured retailers but couldn't find an authenticated listing matching this exact product right now.
            </p>
            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setHasSearched(false);
                  setCompareResults([]);
                }}
                className="rounded-xl text-xs font-semibold"
              >
                Try another product name
              </Button>
            </div>

            {/* Verified Available Products with Accurately Correct Price */}
            <div className="pt-6 border-t border-border/50 text-left space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-foreground">
                  Available Verified Products with Accurate Live Prices:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VERIFIED_AVAILABLE_SUGGESTIONS.slice(0, 6).map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleChipClick(item.name)}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-border/80 bg-card/60 hover:bg-brand/5 hover:border-brand/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-9 w-9 object-contain rounded-lg bg-muted/40 p-0.5 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-brand">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.lowestStore} • In Stock
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 shrink-0 ml-2">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Verified Search Results */}
      {hasSearched && !isLoading && !allInvalid && (
        <div className="space-y-10">
          {/* ZGenie AI Deal Analysis */}
          {(() => {
            const validProductsForAi = verifiedProducts.map((prod) => ({
              name: prod.name,
              category: prod.category,
              rating: prod.rating,
              reviewsCount: prod.reviewsCount,
              platforms: prod.platforms
                .filter((d) => d.price !== null && d.price > 0 && d.isVerified !== false)
                .map((d) => ({
                  platform: d.platform,
                  price: d.price as number,
                  original_price: d.originalPrice || d.price,
                  discount: d.discount,
                  delivery: d.delivery,
                  qualityRating: d.qualityRating,
                  qualityScore: d.qualityScore,
                  regretRisk: d.regretRisk,
                  sellerType: d.sellerType,
                  offers: d.offers,
                })),
            }));

            if (validProductsForAi.length === 0) return null;

            return (
              <GroqAnalysisCard
                products={validProductsForAi}
                userQuery={submittedQuery}
              />
            );
          })()}

          {compareResults.map((result, rIdx) => {
            if (!result.product) {
              return (
                <div key={rIdx} className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 sm:p-8 text-center space-y-3">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">No verified listings found for "{result.term}"</h4>
                  <p className="text-xs text-muted-foreground">
                    No verified matching product found across checked retailers for <strong className="text-foreground">"{result.term}"</strong>.
                  </p>
                </div>
              );
            }

            const currentProduct = result.product;
            const deals = getSortedDeals(currentProduct.platforms);
            const verifiedPriceDeals = deals.filter(
              (d) => d.price !== null && d.price > 0 && d.isVerified !== false && d.availability === "AVAILABLE"
            );
            const lowestPriceVal =
              verifiedPriceDeals.length > 0
                ? Math.min(...verifiedPriceDeals.map((d) => d.price as number))
                : 0;
            const matchBreakdown = generateMatchScoreBreakdown(submittedQuery, currentProduct);
            const regretFactors = getRegretScoreFactors(currentProduct);

            return (
              <div key={currentProduct.id} className="space-y-4">
                {/* Product Header Card */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Zoomed-in Cutout Image */}
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-white dark:bg-slate-900/90 border border-border/60 p-2 flex items-center justify-center overflow-hidden shadow-2xs group">
                      <img
                        src={currentProduct.image || getExactProductImage(currentProduct.name, currentProduct.category)}
                        alt={currentProduct.name}
                        loading="lazy"
                        className="h-full w-full object-contain scale-110 group-hover:scale-125 transition-transform duration-300 drop-shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="text-[10px] uppercase font-black bg-brand/10 text-brand border border-brand/20 rounded-full px-2.5">
                          Brand: {currentProduct.brand || inferBrand(currentProduct.name)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground rounded-full">
                          {currentProduct.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>{currentProduct.rating}</span>
                          <span className="text-muted-foreground font-normal text-[10px]">({currentProduct.reviewsCount.toLocaleString()} reviews)</span>
                        </div>

                        {/* Match Score Badge with 'Why this matches?' */}
                        <button
                          type="button"
                          onClick={() => setActiveWhyMatchProduct(currentProduct)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>{matchBreakdown.score}% Match</span>
                          <Info className="h-2.5 w-2.5 opacity-70" />
                        </button>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-foreground line-clamp-2">
                        {currentProduct.name}
                      </h3>

                      {/* Quick Interactive Actions */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveWhyScoreProduct(currentProduct)}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline decoration-dotted flex items-center gap-1 cursor-pointer"
                        >
                          Regret Risk: <strong className="text-foreground">{regretFactors.regretRisk}</strong> (Why this score?)
                        </button>

                        <span className="text-muted-foreground/40">•</span>

                        <button
                          type="button"
                          onClick={() => setActiveReviewProduct(currentProduct)}
                          className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ThumbsUp className="h-3 w-3" /> AI Review Breakdown
                        </button>

                        <span className="text-muted-foreground/40">•</span>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveAlertProduct(currentProduct);
                            setTargetPriceInput(lowestPriceVal ? (lowestPriceVal * 0.9).toFixed(0) : "");
                          }}
                          className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Bell className="h-3 w-3" /> Set Price Alert
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs text-muted-foreground font-medium">Sort deals:</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
                    >
                      <option value="lowest_price">Lowest Price (Ascending ₹)</option>
                      <option value="highest_quality">Highest Seller Rating</option>
                      <option value="fastest_delivery">Fastest Delivery</option>
                      <option value="max_discount">Maximum Discount</option>
                    </select>
                  </div>
                </div>

                {/* Platform Deals Section */}
                {deals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-muted/10 p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-foreground">No authorized retailers have stock right now</p>
                    <p className="text-xs text-muted-foreground">
                      This product is currently out of stock or not listed across verified partner stores.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 1. LOWEST VERIFIED PRICE SPOTLIGHT HERO */}
                    {(() => {
                      if (lowestPriceVal <= 0 || verifiedPriceDeals.length === 0) {
                        return null;
                      }
                      const lowestDeal = verifiedPriceDeals.find((d) => d.price === lowestPriceVal) || verifiedPriceDeals[0];
                      if (!lowestDeal || !lowestDeal.price) return null;
                      const lowestSearchUrl = lowestDeal.productUrl || getPlatformSearchUrl(lowestDeal.platform, currentProduct.name);

                      return (
                        <div className="rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background p-5 sm:p-6 shadow-md space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Lowest Verified Selling Price
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {lowestDeal.isStale && (
                                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                  Cached (Stale)
                                </Badge>
                              )}
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-0.5 rounded-full self-start sm:self-auto">
                                Best Verified Offer
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-white text-base shadow-sm ${lowestDeal.logoBgClass}`}>
                                {lowestDeal.logoLetter}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-lg font-black text-foreground">{lowestDeal.platform}</h4>
                                  <span className="text-xs text-muted-foreground font-mono">{lowestDeal.domain}</span>
                                  <Badge className={`rounded-full text-[10px] font-bold px-2 py-0.5 border ${lowestDeal.badgeBg}`}>
                                    {lowestDeal.discount || "Verified Deal"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    <Truck className="h-3.5 w-3.5 text-emerald-500" />
                                    {lowestDeal.delivery}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-mono text-[11px]">
                                    <Clock className="h-3 w-3 text-emerald-500" />
                                    {formatUpdatedTime(lowestDeal.lastUpdated, lowestDeal.isStale)}
                                  </span>
                                </div>
                                {lowestDeal.bankDiscount && (
                                  <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <span>💳</span>
                                    <span>Bank Offer: {lowestDeal.bankDiscount}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
                              <div className="text-right">
                                <div className="text-xs font-semibold text-muted-foreground">Selling Price</div>
                                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                  ₹{lowestDeal.price.toLocaleString("en-IN")}
                                </div>
                                {lowestDeal.originalPrice && lowestDeal.originalPrice > lowestDeal.price && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    MRP: ₹{lowestDeal.originalPrice.toLocaleString("en-IN")}
                                  </div>
                                )}
                              </div>

                              <Button
                                asChild
                                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 px-5 gap-2 shadow-md hover:shadow-lg transition-all"
                              >
                                <a
                                  href={lowestSearchUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <span>View on {lowestDeal.platform}</span>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. ALL VERIFIED STORE PRICES HEADER */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand" />
                        <h4 className="text-base font-black text-foreground">
                          All Verified Store Prices ({deals.length} {deals.length === 1 ? "Store" : "Stores"} Discovered)
                        </h4>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        Real-time Retailer Data
                      </span>
                    </div>

                    {/* 3. ALL VERIFIED STORE CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deals.map((deal, dIdx) => {
                        const hasPrice = deal.price !== null && deal.price > 0 && deal.isVerified !== false;
                        const isLowest = hasPrice && lowestPriceVal > 0 && deal.price === lowestPriceVal;
                        const searchUrl = deal.productUrl || getPlatformSearchUrl(deal.platform, currentProduct.name);

                        return (
                          <Card
                            key={dIdx}
                            className={`relative rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                              isLowest
                                ? "border-emerald-500/60 bg-emerald-500/[0.03] dark:bg-emerald-950/10"
                                : hasPrice
                                ? "border-border/80 bg-card hover:border-border"
                                : "border-dashed border-border/60 bg-muted/10 opacity-90"
                            }`}
                          >
                            {/* Top banner if Lowest Price */}
                            {isLowest && (
                              <div className="bg-emerald-600 px-4 py-1 text-center text-[10px] font-bold tracking-wider text-white uppercase flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Lowest Verified Price</span>
                              </div>
                            )}

                            <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                              {/* Store Name & Logo */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl font-black text-white text-xs ${deal.logoBgClass}`}>
                                      {deal.logoLetter}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-sm text-foreground">{deal.platform}</h4>
                                      <span className="text-[10px] text-muted-foreground font-mono">{deal.domain}</span>
                                    </div>
                                  </div>

                                  <Badge className={`rounded-full text-[10px] font-bold px-2.5 py-0.5 border ${hasPrice ? deal.badgeBg : "bg-muted text-muted-foreground border-border"}`}>
                                    {hasPrice ? (deal.discount || "Verified Deal") : "Price unavailable"}
                                  </Badge>
                                </div>

                                {/* Price & MRP */}
                                <div className="space-y-1 pt-1 border-t border-border/50">
                                  {hasPrice ? (
                                    <>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-foreground">
                                          ₹{deal.price!.toLocaleString("en-IN")}
                                        </span>
                                        {deal.originalPrice && deal.originalPrice > deal.price! && (
                                          <span className="text-xs text-muted-foreground line-through">
                                            MRP: ₹{deal.originalPrice.toLocaleString("en-IN")}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                          {deal.isStale ? "Cached historical price" : "Current selling price"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-brand" />
                                          {formatUpdatedTime(deal.lastUpdated, deal.isStale)}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="py-1 space-y-1">
                                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>Unable to verify current price</span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground">
                                        No automated price found for this exact model. Check live listing on retailer page directly.
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Conditional Bank / Coupon Offers */}
                                {(deal.bankDiscount || deal.couponDiscount) && (
                                  <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] space-y-1">
                                    {deal.bankDiscount && (
                                      <div className="text-blue-700 dark:text-blue-300 flex items-start gap-1">
                                        <span className="shrink-0">💳</span>
                                        <span className="line-clamp-2"><strong>Bank Offer:</strong> {deal.bankDiscount}</span>
                                      </div>
                                    )}
                                    {deal.couponDiscount && (
                                      <div className="text-emerald-700 dark:text-emerald-300 flex items-start gap-1">
                                        <span className="shrink-0">🏷️</span>
                                        <span className="line-clamp-1"><strong>Coupon:</strong> {deal.couponDiscount}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Highlights Specs */}
                                <div className="space-y-2 text-xs pt-1">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Truck className="h-3.5 w-3.5 text-brand shrink-0" />
                                    <span className="font-medium text-foreground">{deal.delivery}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    <span>{deal.qualityScore}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Tag className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span>Regret Risk: <strong className="text-foreground">{deal.regretRisk}</strong></span>
                                  </div>

                                  {deal.offers && deal.offers.length > 0 && (
                                    <div className="pt-1 space-y-1">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                        Active Offers:
                                      </span>
                                      {deal.offers.slice(0, 2).map((off, oIdx) => (
                                        <div key={oIdx} className="text-[11px] text-foreground/80 flex items-start gap-1">
                                          <span className="text-brand font-bold">•</span>
                                          <span className="line-clamp-1">{off}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Direct Platform Link */}
                              <div className="pt-4 mt-auto">
                                <Button
                                  asChild
                                  variant={hasPrice ? "default" : "outline"}
                                  className={`w-full rounded-2xl font-bold text-xs h-10 gap-1.5 shadow-xs ${
                                    isLowest
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : hasPrice
                                      ? "bg-brand hover:bg-brand/90 text-white"
                                      : "border-border hover:bg-muted text-foreground"
                                  }`}
                                >
                                  <a
                                    href={searchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span>{hasPrice ? `View Verified on ${deal.platform}` : `Check Price on ${deal.platform}`}</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* 4. Verified Retailer Availability Matrix / Breakdown */}
                    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-brand" />
                          <h4 className="font-bold text-sm text-foreground">Verified Retailer Availability Status</h4>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Live Data Engine (No Fake Listings)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {(() => {
                          const trackedStores = [
                            { name: "Amazon", domain: "amazon.in" },
                            { name: "Flipkart", domain: "flipkart.com" },
                            { name: "Croma", domain: "croma.com" },
                            { name: "Reliance Digital", domain: "reliancedigital.in" },
                            { name: "Zepto", domain: "zeptonow.com" },
                            { name: "iPlanet", domain: "iplanetstore.in" },
                            { name: "Vijay Sales", domain: "vijaysales.com" },
                            { name: "Blinkit", domain: "blinkit.com" },
                            { name: "JioMart", domain: "jiomart.com" },
                            { name: "Myntra", domain: "myntra.com" },
                            { name: "Meesho", domain: "meesho.com" },
                            { name: "Tata CLiQ", domain: "tatacliq.com" },
                          ];

                          return trackedStores.map((store) => {
                            const matchedDeal = currentProduct.platforms.find(
                              (p) => p.platform.toLowerCase() === store.name.toLowerCase() ||
                                     p.domain.toLowerCase().includes(store.domain.toLowerCase())
                            );

                            const isAvailable = !!matchedDeal && matchedDeal.price !== null && matchedDeal.price > 0 && matchedDeal.isVerified !== false;
                            const isOutOfStock = !!matchedDeal && (matchedDeal.stock || "").toLowerCase().includes("out of stock");

                            return (
                              <div
                                key={store.name}
                                className={`rounded-2xl border p-3.5 flex flex-col justify-between gap-2 text-xs transition-colors ${
                                  isAvailable
                                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                                    : isOutOfStock
                                    ? "border-amber-500/30 bg-amber-500/5"
                                    : "border-border/60 bg-muted/20 opacity-75"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-foreground">{store.name}</span>
                                  {isAvailable ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Available
                                    </span>
                                  ) : isOutOfStock ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                      <AlertTriangle className="h-3.5 w-3.5" /> Out of stock
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" /> Price unavailable
                                    </span>
                                  )}
                                </div>

                                {isAvailable && matchedDeal && matchedDeal.price ? (
                                  <div className="space-y-0.5">
                                    <div className="text-base font-black text-foreground">
                                      ₹{matchedDeal.price.toLocaleString("en-IN")}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      {formatUpdatedTime(matchedDeal.lastUpdated, matchedDeal.isStale)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-muted-foreground italic">
                                    — Check retailer page
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODALS & INTERACTIVE POPUPS
         ========================================================================= */}

      {/* 1. Why This Matches Modal */}
      {activeWhyMatchProduct && (
        <Dialog open={!!activeWhyMatchProduct} onOpenChange={() => setActiveWhyMatchProduct(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-black flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" /> Why This Product Matches
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Transparent breakdown of matching criteria for <strong className="text-foreground">{activeWhyMatchProduct.name}</strong> against your search.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {generateMatchScoreBreakdown(submittedQuery, activeWhyMatchProduct).points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-2xl border border-border/70 p-3 bg-muted/20">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold ${pt.match ? "bg-emerald-500" : "bg-amber-500"}`}>
                    {pt.match ? <Check className="h-3 w-3" /> : "!"}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">{pt.title}</p>
                    <p className="text-[11px] text-muted-foreground">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 2. Why This Score (Regret Risk) Modal */}
      {activeWhyScoreProduct && (
        <Dialog open={!!activeWhyScoreProduct} onOpenChange={() => setActiveWhyScoreProduct(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-black flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Regret Score Transparency Factors
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Understanding how ZGenie calculates the buyer regret index for <strong className="text-foreground">{activeWhyScoreProduct.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {getRegretScoreFactors(activeWhyScoreProduct).factors.map((f, idx) => (
                <div key={idx} className="rounded-2xl border border-border/70 p-3.5 bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">{f.name}</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      {f.score}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{f.explanation}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 3. AI Review Highlights Modal */}
      {activeReviewProduct && (
        <Dialog open={!!activeReviewProduct} onOpenChange={() => setActiveReviewProduct(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-black flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-brand" /> Verified Review Analysis
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Aggregated insights from {activeReviewProduct.reviewsCount.toLocaleString()} verified buyers for <strong className="text-foreground">{activeReviewProduct.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const analysis = getProductReviewAnalysis(activeReviewProduct);
              return (
                <div className="space-y-4 pt-2 text-xs">
                  <div className="rounded-2xl bg-brand/5 border border-brand/20 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Sentiment Summary</span>
                    <p className="text-foreground/90 font-medium">{analysis.sentimentSummary}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" /> Top Positive Highlights
                    </span>
                    <div className="space-y-1.5">
                      {analysis.positiveHighlights.map((pos, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{pos}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <ThumbsDown className="h-3.5 w-3.5" /> Things to Keep in Mind
                    </span>
                    <div className="space-y-1.5">
                      {analysis.negativeHighlights.map((neg, nIdx) => (
                        <div key={nIdx} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{neg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/80 italic border-t border-border/40 pt-2">
                    Note: Summarized from authentic retailer customer feedback. Specifications and pricing remain factual live data.
                  </p>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* 4. Set Price Alert Modal */}
      {activeAlertProduct && (
        <Dialog open={!!activeAlertProduct} onOpenChange={() => setActiveAlertProduct(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-black flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" /> Set Price Drop Alert
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Get notified when <strong className="text-foreground">{activeAlertProduct.name}</strong> drops below your target price.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePriceAlert} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Target Alert Price (₹)</label>
                <Input
                  type="number"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  placeholder="e.g. 45000"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl font-bold text-xs h-10 bg-brand text-white hover:bg-brand/90">
                Save Price Alert
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 5. Help Me Decide Modal */}
      {isHelpMeDecideOpen && verifiedProducts.length >= 2 && (
        <Dialog open={isHelpMeDecideOpen} onOpenChange={setIsHelpMeDecideOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-black flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-brand" /> Help Me Decide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Compare verified options based on what matters most to you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">What is your top priority?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "price", label: "Lowest Price" },
                    { id: "performance", label: "Performance" },
                    { id: "camera", label: "Camera Quality" },
                    { id: "battery", label: "Battery Life" },
                    { id: "display", label: "Display" },
                    { id: "gaming", label: "Gaming" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDecidePriority(p.id as any)}
                      className={`rounded-xl p-2.5 text-xs font-bold border transition-all text-center cursor-pointer ${
                        decidePriority === p.id
                          ? "bg-brand text-white border-brand shadow-xs"
                          : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const verdict = generateHelpMeDecideVerdict(verifiedProducts, decidePriority);
                return (
                  <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-brand text-white text-[10px] font-bold rounded-full">
                        Recommended Winner
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">{verdict.winner.name}</h4>
                    </div>

                    <p className="text-xs text-muted-foreground">{verdict.rationale}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Key Advantages:</span>
                      {verdict.keyAdvantages.map((adv, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-2 text-xs text-foreground/90">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
