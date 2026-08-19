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
          "Compare product prices and specs across Amazon, Flipkart, Meesho, Croma, and Reliance Digital in real-time.",
      },
    ],
  }),
  component: ComparePage,
});

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Aether Pro 14 Laptop",
    brand: "Aether",
    price: "₹1,09,990",
    wasPrice: "₹1,24,990",
    rating: 4.8,
    reviews: 1240,
    regretScore: "Low (8%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '14.2" Mini-LED 120Hz',
    processor: "M3 Pro 11-Core CPU",
    ram: "18GB Unified",
    storage: "512GB NVMe SSD",
    battery: "Up to 18 hours",
    weight: "3.5 lbs (1.6 kg)",
    warranty: "2 Years Full Coverage",
    verdict: "Winner: Power & Display",
  },
  {
    id: "p2",
    name: "ZenBook Ultra 14",
    brand: "Asus",
    price: "₹94,990",
    wasPrice: "₹1,09,990",
    rating: 4.6,
    reviews: 890,
    regretScore: "Moderate (12%)",
    regretColor: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    display: '14.0" OLED 90Hz',
    processor: "Intel Core Ultra 7",
    ram: "16GB LPDDR5X",
    storage: "1TB PCIe 4.0 SSD",
    battery: "Up to 14 hours",
    weight: "2.8 lbs (1.3 kg)",
    warranty: "1 Year Standard",
    verdict: "Winner: Storage & Portability",
  },
];

const AVAILABLE_ADDITIONS = [
  {
    id: "p3",
    name: "Dell XPS 14 Touch",
    brand: "Dell",
    price: "₹1,19,990",
    wasPrice: "₹1,34,990",
    rating: 4.5,
    reviews: 620,
    regretScore: "Low (9%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '14.5" 3.2K OLED Touch',
    processor: "Intel Core Ultra 7",
    ram: "16GB LPDDR5X",
    storage: "512GB SSD",
    battery: "Up to 12 hours",
    weight: "3.7 lbs (1.7 kg)",
    warranty: "1 Year Onsite",
    verdict: "Winner: Touch Display",
  },
];

function ComparePage() {
  const { q } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<"platform" | "specs">("platform");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRemoveProduct = (id: string) => {
    if (products.length <= 1) {
      toast.error("You must keep at least 1 product in the comparison grid.");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info("Product removed from comparison grid.");
  };

  const handleAddProduct = (item: (typeof AVAILABLE_ADDITIONS)[0]) => {
    if (products.some((p) => p.id === item.id)) {
      toast.info("Item is already in comparison grid!");
      return;
    }
    setProducts((prev) => [...prev, item]);
    toast.success(`Added ${item.name} to comparison!`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
              <Scale className="mr-1.5 h-3.5 w-3.5" /> Product & Price Compare Engine
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
              Multi-Platform Price & Spec Comparison
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Compare live prices across Amazon, Flipkart, Meesho, Croma, & Reliance Digital or evaluate technical specs side-by-side.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-muted/50 p-1.5">
            <button
              onClick={() => setActiveTab("platform")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "platform"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-4 w-4 text-emerald-500" />
              <span>Multi-Store Comparison</span>
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "specs"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4 text-blue-500" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type product name to add to specs grid..."
                  className="h-10 rounded-xl pl-10 text-xs"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (AVAILABLE_ADDITIONS[0]) handleAddProduct(AVAILABLE_ADDITIONS[0]);
                }}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Product to Matrix
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40">
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase w-48">Feature / Metric</th>
                    {products.map((p) => (
                      <th key={p.id} className="p-4 min-w-[240px] relative">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-brand">{p.brand}</span>
                            <h3 className="text-sm font-bold text-foreground line-clamp-1">{p.name}</h3>
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-md hover:bg-muted"
                            title="Remove product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-black text-foreground">{p.price}</span>
                          <span className="text-xs text-muted-foreground line-through">{p.wasPrice}</span>
                        </div>
                        <Badge className="mt-2 text-[10px] font-bold rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${p.regretColor}`}>
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
