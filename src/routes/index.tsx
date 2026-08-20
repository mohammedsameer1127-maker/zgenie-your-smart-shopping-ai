import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Camera,
  Flame,
  Gift,
  Heart,
  Laptop,
  LineChart,
  Mic,
  Scale,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Star,
  TrendingUp,
  Watch,
  CheckCircle2,
  ExternalLink,
  Globe,
  Award,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiPlatformCompare } from "@/components/compare/MultiPlatformCompare";
import heroImg from "@/assets/hero.png";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZGenie — Your Smart Shopping AI" },
      {
        name: "description",
        content:
          "ZGenie compares product prices and quality specs across Amazon, Flipkart, Meesho, Croma, & Reliance Digital. AI price predictions & regret scores.",
      },
      { property: "og:title", content: "ZGenie — Your Smart Shopping AI" },
      {
        property: "og:description",
        content:
          "Multi-platform product comparison across Amazon, Flipkart, Meesho, Croma, and Reliance Digital.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppLayout>
      <HeroSection />
      <MultiPlatformHomeShowcase />
      <FeatureCategoryGrid />
      <ProductComparisonShowcase />
      <CoreCapabilities />
      <SmartDealsSection />
      <TestimonialsSection />
      <CtaSection />
    </AppLayout>
  );
}

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  const handleCompareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const query = searchQuery.trim();
      if (!query) {
        toast.error("Please enter a product name to compare.");
        navigate({ to: "/compare", search: { q: "" } });
        return;
      }
      toast.success(`Searching multi-platform deals for "${query}" across Amazon, Flipkart, Meesho, Croma, & Reliance Digital...`);
      navigate({ to: "/compare", search: { q: query } });
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900/5 via-background to-background py-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        
        {/* Left Hero Text & Search */}
        <div className="lg:col-span-7 space-y-6">
          <Badge className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Next-Gen Multi-Platform Compare AI
          </Badge>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.15]">
            Compare Price & Quality Across <br />
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Amazon, Flipkart, Meesho & More.
            </span>
          </h1>

          {/* Workable Search Bar Form */}
          <form onSubmit={handleCompareSubmit} className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-sm max-w-xl">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any product e.g. iPhone 15, Sony XM5, Galaxy S24..."
                className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" className="h-11 rounded-xl px-6 font-bold text-xs gap-2 shadow-xs">
              <Scale className="h-4 w-4" /> Compare Now
            </Button>
          </form>

          {/* Smart Search Quick Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
            <span className="font-semibold text-foreground">Popular Comparisons:</span>
            {[
              "Apple iPhone 15 Pro",
              "Sony WH-1000XM5",
              "Samsung Galaxy S24 Ultra",
              "MacBook Pro 14",
            ].map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => {
                  requireAuth(() => {
                    setSearchQuery(query);
                    toast.info(`Pre-filled comparison for "${query}"`);
                    navigate({ to: "/compare", search: { q: query } });
                  });
                }}
                className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:border-brand hover:text-brand"
              >
                {query}
              </button>
            ))}
          </div>

          {/* Supported Store Platforms Banner */}
          <div className="pt-4 border-t border-border/60 max-w-lg">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Live Price Sync Across Major Retailers:</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-black">
                📦 Amazon
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs font-black">
                🛍️ Flipkart
              </Badge>
              <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-500/30 text-xs font-black">
                🛒 Meesho
              </Badge>
              <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30 text-xs font-black">
                🏬 Croma
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs font-black">
                🏬 Reliance Digital
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Hero Image Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg p-2">
            <img
              src={heroImg}
              alt="ZGenie Smart Shopping AI"
              width={1000}
              height={1500}
              className="w-full max-h-[520px] rounded-2xl object-cover"
            />
            <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-100 border border-border p-3.5 text-foreground">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                  ₹
                </span>
                <div>
                  <p className="text-xs font-bold">Multi-Store Price Tracker</p>
                  <p className="text-[11px] text-slate-400">Meesho vs Amazon vs Flipkart</p>
                </div>
              </div>
              <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg text-xs font-bold">
                <Link to="/compare" search={{ q: "" }}>Compare Stores</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function MultiPlatformHomeShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
            <Globe className="mr-1.5 h-3.5 w-3.5" /> Multi-Platform Engine
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">
            Live Platform Comparison Preview
          </h2>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-bold">
          <Link to="/compare" search={{ q: "" }}>Launch Full Comparison Tool <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      <MultiPlatformCompare />
    </section>
  );
}

const CATEGORIES = [
  { name: "Laptops & Computers", icon: Laptop, count: "1,240+ Products", tint: "bg-blue-500/10 text-blue-600" },
  { name: "Smartphones & Tablets", icon: Watch, count: "890+ Products", tint: "bg-purple-500/10 text-purple-600" },
  { name: "Audio & Headphones", icon: Sparkles, count: "650+ Products", tint: "bg-pink-500/10 text-pink-600" },
  { name: "Home & Office Tech", icon: Sofa, count: "1,100+ Products", tint: "bg-emerald-500/10 text-emerald-600" },
  { name: "Fashion & Wearables", icon: Shirt, count: "2,400+ Products", tint: "bg-amber-500/10 text-amber-600" },
  { name: "Smart Gifts & Gadgets", icon: Gift, count: "420+ Products", tint: "bg-indigo-500/10 text-indigo-600" },
];

function FeatureCategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Categorized Catalog</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">Explore Products by Category</h2>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold">
          <Link to="/categories">View All Categories →</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ name, icon: Icon, count, tint }) => (
          <Link
            key={name}
            to="/categories"
            className="group rounded-2xl border border-border/80 bg-card p-4 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint} transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-bold text-foreground line-clamp-1">{name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{count}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

const COMPARISON_PRODUCTS = [
  {
    name: "Aether Pro 14 Laptop",
    category: "Laptops",
    price: 105000,
    was: 120000,
    rating: 4.8,
    regretScore: "Low (8%)",
    verdict: "Winner: Power & Display",
    tag: "94% Match",
  },
  {
    name: "Nimbus Wireless Headphones",
    category: "Audio",
    price: 20000,
    was: 25000,
    rating: 4.7,
    regretScore: "Low (5%)",
    verdict: "Top Noise Canceling",
    tag: "Editor Choice",
  },
  {
    name: "Halo Smart Watch Series 6",
    category: "Wearables",
    price: 30000,
    was: 35000,
    rating: 4.6,
    regretScore: "Moderate (14%)",
    verdict: "Best Battery Life",
    tag: "Trending",
  },
  {
    name: "Lumen Desk Lamp & Charger",
    category: "Home Office",
    price: 7000,
    was: 8500,
    rating: 4.9,
    regretScore: "Low (3%)",
    verdict: "Highest Value",
    tag: "Best Deal",
  },
];

function ProductComparisonShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Top Evaluated</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">Trending Side-by-Side Product Cards</h2>
        </div>
        <Button asChild variant="ghost" className="rounded-full text-xs font-bold text-brand">
          <Link to="/shop">Explore Full Catalog <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COMPARISON_PRODUCTS.map((p) => (
          <Card key={p.name} className="group rounded-2xl border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all">
            <div className="relative aspect-[4/3] bg-muted/40 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge className="rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold">{p.tag}</Badge>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground shadow-xs hover:text-rose-500" aria-label="Wishlist">
                  <Heart className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="my-auto flex justify-center text-muted-foreground/40">
                <ShoppingBag className="h-12 w-12" />
              </div>

              <div className="rounded-lg bg-background/90 backdrop-blur-xs p-1.5 text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span className="text-muted-foreground">Verdict:</span>
                <span className="text-brand font-bold">{p.verdict}</span>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">{p.category}</p>
                <h3 className="text-sm font-bold text-foreground line-clamp-1 mt-0.5">{p.name}</h3>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-foreground">₹{p.price}</span>
                  <span className="text-xs text-muted-foreground line-through">₹{p.was}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{p.rating}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-2 text-xs flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Regret Score:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.regretScore}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1">
                  <Link to="/compare" search={{ q: "" }}><Scale className="h-3.5 w-3.5" /> Compare</Link>
                </Button>
                <Button size="sm" className="rounded-xl text-xs font-bold">
                  View Specs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

const CAPABILITIES = [
  {
    icon: Globe,
    title: "Multi-Platform Price Comparison",
    description: "Real-time price comparison across Amazon, Flipkart, Meesho, Croma, & Reliance Digital.",
  },
  {
    icon: LineChart,
    title: "AI Price Trend Predictor",
    description: "Track historical price fluctuations and receive AI notifications when prices hit guaranteed historical lows.",
  },
  {
    icon: ShieldCheck,
    title: "AI Return & Regret Score",
    description: "Analyzes thousands of verified buyer reviews, return rates, and common product complaints to calculate regret risk.",
  },
  {
    icon: Brain,
    title: "Smart Shopping AI Assistant",
    description: "Chat with your AI assistant to get unbiased recommendations based on your exact budget and performance needs.",
  },
];

function CoreCapabilities() {
  return (
    <section className="bg-secondary/30 text-foreground py-16 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            Categorized AI Capabilities
          </Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Four Core Tools for Smarter Shopping
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            ZGenie simplifies every stage of product research so you never overpay or buy the wrong item.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SmartDealsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Live Price Drops</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">Verified Price Drop Alerts</h2>
        </div>
        <Badge className="rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold">
          <Flame className="mr-1 h-3.5 w-3.5" /> 18 Price Drops Today
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Ultrabook Productivity Bundle", saving: "-32% Off", current: "₹74,990", predicted: "+12% Next Week" },
          { title: "Wireless ANC Audio Headphones", saving: "-24% Off", current: "₹24,990", predicted: "Historical Low" },
          { title: "Smart Home Security Kit", saving: "-40% Off", current: "₹12,499", predicted: "Ends Tonight" },
        ].map((deal) => (
          <div key={deal.title} className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-brand">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{deal.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">{deal.current} · <span className="text-emerald-600 font-semibold">{deal.predicted}</span></p>
            </div>
            <Badge className="rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
              {deal.saving}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-16 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">User Reviews</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">Trusted by 50,000+ Smart Shoppers</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Samantha K.", role: "Tech Buyer", quote: "ZGenie saved me ₹14,000 on my iPhone 15 Pro by comparing Amazon vs Meesho. Amazing tool!" },
            { name: "David M.", role: "Frequent Shopper", quote: "The Regret Score warned me about a laptop with high return rates on Flipkart. Bought the alternative on Amazon." },
            { name: "Elena R.", role: "Smart Home Enthusiast", quote: "I never buy tech without checking ZGenie across stores first. Fast, accurate, and completely unbiased." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-foreground italic">"{t.quote}"</p>
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs font-bold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-white shadow-lg sm:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Start Comparing Prices Across Stores Now
            </h2>
            <p className="text-sm text-white/85 max-w-xl leading-relaxed">
              Create your free account today to save custom product comparison matrices, receive real-time price alerts across Amazon, Flipkart, Meesho, & Croma.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <Button 
              size="lg" 
              className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs"
              onClick={() => requireAuth(() => navigate({ to: "/compare", search: { q: "" } }), "Create your free account to save custom product matrices.")}
            >
              Create Free Account
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 font-bold text-xs"
              onClick={() => requireAuth(() => navigate({ to: "/compare", search: { q: "" } }))}
            >
              Launch Multi-Store Engine
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
