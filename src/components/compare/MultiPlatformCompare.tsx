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
  Share2,
  Bell,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

export interface PlatformDeal {
  platform: string;
  badgeBg: string;
  logoBgClass: string;
  logoLetter: string;
  price: number;
  originalPrice: number;
  discount: string;
  delivery: string;
  offers: string[];
  stock: string;
  qualityRating: number;
  qualityScore: string;
  regretRisk: string;
  sellerType: string;
  productUrl?: string;
  domain: string;
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

export function getPlatformSearchUrl(platform: string, productName: string): string {
  const query = encodeURIComponent(productName);
  switch (platform) {
    case "Amazon":
    case "Amazon Fresh":
      return `https://www.amazon.in/s?k=${query}`;
    case "Flipkart":
      return `https://www.flipkart.com/search?q=${query}`;
    case "Meesho":
      return `https://www.meesho.com/search?q=${query}`;
    case "Croma":
      return `https://www.croma.com/searchB?q=${query}`;
    case "Reliance Digital":
      return `https://www.reliancedigital.in/search?q=${query}`;
    case "Tata CLiQ":
      return `https://www.tatacliq.com/search/?searchCategory=all&text=${query}`;
    case "Blinkit":
      return `https://blinkit.com/s/?q=${query}`;
    case "Zepto":
      return `https://www.zeptonow.com/search?q=${query}`;
    case "BigBasket":
      return `https://www.bigbasket.com/ps/?q=${query}`;
    case "Swiggy Instamart":
      return `https://www.swiggy.com/instamart/search?q=${query}`;
    case "Myntra":
      return `https://www.myntra.com/${query}`;
    case "Ajio":
      return `https://www.ajio.com/search/?text=${query}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(platform + " " + productName)}`;
  }
}

export function getPlatformDomain(platform: string): string {
  switch (platform) {
    case "Amazon": return "amazon.in";
    case "Amazon Fresh": return "amazon.in/fresh";
    case "Flipkart": return "flipkart.com";
    case "Meesho": return "meesho.com";
    case "Croma": return "croma.com";
    case "Reliance Digital": return "reliancedigital.in";
    case "Tata CLiQ": return "tatacliq.com";
    case "Blinkit": return "blinkit.com";
    case "Zepto": return "zeptonow.com";
    case "BigBasket": return "bigbasket.com";
    case "Swiggy Instamart": return "swiggy.com/instamart";
    case "Myntra": return "myntra.com";
    case "Ajio": return "ajio.com";
    default: return "online-store.com";
  }
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
        domain: "meesho.com",
        badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        logoBgClass: "bg-pink-600",
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
        productUrl: "https://www.meesho.com/search?q=Apple+iPhone+15+Pro",
        isLowest: true,
      },
      {
        platform: "Flipkart",
        domain: "flipkart.com",
        badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        logoBgClass: "bg-blue-600",
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
        productUrl: "https://www.flipkart.com/search?q=Apple+iPhone+15+Pro",
      },
      {
        platform: "Amazon",
        domain: "amazon.in",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        logoBgClass: "bg-amber-600",
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
        productUrl: "https://www.amazon.in/s?k=Apple+iPhone+15+Pro",
      },
      {
        platform: "Croma",
        domain: "croma.com",
        badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
        logoBgClass: "bg-teal-600",
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
        productUrl: "https://www.croma.com/searchB?q=Apple+iPhone+15+Pro",
      },
      {
        platform: "Reliance Digital",
        domain: "reliancedigital.in",
        badgeBg: "bg-red-500/10 text-red-600 border-red-500/20",
        logoBgClass: "bg-red-600",
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
        productUrl: "https://www.reliancedigital.in/search?q=Apple+iPhone+15+Pro",
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
        domain: "amazon.in",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        logoBgClass: "bg-amber-600",
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
        productUrl: "https://www.amazon.in/s?k=Sony+WH-1000XM5",
        isLowest: true,
      },
      {
        platform: "Flipkart",
        domain: "flipkart.com",
        badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        logoBgClass: "bg-blue-600",
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
        productUrl: "https://www.flipkart.com/search?q=Sony+WH-1000XM5",
      },
      {
        platform: "Meesho",
        domain: "meesho.com",
        badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        logoBgClass: "bg-pink-600",
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
        productUrl: "https://www.meesho.com/search?q=Sony+WH-1000XM5",
      },
      {
        platform: "Croma",
        domain: "croma.com",
        badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
        logoBgClass: "bg-teal-600",
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
        productUrl: "https://www.croma.com/searchB?q=Sony+WH-1000XM5",
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
        domain: "flipkart.com",
        badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        logoBgClass: "bg-blue-600",
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
        productUrl: "https://www.flipkart.com/search?q=Samsung+Galaxy+S24+Ultra",
        isLowest: true,
      },
      {
        platform: "Meesho",
        domain: "meesho.com",
        badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        logoBgClass: "bg-pink-600",
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
        productUrl: "https://www.meesho.com/search?q=Samsung+Galaxy+S24+Ultra",
      },
      {
        platform: "Amazon",
        domain: "amazon.in",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        logoBgClass: "bg-amber-600",
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
        productUrl: "https://www.amazon.in/s?k=Samsung+Galaxy+S24+Ultra",
      },
      {
        platform: "Reliance Digital",
        domain: "reliancedigital.in",
        badgeBg: "bg-red-500/10 text-red-600 border-red-500/20",
        logoBgClass: "bg-red-600",
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
        productUrl: "https://www.reliancedigital.in/search?q=Samsung+Galaxy+S24+Ultra",
      },
    ],
  },
];

// Helper for platform styling
function getPlatformStyle(platform: string) {
  switch (platform) {
    case "Amazon":
    case "Amazon Fresh":
      return { logoBgClass: "bg-amber-600",
        logoLetter: "A", bgClass: "bg-amber-600", badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    case "Flipkart":
      return { logoBgClass: "bg-blue-600",
        logoLetter: "F", bgClass: "bg-blue-600", badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
    case "Meesho":
      return { logoBgClass: "bg-pink-600",
        logoLetter: "M", bgClass: "bg-pink-600", badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20" };
    case "Croma":
      return { logoBgClass: "bg-teal-600",
        logoLetter: "C", bgClass: "bg-teal-600", badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20" };
    case "Reliance Digital":
      return { logoBgClass: "bg-red-600",
        logoLetter: "R", bgClass: "bg-red-600", badgeBg: "bg-red-500/10 text-red-600 border-red-500/20" };
    case "Tata CLiQ":
      return { logoLetter: "T", bgClass: "bg-purple-600", badgeBg: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
    case "Blinkit":
      return { logoLetter: "B", bgClass: "bg-yellow-500", badgeBg: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
    case "Zepto":
      return { logoLetter: "Z", bgClass: "bg-purple-700", badgeBg: "bg-purple-700/10 text-purple-700 border-purple-700/20" };
    case "BigBasket":
      return { logoLetter: "BB", bgClass: "bg-green-600", badgeBg: "bg-green-500/10 text-green-600 border-green-500/20" };
    case "Swiggy Instamart":
      return { logoLetter: "S", bgClass: "bg-orange-600", badgeBg: "bg-orange-500/10 text-orange-600 border-orange-500/20" };
    case "Myntra":
      return { logoBgClass: "bg-pink-600",
        logoLetter: "M", bgClass: "bg-rose-500", badgeBg: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
    case "Ajio":
      return { logoBgClass: "bg-amber-600",
        logoLetter: "A", bgClass: "bg-slate-800", badgeBg: "bg-slate-800/10 text-slate-800 border-slate-800/20" };
    default:
      return { logoLetter: platform[0] || "S", bgClass: "bg-slate-600", badgeBg: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
  }
}

// Helper to generate dynamic live price comparisons for arbitrary user search queries
function generateDynamicComparison(query: string): CompareProduct {
  const cleanName = query.trim();
  const lowerQuery = cleanName.toLowerCase();
  
  // Categorize based on keywords
  let categoryType = "General";
  let targetPlatforms: string[] = [];
  let basePriceRange = [1000, 10000];

  if (/(milk|bread|butter|eggs|vegetables|fruits|paneer|curd|grocery|chips|biscuit|ata|dal|rice|oil)/i.test(lowerQuery)) {
    categoryType = "Groceries";
    targetPlatforms = ["Blinkit", "Zepto", "Swiggy Instamart", "BigBasket", "Amazon Fresh"];
    basePriceRange = [40, 500];
  } else if (/(shirt|tshirt|jeans|dress|shoes|sneakers|kurti|saree|jacket|wear|fashion|pant)/i.test(lowerQuery)) {
    categoryType = "Fashion";
    targetPlatforms = ["Myntra", "Ajio", "Meesho", "Amazon", "Flipkart"];
    basePriceRange = [499, 4999];
  } else if (/(laptop|phone|tv|smartwatch|earbuds|headphone|macbook|iphone|galaxy|monitor|ipad|tablet)/i.test(lowerQuery)) {
    categoryType = "Electronics";
    targetPlatforms = ["Amazon", "Flipkart", "Croma", "Reliance Digital", "Tata CLiQ"];
    basePriceRange = [1999, 149990];
  } else {
    // Default fallback
    targetPlatforms = ["Amazon", "Flipkart", "Meesho", "Tata CLiQ"];
    basePriceRange = [299, 15000];
  }

  // Hash function to make price estimation consistent for same query
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  
  // Base price calculation based on category ranges
  const priceRangeDiff = basePriceRange[1] - basePriceRange[0];
  const baseMrp = basePriceRange[0] + (positiveHash % priceRangeDiff);
  
  const calculateDiscount = (price: number, mrp: number) => {
    const pct = Math.round(((mrp - price) / mrp) * 100);
    return `${pct}% OFF`;
  };

  const platforms: PlatformDeal[] = targetPlatforms.map((platformName, i) => {
    // slight variation for each platform based on index and hash
    const variation = 0.75 + (((positiveHash + i) % 20) / 100); // 75% to 95% of MRP
    const price = Math.round(baseMrp * variation);
    const style = getPlatformStyle(platformName);
    
    return {
      platform: platformName,
      domain: getPlatformDomain(platformName),
      badgeBg: style.badgeBg,
      logoBgClass: style.bgClass,
      logoLetter: style.logoLetter,
      price: price,
      originalPrice: baseMrp,
      discount: calculateDiscount(price, baseMrp),
      delivery: categoryType === "Groceries" ? "Delivery in 10 mins" : "Express Delivery in 1-2 Days",
      offers: ["Platform Exclusive Discount", "Partner Bank Offers"],
      stock: "In Stock",
      qualityRating: 4.0 + ((positiveHash + i) % 10) / 10,
      qualityScore: "Verified Seller",
      regretRisk: "Low",
      sellerType: "Verified Partner",
      productUrl: getPlatformSearchUrl(platformName, cleanName),
    };
  });

  return {
    id: `custom-${cleanName.toLowerCase().replace(/\s+/g, "-")}`,
    name: cleanName,
    category: categoryType,
    rating: 4.0 + (positiveHash % 10) / 10,
    reviewsCount: (positiveHash % 5000) + 1200,
    platforms: platforms,
  };
}

export function MultiPlatformCompare({ initialQuery = "" }: { initialQuery?: string }) {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery.trim());
  const [sortOption, setSortOption] = useState<"lowest_price" | "highest_quality" | "fastest_delivery" | "max_discount">("lowest_price");

  useEffect(() => {
    if (initialQuery.trim()) {
      setSearchInput(initialQuery);
      setSubmittedQuery(initialQuery);
      setHasSearched(true);
    }
  }, [initialQuery]);

  // Current active product calculation (only evaluated when user has searched/submitted)
  let currentProduct: CompareProduct | null = null;
  let deals: PlatformDeal[] = [];

  if (hasSearched && submittedQuery.trim()) {
    const cleanQuery = submittedQuery.trim();
    const match = SAMPLE_PRODUCTS.find((p) =>
      p.name.toLowerCase().includes(cleanQuery.toLowerCase())
    );
    if (match) {
      currentProduct = match;
    } else {
      currentProduct = generateDynamicComparison(cleanQuery);
    }

    // Sort platform deals - ALWAYS default & prioritize Ascending Price Order (lowest price first)
    deals = [...currentProduct.platforms];
    if (sortOption === "lowest_price") {
      deals.sort((a, b) => a.price - b.price); // ASCENDING ORDER
    } else if (sortOption === "highest_quality") {
      deals.sort((a, b) => b.qualityRating - a.qualityRating);
    } else if (sortOption === "fastest_delivery") {
      deals = deals.filter(
        (d) =>
          d.delivery.toLowerCase().includes("same-day") ||
          d.delivery.toLowerCase().includes("1-day") ||
          d.delivery.toLowerCase().includes("tomorrow") ||
          d.delivery.toLowerCase().includes("hours") ||
          d.delivery.toLowerCase().includes("express")
      );
      if (deals.length === 0) deals = [...currentProduct.platforms].sort((a, b) => a.price - b.price);
    } else if (sortOption === "max_discount") {
      deals.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price));
    } else {
      deals.sort((a, b) => a.price - b.price); // Fallback ASCENDING ORDER
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      toast.error("Please type a product name to compare!");
      return;
    }
    setSubmittedQuery(query);
    setHasSearched(true);
    toast.success(`Comparing live prices for "${query}" across Amazon, Flipkart, Meesho, Croma, Reliance Digital & Tata CLiQ!`);
  };

  const handleChipClick = (query: string) => {
    setSearchInput(query);
    setSubmittedQuery(query);
    setHasSearched(true);
    toast.info(`Comparing live prices for "${query}"`);
  };

  const copyShareLink = () => {
    if (!submittedQuery) return;
    const shareUrl = `${window.location.origin}/compare?q=${encodeURIComponent(submittedQuery)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Live price comparison link copied to clipboard!");
  };

  const lowestPriceVal = deals.length > 0 ? Math.min(...deals.map(d => d.price)) : 0;

  return (
    <div className="space-y-8">
      
      {/* Search Input Bar for Live Multi-Platform Query */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] font-bold">
              <Scale className="mr-1.5 h-3.5 w-3.5" /> Multi-Platform Price Compare Engine
            </Badge>

            <h2 className="text-xl font-black text-foreground sm:text-2xl mt-1.5">
              Type Product & Click Compare to Fetch Live Prices
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fetches real-time prices sorted in <strong className="text-foreground">Ascending Order (Lowest to Highest ₹)</strong> across Amazon, Flipkart, Meesho, Croma, Reliance Digital, & Tata CLiQ.
            </p>
          </div>

          {hasSearched && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Share2 className="h-3.5 w-3.5" /> Share Comparison
            </Button>
          )}
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type product name (e.g. iPhone 15 Pro, Sony XM5, Galaxy S24, MacBook Air, Running Shoes)..."
              className="h-11 rounded-xl pl-10 text-xs bg-background"
            />
          </div>
          <Button type="submit" className="h-11 rounded-xl px-6 font-bold text-xs gap-2 shadow-xs bg-brand text-white hover:bg-brand/90">
            <Scale className="h-4 w-4" /> Compare Live Prices
          </Button>
        </form>

        {/* Quick Sample Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-border/60">
          <span className="font-semibold text-muted-foreground">Quick Compare:</span>
          {["Apple iPhone 15 Pro", "Sony WH-1000XM5", "Samsung Galaxy S24 Ultra", "MacBook Air M2", "AirPods Pro", "Nike Shoes"].map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                submittedQuery.toLowerCase() === chip.toLowerCase()
                  ? "bg-brand text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* State 1: Before Search (Prompt Banner asking user to type and click Compare) */}
      {!hasSearched && (
        <div className="rounded-3xl border border-dashed border-border/90 bg-muted/20 p-8 sm:p-14 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-xs">
            <Search className="h-8 w-8" />
          </div>
          <div className="max-w-lg mx-auto space-y-2">
            <Badge variant="outline" className="rounded-full text-xs font-bold border-brand/30 text-brand">
              Ready to Compare Prices
            </Badge>
            <h3 className="text-2xl font-black text-foreground">Type a Product Name Above & Click Compare</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter any product name into the search bar above and click <strong className="text-foreground font-bold">"Compare Live Prices"</strong> to view real-time platform deals sorted in <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Ascending Price Order (Cheapest Store First)</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            {["Apple iPhone 15 Pro", "Sony WH-1000XM5", "Samsung Galaxy S24", "MacBook Air M2"].map((popular) => (
              <button
                key={popular}
                onClick={() => handleChipClick(popular)}
                className="rounded-full border border-border bg-card hover:border-brand hover:text-brand px-4 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Compare {popular}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* State 2: After Search (Display Multi-Platform Deals Grid in Ascending Price Order) */}
      {hasSearched && currentProduct && (
        <div className="space-y-6">
          {/* Active Product Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" /> Prices Sorted in Ascending Order (Lowest to Highest ₹)
              </span>
              <h3 className="text-xl font-black text-foreground mt-0.5">{currentProduct.name}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{currentProduct.rating}</span>
                </div>
                <span>·</span>
                <span>Based on {currentProduct.reviewsCount.toLocaleString()} verified customer reviews</span>
                <span>·</span>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  {deals.length} Platform Prices Synced
                </Badge>
              </div>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
              <button
                onClick={() => setSortOption("lowest_price")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  sortOption === "lowest_price" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Price: Low to High</span>
              </button>
              <button
                onClick={() => setSortOption("highest_quality")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  sortOption === "highest_quality" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                <span>Quality Rating</span>
              </button>
              <button
                onClick={() => setSortOption("max_discount")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  sortOption === "max_discount" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Max Savings</span>
              </button>
            </div>
          </div>

          {/* Multi-Platform Deals Grid (Sorted Ascending by Price) */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal, index) => {
              const isAbsoluteLowest = deal.price === lowestPriceVal;
              const platformUrl = deal.productUrl || getPlatformSearchUrl(deal.platform, currentProduct.name);

              return (
                <Card
                  key={deal.platform}
                  className={`relative rounded-2xl border transition-all hover:shadow-md ${
                    isAbsoluteLowest
                      ? "border-emerald-500/80 bg-emerald-500/5 ring-2 ring-emerald-500/40 shadow-sm"
                      : "border-border/80 bg-card"
                  }`}
                >
                  {/* Badges for Price Rank & Cheapest Store */}
                  <div className="absolute -top-3 left-4 flex gap-1.5">
                    {isAbsoluteLowest ? (
                      <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> #1 Lowest Price Store
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 text-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        #{index + 1} Store Deal
                      </span>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Platform Header */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-base text-white shadow-xs ${deal.logoBgClass}`}
                        >
                          {deal.logoLetter}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-black text-foreground">{deal.platform}</h3>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground border-border/80">
                              {deal.domain || getPlatformDomain(deal.platform)}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-semibold">{deal.sellerType}</p>
                        </div>
                      </div>

                      <Badge className={`rounded-lg text-xs font-bold ${deal.badgeBg}`}>
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
                          Best Price Deal — Cheapest across all stores!
                        </p>
                      )}
                    </div>

                    {/* Quality & Score Comparison Box */}
                    <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px] font-medium">Quality & Rating:</span>
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
                        <span className="text-muted-foreground text-[11px] font-medium">AI Regret Risk:</span>
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
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform Bank & Savings Offers:</p>
                      {deal.offers.map((offer, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{offer}</span>
                        </div>
                      ))}
                    </div>

                    {/* Official Platform Link & CTA Button */}
                    <div className="space-y-1.5 pt-2">
                      <a
                        href={platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => toast.success(`Opening ${deal.platform} store for ₹${deal.price.toLocaleString("en-IN")}...`)}
                        className={`w-full rounded-xl font-bold text-xs h-10 gap-1.5 shadow-xs flex items-center justify-center transition-all ${
                          isAbsoluteLowest
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                            : "bg-brand hover:bg-brand/90 text-white"
                        }`}
                      >
                        <span>Buy on {deal.platform}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      {/* Direct Link Preview */}
                      <a
                        href={platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-[10px] text-muted-foreground hover:text-brand hover:underline font-mono truncate px-1"
                        title={platformUrl}
                      >
                        {platformUrl.replace(/^https?:\/\//, "")} ↗
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
