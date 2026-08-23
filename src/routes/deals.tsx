import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flame,
  TrendingDown,
  Scale,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
  Package,
  ShoppingCart,
  Store,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Hot Live Deals & Price Drops — ZGenie" },
      {
        name: "description",
        content: "Discover verified real-time price drops across Amazon, Flipkart, Meesho, Croma, & Reliance Digital.",
      },
    ],
  }),
  component: DealsPage,
});

const LIVE_DEALS = [
  {
    id: "d1",
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    store: "Amazon",
    currentPrice: 24990,
    originalPrice: 34990,
    discount: "28% OFF",
    predictedTrend: "Guaranteed Historical Low",
    rating: 4.8,
    category: "Audio & Headphones",
    icon: Package,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    regretScore: "Low (4%)",
    endsIn: "4 hours left",
  },
  {
    id: "d2",
    title: "Apple iPhone 15 (128 GB, Black)",
    store: "Flipkart",
    currentPrice: 65990,
    originalPrice: 79900,
    discount: "17% OFF",
    predictedTrend: "Lowest in 30 Days",
    rating: 4.7,
    category: "Smartphones",
    icon: ShoppingBag,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    regretScore: "Low (6%)",
    endsIn: "Today only",
  },
  {
    id: "d3",
    title: "Samsung Galaxy Watch6 LTE (44mm, Graphite)",
    store: "Croma",
    currentPrice: 18499,
    originalPrice: 36999,
    discount: "50% OFF",
    predictedTrend: "Mega Price Drop",
    rating: 4.6,
    category: "Wearables",
    icon: Store,
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    regretScore: "Low (8%)",
    endsIn: "Limited Stock",
  },
  {
    id: "d4",
    title: "Aether Pro 14 M3 Workstation Laptop",
    store: "Reliance Digital",
    currentPrice: 105000,
    originalPrice: 124990,
    discount: "16% OFF",
    predictedTrend: "Price Drop Alert",
    rating: 4.9,
    category: "Laptops",
    icon: Building2,
    badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    regretScore: "Low (3%)",
    endsIn: "Ends in 2 days",
  },
  {
    id: "d5",
    title: "UltraWide 34\" 144Hz Curved Gaming Monitor",
    store: "Amazon",
    currentPrice: 38990,
    originalPrice: 52000,
    discount: "25% OFF",
    predictedTrend: "Lowest Verified Price",
    rating: 4.8,
    category: "Gaming & Displays",
    icon: Package,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    regretScore: "Low (5%)",
    endsIn: "6 hours left",
  },
  {
    id: "d6",
    title: "Ergonomic High-Back Executive Task Chair",
    store: "Meesho",
    currentPrice: 8499,
    originalPrice: 15999,
    discount: "47% OFF",
    predictedTrend: "Super Value Pick",
    rating: 4.5,
    category: "Home & Lifestyle",
    icon: ShoppingCart,
    badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    regretScore: "Low (9%)",
    endsIn: "Flash Deal",
  },
];

function DealsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredDeals = LIVE_DEALS.filter((d) => {
    if (selectedFilter === "all") return true;
    return d.category.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <Badge className="rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-semibold">
              <Flame className="mr-1.5 h-3.5 w-3.5" /> Live Price Drop Feed
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-2">
              Verified Deals & Price Drops
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Live price drops synchronized directly across Amazon, Flipkart, Meesho, Croma, and Reliance Digital.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Deals" },
              { id: "audio", label: "Audio" },
              { id: "smartphone", label: "Phones" },
              { id: "laptop", label: "Laptops" },
              { id: "wearables", label: "Wearables" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={selectedFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(tab.id)}
                className={`rounded-lg text-xs font-semibold h-8.5 ${
                  selectedFilter === tab.id
                    ? "bg-brand text-white shadow-xs"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => {
            const StoreIcon = deal.icon;
            return (
              <Card
                key={deal.id}
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-brand/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="p-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
                    <Badge variant="outline" className={`rounded-md text-[11px] font-semibold gap-1 ${deal.badgeColor}`}>
                      <StoreIcon className="h-3 w-3" />
                      <span>{deal.store}</span>
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Clock className="h-3 w-3 text-rose-500" />
                      {deal.endsIn}
                    </span>
                  </div>

                  <CardContent className="p-4 space-y-3.5">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{deal.category}</p>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5 group-hover:text-brand transition-colors">
                        {deal.title}
                      </h3>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-foreground">₹{deal.currentPrice.toLocaleString("en-IN")}</span>
                          <span className="text-xs text-muted-foreground line-through">₹{deal.originalPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{deal.predictedTrend}</p>
                      </div>
                      <Badge className="rounded-md bg-rose-500 text-white text-xs font-bold px-2 py-0.5">
                        {deal.discount}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">{deal.rating}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Regret: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{deal.regretScore}</strong></span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Button asChild className="w-full rounded-lg text-xs font-semibold gap-1.5 h-9 bg-brand hover:bg-brand/90 text-white shadow-xs">
                    <Link to="/compare" search={{ q: deal.title }}>
                      <Scale className="h-3.5 w-3.5" /> Compare Across All Stores
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
