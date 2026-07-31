import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Heart, ShoppingBag, Star, Search, Filter, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Full Product Catalog — ZGenie" },
      { name: "description", content: "Explore all products, compare specs side-by-side, and track price drops." },
    ],
  }),
  component: ShopPage,
});

const ALL_PRODUCTS = [
  { id: "1", name: "Aether Pro 14 Laptop", price: 1299, was: 1499, rating: 4.8, regret: "Low (8%)", tag: "Editor Pick" },
  { id: "2", name: "Nimbus Wireless Headphones", price: 249, was: 299, rating: 4.7, regret: "Low (5%)", tag: "Top Audio" },
  { id: "3", name: "Halo Smart Watch Series 6", price: 379, was: 429, rating: 4.6, regret: "Low (12%)", tag: "Popular" },
  { id: "4", name: "Lumen Desk Lamp & Charger", price: 89, was: 109, rating: 4.9, regret: "Low (3%)", tag: "Best Value" },
  { id: "5", name: "UltraWide 34\" Curved Monitor", price: 649, was: 749, rating: 4.8, regret: "Low (7%)", tag: "Top Display" },
  { id: "6", name: "Ergonomic Mesh Task Chair", price: 329, was: 399, rating: 4.6, regret: "Low (10%)", tag: "Office Tech" },
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
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
              Product Directory
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
              All Evaluated Products
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filtered.length} products available for side-by-side comparison.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter products..."
                className="h-10 rounded-xl pl-9 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Filter modal opened")}
              className="rounded-xl text-xs font-bold gap-1.5 h-10"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="group rounded-2xl border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="relative aspect-[4/3] bg-muted/40 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-full bg-slate-900 text-white text-[10px] font-bold">{p.tag}</Badge>
                  <button
                    onClick={() => toggleWishlist(p.id, p.name)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-xs transition-colors ${
                      wishlisted[p.id] ? "text-rose-500 fill-rose-500" : "text-muted-foreground hover:text-rose-500"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${wishlisted[p.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
                <div className="my-auto flex justify-center text-muted-foreground/30">
                  <ShoppingBag className="h-12 w-12" />
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground line-clamp-1">{p.name}</h3>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-foreground">${p.price}</span>
                    <span className="text-xs text-muted-foreground line-through">${p.was}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{p.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1">
                    <Link to="/compare"><Scale className="h-3.5 w-3.5" /> Compare</Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.success(`Added ${p.name} to cart!`)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Add to Cart
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
