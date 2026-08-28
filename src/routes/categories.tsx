import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Laptop,
  Shirt,
  Sofa,
  Watch,
  Gift,
  Sparkles,
  Headphones,
  Smartphone,
  Tv,
  Gamepad2,
  Camera,
  Search,
  Heart,
  Scale,
  ChevronRight,
  Star,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useLikes } from "@/context/LikesContext";
import { getRealBrandSuggestions, inferBrand } from "@/lib/groq";
import { getFull10000Catalog, type CatalogProduct as CategoryProduct } from "@/data/catalog";

export type { CategoryProduct };


export const Route = createFileRoute("/categories")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => {
    return {
      category: typeof search.category === "string" ? search.category : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "10,000+ Product Catalog & Categories — ZGenie" },
      {
        name: "description",
        content:
          "Explore 10,000+ verified distinct commercial products across 10 departments with live retailer price comparisons and regret intelligence.",
      },
    ],
  }),
  component: CategoriesPage,
});


interface CategoryItem {
  id: string;
  name: string;
  icon: any;
  desc: string;
  accent: string;
}

const ALL_CATEGORIES: CategoryItem[] = [
  {
    id: "all",
    name: "All Categories",
    icon: Sparkles,
    desc: "Browse entire 5,000+ product catalog across all departments",
    accent: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  {
    id: "smartphones",
    name: "Smartphones & Tablets",
    icon: Smartphone,
    desc: "iPhone, Galaxy, OnePlus, Pixel, iQOO, Vivo & Tablets",
    accent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    id: "laptops",
    name: "Laptops & Computers",
    icon: Laptop,
    desc: "Ultrabooks, Gaming Rigs, MacBooks, Copilot+ PCs & Workstations",
    accent: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  {
    id: "audio",
    name: "Headphones & Audio",
    icon: Headphones,
    desc: "ANC Earbuds, Over-Ear, Hi-Fi Monitors & Bluetooth Speakers",
    accent: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  {
    id: "tv",
    name: "Smart TVs & Home Theater",
    icon: Tv,
    desc: "OLED 4K, Mini-LED, QLED, Soundbars & Streaming Tech",
    accent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  {
    id: "gaming",
    name: "Gaming & Consoles",
    icon: Gamepad2,
    desc: "PS5, Xbox Series X, ROG Ally Handhelds & Pro Gear",
    accent: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  {
    id: "cameras",
    name: "Cameras & Drones",
    icon: Camera,
    desc: "Full-Frame Mirrorless, 4K/8K Action Cams & Gimbal Drones",
    accent: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  },
  {
    id: "wearables",
    name: "Smart Wearables",
    icon: Watch,
    desc: "Apple Watch Ultra, Galaxy Watch, Garmin & Health Rings",
    accent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    id: "home-office",
    name: "Home & Smart Office",
    icon: Sofa,
    desc: "Herman Miller Chairs, Desks, MX Mouses & Air Purifiers",
    accent: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    icon: Shirt,
    desc: "Sneakers, Jackets, Activewear, Denim & Premium Watches",
    accent: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  {
    id: "gifts",
    name: "Smart Gifts & Tech",
    icon: Gift,
    desc: "Curated smart gadgets, Dyson vacuums, Kindles & AirTags",
    accent: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
];

export const COMPREHENSIVE_CATALOG: CategoryProduct[] = getFull10000Catalog();


function CategoriesPage() {
  const { category: initialCatQuery } = Route.useSearch();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCatQuery || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"featured" | "price_low" | "price_high" | "rating" | "discount">("featured");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;
  const { isLiked, toggleLike } = useLikes();

  // Keep state synced if URL category query changes
  useEffect(() => {
    if (initialCatQuery && initialCatQuery !== selectedCategoryId) {
      setSelectedCategoryId(initialCatQuery);
      setCurrentPage(1);
    }
  }, [initialCatQuery]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find active category
  const activeCategory = useMemo(() => {
    return ALL_CATEGORIES.find((c) => c.id === selectedCategoryId) || ALL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Product counts per category from master 10,000 catalog (minimum 1,000 per category)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: COMPREHENSIVE_CATALOG.length,
    };
    for (const cat of ALL_CATEGORIES) {
      if (cat.id !== "all") {
        counts[cat.id] = COMPREHENSIVE_CATALOG.filter((p) => p.categoryId === cat.id).length;
      }
    }
    return counts;
  }, []);

  function applySorting(prods: CategoryProduct[], sort: string) {
    if (sort === "price_low") {
      prods.sort((a, b) => a.price - b.price);
    } else if (sort === "price_high") {
      prods.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      prods.sort((a, b) => b.rating - a.rating);
    } else if (sort === "discount") {
      prods.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price));
    }
  }

  // Intelligent search matching: searches active category, all categories, and brand/token fallbacks
  const { filteredProducts, isFallbackMatch, activeSuggestions, groupedByCategory } = useMemo(() => {
    let prods: CategoryProduct[] = [];

    if (!searchQuery.trim()) {
      if (activeCategory.id === "all") {
        prods = [...COMPREHENSIVE_CATALOG];
      } else {
        prods = COMPREHENSIVE_CATALOG.filter((p) => p.categoryId === activeCategory.id);
      }
      applySorting(prods, sortOption);

      // Group by category when "all" is active
      const grouped: Record<string, CategoryProduct[]> = {};
      if (activeCategory.id === "all") {
        for (const cat of ALL_CATEGORIES) {
          if (cat.id !== "all") {
            const catProds = prods.filter((p) => p.categoryId === cat.id);
            if (catProds.length > 0) {
              grouped[cat.id] = catProds;
            }
          }
        }
      }

      return {
        filteredProducts: prods,
        isFallbackMatch: false,
        activeSuggestions: [],
        groupedByCategory: grouped,
      };
    }

    const q = searchQuery.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);

    // 1. Match in active category (if not "all")
    if (activeCategory.id !== "all") {
      let directCatMatches = COMPREHENSIVE_CATALOG.filter(
        (p) =>
          p.categoryId === activeCategory.id &&
          (p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.tag.toLowerCase().includes(q))
      );

      if (directCatMatches.length > 0) {
        applySorting(directCatMatches, sortOption);
        return {
          filteredProducts: directCatMatches,
          isFallbackMatch: false,
          activeSuggestions: [],
          groupedByCategory: {},
        };
      }
    }

    // 2. Direct match across ALL categories
    let allCatMatches = COMPREHENSIVE_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
    );

    if (allCatMatches.length > 0) {
      applySorting(allCatMatches, sortOption);
      return {
        filteredProducts: allCatMatches,
        isFallbackMatch: false,
        activeSuggestions: [],
        groupedByCategory: {},
      };
    }

    // 3. Token & Brand matching
    const brandFromQuery = inferBrand(q).toLowerCase();
    let tokenMatches = COMPREHENSIVE_CATALOG.filter((p) => {
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      
      if (brandFromQuery !== "verified" && pBrand.includes(brandFromQuery)) return true;
      return tokens.some((t) => pName.includes(t) || pBrand.includes(t));
    });

    if (tokenMatches.length > 0) {
      applySorting(tokenMatches, sortOption);
      return {
        filteredProducts: tokenMatches,
        isFallbackMatch: true,
        activeSuggestions: [],
        groupedByCategory: {},
      };
    }

    // 4. No verified product found - calculate real brand recommendations
    const sugs = getRealBrandSuggestions(searchQuery);
    return {
      filteredProducts: [],
      isFallbackMatch: false,
      activeSuggestions: sugs,
      groupedByCategory: {},
    };
  }, [activeCategory, searchQuery, sortOption]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  const handleProductLike = (p: CategoryProduct) => {
    toggleLike({
      product_id: p.id,
      product_name: p.name,
      price: p.price,
      original_price: p.originalPrice,
      rating: p.rating,
      regret_score: p.regretScore,
      category: p.category,
    });
  };

  const renderProductCard = (p: CategoryProduct) => {
    const liked = isLiked(p.id);

    return (
      <Card
        key={p.id}
        className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          {/* Top Card Visual Image Header */}
          <div className="relative aspect-[16/11] bg-white dark:bg-slate-900/90 p-3 flex flex-col justify-between border-b border-border/40 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector(".fallback-icon")) {
                    const iconWrapper = document.createElement("div");
                    iconWrapper.className = "fallback-icon flex items-center justify-center text-muted-foreground/40";
                    iconWrapper.innerHTML = `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>`;
                    parent.appendChild(iconWrapper);
                  }
                }}
              />
            </div>

            {/* Floating Badges over Image */}
            <div className="relative z-10 flex items-center justify-between pointer-events-auto">
              <Badge className="rounded-full bg-background/90 backdrop-blur-xs border border-border/60 text-foreground text-[10px] font-bold shadow-xs">
                {p.tag}
              </Badge>
              <button
                onClick={() => handleProductLike(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-xs shadow-xs border transition-all active:scale-90 hover:scale-105 cursor-pointer ${
                  liked
                    ? "border-rose-200 bg-rose-50 text-rose-500"
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

            <div className="relative z-10 flex items-center justify-between mt-auto pt-2">
              <span className="text-[10px] uppercase font-black text-foreground/90 bg-background/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/50 tracking-wider">
                {p.brand}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-background/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/50">
                Verified Model
              </span>
            </div>
          </div>


          {/* Card Body */}
          <CardContent className="p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground mb-1">
                <span className="font-semibold uppercase tracking-wider">{p.brand}</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{p.rating}</span>
                  <span className="text-muted-foreground font-normal text-[9px]">
                    ({p.reviewsCount.toLocaleString()})
                  </span>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug">
                {p.name}
              </h3>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-foreground">
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
                {p.originalPrice > p.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{p.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                {p.discount}
              </Badge>
            </div>

            {/* Regret Risk Score */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> Regret Score:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {p.regretScore}
              </span>
            </div>
          </CardContent>
        </div>

        {/* Card Footer Button */}
        <div className="p-4 pt-0">
          <Button
            asChild
            className="w-full rounded-2xl text-xs font-bold gap-1.5 bg-brand text-white hover:bg-brand/90 h-9 shadow-xs cursor-pointer"
          >
            <Link to="/compare" search={{ q: p.name }}>
              <Scale className="h-3.5 w-3.5" /> Compare Live Prices
            </Link>
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb & Hero Banner */}
        <div className="rounded-3xl bg-linear-to-r from-brand/10 via-brand/5 to-transparent border border-brand/20 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              10,000+ Verified Commercial Products
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              Explore All Product Categories
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse 10,000+ authentic, distinct products across 10 commercial categories (min 1,000 items each). Compare real-time prices across Amazon, Flipkart, Blinkit, Croma, and Reliance Digital with AI Regret Intelligence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button
              asChild
              className="rounded-2xl text-xs font-bold gap-1.5 h-10 px-4 bg-brand text-white hover:bg-brand/90 shadow-sm"
            >
              <Link to="/compare" search={{ q: "iPhone 16 Pro" }}>
                <Scale className="h-4 w-4" /> Multi-Store Price Engine
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-2xl text-xs font-semibold gap-1.5 h-10 px-4 border-border/80"
            >
              <Link to="/assistant">
                <Sparkles className="h-4 w-4 text-brand" /> Ask Shopping AI
              </Link>
            </Button>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar Categories List + Main Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Categories Navigation Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3 sticky top-20">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Departments (10)
              </h3>
              <span className="text-[11px] font-bold text-brand">
                10,000 Total Items
              </span>
            </div>


            <div className="space-y-1.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
              {ALL_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategoryId === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand/5 shadow-xs ring-1 ring-brand/30"
                        : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform ${
                          isSelected ? "bg-brand text-white shadow-2xs scale-105" : cat.accent
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-brand" : "text-foreground"
                            }`}
                          >
                            {cat.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{cat.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-brand text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {count.toLocaleString()}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${
                          isSelected ? "text-brand translate-x-0.5" : "text-muted-foreground/40"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Products Grid of Selected Category */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Active Category Header Card with Integrated Search */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeCategory.accent}`}>
                    <activeCategory.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-foreground">{activeCategory.name}</h2>
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {filteredProducts.length.toLocaleString()} Products
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeCategory.desc}</p>
                  </div>
                </div>

                {/* Sort Filter Options */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0 hidden sm:inline">
                    Sort by:
                  </span>
                  {[
                    { id: "featured", label: "Featured" },
                    { id: "price_low", label: "Lowest Price" },
                    { id: "price_high", label: "Highest Price" },
                    { id: "rating", label: "Top Rated" },
                    { id: "discount", label: "Max Discount" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortOption(opt.id as any);
                        setCurrentPage(1);
                      }}
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        sortOption === opt.id
                          ? "bg-brand text-white shadow-2xs"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Category Search Box */}
              <div className="relative pt-2 border-t border-border/60">
                <Search className="pointer-events-none absolute left-3.5 top-[calc(50%+4px)] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={
                    activeCategory.id === "all"
                      ? "Search across 5,000+ products (e.g. iPhone 16, RTX 4070, Sony, Nike, Dyson)..."
                      : `Search inside ${activeCategory.name} (e.g. model, brand, features)...`
                  }
                  className="h-11 rounded-2xl pl-10 pr-12 text-xs bg-background text-foreground shadow-2xs border-border/80"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3.5 top-[calc(50%+4px)] -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-muted cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Fallback Match Notice Banner */}
            {isFallbackMatch && searchQuery.trim() && filteredProducts.length > 0 && (
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="h-4 w-4 text-brand shrink-0" />
                  <span className="text-foreground">
                    No exact model named <strong className="text-brand">"{searchQuery}"</strong> exists. Showing verified authentic <strong className="capitalize">{inferBrand(searchQuery)}</strong> products below:
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-[11px] font-bold h-7 px-2.5 shrink-0"
                >
                  <Link to="/compare" search={{ q: searchQuery }}>
                    Analyze "{searchQuery}" <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Products Grid or Section-by-Section Rendering */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 sm:p-12 text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <AlertCircle className="h-7 w-7" />
                </div>
                
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-lg font-black text-foreground">
                    No product named "{searchQuery}" found
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    We couldn't find a verified product matching <strong className="text-foreground">"{searchQuery}"</strong> in this catalog.
                  </p>
                </div>

                {/* Did You Mean Smart Recommendations */}
                {activeSuggestions.length > 0 && (
                  <div className="pt-2 max-w-xl mx-auto space-y-3">
                    <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand" />
                      Did you mean one of these verified products?
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {activeSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setSearchQuery(sug);
                            setCurrentPage(1);
                          }}
                          className="rounded-full bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold px-3.5 py-1.5 border border-brand/20 transition-all cursor-pointer shadow-2xs hover:scale-105"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                  <Button
                    asChild
                    className="rounded-2xl text-xs font-bold gap-1.5 h-10 px-5 bg-brand text-white hover:bg-brand/90 shadow-xs cursor-pointer"
                  >
                    <Link to="/compare" search={{ q: searchQuery }}>
                      <Scale className="h-3.5 w-3.5" /> Compare in Live Store Engine
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="rounded-2xl text-xs font-semibold h-10 px-4 cursor-pointer"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            ) : activeCategory.id === "all" && !searchQuery.trim() && Object.keys(groupedByCategory).length > 0 ? (
              /* SECTION-BY-SECTION DISPLAY ACCORDING TO CATEGORY */
              <div className="space-y-12">
                {ALL_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                  const catProducts = groupedByCategory[cat.id] || [];
                  if (catProducts.length === 0) return null;
                  const IconComp = cat.icon;
                  // Show top 6 products per department showcase in All Categories overview
                  const showcaseProducts = catProducts.slice(0, 6);

                  return (
                    <div key={cat.id} className="space-y-4 pt-2">
                      {/* Section Header */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cat.accent}`}>
                            <IconComp className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-foreground">{cat.name}</h3>
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                {catProducts.length} Items
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{cat.desc}</p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectCategory(cat.id)}
                          className="text-xs font-bold text-brand hover:text-brand/80 gap-1 rounded-xl h-8 cursor-pointer"
                        >
                          View All {catProducts.length} Products <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Products Grid for this category section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {showcaseProducts.map((p) => renderProductCard(p))}
                      </div>

                      <div className="text-center pt-2">
                        <Button
                          variant="outline"
                          onClick={() => handleSelectCategory(cat.id)}
                          className="rounded-2xl text-xs font-bold h-9 px-6 border-dashed border-brand/40 text-brand hover:bg-brand/5 cursor-pointer"
                        >
                          Explore all {catProducts.length} {cat.name} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* PAGINATED CATEGORY GRID DISPLAY */
              <div className="space-y-8">
                {/* Active Page Indicator */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>
                    Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong>–<strong className="text-foreground">{Math.min(currentPage * pageSize, filteredProducts.length)}</strong> of <strong className="text-foreground">{filteredProducts.length.toLocaleString()}</strong> products
                  </span>
                  <span>
                    Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedProducts.map((p) => renderProductCard(p))}
                </div>

                {/* Full Pagination Controls */}
                {totalPages > 1 && (
                  <div className="rounded-3xl border border-border/70 bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="text-xs text-muted-foreground font-medium">
                      Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong> ({filteredProducts.length.toLocaleString()} items)
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                        className="rounded-xl h-8 w-8 p-0 cursor-pointer disabled:opacity-40"
                        title="First Page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="rounded-xl h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Prev
                      </Button>

                      {/* Page number buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = currentPage;
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={`rounded-xl h-8 w-8 p-0 text-xs font-bold cursor-pointer ${
                              currentPage === pageNum ? "bg-brand text-white shadow-2xs" : ""
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="rounded-xl h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer disabled:opacity-40"
                      >
                        Next <ChevronRight className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="rounded-xl h-8 w-8 p-0 cursor-pointer disabled:opacity-40"
                        title="Last Page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
