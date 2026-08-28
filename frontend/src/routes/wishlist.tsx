import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  Trash2, 
  Scale, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search
} from "lucide-react";
import { useLikes, LikedProduct } from "@/context/LikesContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [{ title: "My Saved Wishlist & Likes — ZGenie" }],
  }),
  component: WishlistPage,
});

const QUICK_SUGGESTIONS = [
  {
    id: "iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max (256 GB)",
    price: 139999,
    was: 159900,
    rating: 4.8,
    regret: "Very Low Regret (4%)",
    category: "Smartphones",
    platform: "Amazon",
    tag: "Lowest in 30 Days",
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    price: 26990,
    was: 34990,
    rating: 4.7,
    regret: "Minimal Regret (6%)",
    category: "Audio",
    platform: "Flipkart",
    tag: "Editor's Choice",
  },
  {
    id: "macbook-air-m2",
    name: "Apple MacBook Air M2 (16GB, 256GB SSD)",
    price: 94990,
    was: 114900,
    rating: 4.9,
    regret: "Ultra Safe Buy (2%)",
    category: "Laptops",
    platform: "Croma",
    tag: "Best Value",
  },
  {
    id: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 5G (512 GB)",
    price: 119999,
    was: 139999,
    rating: 4.8,
    regret: "Low Regret (5%)",
    category: "Smartphones",
    platform: "Amazon",
    tag: "Trending Flagship",
  },
];

function WishlistPage() {
  const { currentUser, requireAuth } = useAuth();
  const { likedProducts, toggleLike, isLiked } = useLikes();
  const [filterSearch, setFilterSearch] = useState("");

  const handleRemove = (item: LikedProduct) => {
    toggleLike(item);
  };

  const handleSuggestionLike = (p: typeof QUICK_SUGGESTIONS[0]) => {
    toggleLike({
      product_id: p.id,
      product_name: p.name,
      price: p.price,
      original_price: p.was,
      rating: p.rating,
      regret_score: p.regret,
      category: p.category,
      platform: p.platform,
    });
  };

  const formatPrice = (p?: number | string | null) => {
    if (p === null || p === undefined || p === "") return null;
    if (typeof p === "number") return `₹${p.toLocaleString("en-IN")}`;
    if (typeof p === "string" && !p.startsWith("₹")) return `₹${p}`;
    return p;
  };

  const filteredLiked = likedProducts.filter((p) =>
    p.product_name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-semibold">
                <Heart className="mr-1.5 h-3.5 w-3.5 fill-rose-500" /> Wishlist ({likedProducts.length})
              </Badge>
              {currentUser && (
                <Badge variant="outline" className="rounded-full text-[10px] text-emerald-600 border-emerald-500/20 bg-emerald-50/50">
                  <ShieldCheck className="mr-1 h-3 w-3" /> {currentUser.email}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-2">
              My Liked Products & Wishlist
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your saved items with real-time retailer pricing and buyer regret intelligence.
            </p>
          </div>

          {likedProducts.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search saved products..."
                className="w-full h-9 rounded-full pl-9 pr-4 text-xs border border-border/80 bg-card focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          )}
        </div>

        {/* If user is not logged in */}
        {!currentUser ? (
          <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-muted/30 to-card shadow-xs space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-foreground">
                Sign in to view your Liked Products
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your wishlist is safely stored with your Gmail / email account. Sign in with your account to view, track, and manage all your liked products.
              </p>
            </div>

            <div className="flex items-center justify-center pt-2">
              <Button
                onClick={() => requireAuth(() => {}, "Sign in with your email to view your saved wishlist.")}
                size="sm"
                className="rounded-full text-xs font-semibold px-6 bg-brand text-white hover:bg-brand/90 shadow-xs h-9"
              >
                Sign In / Sign Up
              </Button>
            </div>
          </div>
        ) : likedProducts.length === 0 ? (
          <div className="space-y-8">
            <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-muted/30 to-card shadow-xs space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold text-foreground">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  You haven't liked any products yet in this account. Click the heart (<Heart className="inline h-3 w-3 fill-rose-500 text-rose-500" />) icon on any product to save it to your account for live multi-store price tracking.
                </p>
              </div>

              <div className="flex items-center justify-center pt-2">
                <Button asChild size="sm" className="rounded-full text-xs font-semibold px-6 bg-brand text-white hover:bg-brand/90 shadow-xs h-9">
                  <Link to="/shop">
                    <ShoppingBag className="mr-1.5 h-4 w-4" /> Browse Products Catalog
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Suggestions to Like */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand" />
                  <h3 className="text-sm font-bold text-foreground">Popular Products You Might Like</h3>
                </div>
                <span className="text-[11px] text-muted-foreground">Click ❤️ to add instantly</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {QUICK_SUGGESTIONS.map((item) => {
                  const liked = isLiked(item.id);
                  return (
                    <Card key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="relative aspect-[4/3] bg-muted/30 p-3.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                            {item.tag}
                          </Badge>
                          <button
                            onClick={() => handleSuggestionLike(item)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-xs shadow-xs border transition-all active:scale-90 hover:scale-105 ${
                              liked
                                ? "border-rose-200 bg-rose-50 text-rose-500 shadow-rose-100"
                                : "border-border/60 text-muted-foreground hover:border-rose-300 hover:text-rose-500"
                            }`}
                            aria-label="Wishlist"
                            title={liked ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`h-4 w-4 transition-all duration-200 ${liked ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                          </button>
                        </div>

                        <div className="my-auto flex justify-center text-muted-foreground/30">
                          <ShoppingBag className="h-8 w-8" />
                        </div>

                        <div className="rounded-xl bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground flex items-center justify-between border border-border/50">
                          <span className="text-muted-foreground">Store:</span>
                          <span className="font-semibold text-brand">{item.platform}</span>
                        </div>
                      </div>

                      <CardContent className="p-3.5 space-y-2">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</h4>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-foreground">₹{item.price.toLocaleString("en-IN")}</span>
                          <span className="text-[11px] text-muted-foreground line-through">₹{item.was.toLocaleString("en-IN")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ) : filteredLiked.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-muted/20 space-y-3">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <h3 className="text-sm font-semibold text-foreground">No liked products match "{filterSearch}"</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterSearch("")}
              className="rounded-full text-xs font-semibold"
            >
              Clear Filter
            </Button>
          </div>
        ) : (
          /* List of Liked Products */
          <div className="space-y-3">
            {filteredLiked.map((item) => {
              const formattedPrice = formatPrice(item.price);
              const formattedOriginal = formatPrice(item.original_price);

              return (
                <div
                  key={item.product_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs gap-4 transition-all hover:border-brand/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/40 border border-border/60 text-muted-foreground">
                      <ShoppingBag className="h-6 w-6 text-brand/70" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{item.product_name}</h3>
                        {item.platform && item.platform !== "General" && (
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0 border-border">
                            {item.platform}
                          </Badge>
                        )}
                        {item.category && (
                          <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0">
                            {item.category}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
                        {formattedPrice && (
                          <span className="text-base font-bold text-foreground">{formattedPrice}</span>
                        )}
                        {formattedOriginal && (
                          <span className="text-xs text-muted-foreground line-through">{formattedOriginal}</span>
                        )}
                        {item.regret_score && (
                          <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold">
                            {item.regret_score}
                          </Badge>
                        )}
                        {item.rating && (
                          <span className="text-amber-500 font-medium text-[11px]">
                            ★ {item.rating}/5.0
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button asChild size="sm" className="rounded-full text-xs font-semibold gap-1.5 bg-brand text-white hover:bg-brand/90 px-4 h-8 shadow-xs">
                      <Link to="/compare" search={{ q: item.product_name }}>
                        <Scale className="h-3.5 w-3.5" /> Compare Stores
                      </Link>
                    </Button>
                    <button
                      onClick={() => handleRemove(item)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
                      aria-label="Remove item"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
