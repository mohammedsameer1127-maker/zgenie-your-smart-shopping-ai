import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MultiPlatformCompare } from "@/components/compare/MultiPlatformCompare";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  ShoppingBag,
  Laptop,
  Smartphone,
  Headphones,
  Tablet,
  Watch,
  Check,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

import { toast } from "sonner";
import { getPlatformSearchUrl } from "@/lib/groq";


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

export interface SpecProduct {
  id: string;
  name: string;
  brand: string;
  category: "laptops" | "smartphones" | "audio" | "tablets" | "wearables";
  price: string;
  wasPrice: string;
  rating: number;
  reviews: number;
  regretScore: string;
  regretColor: string;
  display: string;
  processor: string;
  ram: string;
  storage: string;
  battery: string;
  weight: string;
  warranty: string;
  verdict: string;
  image: string;
}

export const COMPARE_CATALOG: SpecProduct[] = [
  {
    id: "p1",
    name: "Apple MacBook Pro 14 (M3 Pro)",
    brand: "Apple",
    category: "laptops",
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
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p2",
    name: "ASUS ROG Zephyrus G14 (RTX 4060)",
    brand: "Asus",
    category: "laptops",
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
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p3",
    name: "Dell XPS 13 Plus Ultrabook",
    brand: "Dell",
    category: "laptops",
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
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p4",
    name: "Apple MacBook Air M3 (16GB RAM)",
    brand: "Apple",
    category: "laptops",
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
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p5",
    name: "Apple iPhone 16 Pro (128GB)",
    brand: "Apple",
    category: "smartphones",
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
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p6",
    name: "Samsung Galaxy S24 Ultra (5G)",
    brand: "Samsung",
    category: "smartphones",
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
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p7",
    name: "OnePlus 12 (512GB 5G)",
    brand: "OnePlus",
    category: "smartphones",
    price: "₹64,999",
    wasPrice: "₹69,999",
    rating: 4.7,
    reviews: 6400,
    regretScore: "Low (4%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '6.82" 2K 120Hz ProXDR AMOLED',
    processor: "Snapdragon 8 Gen 3",
    ram: "16GB LPDDR5X",
    storage: "512GB UFS 4.0",
    battery: "5400 mAh (100W SUPERVOOC)",
    weight: "220 g (0.48 lbs)",
    warranty: "1 Year Manufacturer",
    verdict: "Flagship Killer Performance",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p8",
    name: "Sony WH-1000XM5 ANC Headphones",
    brand: "Sony",
    category: "audio",
    price: "₹24,990",
    wasPrice: "₹34,990",
    rating: 4.8,
    reviews: 22400,
    regretScore: "Low (3%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: "Over-Ear Wireless (30mm Driver)",
    processor: "HD Noise Canceling QN1 + V1",
    ram: "Integrated DAC & Amplifier",
    storage: "Dual Device Bluetooth 5.2",
    battery: "Up to 30 hours (ANC On)",
    weight: "250 g (0.55 lbs)",
    warranty: "1 Year Sony India",
    verdict: "Top Noise Canceling Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p9",
    name: "Apple AirPods Pro (2nd Gen USB-C)",
    brand: "Apple",
    category: "audio",
    price: "₹20,990",
    wasPrice: "₹24,900",
    rating: 4.9,
    reviews: 31200,
    regretScore: "Very Low (1%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: "In-Ear Active Noise Cancellation",
    processor: "Apple H2 Headphone Chip",
    ram: "Spatial Audio with Head Tracking",
    storage: "MagSafe Charging Case (USB-C)",
    battery: "Up to 6 hrs (30 hrs with Case)",
    weight: "5.3 g per earbud",
    warranty: "1 Year AppleCare",
    verdict: "Best Earbuds for iOS",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p10",
    name: 'Apple iPad Pro 11" (M4 Chip)',
    brand: "Apple",
    category: "tablets",
    price: "₹99,900",
    wasPrice: "₹1,09,900",
    rating: 4.9,
    reviews: 1400,
    regretScore: "Very Low (2%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '11.0" Ultra Retina XDR Tandem OLED',
    processor: "Apple M4 Chip (9-core CPU)",
    ram: "8GB Unified",
    storage: "256GB SSD",
    battery: "Up to 10 hours",
    weight: "444 g (0.98 lbs)",
    warranty: "1 Year Apple Warranty",
    verdict: "Most Advanced Tablet on Earth",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p11",
    name: "Samsung Galaxy Tab S9 Ultra",
    brand: "Samsung",
    category: "tablets",
    price: "₹94,999",
    wasPrice: "₹1,08,999",
    rating: 4.8,
    reviews: 2100,
    regretScore: "Low (4%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: '14.6" Dynamic AMOLED 2X (120Hz)',
    processor: "Snapdragon 8 Gen 2",
    ram: "12GB RAM",
    storage: "256GB Expandable",
    battery: "11,200 mAh (45W Fast Charging)",
    weight: "732 g (1.61 lbs)",
    warranty: "1 Year Samsung Warranty",
    verdict: "Ultimate Android Productivity Tablet",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "p12",
    name: "Apple Watch Ultra 2 (GPS + Cellular)",
    brand: "Apple",
    category: "wearables",
    price: "₹84,900",
    wasPrice: "₹89,900",
    rating: 4.9,
    reviews: 4200,
    regretScore: "Very Low (1%)",
    regretColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    display: "49mm Titanium Always-On Retina 3000 nits",
    processor: "S9 SiP with 64-bit dual-core",
    ram: "64GB Storage",
    storage: "Dual-frequency GPS (L1 and L5)",
    battery: "Up to 36 hours (72 hrs low power)",
    weight: "61.4 g (Titanium Case)",
    warranty: "1 Year Apple Warranty",
    verdict: "Ultimate Rugged Smartwatch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
];

function ComparePage() {
  const { q } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<"platform" | "specs">("platform");

  // Initial state: NO products selected by default when opened
  const [products, setProducts] = useState<SpecProduct[]>([]);

  // Product Selection Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<string>("all");
  const [pickerSearch, setPickerSearch] = useState("");
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);

  const openPicker = (slotIndex?: number) => {
    setTargetSlotIndex(typeof slotIndex === "number" ? slotIndex : null);
    setPickerSearch("");
    setPickerCategory("all");
    setIsPickerOpen(true);
  };

  const handleSelectProduct = (prod: SpecProduct) => {
    if (products.some((p) => p.id === prod.id)) {
      toast.info(`${prod.name} is already in the comparison table.`);
      setIsPickerOpen(false);
      return;
    }

    if (targetSlotIndex !== null && targetSlotIndex < products.length) {
      // Replace existing slot
      setProducts((prev) => {
        const copy = [...prev];
        copy[targetSlotIndex] = prod;
        return copy;
      });
      toast.success(`Updated comparison with ${prod.name}`);
    } else {
      // Add as new product
      if (products.length >= 4) {
        toast.error("Maximum 4 products can be compared simultaneously.");
        return;
      }
      setProducts((prev) => [...prev, prod]);
      toast.success(`Added ${prod.name} to comparison.`);
    }

    setIsPickerOpen(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info("Product removed from comparison.");
  };

  const handleResetComparison = () => {
    setProducts([]);
    toast.info("Comparison table reset. Click '+' on any slot to add products.");
  };

  // Filter products for the modal
  const filteredCatalog = COMPARE_CATALOG.filter((item) => {
    const matchesCategory =
      pickerCategory === "all" || item.category === pickerCategory;
    const matchesSearch =
      !pickerSearch.trim() ||
      item.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      item.brand.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      item.processor.toLowerCase().includes(pickerSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            {/* Top Guidance Banner at the top of the comparison table */}
            {products.length === 0 ? (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/20 p-6 text-center space-y-2 shadow-2xs">
                <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-1">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Ready to Compare Specs Side-by-Side
                </h3>
                <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                  Click the <strong className="text-foreground font-semibold">+ button</strong> in Product 1 and Product 2 above to choose items from the catalog and instantly generate full technical specs matrix.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Comparing <strong className="text-foreground">{products.length}</strong> of 4 products side-by-side.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetComparison}
                  className="rounded-full text-xs text-muted-foreground hover:text-rose-600 gap-1.5 h-8"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Grid
                </Button>
              </div>
            )}

            {/* Comparison Table / Empty Template State */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase w-48 align-top">
                      <div className="flex items-center gap-1.5 text-foreground/80">
                        <Sparkles className="h-4 w-4 text-brand" />
                        <span>Feature / Metric</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-normal normal-case mt-1">
                        {products.length === 0
                          ? "Click + on slots to select products"
                          : `${products.length} of 4 products loaded`}
                      </p>
                    </th>

                    {/* Slot 1 */}
                    {products[0] ? (
                      <ProductHeaderTh
                        product={products[0]}
                        onRemove={() => handleRemoveProduct(products[0].id)}
                        onChange={() => openPicker(0)}
                      />
                    ) : (
                      <EmptySlotTh
                        onAdd={() => openPicker(0)}
                        title="Add Product 1"
                        subtitle="Click + to select product"
                      />
                    )}

                    {/* Slot 2 */}
                    {products[1] ? (
                      <ProductHeaderTh
                        product={products[1]}
                        onRemove={() => handleRemoveProduct(products[1].id)}
                        onChange={() => openPicker(1)}
                      />
                    ) : (
                      <EmptySlotTh
                        onAdd={() => openPicker(1)}
                        title="Add Product 2"
                        subtitle="Click + to select product"
                      />
                    )}

                    {/* Slot 3 (Shown if selected or if 2 products are already picked) */}
                    {products[2] ? (
                      <ProductHeaderTh
                        product={products[2]}
                        onRemove={() => handleRemoveProduct(products[2].id)}
                        onChange={() => openPicker(2)}
                      />
                    ) : products.length >= 2 ? (
                      <SideAddSlotTh
                        onAdd={() => openPicker(2)}
                        label="+ Add 3rd Product"
                      />
                    ) : null}

                    {/* Slot 4 (Shown if selected or if 3 products are already picked) */}
                    {products[3] ? (
                      <ProductHeaderTh
                        product={products[3]}
                        onRemove={() => handleRemoveProduct(products[3].id)}
                        onChange={() => openPicker(3)}
                      />
                    ) : products.length >= 3 ? (
                      <SideAddSlotTh
                        onAdd={() => openPicker(3)}
                        label="+ Add 4th Product"
                      />
                    ) : null}
                  </tr>
                </thead>

                {/* Specs Data Rows (Rendered when at least 1 product is selected) */}
                {products.length > 0 && (
                  <tbody className="divide-y divide-border/60 text-xs">
                    {/* User Rating */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">User Rating</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 font-bold text-foreground">
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="h-4 w-4 fill-amber-400" />
                            <span className="text-foreground font-semibold">{p.rating}</span>
                            <span className="text-muted-foreground text-[11px] font-normal">
                              ({p.reviews.toLocaleString()} reviews)
                            </span>
                          </div>
                        </td>
                      ))}
                      {/* Empty cells for placeholder slots */}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-rating-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* AI Regret Score */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">AI Regret Score</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 font-bold">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${p.regretColor}`}>
                            <ShieldCheck className="h-3.5 w-3.5" /> {p.regretScore}
                          </span>
                        </td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-regret-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* Display */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">Display</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.display}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-disp-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* Processor */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">Processor</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.processor}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-proc-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* RAM Memory */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">RAM Memory</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.ram}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-ram-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* Storage */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">Storage</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.storage}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-store-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* Battery Life */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">Battery Life</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.battery}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-bat-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* Weight */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">Weight</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.weight}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-weight-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>

                    {/* Warranty */}
                    <tr>
                      <td className="p-4 font-bold text-muted-foreground bg-muted/20">Warranty</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-foreground font-medium">{p.warranty}</td>
                      ))}
                      {Array.from({
                        length: Math.max(0, (products.length < 2 ? 2 : products.length < 4 ? products.length + 1 : 4) - products.length),
                      }).map((_, i) => (
                        <td key={`empty-warr-${i}`} className="p-4 text-center text-muted-foreground/40 font-medium">
                          —
                        </td>
                      ))}
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Product Picker Modal */}
        <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <DialogContent className="sm:max-w-[720px] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border bg-card shadow-2xl">
            <div className="p-6 border-b border-border space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <ShoppingBag className="h-5 w-5 text-brand" />
                  Select Product for Comparison
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Pick any verified product to add to Slot {targetSlotIndex !== null ? targetSlotIndex + 1 : products.length + 1}
                </DialogDescription>
              </DialogHeader>

              {/* Search input in modal */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Filter by name, model, or brand (e.g. Apple, M3, RTX 4060, S24)..."
                  className="h-10 rounded-xl pl-9 text-xs border-border/80 bg-background"
                  autoFocus
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "All Items" },
                  { id: "laptops", label: "Laptops", icon: Laptop },
                  { id: "smartphones", label: "Smartphones", icon: Smartphone },
                  { id: "audio", label: "Audio", icon: Headphones },
                  { id: "tablets", label: "Tablets", icon: Tablet },
                  { id: "wearables", label: "Wearables", icon: Watch },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const active = pickerCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setPickerCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                        active
                          ? "bg-foreground text-background shadow-xs"
                          : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredCatalog.map((prod) => {
                const isSelected = products.some((p) => p.id === prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => !isSelected && handleSelectProduct(prod)}
                    className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-brand/40 bg-brand/5 opacity-70 cursor-not-allowed"
                        : "border-border bg-card hover:border-brand/60 hover:bg-muted/40 hover:shadow-xs cursor-pointer group"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-white dark:bg-slate-900 border border-border/60 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                        {prod.brand}
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate">{prod.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-foreground">{prod.price}</span>
                        <span className="text-[10px] text-muted-foreground line-through">{prod.wasPrice}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{prod.processor}</p>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 self-center">
                      {isSelected ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] gap-1">
                          <Check className="h-3 w-3" /> Added
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full text-xs font-semibold px-3 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors"
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredCatalog.length === 0 && (
                <div className="col-span-2 py-10 text-center text-muted-foreground space-y-2">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs font-medium">No products match "{pickerSearch}" in this category.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// Subcomponent: Filled Product Header Cell
function ProductHeaderTh({
  product,
  onRemove,
  onChange,
}: {
  product: SpecProduct;
  onRemove: () => void;
  onChange: () => void;
}) {
  return (
    <th className="p-4 min-w-[250px] relative align-top">
      <div className="relative aspect-[16/11] w-full rounded-2xl bg-white dark:bg-slate-900 border border-border/70 p-3 mb-3 flex items-center justify-center overflow-hidden shadow-2xs group">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain scale-105 group-hover:scale-115 transition-transform duration-300 drop-shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLElement;
            target.style.display = "none";
          }}
        />

        {/* Delete button on top right of the card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-rose-600 p-2 rounded-full bg-background/90 backdrop-blur-md border border-border/70 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all cursor-pointer shadow-sm z-10"
          title="Remove product from comparison"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Change product quick overlay button */}
        <button
          type="button"
          onClick={onChange}
          className="absolute bottom-2 left-2 text-[10px] font-semibold text-foreground/80 bg-background/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/60 hover:text-brand hover:border-brand/50 transition-all shadow-2xs"
        >
          Change Item
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold uppercase text-brand tracking-wider">
            {product.brand}
          </span>
          <h3 className="text-sm font-bold text-foreground line-clamp-1">{product.name}</h3>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-black text-foreground">{product.price}</span>
        <span className="text-xs text-muted-foreground line-through">{product.wasPrice}</span>
      </div>
      <Badge className="mt-2 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
        {product.verdict}
      </Badge>

      {/* Direct Store Links */}
      <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Button
            asChild
            size="sm"
            className="flex-1 rounded-xl text-[11px] font-bold h-7.5 px-2 bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 gap-1 shadow-2xs"
          >
            <a
              href={getPlatformSearchUrl("Amazon", product.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`View ${product.name} on Amazon`}
            >
              <span>Amazon</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 rounded-xl text-[11px] font-bold h-7.5 px-2 bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 border border-blue-500/30 gap-1 shadow-2xs"
          >
            <a
              href={getPlatformSearchUrl("Flipkart", product.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`View ${product.name} on Flipkart`}
            >
              <span>Flipkart</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        <Button
          asChild
          size="sm"
          className="w-full rounded-xl text-[11px] font-bold h-7.5 bg-brand text-white hover:bg-brand/90 gap-1 shadow-2xs cursor-pointer"
        >
          <Link to="/compare" search={{ q: product.name }}>
            <Scale className="h-3 w-3" />
            <span>Compare All Stores</span>
          </Link>
        </Button>
      </div>
    </th>

  );
}

// Subcomponent: Empty Slot Template with centered "+"
function EmptySlotTh({
  onAdd,
  title,
  subtitle,
}: {
  onAdd: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <th className="p-4 min-w-[250px] relative align-top">
      <div
        onClick={onAdd}
        className="relative aspect-[16/11] w-full rounded-2xl border-2 border-dashed border-border/90 hover:border-brand/80 bg-muted/20 hover:bg-brand/5 p-4 flex flex-col items-center justify-center cursor-pointer transition-all group shadow-2xs"
      >
        {/* Large "+" centered icon button */}
        <div className="h-12 w-12 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all shadow-xs mb-2">
          <Plus className="h-6 w-6" />
        </div>
        <span className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5 text-center">
          {subtitle}
        </span>
      </div>
    </th>
  );
}

// Subcomponent: Side "+ Add More Products" Slot
function SideAddSlotTh({
  onAdd,
  label,
}: {
  onAdd: () => void;
  label: string;
}) {
  return (
    <th className="p-4 min-w-[220px] relative align-top">
      <div
        onClick={onAdd}
        className="relative aspect-[16/11] w-full rounded-2xl border-2 border-dashed border-blue-400/40 hover:border-brand bg-blue-500/5 hover:bg-blue-500/10 p-4 flex flex-col items-center justify-center cursor-pointer transition-all group shadow-2xs"
      >
        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs mb-2">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">Compare 3rd/4th product</span>
      </div>
    </th>
  );
}
