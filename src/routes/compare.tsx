import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MultiPlatformCompare } from "@/components/compare/MultiPlatformCompare";
import {
  Scale,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Search,
  Star,
  Globe,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search.q === "string" ? search.q : "",
    };
  },
  head: () => ({
    meta: [
      { title: "Multi-Platform Price & Product Compare Engine" },
      {
        name: "description",
        content:
          "Compare product prices and specs across Amazon, Flipkart, Meesho, Myntra, and Blinkit in real-time.",
      },
    ],
  }),
  component: ComparePage,
});

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Apple MacBook Pro 14 (M3 Pro)",
    brand: "Apple",
    price: "₹1,79,990",
    wasPrice: "₹1,99,900",
    rating: 4.9,
    reviews: 3100,
    regretScore: "Very Low (1%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '14.2" Liquid Retina XDR (120Hz)',
    processor: "Apple M3 Pro (11-core CPU)",
    ram: "18GB Unified",
    storage: "512GB NVMe SSD",
    battery: "Up to 18 hours",
    weight: "3.5 lbs (1.6 kg)",
    warranty: "1 Year Limited AppleCare",
    verdict: "Top Overall Power & Battery",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "p2",
    name: "ASUS ROG Zephyrus G14 (RTX 4060)",
    brand: "Asus",
    price: "₹1,49,990",
    wasPrice: "₹1,79,990",
    rating: 4.8,
    reviews: 2800,
    regretScore: "Low (4%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '14.0" 3K OLED 120Hz',
    processor: "AMD Ryzen 9 8945HS",
    ram: "16GB LPDDR5X",
    storage: "1TB PCIe 4.0 SSD",
    battery: "Up to 12 hours",
    weight: "3.3 lbs (1.5 kg)",
    warranty: "1 Year Standard",
    verdict: "Winner: Gaming & OLED Display",
    image: "https://dlcdnwebimgs.asus.com/gain/9712a8a8-3563-4b67-a8b2-b1ee0f913d33/w800",
  },
];

const AVAILABLE_SPECS_DATABASE = [
  {
    id: "p3",
    name: "Dell XPS 13 Plus Ultrabook",
    brand: "Dell",
    price: "₹1,29,990",
    wasPrice: "₹1,49,900",
    rating: 4.7,
    reviews: 1900,
    regretScore: "Minimal (5%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '13.4" 3.5K OLED Touch',
    processor: "Intel Core i7 13th Gen",
    ram: "16GB LPDDR5X",
    storage: "1TB SSD",
    battery: "Up to 13 hours",
    weight: "2.7 lbs (1.23 kg)",
    warranty: "1 Year Onsite",
    verdict: "Winner: Touch OLED & Portability",
    image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9320/media-gallery/notebook-xps-9320-platinum-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=600&wid=600",
  },
  {
    id: "p4",
    name: "Apple MacBook Air M3 (16GB RAM)",
    brand: "Apple",
    price: "₹1,24,990",
    wasPrice: "₹1,34,900",
    rating: 4.9,
    reviews: 5200,
    regretScore: "Ultra Safe (1%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '13.6" Liquid Retina (60Hz)',
    processor: "Apple M3 (8-core CPU)",
    ram: "16GB Unified",
    storage: "512GB SSD",
    battery: "Up to 18 hours",
    weight: "2.7 lbs (1.24 kg)",
    warranty: "1 Year AppleCare",
    verdict: "Best Ultrabook Value",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-midnight-select-202402?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "p5",
    name: "Apple iPhone 16 Pro (128GB)",
    brand: "Apple",
    price: "₹1,19,490",
    wasPrice: "₹1,19,900",
    rating: 4.9,
    reviews: 8900,
    regretScore: "Very Low (1%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '6.3" Super Retina XDR OLED (120Hz)',
    processor: "A18 Pro (6-core CPU)",
    ram: "8GB RAM",
    storage: "128GB NVMe",
    battery: "Up to 27 hours video",
    weight: "199 g (0.44 lbs)",
    warranty: "1 Year Apple Warranty",
    verdict: "Top Flagship Smartphone",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "p6",
    name: "Samsung Galaxy S24 Ultra (5G)",
    brand: "Samsung",
    price: "₹1,09,999",
    wasPrice: "₹1,29,999",
    rating: 4.8,
    reviews: 12400,
    regretScore: "Low (3%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '6.8" Dynamic LTPO AMOLED 2X (120Hz)',
    processor: "Snapdragon 8 Gen 3 (For Galaxy)",
    ram: "12GB LPDDR5X",
    storage: "256GB UFS 4.0",
    battery: "5000 mAh (Up to 30 hrs)",
    weight: "232 g (0.51 lbs)",
    warranty: "1 Year Brand Warranty",
    verdict: "Best Android Flagship",
    image: "https://m.media-amazon.com/images/I/71RVu88nx6L._SL1500_.jpg",
  },
  {
    id: "p7",
    name: "Sony WH-1000XM5 ANC Headphones",
    brand: "Sony",
    price: "₹24,990",
    wasPrice: "₹34,990",
    rating: 4.8,
    reviews: 22400,
    regretScore: "Low (3%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: "N/A (Over-Ear Wireless Audio)",
    processor: "HD Noise Canceling Processor QN1 + V1",
    ram: "N/A",
    storage: "N/A",
    battery: "Up to 30 hours (ANC On)",
    weight: "250 g (0.55 lbs)",
    warranty: "1 Year Sony India",
    verdict: "Top Noise Canceling Audio",
    image: "https://www.sony.co.in/image/6145c1d32e6ac8e63a46c912dc33d5bb?fmt=png-alpha&wid=600",
  },
];

function ComparePage() {
  const { q } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<"platform" | "specs">("platform");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddProduct = (prod: (typeof AVAILABLE_SPECS_DATABASE)[0]) => {
    if (products.length >= 4) {
      toast.error("Maximum 4 products can be compared side-by-side simultaneously.");
      return;
    }
    if (products.some((p) => p.id === prod.id)) {
      toast.info(`${prod.name} is already in the comparison table.`);
      return;
    }
    setProducts((prev) => [...prev, prod]);
    toast.success(`Added ${prod.name} to comparison table.`);
  };

  const handleSearchAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = AVAILABLE_SPECS_DATABASE.find(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        query.includes(p.name.toLowerCase())
    );

    if (match) {
      handleAddProduct(match);
      setSearchQuery("");
    } else {
      toast.error(`No results found for "${searchQuery}". Only verified catalog products can be added.`);
    }
  };

  const handleRemoveProduct = (id: string) => {
    if (products.length <= 2) {
      toast.error("At least 2 products must remain in comparison table.");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info("Product removed from comparison.");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
              <Scale className="mr-1.5 h-3.5 w-3.5" /> Product & Price Compare Engine
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
              Multi-Platform Price & Spec Comparison
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Compare live prices across Amazon, Flipkart, Meesho, Myntra, & Blinkit or evaluate technical specs side-by-side.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
            <button
              onClick={() => setActiveTab("platform")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "platform"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>Multi-Store Comparison</span>
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "specs"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <span>Side-by-Side Specs Grid</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Multi-Platform Price Comparison */}
        {activeTab === "platform" ? (
          <MultiPlatformCompare initialQuery={q} />
        ) : (
          /* Tab 2: Specs Matrix */
          <div className="space-y-6">
            <form onSubmit={handleSearchAndAdd} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type verified product name (e.g. MacBook Air, iPhone 15 Pro, Dell XPS)..."
                  className="h-10 rounded-full pl-9.5 text-xs border-border/80"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold gap-1.5 h-10 px-4"
              >
                <Plus className="h-3.5 w-3.5" /> Add Product to Matrix
              </Button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase w-48">Feature / Metric</th>
                    {products.map((p) => (
                      <th key={p.id} className="p-4 min-w-[240px] relative align-top">
                        {/* Zoomed-in Product Cutout Image */}
                        <div className="relative aspect-[16/11] w-full rounded-2xl bg-white dark:bg-slate-900/90 border border-border/60 p-3 mb-3 flex items-center justify-center overflow-hidden shadow-2xs group">
                          {p.image ? (
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
                          ) : (
                            <div className="h-10 w-10 text-muted-foreground/30 flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-rose-500 p-1.5 rounded-full bg-background/80 backdrop-blur-xs border border-border/50 hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                            title="Remove product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-brand tracking-wider">{p.brand}</span>
                            <h3 className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</h3>
                          </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-xl font-bold text-foreground">{p.price}</span>
                          <span className="text-xs text-muted-foreground line-through">{p.wasPrice}</span>
                        </div>
                        <Badge className="mt-2 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {p.verdict}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">User Rating</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 font-bold text-foreground">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-amber-400" />
                          <span>{p.rating}</span>
                          <span className="text-muted-foreground text-[11px]">({p.reviews} reviews)</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">AI Regret Score</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 font-bold">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs ${p.regretColor}`}>
                          <ShieldCheck className="h-3.5 w-3.5" /> {p.regretScore}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">Display</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.display}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">Processor</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.processor}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">RAM Memory</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.ram}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">Storage</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.storage}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">Battery Life</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.battery}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">Weight</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.weight}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-muted-foreground bg-muted/20">Warranty</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-foreground font-medium">{p.warranty}</td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
