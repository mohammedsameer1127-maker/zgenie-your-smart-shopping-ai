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
  Package,
  ShoppingCart,
  Store,
  Building2,
  Bot,
  TrendingDown,
  Lock,
  Clock,
  Zap,
  SlidersHorizontal,
  Headphones,
  Smartphone,
  Tag,
  Check,
} from "lucide-react";
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
      { title: "ZGenie — Shop Smarter. Decide Better." },
      {
        name: "description",
        content:
          "ZGenie is your next-generation AI-powered shopping companion. Compare prices across Amazon, Flipkart, Meesho, Croma, & Reliance Digital with live price tracking and regret score analysis.",
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
  return (
    <section className="relative overflow-hidden pt-6 pb-2 sm:pt-8 sm:pb-4 lg:pt-12 lg:pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-xs">
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

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-lg px-6 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm gap-2"
              >
                <Link to="/shop">
                  Explore ZGenie <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-lg px-5 text-xs font-semibold border-border/80 bg-card text-foreground hover:bg-muted shadow-xs gap-2"
              >
                <Link to="/assistant">
                  <Sparkles className="h-4 w-4 text-blue-600" /> Ask ZGenie AI
                </Link>
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

          {/* Right Column: Ultra-High Quality Real Phone Shopping Visual with Blended Edges */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-none flex items-center justify-center group">
              
              {/* Vibrant Multi-Corner Glowing Ambient Effects */}
              <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl -z-10 pointer-events-none opacity-90" />
              <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl -z-10 pointer-events-none opacity-90" />
              <div className="absolute top-1/3 -right-12 h-56 w-56 rounded-full bg-purple-500/20 blur-2xl -z-10 pointer-events-none" />
              <div className="absolute bottom-1/3 -left-12 h-56 w-56 rounded-full bg-cyan-500/20 blur-2xl -z-10 pointer-events-none" />
              
              {/* Central Ambient Backdrop Glow */}
              <div className="absolute inset-2 rounded-3xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl -z-10 pointer-events-none" />

              <img
                src={heroImg}
                alt="ZGenie Smart Shopping Intelligence — Real-Time Multi-Store Price Tracker"
                width={1600}
                height={1066}
                className="w-full h-auto max-h-[640px] sm:max-h-[720px] lg:max-h-[800px] xl:max-h-[860px] object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.18)] dark:drop-shadow-[0_20px_50px_rgba(59,130,246,0.25)] select-none transition-transform duration-300 hover:scale-[1.01] [mask-image:radial-gradient(ellipse_94%_92%_at_50%_50%,#000_80%,transparent_100%)]"
                loading="eager"
              />
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
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    borderHover: "hover:border-blue-500/40",
  },
  {
    title: "Live Price Tracking",
    description: "Track and monitor product prices across multiple major retailers in real time.",
    icon: LineChart,
    to: "/shop",
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/40",
  },
  {
    title: "Smart Product Comparison",
    description: "Compare products, specifications, prices, and key features easily.",
    icon: Scale,
    to: "/compare",
    accent: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    borderHover: "hover:border-purple-500/40",
  },
  {
    title: "Review & Regret Analysis",
    description: "Analyze customer reviews and product satisfaction before buying.",
    icon: ShieldCheck,
    to: "/shop",
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderHover: "hover:border-amber-500/40",
  },
];

function FeatureCardsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-0 pb-6 sm:pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURE_CARDS.map((feature) => {
          const IconComp = feature.icon;
          return (
            <Link
              key={feature.title}
              to={feature.to}
              className={`group rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${feature.borderHover} flex flex-col justify-between`}
            >
              <div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${feature.accent} transition-transform group-hover:scale-105`}>
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
            </Link>
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
  { name: "Amazon", icon: Package, badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  { name: "Flipkart", icon: ShoppingBag, badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  { name: "Meesho", icon: ShoppingCart, badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30" },
  { name: "Croma", icon: Store, badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30" },
  { name: "Reliance Digital", icon: Building2, badgeColor: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30" },
];

function RetailerSyncSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          LIVE PRICE SYNC ACROSS MAJOR RETAILERS
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {RETAILERS.map((r) => {
            const IconComponent = r.icon;
            return (
              <div
                key={r.name}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold shadow-2xs ${r.badgeColor} transition-transform hover:scale-105`}
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
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
            <Globe className="mr-1.5 h-3.5 w-3.5" /> Interactive Comparison Engine
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1.5">
            Live Platform Comparison Preview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search any tech or lifestyle product to evaluate prices and stock across all synced stores.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-semibold h-9">
          <Link to="/compare" search={{ q: "" }}>
            Launch Full Comparison Tool <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <MultiPlatformCompare />
    </section>
  );
}

/* =========================================================================
   5. FEATURED PRODUCTS SHOWCASE
   ========================================================================= */
const COMPARISON_PRODUCTS = [
  {
    name: "Aether Pro 14 Laptop",
    category: "Laptops & Computers",
    price: 105000,
    was: 120000,
    rating: 4.8,
    regretScore: "Low (8%)",
    verdict: "Winner: Power & Display",
    tag: "94% Match",
  },
  {
    name: "Nimbus Wireless ANC Headphones",
    category: "Headphones & Audio",
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
    regretScore: "Low (12%)",
    verdict: "Best Battery Life",
    tag: "Trending",
  },
  {
    name: "Lumen Desk Lamp & Fast Charger",
    category: "Home & Office Tech",
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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Top Evaluated</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
            Trending Side-by-Side Product Cards
          </h2>
        </div>
        <Button asChild variant="ghost" className="rounded-lg text-xs font-semibold text-brand">
          <Link to="/shop">Explore Full Catalog <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COMPARISON_PRODUCTS.map((p) => (
          <Card key={p.name} className="group rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative aspect-[4/3] bg-muted/30 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">{p.tag}</Badge>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground shadow-xs hover:text-rose-500 transition-colors" aria-label="Wishlist">
                    <Heart className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="my-auto flex justify-center text-muted-foreground/30">
                  <ShoppingBag className="h-10 w-10" />
                </div>

                <div className="rounded-md bg-background/90 backdrop-blur-xs px-2 py-1 text-[11px] font-medium text-foreground flex items-center justify-between border border-border/50">
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

                <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">Regret Score:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{p.regretScore}</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Button asChild className="w-full rounded-lg text-xs font-semibold gap-1.5 h-9 bg-brand hover:bg-brand/90 text-white shadow-xs">
                <Link to="/compare" search={{ q: p.name }}>
                  <Scale className="h-3.5 w-3.5" /> Compare Stores
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   6. CATEGORIES GRID
   ========================================================================= */
const CATEGORIES = [
  { name: "Laptops & Computers", icon: Laptop, count: "1,240+ Products", tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { name: "Smartphones & Tablets", icon: Smartphone, count: "890+ Products", tint: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { name: "Audio & Headphones", icon: Headphones, count: "650+ Products", tint: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  { name: "Home & Office Tech", icon: Sofa, count: "1,100+ Products", tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { name: "Fashion & Wearables", icon: Shirt, count: "2,400+ Products", tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { name: "Smart Gifts & Gadgets", icon: Gift, count: "420+ Products", tint: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
];

function FeatureCategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Categorized Catalog</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">Explore Products by Category</h2>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-semibold">
          <Link to="/categories">View All Categories →</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ name, icon: Icon, count, tint }) => (
          <Link
            key={name}
            to="/categories"
            className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint} transition-transform group-hover:scale-105`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-semibold text-foreground line-clamp-1">{name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{count}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   7. TRUST / BENEFITS SECTION (4 BENEFITS)
   ========================================================================= */
const TRUST_BENEFITS = [
  {
    title: "100% Trusted",
    description: "Accurate and reliable price information.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Updates",
    description: "Live price sync across major platforms.",
    icon: Zap,
  },
  {
    title: "Secure & Private",
    description: "Your data and preferences are always protected.",
    icon: Lock,
  },
  {
    title: "Always Here",
    description: "AI Assistant available 24/7 to help you.",
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
              className="rounded-xl border border-border bg-card p-5 shadow-xs text-center space-y-2 hover:border-brand/30 transition-colors"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
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
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white shadow-md">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Start Shopping Smarter with ZGenie
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              Create your free account today to track price drops across Amazon, Flipkart, Meesho, Croma, & Reliance Digital.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:items-end">
            <Button
              size="lg"
              className="h-10 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs shadow-xs px-5"
              onClick={() => requireAuth(() => navigate({ to: "/compare", search: { q: "" } }))}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-10 rounded-lg border-white/40 bg-transparent text-white hover:bg-white/10 font-semibold text-xs px-5"
              onClick={() => navigate({ to: "/assistant" })}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Try AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
