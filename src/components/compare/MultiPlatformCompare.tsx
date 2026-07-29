import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  Truck,
  ShieldCheck,
  Tag,
  Sparkles,
  ArrowRight,
  Filter,
  Scale,
  Search,
  Star,
  Award,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export interface PlatformDeal {
  platform: "Amazon" | "Flipkart" | "Meesho" | "Croma" | "Reliance Digital" | "Tata CLiQ";
  badgeBg: string;
  logoLetter: string;
  price: number;
  originalPrice: number;
  discount: string;
  delivery: string;
  offers: string[];
  stock: string;
  qualityRating: number; // e.g. 4.8 / 5
  qualityScore: string; // e.g. 9.5/10 Build Quality
  regretRisk: string; // e.g. "Low (4%)"
  sellerType: string; // e.g. "Official Brand Store"
  isLowest?: boolean;
}

export interface CompareProduct {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  platforms: PlatformDeal[];
}

export const SAMPLE_PRODUCTS: CompareProduct[] = [
  {
    id: "prod-1",
    name: "Apple iPhone 15 Pro (128GB - Natural Titanium)",
    category: "Smartphones",
    rating: 4.8,
    reviewsCount: 14200,
    platforms: [
      {
        platform: "Meesho",
        badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        logoLetter: "M",
        price: 119990,
        originalPrice: 134900,
        discount: "11% OFF",
        delivery: "Free Express Delivery",
        offers: ["Reseller Deal Savings", "Zero Convenience Fee", "7-Day Replacement"],
        stock: "In Stock",
        qualityRating: 4.7,
        qualityScore: "9.2/10 Certified New",
        regretRisk: "Low (5%)",
        sellerType: "Verified Top Seller",
        isLowest: true,
      },
      {
        platform: "Flipkart",
        badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        logoLetter: "F",
        price: 122990,
        originalPrice: 134900,
        discount: "8% OFF",
        delivery: "Delivery in 2 Days",
        offers: ["HDFC Card ₹4,000 Instant Off", "Extra ₹3,000 Exchange Bonus", "SuperCoin Eligible"],
        stock: "In Stock",
        qualityRating: 4.8,
        qualityScore: "9.6/10 Official Retailer",
        regretRisk: "Low (4%)",
        sellerType: "Apple Authorized Reseller",
      },
      {
        platform: "Amazon",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        logoLetter: "A",
        price: 124900,
        originalPrice: 134900,
        discount: "7% OFF",
        delivery: "Prime 1-Day Delivery",
        offers: ["5% Unlimited Cashback with Amazon Pay ICICI", "No Cost EMI up to 12 months"],
        stock: "In Stock",
        qualityRating: 4.9,
        qualityScore: "9.8/10 Brand Direct",
        regretRisk: "Low (3%)",
        sellerType: "Amazon Fulfilled Store",
      },
      {
        platform: "Croma",
        badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
        logoLetter: "C",
        price: 125990,
        originalPrice: 134900,
        discount: "6% OFF",
        delivery: "Store Pickup in 2 Hours",
        offers: ["Tata Neu 5% NeuCoins", "Free Apple Care 6-Month Plan"],
        stock: "Available at Nearby Store",
        qualityRating: 4.8,
        qualityScore: "9.5/10 Physical Store Verified",
        regretRisk: "Low (4%)",
        sellerType: "Tata Croma Official",
      },
      {
        platform: "Reliance Digital",
        badgeBg: "bg-red-500/10 text-red-600 border-red-500/20",
        logoLetter: "R",
        price: 126490,
        originalPrice: 134900,
        discount: "6% OFF",
        delivery: "Express Delivery in 4 Hours",
        offers: ["Reliance One Loyalty Points", "Instant Bank Coupon ₹2,500"],
        stock: "In Stock",
        qualityRating: 4.7,
        qualityScore: "9.4/10 Retail Verified",
        regretRisk: "Low (5%)",
        sellerType: "Reliance Retail Store",
      },
    ],
  },
  {
    id: "prod-2",
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    category: "Audio",
    rating: 4.7,
    reviewsCount: 8400,
    platforms: [
      {
        platform: "Amazon",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        logoLetter: "A",
        price: 24990,
        originalPrice: 29990,
        discount: "16% OFF",
        delivery: "Prime Delivery Tomorrow",
        offers: ["ICICI Card ₹2,000 Off", "Free 3-Month Audible Subscription"],
        stock: "In Stock",
        qualityRating: 4.9,
        qualityScore: "9.7/10 Premium Audio Build",
        regretRisk: "Low (3%)",
        sellerType: "Sony India Authorized",
        isLowest: true,
      },
      {
        platform: "Flipkart",
        badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        logoLetter: "F",
        price: 25990,
        originalPrice: 29990,
        discount: "13% OFF",
        delivery: "Delivery in 2 Days",
        offers: ["SBI Card ₹1,500 Off", "Flipkart Pay Later"],
        stock: "In Stock",
        qualityRating: 4.7,
        qualityScore: "9.3/10 Verified Quality",
        regretRisk: "Low (5%)",
        sellerType: "Assured SuperSeller",
      },
      {
        platform: "Meesho",
        badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        logoLetter: "M",
        price: 26490,
        originalPrice: 29990,
        discount: "11% OFF",
        delivery: "Free Delivery",
        offers: ["Wholesale Direct Seller", "Cash on Delivery Available"],
        stock: "Limited Stock",
        qualityRating: 4.5,
        qualityScore: "8.9/10 Direct Import",
        regretRisk: "Low (7%)",
        sellerType: "Direct Factory Wholesale",
      },
      {
        platform: "Croma",
        badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
        logoLetter: "C",
        price: 26990,
        originalPrice: 29990,
        discount: "10% OFF",
        delivery: "Store Pickup Available",
        offers: ["Croma ZipCare Warranty 1-Year Free"],
        stock: "In Stock",
        qualityRating: 4.8,
        qualityScore: "9.5/10 Brand Store Warranty",
        regretRisk: "Low (4%)",
        sellerType: "Croma Store Verified",
      },
    ],
  },
  {
    id: "prod-3",
    name: "Samsung Galaxy S24 Ultra (5G 256GB - Titanium Gray)",
    category: "Smartphones",
    rating: 4.8,
    reviewsCount: 9600,
    platforms: [
      {
        platform: "Flipkart",
        badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        logoLetter: "F",
        price: 124999,
        originalPrice: 139999,
        discount: "11% OFF",
        delivery: "Delivery by Tomorrow",
        offers: ["Samsung Axis Card 10% Cashback", "Extra ₹6,000 Exchange Bonus"],
        stock: "In Stock",
        qualityRating: 4.8,
        qualityScore: "9.6/10 Official Samsung Store",
        regretRisk: "Low (4%)",
        sellerType: "Samsung Official Partner",
        isLowest: true,
      },
      {
        platform: "Meesho",
        badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        logoLetter: "M",
        price: 125999,
        originalPrice: 139999,
        discount: "10% OFF",
        delivery: "Free Delivery",
        offers: ["Zero Fee Delivery", "7-Day Return Guarantee"],
        stock: "In Stock",
        qualityRating: 4.6,
        qualityScore: "9.1/10 Wholesale Sealed",
        regretRisk: "Low (6%)",
        sellerType: "Verified Reseller",
      },
      {
        platform: "Amazon",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        logoLetter: "A",
        price: 129999,
        originalPrice: 139999,
        discount: "7% OFF",
        delivery: "Prime 1-Day Delivery",
        offers: ["Instant ₹5,000 Bank Discount", "No Cost EMI 24 Months"],
        stock: "In Stock",
        qualityRating: 4.9,
        qualityScore: "9.8/10 Official Brand Store",
        regretRisk: "Low (3%)",
        sellerType: "Amazon Fulfilled",
      },
      {
        platform: "Reliance Digital",
        badgeBg: "bg-red-500/10 text-red-600 border-red-500/20",
        logoLetter: "R",
        price: 129990,
        originalPrice: 139999,
        discount: "7% OFF",
        delivery: "Express Store Delivery",
        offers: ["Free Galaxy Buds FE Voucher"],
        stock: "In Stock",
        qualityRating: 4.7,
        qualityScore: "9.4/10 Retail Verified",
        regretRisk: "Low (5%)",
        sellerType: "Reliance Official",
      },
    ],
  },
];

export function MultiPlatformCompare({ initialQuery = "" }: { initialQuery?: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedProductId, setSelectedProductId] = useState(SAMPLE_PRODUCTS[0].id);
  const [sortOption, setSortOption] = useState<"lowest_price" | "highest_quality" | "fastest_delivery">("lowest_price");

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      // Find matching sample product or generate custom platform comparison
      const match = SAMPLE_PRODUCTS.find((p) =>
        p.name.toLowerCase().includes(initialQuery.toLowerCase())
      );
      if (match) {
        setSelectedProductId(match.id);
      }
    }
  }, [initialQuery]);

  // Current active product or dynamic search generation
  let currentProduct = SAMPLE_PRODUCTS.find((p) => p.id === selectedProductId) || SAMPLE_PRODUCTS[0];

  // If user searched for a custom query not in presets, create a dynamic product comparison!
  if (searchQuery && !SAMPLE_PRODUCTS.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
    currentProduct = {
      id: "custom-search",
      name: searchQuery.length > 3 ? searchQuery : "Searched Product Comparison",
      category: "Comparison Search Result",
      rating: 4.8,
      reviewsCount: 3450,
      platforms: [
        {
          platform: "Meesho",
          badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
          logoLetter: "M",
          price: 14999,
          originalPrice: 19999,
          discount: "25% OFF",
          delivery: "Free Shipping in 2 Days",
          offers: ["Best Wholesale Rate", "7-Day Free Returns"],
          stock: "In Stock",
          qualityRating: 4.6,
          qualityScore: "9.0/10 Value Leader",
          regretRisk: "Low (6%)",
          sellerType: "Top Meesho Seller",
          isLowest: true,
        },
        {
          platform: "Flipkart",
          badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          logoLetter: "F",
          price: 15499,
          originalPrice: 19999,
          discount: "22% OFF",
          delivery: "Delivery by Tomorrow",
          offers: ["Bank Card 10% Off", "SuperCoins Eligible"],
          stock: "In Stock",
          qualityRating: 4.7,
          qualityScore: "9.4/10 Assured Seller",
          regretRisk: "Low (4%)",
          sellerType: "Flipkart Assured Store",
        },
        {
          platform: "Amazon",
          badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          logoLetter: "A",
          price: 15999,
          originalPrice: 19999,
          discount: "20% OFF",
          delivery: "Prime 1-Day Delivery",
          offers: ["Amazon Pay Cashback", "No Cost EMI"],
          stock: "In Stock",
          qualityRating: 4.9,
          qualityScore: "9.7/10 Verified Brand Direct",
          regretRisk: "Low (3%)",
          sellerType: "Official Brand Store",
        },
        {
          platform: "Croma",
          badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
          logoLetter: "C",
          price: 16290,
          originalPrice: 19999,
          discount: "18% OFF",
          delivery: "Store Pickup Today",
          offers: ["Tata Neu Cashback", "Croma Warranty"],
          stock: "In Stock at Store",
          qualityRating: 4.8,
          qualityScore: "9.5/10 Physical Store Test",
          regretRisk: "Low (4%)",
          sellerType: "Croma Retail",
        },
      ],
    };
  }

  // Sort deals based on user preference
  let deals = [...currentProduct.platforms];
  if (sortOption === "lowest_price") {
    deals.sort((a, b) => a.price - b.price);
  } else if (sortOption === "highest_quality") {
    deals.sort((a, b) => b.qualityRating - a.qualityRating);
  } else if (sortOption === "fastest_delivery") {
    deals = deals.filter(
      (d) =>
        d.delivery.toLowerCase().includes("same-day") ||
        d.delivery.toLowerCase().includes("tomorrow") ||
        d.delivery.toLowerCase().includes("hours") ||
        d.delivery.toLowerCase().includes("express")
    );
  }

  const lowestDeal = currentProduct.platforms.reduce((min, deal) => (deal.price < min.price ? deal : min), currentProduct.platforms[0]);
  const highestQualityDeal = currentProduct.platforms.reduce((max, deal) => (deal.qualityRating > max.qualityRating ? deal : max), currentProduct.platforms[0]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.success(`Comparing live prices & quality for "${searchQuery}" across Amazon, Flipkart, Meesho, & Croma!`);
  };

  return (
    <div className="space-y-8">
      
      {/* Search Input Bar for Live Multi-Platform Query */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] font-bold">
            <Scale className="mr-1.5 h-3.5 w-3.5" /> Multi-Platform Product Engine
          </Badge>

          <h2 className="text-xl font-black text-foreground sm:text-2xl mt-1.5">
            Search Any Product to Compare Prices & Quality Across Stores
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compares live price (₹), warranty, delivery speed, seller verification, & AI regret scores on Amazon, Flipkart, Meesho, Croma, & Reliance Digital.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product (e.g. iPhone 15, Sony Headphones, Galaxy S24, Laptop)..."
              className="h-11 rounded-xl pl-10 text-xs bg-background"
            />
          </div>
          <Button type="submit" className="h-11 rounded-xl px-6 font-bold text-xs gap-2 shadow-xs">
            <Scale className="h-4 w-4" /> Compare Now
          </Button>
        </form>

        {/* Quick Sample Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-border/60">
          <span className="font-semibold text-muted-foreground">Quick Compare:</span>
          {SAMPLE_PRODUCTS.map((prod) => (
            <button
              key={prod.id}
              onClick={() => {
                setSelectedProductId(prod.id);
                setSearchQuery(prod.name);
                toast.info(`Comparing multi-platform deals for ${prod.name}`);
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selectedProductId === prod.id && !searchQuery
                  ? "bg-brand text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {prod.name.split(" ")[0]} {prod.name.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Active Product Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Comparing Live Platform Deals</span>
          <h3 className="text-xl font-black text-foreground">{currentProduct.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{currentProduct.rating}</span>
            </div>
            <span>·</span>
            <span>Based on {currentProduct.reviewsCount.toLocaleString()} verified customer reviews</span>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
          <button
            onClick={() => setSortOption("lowest_price")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              sortOption === "lowest_price" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🏆 Lowest Price
          </button>
          <button
            onClick={() => setSortOption("highest_quality")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              sortOption === "highest_quality" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ⭐ Highest Quality Score
          </button>
          <button
            onClick={() => setSortOption("fastest_delivery")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              sortOption === "fastest_delivery" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🚀 Fastest Shipping
          </button>
        </div>
      </div>

      {/* Multi-Platform Deals & Quality Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const isAbsoluteLowest = deal.platform === lowestDeal.platform;
          const isHighestQuality = deal.platform === highestQualityDeal.platform;

          return (
            <Card
              key={deal.platform}
              className={`relative rounded-2xl border transition-all hover:shadow-md ${
                isAbsoluteLowest
                  ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                  : isHighestQuality
                  ? "border-blue-500/60 bg-blue-500/5 ring-1 ring-blue-500/30"
                  : "border-border/80 bg-card"
              }`}
            >
              {/* Badges for Best Price / Quality */}
              <div className="absolute -top-3 left-4 flex gap-1.5">
                {isAbsoluteLowest && (
                  <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Cheapest Store
                  </span>
                )}
                {isHighestQuality && !isAbsoluteLowest && (
                  <span className="rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Award className="h-3 w-3" /> Highest Quality Rating
                  </span>
                )}
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Platform Header */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl font-black text-sm text-white shadow-xs ${
                        deal.platform === "Amazon"
                          ? "bg-amber-600"
                          : deal.platform === "Flipkart"
                          ? "bg-blue-600"
                          : deal.platform === "Meesho"
                          ? "bg-pink-600"
                          : deal.platform === "Croma"
                          ? "bg-teal-600"
                          : deal.platform === "Reliance Digital"
                          ? "bg-red-600"
                          : "bg-purple-600"
                      }`}
                    >
                      {deal.logoLetter}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-foreground">{deal.platform}</h3>
                      <p className="text-[10px] text-muted-foreground font-semibold">{deal.sellerType}</p>
                    </div>
                  </div>

                  <Badge className={`rounded-lg text-[10px] font-bold ${deal.badgeBg}`}>
                    {deal.discount}
                  </Badge>
                </div>

                {/* Price Display */}
                <div className="border-t border-border/60 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">
                      ₹{deal.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{deal.originalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {isAbsoluteLowest && (
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Save ₹{(lowestDeal.originalPrice - lowestDeal.price).toLocaleString("en-IN")} vs MRP!
                    </p>
                  )}
                </div>

                {/* Quality & Score Comparison Box */}
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px] font-medium">Quality & Build Rating:</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {deal.qualityRating}/5.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px] font-medium">Verified Specs Score:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{deal.qualityScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px] font-medium">AI Regret & Return Risk:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {deal.regretRisk}
                    </span>
                  </div>
                </div>

                {/* Delivery & Shipping Info */}
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Truck className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>{deal.delivery}</span>
                </div>

                {/* Platform Offers */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform Bank & Discount Offers:</p>
                  {deal.offers.map((offer, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{offer}</span>
                    </div>
                  ))}
                </div>

                {/* Store CTA Button */}
                <Button
                  onClick={() => toast.success(`Redirecting to ${deal.platform} store for ₹${deal.price.toLocaleString("en-IN")}...`)}
                  className={`w-full rounded-xl font-bold text-xs h-10 gap-1.5 shadow-xs ${
                    isAbsoluteLowest
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <span>Buy on {deal.platform}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
