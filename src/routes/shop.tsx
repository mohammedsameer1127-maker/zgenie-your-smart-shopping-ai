import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Heart, ShoppingBag, Star, Search, SlidersHorizontal, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLikes } from "@/context/LikesContext";

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
  {
    id: "prod-iphone-16-pro",
    name: "Apple iPhone 16 Pro (Desert Titanium)",
    brand: "Apple",
    category: "Smartphones",
    price: 119490,
    was: 119900,
    rating: 4.9,
    reviews: 8900,
    regret: "Very Low (1%)",
    tag: "Top Flagship",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-macbook-air-m3",
    name: "Apple MacBook Air M3 (16GB, 512GB SSD)",
    brand: "Apple",
    category: "Laptops",
    price: 124990,
    was: 134900,
    rating: 4.9,
    reviews: 5200,
    regret: "Ultra Safe (1%)",
    tag: "Best Ultrabook",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-midnight-select-202402?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray)",
    brand: "Samsung",
    category: "Smartphones",
    price: 109999,
    was: 129999,
    rating: 4.8,
    reviews: 12400,
    regret: "Very Low (3%)",
    tag: "Camera Monster",
    image: "https://m.media-amazon.com/images/I/71RVu88nx6L._SL1500_.jpg",
  },
  {
    id: "prod-sony-wh1000xm5",
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    brand: "Sony",
    category: "Audio",
    price: 24990,
    was: 34990,
    rating: 4.8,
    reviews: 22400,
    regret: "Minimal (3%)",
    tag: "Top ANC Audio",
    image: "https://www.sony.co.in/image/6145c1d32e6ac8e63a46c912dc33d5bb?fmt=png-alpha&wid=600",
  },
  {
    id: "prod-ps5-slim",
    name: "Sony PlayStation 5 Slim Disc Edition (1TB SSD)",
    brand: "Sony",
    category: "Gaming",
    price: 49990,
    was: 54990,
    rating: 4.9,
    reviews: 28000,
    regret: "Ultra Safe (1%)",
    tag: "Top Console",
    image: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$",
  },
  {
    id: "prod-lg-c3-oled",
    name: "LG C3 55-inch 4K OLED Smart TV",
    brand: "LG",
    category: "Smart TVs",
    price: 114990,
    was: 169990,
    rating: 4.9,
    reviews: 6800,
    regret: "Ultra Safe (1%)",
    tag: "Best 4K OLED",
    image: "https://www.lg.com/content/dam/channel/wcms/in/images/tvs/oled55c3psa_atr_eain_in_c/gallery/medium01.jpg",
  },
  {
    id: "prod-airpods-pro-2",
    name: "Apple AirPods Pro (2nd Gen USB-C)",
    brand: "Apple",
    category: "Audio",
    price: 20990,
    was: 24900,
    rating: 4.9,
    reviews: 38000,
    regret: "Very Low (2%)",
    tag: "Top In-Ear ANC",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-oneplus-12",
    name: "OnePlus 12 5G (Flowy Emerald)",
    brand: "OnePlus",
    category: "Smartphones",
    price: 59999,
    was: 64999,
    rating: 4.8,
    reviews: 9200,
    regret: "Very Low (3%)",
    tag: "Fast Charging",
    image: "https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg",
  },
  {
    id: "prod-iqoo-neo-9-pro",
    name: "iQOO Neo 9 Pro 5G (Fiery Red)",
    brand: "iQOO",
    category: "Smartphones",
    price: 33999,
    was: 39999,
    rating: 4.8,
    reviews: 14200,
    regret: "Very Low (2%)",
    tag: "Top Gaming",
    image: "https://m.media-amazon.com/images/I/719n91OsuSL._SL1200_.jpg",
  },
];

function ShopPage() {
  const [search, setSearch] = useState("");
  const { isLiked, toggleLike, actionLoading } = useLikes();

  const handleLikeClick = (p: typeof ALL_PRODUCTS[0]) => {
    toggleLike({
      product_id: p.id,
      product_name: p.name,
      price: p.price,
      original_price: p.was,
      rating: p.rating,
      regret_score: p.regret,
    });
  };

  const filtered = useMemo(() => {
    return ALL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Live Price Tracker
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                Official Brand Release Assets
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              Price Tracker & Product Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filtered.length} evaluated products with real-time price comparison and regret risk scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, brand, category..."
                className="h-10 rounded-2xl pl-9.5 text-xs bg-background text-foreground border-border/80"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Filter active")}
              className="rounded-2xl text-xs font-semibold gap-1.5 h-10 px-4 shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const liked = isLiked(p.id);

            return (
              <Card key={p.id} className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/11] bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between overflow-hidden border-b border-border/40">
                    {/* Zoomed-In Official Brand Release Cutout */}
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-contain scale-110 group-hover:scale-125 transition-transform duration-300 drop-shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="relative z-10 flex items-center justify-between pointer-events-auto">
                      <Badge className="rounded-full bg-background/90 backdrop-blur-xs border border-border/60 text-foreground text-[10px] font-bold shadow-2xs">
                        {p.tag}
                      </Badge>
                      <button
                        onClick={() => handleLikeClick(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-xs shadow-xs border transition-all active:scale-90 hover:scale-105 cursor-pointer ${
                          liked
                            ? "border-rose-200 bg-rose-50 text-rose-500 shadow-rose-100"
                            : "border-border/60 text-muted-foreground hover:border-rose-300 hover:text-rose-500"
                        }`}
                        aria-label="Wishlist"
                        title={liked ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`h-4 w-4 transition-all duration-200 ${
                            liked ? "fill-rose-500 text-rose-500 scale-110" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="relative z-10 rounded-xl bg-background/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-foreground flex items-center justify-between border border-border/50 shadow-2xs mt-auto">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" /> Regret Score:
                      </span>
                      <span className="text-emerald-600 font-bold">{p.regret}</span>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand tracking-wider">{p.brand}</span>
                      <h3 className="text-sm font-bold text-foreground line-clamp-1 mt-0.5">{p.name}</h3>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground line-through">₹{p.was.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                        <span className="text-muted-foreground font-normal text-[10px]">({p.reviews.toLocaleString()})</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Button asChild className="w-full rounded-2xl text-xs font-bold gap-1.5 h-9 bg-brand hover:bg-brand/90 text-white shadow-xs cursor-pointer">
                    <Link to="/compare" search={{ q: p.name }}>
                      <Scale className="h-3.5 w-3.5" /> Compare Live Stores
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
