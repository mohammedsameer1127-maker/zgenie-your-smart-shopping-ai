import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Heart, ShoppingBag, Star, Search, SlidersHorizontal, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Price Tracker & Product Catalog — ZGenie" },
      { name: "description", content: "Explore all products, compare specs side-by-side, and track price drops across retailers." },
    ],
  }),
  component: ShopPage,
});

const ALL_PRODUCTS = [
  { id: "1", name: "Aether Pro 14 Laptop", price: 105000, was: 120000, rating: 4.8, regret: "Low (8%)", tag: "Editor Pick" },
  { id: "2", name: "Nimbus Wireless ANC Headphones", price: 20000, was: 25000, rating: 4.7, regret: "Low (5%)", tag: "Top Audio" },
  { id: "3", name: "Halo Smart Watch Series 6", price: 30000, was: 35000, rating: 4.6, regret: "Low (12%)", tag: "Popular" },
  { id: "4", name: "Lumen Desk Lamp & Charger", price: 7000, was: 8500, rating: 4.9, regret: "Low (3%)", tag: "Best Value" },
  { id: "5", name: "UltraWide 34\" Curved Monitor", price: 55000, was: 65000, rating: 4.8, regret: "Low (7%)", tag: "Top Display" },
  { id: "6", name: "Ergonomic Mesh Task Chair", price: 25000, was: 30000, rating: 4.6, regret: "Low (10%)", tag: "Office Tech" },
];

function ShopPage() {
  const [search, setSearch] = useState("");
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string, name: string) => {
    setWishlisted((prev) => {
      const next = !prev[id];
      if (next) toast.success(`Added ${name} to Wishlist!`);
      else toast.info(`Removed ${name} from Wishlist`);
      return { ...prev, [id]: next };
    });
  };

  const filtered = ALL_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
              Live Price Tracker
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-2">
              Price Tracker & Product Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filtered.length} evaluated products with real-time price comparison and regret risk scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter products..."
                className="h-9.5 rounded-lg pl-9 text-xs border-border/80"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Filter applied")}
              className="rounded-lg text-xs font-semibold gap-1.5 h-9.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="group rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="relative aspect-[4/3] bg-muted/30 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">{p.tag}</Badge>
                  <button
                    onClick={() => toggleWishlist(p.id, p.name)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-xs transition-colors ${
                      wishlisted[p.id] ? "text-rose-500 fill-rose-500" : "text-muted-foreground hover:text-rose-500"
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`h-3.5 w-3.5 ${wishlisted[p.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
                <div className="my-auto flex justify-center text-muted-foreground/30">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <div className="rounded-md bg-background/90 backdrop-blur-xs px-2 py-1 text-[11px] font-medium text-foreground flex items-center justify-between border border-border/50">
                  <span className="text-muted-foreground">AI Evaluation:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{p.regret}</span>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</h3>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-muted-foreground line-through">₹{p.was.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button asChild className="w-full rounded-lg text-xs font-semibold gap-1.5 h-9 bg-brand hover:bg-brand/90 text-white shadow-xs">
                    <Link to="/compare" search={{ q: p.name }}>
                      <Scale className="h-3.5 w-3.5" /> Compare Stores
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
