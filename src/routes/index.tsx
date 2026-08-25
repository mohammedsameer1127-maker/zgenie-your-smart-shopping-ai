import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Gift,
  Heart,
  Laptop,
  LineChart,
  Scale,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Star,
  CheckCircle2,
  Globe,
  Package,
  ShoppingCart,
  Store,
  Building2,
  Bot,
  Clock,
  Zap,
  Lock,
  Headphones,
  Smartphone,
  Loader2,
  Search,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import heroImg from "@/assets/hero.png";
import { useAuth } from "@/context/AuthContext";
import { useLikes } from "@/context/LikesContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZGenie — Shop Smarter. Decide Better." },
      {
        name: "description",
        content:
          "ZGenie is your next-generation AI-powered shopping companion. Compare prices across Amazon, Flipkart, Meesho, Myntra, & Blinkit with live price tracking and regret score analysis.",
      },
      { property: "og:title", content: "ZGenie — Shop Smarter. Decide Better." },
      {
        property: "og:description",
        content:
          "AI shopping intelligence with live price tracking and specs comparison across top retailers.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppLayout>
      <HeroSection />
      <FeatureCardsSection />
      <RetailerSyncSection />
      <MultiPlatformHomeShowcase />
      <ProductComparisonShowcase />
      <FeatureCategoryGrid />
      <TrustBenefitsSection />
      <CtaSection />
    </AppLayout>
  );
}

/* =========================================================================
   1. HERO SECTION
   ========================================================================= */
function HeroSection() {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-6 pb-2 sm:pt-8 sm:pb-4 lg:pt-12 lg:pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-6">
          
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-xs">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Next-Gen AI Shopping Intelligence
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.12]">
                Shop Smarter. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Decide Better.
                </span>
              </h1>
              <p className="text-base sm:text-lg font-semibold text-foreground/80">
                Your AI-Powered Shopping Companion.
              </p>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              ZGenie helps you discover products, get personalized AI recommendations, track live prices across major retailers, compare products when needed, and make confident purchasing decisions.
            </p>

            {/* Action Buttons with Authentication Guard & Auto-Redirect */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() =>
                  requireAuth(
                    () => navigate({ to: "/compare", search: { q: "" } }),
                    "Sign in to compare live prices across verified Indian retailers."
                  )
                }
                className="h-11 rounded-full px-6 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs gap-2 cursor-pointer"
              >
                <Scale className="h-4 w-4" /> Compare Live Prices
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  requireAuth(
                    () => navigate({ to: "/assistant" }),
                    "Sign in to chat with ZGenie AI Shopping Assistant."
                  )
                }
                className="h-11 rounded-full px-5 text-xs font-semibold border-border/80 bg-card text-foreground hover:bg-muted shadow-xs gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-blue-600" /> Ask ZGenie AI
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() =>
                  requireAuth(
                    () => navigate({ to: "/shop" }),
                    "Sign in to explore our verified multi-store catalog."
                  )
                }
                className="h-11 rounded-full px-4 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Explore Catalog <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>5 Major Retailers Synced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Zero Sponsored Bias</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>AI Regret Risk Scoring</span>
              </div>
            </div>
          </div>

          {/* Right Column: Enlarged Rounded-3xl Hero Image Container & Phone Mockup */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-none flex items-center justify-center rounded-3xl group">
              
              {/* Vibrant Multi-Corner Glowing Ambient Effects */}
              <div className="absolute -top-12 -right-12 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl -z-10 pointer-events-none opacity-80" />
              <div className="absolute -bottom-12 -left-12 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl -z-10 pointer-events-none opacity-80" />
              <div className="absolute top-1/3 -right-14 h-72 w-72 rounded-full bg-purple-500/15 blur-2xl -z-10 pointer-events-none" />
              <div className="absolute bottom-1/3 -left-14 h-72 w-72 rounded-full bg-cyan-500/15 blur-2xl -z-10 pointer-events-none" />
              
              {/* Central Ambient Backdrop Glow with Rounded-3xl */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl -z-10 pointer-events-none" />

              {/* Inner Mock-phone container with rounded-3xl */}
              <div className="w-full overflow-hidden rounded-3xl shadow-xl border border-blue-500/15 bg-card/60 backdrop-blur-xs p-1 sm:p-2">
                <img
                  src={heroImg}
                  alt="ZGenie Smart Shopping Intelligence — Real-Time Multi-Store Price Tracker"
                  width={1600}
                  height={1066}
                  className="w-full h-auto max-h-[750px] sm:max-h-[850px] lg:max-h-[920px] xl:max-h-[980px] object-contain rounded-3xl drop-shadow-[0_25px_60px_rgba(37,99,235,0.18)] select-none transition-transform duration-300 hover:scale-[1.01]"
                  loading="eager"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   2. FEATURE CARDS (4 CARDS)
   ========================================================================= */
const FEATURE_CARDS = [
  {
    title: "AI Shopping Assistant",
    description: "Get personalized recommendations and answers to your shopping questions.",
    icon: Bot,
    to: "/assistant",
    accent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    borderHover: "hover:border-blue-500/40",
    message: "Sign in to chat with our AI Shopping Assistant.",
  },
  {
    title: "Live Price Tracking",
    description: "Track and monitor product prices across multiple major retailers in real time.",
    icon: LineChart,
    to: "/shop",
    accent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/40",
    message: "Sign in to access live multi-platform price tracking.",
  },
  {
    title: "Smart Product Comparison",
    description: "Compare products, specifications, prices, and key features easily.",
    icon: Scale,
    to: "/compare",
    search: { q: "" },
    accent: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    borderHover: "hover:border-purple-500/40",
    message: "Sign in to compare product specifications and store deals.",
  },
  {
    title: "Review & Regret Analysis",
    description: "Analyze customer reviews and product satisfaction before buying.",
    icon: ShieldCheck,
    to: "/shop",
    accent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    borderHover: "hover:border-amber-500/40",
    message: "Sign in to view AI regret scores and verified review insights.",
  },
];

function FeatureCardsSection() {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 pt-0 pb-6 sm:pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURE_CARDS.map((feature) => {
          const IconComp = feature.icon;
          return (
            <div
              key={feature.title}
              role="button"
              tabIndex={0}
              onClick={() =>
                requireAuth(
                  () => navigate({ to: feature.to, search: feature.search }),
                  feature.message
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  requireAuth(
                    () => navigate({ to: feature.to, search: feature.search }),
                    feature.message
                  );
                }
              }}
              className={`group rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${feature.borderHover} flex flex-col justify-between cursor-pointer`}
            >
              <div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${feature.accent} transition-transform group-hover:scale-105`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand group-hover:translate-x-1 transition-transform">
                <span>Explore Feature</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
   3. RETAILER SECTION
   ========================================================================= */
const RETAILERS = [
  { name: "Amazon", icon: Package, badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  { name: "Flipkart", icon: ShoppingBag, badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  { name: "Croma", icon: Store, badgeColor: "bg-teal-500/10 text-teal-700 border-teal-500/30" },
  { name: "Reliance Digital", icon: Building2, badgeColor: "bg-red-500/10 text-red-700 border-red-500/30" },
  { name: "Meesho", icon: ShoppingCart, badgeColor: "bg-pink-500/10 text-pink-700 border-pink-500/30" },
  { name: "Myntra", icon: Shirt, badgeColor: "bg-rose-500/10 text-rose-700 border-rose-500/30" },
  { name: "Blinkit", icon: Zap, badgeColor: "bg-yellow-500/10 text-yellow-800 border-yellow-500/30" },
];

function RetailerSyncSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          LIVE PRICE SYNC ACROSS VERIFIED AUTHORIZED RETAILERS
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {RETAILERS.map((r) => {
            const IconComponent = r.icon;
            return (
              <div
                key={r.name}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-2xs ${r.badgeColor} select-none cursor-default`}
              >
                <IconComponent className="h-4 w-4 shrink-0" />
                <span>{r.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   4. MULTI-PLATFORM LIVE COMPARISON PREVIEW
   ========================================================================= */
function MultiPlatformHomeShowcase() {
  const [searchTerm, setSearchTerm] = useState("");
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTerm.trim();
    requireAuth(
      () => {
        if (clean) {
          navigate({ to: "/compare", search: { q: clean } });
        } else {
          navigate({ to: "/compare", search: { q: "" } });
        }
      },
      clean ? `Sign in to compare live store prices for "${clean}".` : "Sign in to search and compare live prices."
    );
  };

  const handleChipClick = (productName: string) => {
    requireAuth(
      () => navigate({ to: "/compare", search: { q: productName } }),
      `Sign in to compare live store prices for "${productName}".`
    );
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
            <Scale className="mr-1.5 h-3.5 w-3.5" /> Multi-Platform Price Compare Engine
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1.5">
            Search Product & Compare Live Store Prices
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fetches verified real-time prices across Amazon, Flipkart, Croma, Reliance Digital, Blinkit, Myntra, Meesho, and Tata CLiQ.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            requireAuth(
              () => navigate({ to: "/compare", search: { q: "" } }),
              "Sign in to launch the full comparison tool."
            )
          }
          className="rounded-full text-xs font-semibold h-9.5 px-4 cursor-pointer"
        >
          Launch Full Comparison Tool <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Interactive Home Compare Search Card with Auth Guard & Auto-Redirect */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exact phone or product (e.g. iQOO Neo 9 Pro, Infinix Note 40, iPhone 16 Pro, S24 Ultra, OnePlus 12)..."
              className="h-12 rounded-2xl pl-11 text-xs bg-background text-foreground"
            />
          </div>
          <Button
            type="submit"
            className="h-12 rounded-2xl px-7 font-bold text-xs gap-2 shadow-xs bg-brand text-white hover:bg-brand/90 cursor-pointer"
          >
            <Scale className="h-4 w-4" />
            <span>Compare Live Prices</span>
          </Button>
        </form>

        {/* Popular Comparison Quick Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground">Popular Comparisons:</span>
          {[
            "iQOO Neo 9 Pro",
            "Infinix Note 40 Pro",
            "Apple iPhone 16 Pro",
            "Samsung Galaxy S24 Ultra",
            "OnePlus 12",
            "Google Pixel 9 Pro",
            "Sony WH-1000XM5",
            "MacBook Air M2",
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="rounded-xl bg-muted/60 hover:bg-brand hover:text-white px-3 py-1.5 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   5. FEATURED PRODUCTS SHOWCASE
   ========================================================================= */
const COMPARISON_PRODUCTS = [
  {
    name: "Apple MacBook Air M3 (16GB, 512GB SSD)",
    category: "Laptops & Computers",
    price: 124990,
    was: 134900,
    rating: 4.9,
    regretScore: "Ultra Safe (1%)",
    verdict: "Winner: Power & Battery",
    tag: "98% Match",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-midnight-select-202402?wid=600&hei=600&fmt=png-alpha",
  },
  {
    name: "Apple iPhone 16 Pro (128GB - Desert Titanium)",
    category: "Smartphones & Tablets",
    price: 119490,
    was: 119900,
    rating: 4.9,
    regretScore: "Very Low (1%)",
    verdict: "Top Flagship Camera",
    tag: "Editor Choice",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=600&hei=600&fmt=png-alpha",
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G (256GB)",
    category: "Smartphones & Tablets",
    price: 109999,
    was: 129999,
    rating: 4.8,
    regretScore: "Low (3%)",
    verdict: "Best Android Flagship",
    tag: "Trending",
    image: "https://m.media-amazon.com/images/I/71RVu88nx6L._SL1500_.jpg",
  },
  {
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    category: "Headphones & Audio",
    price: 24990,
    was: 34990,
    rating: 4.8,
    regretScore: "Minimal (3%)",
    verdict: "Top Noise Canceling",
    tag: "Best Audio Deal",
    image: "https://www.sony.co.in/image/6145c1d32e6ac8e63a46c912dc33d5bb?fmt=png-alpha&wid=600",
  },
];

function ProductComparisonShowcase() {
  const { isLiked, toggleLike, actionLoading } = useLikes();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const handleLikeClick = (p: (typeof COMPARISON_PRODUCTS)[0]) => {
    const pId = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    toggleLike({
      product_id: pId,
      product_name: p.name,
      price: p.price,
      original_price: p.was,
      rating: p.rating,
      regret_score: p.regretScore,
      category: p.category,
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Top Evaluated</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
            Trending Side-by-Side Product Cards
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={() =>
            requireAuth(
              () => navigate({ to: "/shop" }),
              "Sign in to explore the complete verified product catalog."
            )
          }
          className="rounded-full text-xs font-semibold text-brand px-3.5 cursor-pointer"
        >
          Explore Full Catalog <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COMPARISON_PRODUCTS.map((p) => {
          const pId = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const liked = isLiked(pId);
          const isProcessing = !!actionLoading[pId];

          return (
            <Card key={p.name} className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/11] bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between overflow-hidden border-b border-border/40">
                  {/* Zoomed-in Official Product Image */}
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
                    <Badge className="rounded-full bg-background/90 backdrop-blur-xs border border-border/60 text-foreground text-[10px] font-bold shadow-2xs">{p.tag}</Badge>
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
                    <span className="text-muted-foreground">Verdict:</span>
                    <span className="text-brand font-semibold">{p.verdict}</span>
                  </div>
                </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{p.category}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5">{p.name}</h3>
                </div>

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

                <div className="rounded-xl border border-border bg-muted/20 px-3 py-1.5 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">Regret Score:</span>
                  <span className="font-semibold text-emerald-600">{p.regretScore}</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Button
                onClick={() =>
                  requireAuth(
                    () => navigate({ to: "/compare", search: { q: p.name } }),
                    `Sign in to compare live store prices for ${p.name}.`
                  )
                }
                className="w-full rounded-full text-xs font-semibold gap-1.5 h-9 bg-brand hover:bg-brand/90 text-white shadow-xs cursor-pointer"
              >
                <Scale className="h-3.5 w-3.5" /> Compare Stores
              </Button>
            </div>
          </Card>
        );
      })}
      </div>
    </section>
  );
}

/* =========================================================================
   6. CATEGORIES GRID
   ========================================================================= */
const CATEGORIES = [
  { name: "Laptops & Computers", icon: Laptop, count: "1,240+ Products", tint: "bg-blue-500/10 text-blue-600", categoryId: "laptops" },
  { name: "Smartphones & Tablets", icon: Smartphone, count: "890+ Products", tint: "bg-purple-500/10 text-purple-600", categoryId: "smartphones" },
  { name: "Audio & Headphones", icon: Headphones, count: "650+ Products", tint: "bg-pink-500/10 text-pink-600", categoryId: "audio" },
  { name: "Home & Office Tech", icon: Sofa, count: "1,100+ Products", tint: "bg-emerald-500/10 text-emerald-600", categoryId: "home" },
  { name: "Fashion & Wearables", icon: Shirt, count: "2,400+ Products", tint: "bg-amber-500/10 text-amber-600", categoryId: "fashion" },
  { name: "Smart Gifts & Gadgets", icon: Gift, count: "420+ Products", tint: "bg-indigo-500/10 text-indigo-600", categoryId: "gifts" },
];

function FeatureCategoryGrid() {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Categorized Catalog</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">Explore Products by Category</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            requireAuth(
              () => navigate({ to: "/categories" }),
              "Sign in to browse all product categories."
            )
          }
          className="rounded-full text-xs font-semibold h-9 px-4 cursor-pointer"
        >
          View All Categories →
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ name, icon: Icon, count, tint, categoryId }) => (
          <div
            key={name}
            role="button"
            tabIndex={0}
            onClick={() =>
              requireAuth(
                () => navigate({ to: "/categories", search: { category: categoryId } }),
                `Sign in to explore ${name}.`
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                requireAuth(
                  () => navigate({ to: "/categories", search: { category: categoryId } }),
                  `Sign in to explore ${name}.`
                );
              }
            }}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm cursor-pointer"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint} transition-transform group-hover:scale-105`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-semibold text-foreground line-clamp-1">{name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{count}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   7. TRUST / BENEFITS SECTION (4 INFORMATIONAL LABELS)
   ========================================================================= */
const TRUST_BENEFITS = [
  {
    title: "100% Trusted",
    description: "Accurate and reliable price information across verified stores.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Updates",
    description: "Live price sync across Amazon, Flipkart, Croma, & Reliance.",
    icon: Zap,
  },
  {
    title: "Zero Sponsored Bias",
    description: "Unbiased algorithm prioritizing your wallet & regret score.",
    icon: Lock,
  },
  {
    title: "24/7 AI Assistant",
    description: "AI Shopping Assistant ready to answer any buying question.",
    icon: Clock,
  },
];

function TrustBenefitsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_BENEFITS.map((benefit) => {
          const BenefitIcon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs text-center space-y-2 select-none"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <BenefitIcon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
   8. CTA SECTION
   ========================================================================= */
function CtaSection() {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white shadow-md">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Start Shopping Smarter with ZGenie
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              Create your free account today to track price drops across Amazon, Flipkart, Meesho, Myntra, & Blinkit.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:items-end">
            <Button
              size="lg"
              className="h-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs shadow-xs px-5.5 cursor-pointer"
              onClick={() =>
                requireAuth(
                  () => navigate({ to: "/compare", search: { q: "" } }),
                  "Sign in to start comparing store prices for free."
                )
              }
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-10 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 font-semibold text-xs px-5.5 cursor-pointer"
              onClick={() =>
                requireAuth(
                  () => navigate({ to: "/assistant" }),
                  "Sign in to try ZGenie AI Shopping Assistant."
                )
              }
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Try AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
