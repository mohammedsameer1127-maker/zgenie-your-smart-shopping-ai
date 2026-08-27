import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useLikes } from "@/context/LikesContext";
import { getRealBrandSuggestions, inferBrand } from "@/lib/groq";

export const Route = createFileRoute("/categories")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => {
    return {
      category: typeof search.category === "string" ? search.category : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Product Categories & Catalog — ZGenie" },
      {
        name: "description",
        content:
          "Explore curated product categories, live retailer pricing, and regret intelligence across Amazon, Flipkart, Croma, Reliance Digital, Blinkit, and Myntra.",
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
    id: "smartphones",
    name: "Smartphones & Tablets",
    icon: Smartphone,
    desc: "iPhone, Galaxy, OnePlus, Pixel, iQOO & Tablets",
    accent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    id: "laptops",
    name: "Laptops & Computers",
    icon: Laptop,
    desc: "Ultrabooks, Gaming Rigs, MacBooks & Workstations",
    accent: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  {
    id: "audio",
    name: "Headphones & Audio",
    icon: Headphones,
    desc: "ANC Earbuds, Over-Ear & Studio Monitors",
    accent: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  {
    id: "tv",
    name: "Smart TVs & Home Theater",
    icon: Tv,
    desc: "OLED 4K, QLED, Soundbars & Streaming Tech",
    accent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  {
    id: "gaming",
    name: "Gaming & Consoles",
    icon: Gamepad2,
    desc: "PS5, Xbox, Handhelds & Accessories",
    accent: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  {
    id: "cameras",
    name: "Cameras & Drones",
    icon: Camera,
    desc: "Mirrorless, 4K Action Cams & Gimbal Drones",
    accent: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  },
  {
    id: "wearables",
    name: "Smart Wearables",
    icon: Watch,
    desc: "Apple Watch, Galaxy Watch, Garmin & Smart Rings",
    accent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    id: "home-office",
    name: "Home & Smart Office",
    icon: Sofa,
    desc: "Ergonomic Chairs, Desks, Mouses & Smart Lights",
    accent: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    icon: Shirt,
    desc: "Sneakers, Jackets, Activewear & Premium Watches",
    accent: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  {
    id: "gifts",
    name: "Smart Gifts & Tech",
    icon: Gift,
    desc: "Curated smart gadgets, vacuums, Kindles & hubs",
    accent: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
];

export interface CategoryProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewsCount: number;
  regretScore: string;
  platform: string;
  tag: string;
  image: string;
}

export const COMPREHENSIVE_CATALOG: CategoryProduct[] = [
  // ==========================================
  // 1. SMARTPHONES & TABLETS
  // ==========================================
  {
    id: "prod-iphone-16-pro",
    name: "Apple iPhone 16 Pro (128GB - Desert Titanium)",
    brand: "Apple",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 119490,
    originalPrice: 119900,
    discount: "10-Min Delivery",
    rating: 4.9,
    reviewsCount: 8900,
    regretScore: "Very Low (1%)",
    platform: "Blinkit",
    tag: "Top Flagship",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-iphone-16",
    name: "Apple iPhone 16 (128GB - Ultramarine)",
    brand: "Apple",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 74999,
    originalPrice: 79900,
    discount: "6% OFF",
    rating: 4.8,
    reviewsCount: 11200,
    regretScore: "Very Low (2%)",
    platform: "Flipkart",
    tag: "Trending",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max (256GB - Natural Titanium)",
    brand: "Apple",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 134900,
    originalPrice: 154000,
    discount: "12% OFF",
    rating: 4.9,
    reviewsCount: 14500,
    regretScore: "Very Low (2%)",
    platform: "Amazon",
    tag: "Titanium Power",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-iphone-15",
    name: "Apple iPhone 15 (128GB - Blue)",
    brand: "Apple",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 57999,
    originalPrice: 69900,
    discount: "17% OFF",
    rating: 4.8,
    reviewsCount: 32000,
    regretScore: "Very Low (2%)",
    platform: "Flipkart",
    tag: "Best Value iPhone",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB Storage - Titanium Gray)",
    brand: "Samsung",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 109999,
    originalPrice: 129999,
    discount: "15% OFF",
    rating: 4.8,
    reviewsCount: 12400,
    regretScore: "Very Low (3%)",
    platform: "Flipkart",
    tag: "Camera Monster",
    image: "https://m.media-amazon.com/images/I/71RVu88nx6L._SL1500_.jpg",
  },
  {
    id: "prod-s24",
    name: "Samsung Galaxy S24 5G (8GB RAM, 128GB - Onyx Black)",
    brand: "Samsung",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 62999,
    originalPrice: 74999,
    discount: "16% OFF",
    rating: 4.7,
    reviewsCount: 7800,
    regretScore: "Low (4%)",
    platform: "Amazon",
    tag: "Compact Flagship",
    image: "https://m.media-amazon.com/images/I/719nv28uS1L._SL1500_.jpg",
  },
  {
    id: "prod-oneplus-12",
    name: "OnePlus 12 5G (12GB RAM, 256GB - Flowy Emerald)",
    brand: "OnePlus",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 59999,
    originalPrice: 64999,
    discount: "8% OFF",
    rating: 4.8,
    reviewsCount: 9200,
    regretScore: "Very Low (3%)",
    platform: "Amazon",
    tag: "Fast Charging King",
    image: "https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg",
  },
  {
    id: "prod-oneplus-12r",
    name: "OnePlus 12R 5G (8GB RAM, 128GB - Cool Blue)",
    brand: "OnePlus",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 35999,
    originalPrice: 39999,
    discount: "10% OFF",
    rating: 4.7,
    reviewsCount: 18400,
    regretScore: "Very Low (3%)",
    platform: "Amazon",
    tag: "Performance Value",
    image: "https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg",
  },
  {
    id: "prod-pixel-9-pro",
    name: "Google Pixel 9 Pro XL 5G (16GB RAM, 128GB - Hazel)",
    brand: "Google",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 104999,
    originalPrice: 124999,
    discount: "16% OFF",
    rating: 4.7,
    reviewsCount: 3600,
    regretScore: "Low (4%)",
    platform: "Flipkart",
    tag: "Pure AI Android",
    image: "https://m.media-amazon.com/images/I/61NfA7s-DYL._SL1500_.jpg",
  },
  {
    id: "prod-pixel-8a",
    name: "Google Pixel 8a 5G (8GB RAM, 128GB - Aloe)",
    brand: "Google",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 44999,
    originalPrice: 52999,
    discount: "15% OFF",
    rating: 4.6,
    reviewsCount: 4800,
    regretScore: "Low (4%)",
    platform: "Flipkart",
    tag: "Clean AI Experience",
    image: "https://m.media-amazon.com/images/I/61NfA7s-DYL._SL1500_.jpg",
  },
  {
    id: "prod-iqoo-neo-9-pro",
    name: "iQOO Neo 9 Pro 5G (8GB RAM, 256GB - Fiery Red)",
    brand: "iQOO",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 33999,
    originalPrice: 39999,
    discount: "15% OFF",
    rating: 4.8,
    reviewsCount: 14200,
    regretScore: "Very Low (2%)",
    platform: "Amazon",
    tag: "Top Gaming Phone",
    image: "https://m.media-amazon.com/images/I/719n91OsuSL._SL1200_.jpg",
  },
  {
    id: "prod-iqoo-12",
    name: "iQOO 12 5G (12GB RAM, 256GB - Legend Edition)",
    brand: "iQOO",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 49999,
    originalPrice: 59999,
    discount: "17% OFF",
    rating: 4.8,
    reviewsCount: 8100,
    regretScore: "Very Low (2%)",
    platform: "Amazon",
    tag: "Snapdragon 8 Gen 3",
    image: "https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1200_.jpg",
  },
  {
    id: "prod-iqoo-z9s-pro",
    name: "iQOO Z9s Pro 5G (8GB RAM, 128GB - Luxe Marble)",
    brand: "iQOO",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 24999,
    originalPrice: 29999,
    discount: "17% OFF",
    rating: 4.7,
    reviewsCount: 6500,
    regretScore: "Low (3%)",
    platform: "Amazon",
    tag: "Curved AMOLED",
    image: "https://m.media-amazon.com/images/I/611m3NpqefL._SL1200_.jpg",
  },
  {
    id: "prod-infinix-note-40-pro",
    name: "Infinix Note 40 Pro 5G (8GB RAM, 256GB - Vintage Green)",
    brand: "Infinix",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 19999,
    originalPrice: 25999,
    discount: "23% OFF",
    rating: 4.6,
    reviewsCount: 6800,
    regretScore: "Low (5%)",
    platform: "Flipkart",
    tag: "Wireless MagCharge",
    image: "https://m.media-amazon.com/images/I/718y6tLw2bL._SL1500_.jpg",
  },
  {
    id: "prod-infinix-zero-30",
    name: "Infinix Zero 30 5G (12GB RAM, 256GB - Rome Green)",
    brand: "Infinix",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 21999,
    originalPrice: 27999,
    discount: "21% OFF",
    rating: 4.5,
    reviewsCount: 5100,
    regretScore: "Low (6%)",
    platform: "Flipkart",
    tag: "4K 60fps Front Camera",
    image: "https://m.media-amazon.com/images/I/71eXwZJ0gSL._SL1500_.jpg",
  },
  {
    id: "prod-xiaomi-14-ultra",
    name: "Xiaomi 14 Ultra 5G (16GB RAM, 512GB - Black)",
    brand: "Xiaomi",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 99999,
    originalPrice: 119999,
    discount: "17% OFF",
    rating: 4.7,
    reviewsCount: 2900,
    regretScore: "Low (4%)",
    platform: "Amazon",
    tag: "Leica Optics",
    image: "https://m.media-amazon.com/images/I/71v15+sV2ZL._SL1500_.jpg",
  },
  {
    id: "prod-vivo-x100-pro",
    name: "Vivo X100 Pro 5G (16GB RAM, 512GB - Asteroid Black)",
    brand: "Vivo",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 89999,
    originalPrice: 99999,
    discount: "10% OFF",
    rating: 4.8,
    reviewsCount: 3800,
    regretScore: "Very Low (2%)",
    platform: "Flipkart",
    tag: "ZEISS APO Telephoto",
    image: "https://m.media-amazon.com/images/I/71K1jVn7PXL._SL1500_.jpg",
  },
  {
    id: "prod-nothing-phone-2",
    name: "Nothing Phone (2) (12GB RAM, 256GB - Dark Grey)",
    brand: "Nothing",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 36999,
    originalPrice: 49999,
    discount: "26% OFF",
    rating: 4.6,
    reviewsCount: 6800,
    regretScore: "Low (4%)",
    platform: "Flipkart",
    tag: "Glyph Interface",
    image: "https://m.media-amazon.com/images/I/81mXn46-77L._SL1500_.jpg",
  },
  {
    id: "prod-nothing-2a-plus",
    name: "Nothing Phone (2a) Plus (8GB RAM, 256GB - Metallic Grey)",
    brand: "Nothing",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 27999,
    originalPrice: 31999,
    discount: "12% OFF",
    rating: 4.6,
    reviewsCount: 7200,
    regretScore: "Low (4%)",
    platform: "Flipkart",
    tag: "Iconic Design",
    image: "https://m.media-amazon.com/images/I/71V2+5eU+oL._SL1500_.jpg",
  },
  {
    id: "prod-realme-gt-6",
    name: "Realme GT 6 5G (12GB RAM, 256GB - Fluid Silver)",
    brand: "Realme",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 36999,
    originalPrice: 42999,
    discount: "14% OFF",
    rating: 4.6,
    reviewsCount: 5400,
    regretScore: "Low (5%)",
    platform: "Flipkart",
    tag: "Bright 6000-Nit OLED",
    image: "https://m.media-amazon.com/images/I/71Xm+H-ZlNL._SL1500_.jpg",
  },
  {
    id: "prod-poco-f6",
    name: "Poco F6 5G (8GB RAM, 256GB - Titanium)",
    brand: "Poco",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 27999,
    originalPrice: 33999,
    discount: "18% OFF",
    rating: 4.6,
    reviewsCount: 11400,
    regretScore: "Low (5%)",
    platform: "Flipkart",
    tag: "Snapdragon 8s Gen 3",
    image: "https://m.media-amazon.com/images/I/71T5NVOgbpL._SL1500_.jpg",
  },
  {
    id: "prod-ipad-air-m2",
    name: "Apple iPad Air M2 (11-inch, 128GB, Wi-Fi - Space Gray)",
    brand: "Apple",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 54900,
    originalPrice: 59900,
    discount: "8% OFF",
    rating: 4.9,
    reviewsCount: 7100,
    regretScore: "Very Low (1%)",
    platform: "Croma",
    tag: "Best Tablet",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-air-finish-select-gallery-202405-11inch-spacegray?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-samsung-tab-s9",
    name: "Samsung Galaxy Tab S9 (11-inch, Dynamic AMOLED 2X, S-Pen)",
    brand: "Samsung",
    category: "Smartphones & Tablets",
    categoryId: "smartphones",
    price: 58999,
    originalPrice: 72999,
    discount: "19% OFF",
    rating: 4.8,
    reviewsCount: 4300,
    regretScore: "Very Low (3%)",
    platform: "Reliance Digital",
    tag: "Top Android Tablet",
    image: "https://m.media-amazon.com/images/I/61y493b8uNL._SL1500_.jpg",
  },

  // ==========================================
  // 2. LAPTOPS & COMPUTERS
  // ==========================================
  {
    id: "prod-macbook-air-m3",
    name: "Apple MacBook Air M3 (13.6-inch, 16GB Unified RAM, 512GB SSD)",
    brand: "Apple",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 124990,
    originalPrice: 134900,
    discount: "7% OFF",
    rating: 4.9,
    reviewsCount: 5200,
    regretScore: "Ultra Safe Buy (1%)",
    platform: "Croma",
    tag: "Best Ultrabook",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-midnight-select-202402?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-macbook-air-m2",
    name: "Apple MacBook Air M2 (13.6-inch, 16GB RAM, 256GB SSD)",
    brand: "Apple",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 94990,
    originalPrice: 114900,
    discount: "17% OFF",
    rating: 4.9,
    reviewsCount: 16400,
    regretScore: "Ultra Safe Buy (2%)",
    platform: "Amazon",
    tag: "Highest Selling",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-starlight-select-20220606?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-macbook-pro-14",
    name: "Apple MacBook Pro 14 (M3 Pro Chip, 18GB RAM, 512GB SSD)",
    brand: "Apple",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 179990,
    originalPrice: 199900,
    discount: "10% OFF",
    rating: 4.9,
    reviewsCount: 3100,
    regretScore: "Ultra Safe Buy (1%)",
    platform: "Reliance Digital",
    tag: "Pro Workstation",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-asus-zephyrus-g14",
    name: "ASUS ROG Zephyrus G14 Gaming Laptop (Ryzen 9, RTX 4060, OLED)",
    brand: "Asus",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 149990,
    originalPrice: 179990,
    discount: "17% OFF",
    rating: 4.8,
    reviewsCount: 2800,
    regretScore: "Low Regret (4%)",
    platform: "Amazon",
    tag: "Top Gaming Laptop",
    image: "https://dlcdnwebimgs.asus.com/gain/9712a8a8-3563-4b67-a8b2-b1ee0f913d33/w800",
  },
  {
    id: "prod-dell-xps-13",
    name: "Dell XPS 13 Plus Ultrabook (Intel Core i7 13th Gen, 16GB, 1TB SSD)",
    brand: "Dell",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 129990,
    originalPrice: 149900,
    discount: "13% OFF",
    rating: 4.7,
    reviewsCount: 1900,
    regretScore: "Minimal Regret (5%)",
    platform: "Reliance Digital",
    tag: "Premium Windows",
    image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9320/media-gallery/notebook-xps-9320-platinum-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=600&wid=600",
  },
  {
    id: "prod-lenovo-legion-pro-5",
    name: "Lenovo Legion Pro 5 Gen 8 (i7-13700HX, RTX 4070, 32GB RAM)",
    brand: "Lenovo",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 139990,
    originalPrice: 165000,
    discount: "15% OFF",
    rating: 4.8,
    reviewsCount: 4200,
    regretScore: "Low Regret (4%)",
    platform: "Flipkart",
    tag: "Heavy Gaming",
    image: "https://p2-ofp.static.pub//fes/cms/2023/11/02/0h15p38g381014p564998p7u8t0071375373.png",
  },
  {
    id: "prod-hp-envy-x360",
    name: "HP Envy x360 2-in-1 Touchscreen Laptop (Ryzen 7, 16GB RAM, OLED)",
    brand: "HP",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 79990,
    originalPrice: 95000,
    discount: "16% OFF",
    rating: 4.6,
    reviewsCount: 3700,
    regretScore: "Moderate (8%)",
    platform: "Amazon",
    tag: "Versatile 2-in-1",
    image: "https://ssl-product-images.www8-hp.com/digmedialib/worldcat/c08906660.png",
  },
  {
    id: "prod-acer-helios-16",
    name: "Acer Predator Helios 16 Gaming Laptop (i7 14th Gen, RTX 4070)",
    brand: "Acer",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 134990,
    originalPrice: 159990,
    discount: "16% OFF",
    rating: 4.7,
    reviewsCount: 2200,
    regretScore: "Low Regret (6%)",
    platform: "Flipkart",
    tag: "Thermal King",
    image: "https://static-ecapac.acer.com/media/catalog/product/p/r/predator-helios-16-ph16-71-keyboard-backlight-on-wallpaper-01_1_3.png",
  },
  {
    id: "prod-lg-gram-17",
    name: "LG Gram 17 Lightweight Laptop (Intel Core Ultra 7, 16GB, 1.3kg)",
    brand: "LG",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 114990,
    originalPrice: 139000,
    discount: "17% OFF",
    rating: 4.7,
    reviewsCount: 1600,
    regretScore: "Low Regret (5%)",
    platform: "Croma",
    tag: "Featherlight 17-inch",
    image: "https://www.lg.com/content/dam/channel/wcms/in/images/laptops/17z90r-g-ah75a2_d_01_in/gallery/medium01.jpg",
  },
  {
    id: "prod-asus-tuf-f15",
    name: "ASUS TUF Gaming F15 (Intel Core i5 12th Gen, RTX 3050, 16GB)",
    brand: "Asus",
    category: "Laptops & Computers",
    categoryId: "laptops",
    price: 54990,
    originalPrice: 75990,
    discount: "28% OFF",
    rating: 4.6,
    reviewsCount: 12800,
    regretScore: "Low (6%)",
    platform: "Flipkart",
    tag: "Budget Gaming",
    image: "https://dlcdnwebimgs.asus.com/gain/49463b28-8bb0-47b2-bdcf-884bf059d09c/w800",
  },

  // ==========================================
  // 3. HEADPHONES & AUDIO
  // ==========================================
  {
    id: "prod-sony-wh1000xm5",
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    brand: "Sony",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 24990,
    originalPrice: 34990,
    discount: "29% OFF",
    rating: 4.8,
    reviewsCount: 22400,
    regretScore: "Minimal Regret (3%)",
    platform: "Amazon",
    tag: "Best ANC Audio",
    image: "https://www.sony.co.in/image/6145c1d32e6ac8e63a46c912dc33d5bb?fmt=png-alpha&wid=600",
  },
  {
    id: "prod-airpods-pro-2",
    name: "Apple AirPods Pro (2nd Gen with USB-C MagSafe Case)",
    brand: "Apple",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 20990,
    originalPrice: 24900,
    discount: "16% OFF",
    rating: 4.9,
    reviewsCount: 38000,
    regretScore: "Very Low Regret (2%)",
    platform: "Flipkart",
    tag: "Top In-Ear ANC",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-bose-qc-ultra",
    name: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones",
    brand: "Bose",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 32990,
    originalPrice: 35900,
    discount: "8% OFF",
    rating: 4.8,
    reviewsCount: 6500,
    regretScore: "Minimal Regret (4%)",
    platform: "Croma",
    tag: "Max Comfort",
    image: "https://assets.bosecreative.com/transform/54261da2-0708-4100-b620-1a7356262444/QCUH_Black_001_RGB?io=transform:scaleWidth,width:600",
  },
  {
    id: "prod-sennheiser-momentum-4",
    name: "Sennheiser Momentum 4 Wireless ANC Headphones (60Hr Battery)",
    brand: "Sennheiser",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 24990,
    originalPrice: 34990,
    discount: "29% OFF",
    rating: 4.7,
    reviewsCount: 7800,
    regretScore: "Low Regret (5%)",
    platform: "Amazon",
    tag: "60-Hour Battery",
    image: "https://assets.sennheiser.com/img/28059/product_detail_x2_desktop_Sennheiser-Momentum-4-Wireless-Black-Perspective.png",
  },
  {
    id: "prod-galaxy-buds2-pro",
    name: "Samsung Galaxy Buds2 Pro (24-bit Hi-Fi Sound, ANC)",
    brand: "Samsung",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 9999,
    originalPrice: 19999,
    discount: "50% OFF",
    rating: 4.7,
    reviewsCount: 14500,
    regretScore: "Very Low (3%)",
    platform: "Flipkart",
    tag: "50% Massive Deal",
    image: "https://m.media-amazon.com/images/I/61T7Y4yq5eL._SL1500_.jpg",
  },
  {
    id: "prod-sony-wf1000xm5",
    name: "Sony WF-1000XM5 True Wireless Noise Canceling Earbuds",
    brand: "Sony",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 21990,
    originalPrice: 29990,
    discount: "27% OFF",
    rating: 4.7,
    reviewsCount: 9200,
    regretScore: "Low Regret (4%)",
    platform: "Amazon",
    tag: "Hi-Res TWS",
    image: "https://www.sony.co.in/image/4429fcda717593c683fa610f60c6d594?fmt=png-alpha&wid=600",
  },
  {
    id: "prod-oneplus-buds-pro-2",
    name: "OnePlus Buds Pro 2 with Dynaudio Spatial Audio",
    brand: "OnePlus",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 8999,
    originalPrice: 11999,
    discount: "25% OFF",
    rating: 4.6,
    reviewsCount: 11200,
    regretScore: "Low (5%)",
    platform: "Reliance Digital",
    tag: "Spatial Sound",
    image: "https://oasis.opstatics.com/content/dam/oasis/page/2023/in/product/buds-pro-2/specs/green.png",
  },
  {
    id: "prod-marshall-major-4",
    name: "Marshall Major IV Wireless On-Ear Bluetooth Headphones",
    brand: "Marshall",
    category: "Headphones & Audio",
    categoryId: "audio",
    price: 11999,
    originalPrice: 14999,
    discount: "20% OFF",
    rating: 4.7,
    reviewsCount: 8400,
    regretScore: "Minimal (4%)",
    platform: "Myntra",
    tag: "Iconic Design",
    image: "https://www.marshallheadphones.com/dw/image/v2/BCQL_PRD/on/demandware.static/-/Sites-zs-master-catalog/default/dwfd8db3db/images/marshall/headphones/major-iv/black/pos-marshall-major-iv-black-01.png?sw=600",
  },

  // ==========================================
  // 4. SMART TVS & HOME THEATER
  // ==========================================
  {
    id: "prod-lg-c3-oled",
    name: "LG C3 55-inch 4K OLED Smart TV (α9 Gen6 AI, 120Hz Dolby Vision)",
    brand: "LG",
    category: "Smart TVs & Home Theater",
    categoryId: "tv",
    price: 114990,
    originalPrice: 169990,
    discount: "32% OFF",
    rating: 4.9,
    reviewsCount: 6800,
    regretScore: "Ultra Safe Buy (1%)",
    platform: "Amazon",
    tag: "Best 4K OLED",
    image: "https://www.lg.com/content/dam/channel/wcms/in/images/tvs/oled55c3psa_atr_eain_in_c/gallery/medium01.jpg",
  },
  {
    id: "prod-samsung-neo-qled",
    name: "Samsung 65-inch Neo QLED 4K Smart TV (Quantum Matrix Tech)",
    brand: "Samsung",
    category: "Smart TVs & Home Theater",
    categoryId: "tv",
    price: 139990,
    originalPrice: 199900,
    discount: "30% OFF",
    rating: 4.8,
    reviewsCount: 4200,
    regretScore: "Very Low (3%)",
    platform: "Reliance Digital",
    tag: "Ultra Bright QLED",
    image: "https://m.media-amazon.com/images/I/91r6jT1lJCL._SL1500_.jpg",
  },
  {
    id: "prod-sony-bravia-xr",
    name: "Sony Bravia XR 65-inch 4K OLED Google TV (Cognitive XR Processor)",
    brand: "Sony",
    category: "Smart TVs & Home Theater",
    categoryId: "tv",
    price: 189990,
    originalPrice: 249900,
    discount: "24% OFF",
    rating: 4.9,
    reviewsCount: 3100,
    regretScore: "Ultra Safe (2%)",
    platform: "Croma",
    tag: "Cinematic King",
    image: "https://www.sony.co.in/image/b8da0a9fef0a4303b71da5ba74eb3606?fmt=png-alpha&wid=600",
  },
  {
    id: "prod-tcl-c755",
    name: "TCL 55-inch Mini-LED 4K QD-Mini LED Smart Google TV (144Hz)",
    brand: "TCL",
    category: "Smart TVs & Home Theater",
    categoryId: "tv",
    price: 56990,
    originalPrice: 89990,
    discount: "37% OFF",
    rating: 4.6,
    reviewsCount: 5200,
    regretScore: "Low (6%)",
    platform: "Flipkart",
    tag: "Best Value Mini-LED",
    image: "https://www.tcl.com/content/dam/tcl-dam/region/in/products/tvs/c755/1.png",
  },
  {
    id: "prod-sonos-beam-2",
    name: "Sonos Beam Gen 2 Compact Smart Soundbar with Dolby Atmos",
    brand: "Sonos",
    category: "Smart TVs & Home Theater",
    categoryId: "tv",
    price: 49999,
    originalPrice: 54999,
    discount: "9% OFF",
    rating: 4.8,
    reviewsCount: 3400,
    regretScore: "Low Regret (3%)",
    platform: "Amazon",
    tag: "Dolby Atmos Audio",
    image: "https://media.sonos.com/images/znqlb5gh/project-retail/7c030d32bb5e71ba2b4421b1aeaa2394d6e9f168-1200x800.png?w=600",
  },
  {
    id: "prod-xiaomi-x-pro-55",
    name: "Xiaomi 55-inch X Pro 4K Dolby Vision Smart Google TV",
    brand: "Xiaomi",
    category: "Smart TVs & Home Theater",
    categoryId: "tv",
    price: 36999,
    originalPrice: 49999,
    discount: "26% OFF",
    rating: 4.5,
    reviewsCount: 14200,
    regretScore: "Low (7%)",
    platform: "Flipkart",
    tag: "Budget 4K TV",
    image: "https://i02.appmifile.com/105_operator_in/03/05/2023/24e622efbe0be05c6c06a3809623e1dc.png",
  },

  // ==========================================
  // 5. GAMING & CONSOLES
  // ==========================================
  {
    id: "prod-ps5-slim",
    name: "Sony PlayStation 5 Slim Disc Edition Console (1TB SSD)",
    brand: "Sony",
    category: "Gaming & Consoles",
    categoryId: "gaming",
    price: 49990,
    originalPrice: 54990,
    discount: "9% OFF",
    rating: 4.9,
    reviewsCount: 28000,
    regretScore: "Ultra Safe Buy (1%)",
    platform: "Amazon",
    tag: "Top Gaming Console",
    image: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$",
  },
  {
    id: "prod-xbox-series-x",
    name: "Microsoft Xbox Series X Console (1TB SSD, 4K 120FPS)",
    brand: "Microsoft",
    category: "Gaming & Consoles",
    categoryId: "gaming",
    price: 47990,
    originalPrice: 55990,
    discount: "14% OFF",
    rating: 4.8,
    reviewsCount: 9600,
    regretScore: "Very Low (3%)",
    platform: "Flipkart",
    tag: "Game Pass Beast",
    image: "https://assets.xboxservices.com/assets/fb/d2/fbd2cb56-5c25-414d-9fab-e4e690276b40.png?n=XBX_A-BuyBoxBGImage01-D.png",
  },
  {
    id: "prod-switch-oled",
    name: "Nintendo Switch OLED Model with White Joy-Con",
    brand: "Nintendo",
    category: "Gaming & Consoles",
    categoryId: "gaming",
    price: 29990,
    originalPrice: 34990,
    discount: "14% OFF",
    rating: 4.8,
    reviewsCount: 15400,
    regretScore: "Low (4%)",
    platform: "Amazon",
    tag: "Best Handheld",
    image: "https://assets.nintendo.com/image/upload/b_white,c_pad,f_auto,h_382,q_auto,w_573/ncom/en_US/switch/system/oled-model-white-set",
  },
  {
    id: "prod-asus-rog-ally-x",
    name: "ASUS ROG Ally X Handheld Gaming PC (Ryzen Z1 Extreme, 24GB)",
    brand: "Asus",
    category: "Gaming & Consoles",
    categoryId: "gaming",
    price: 84990,
    originalPrice: 89990,
    discount: "6% OFF",
    rating: 4.7,
    reviewsCount: 1800,
    regretScore: "Low (5%)",
    platform: "Croma",
    tag: "PC Gaming on Go",
    image: "https://dlcdnwebimgs.asus.com/gain/3c14a22c-a2b1-419b-a010-85fbbd3ef7ff/w800",
  },
  {
    id: "prod-dualsense-edge",
    name: "Sony DualSense Edge Wireless Controller for PS5",
    brand: "Sony",
    category: "Gaming & Consoles",
    categoryId: "gaming",
    price: 18990,
    originalPrice: 20990,
    discount: "10% OFF",
    rating: 4.8,
    reviewsCount: 4200,
    regretScore: "Low (4%)",
    platform: "Reliance Digital",
    tag: "Pro Controller",
    image: "https://gmedia.playstation.com/is/image/SIEPDC/dualsense-edge-controller-product-thumbnail-01-en-24aug22?$facebook$",
  },

  // ==========================================
  // 6. CAMERAS & DRONES
  // ==========================================
  {
    id: "prod-sony-a7iv",
    name: "Sony Alpha 7 IV Full-Frame Hybrid Mirrorless Camera (Body)",
    brand: "Sony",
    category: "Cameras & Drones",
    categoryId: "cameras",
    price: 199990,
    originalPrice: 242490,
    discount: "18% OFF",
    rating: 4.9,
    reviewsCount: 3800,
    regretScore: "Ultra Safe (1%)",
    platform: "Amazon",
    tag: "Pro Hybrid Cam",
    image: "https://www.sony.co.in/image/ca6c0e5a60e0a5d48dcfab33e9d8e752?fmt=png-alpha&wid=600",
  },
  {
    id: "prod-canon-r6m2",
    name: "Canon EOS R6 Mark II Mirrorless Camera with 24-105mm Lens",
    brand: "Canon",
    category: "Cameras & Drones",
    categoryId: "cameras",
    price: 239990,
    originalPrice: 279990,
    discount: "14% OFF",
    rating: 4.8,
    reviewsCount: 2200,
    regretScore: "Low (3%)",
    platform: "Reliance Digital",
    tag: "Fast 40fps Photo",
    image: "https://in.canon/media/image/2022/11/02/b65ba5a840e64c248b1bfb9eb092c45f_EOS+R6+Mark+II+Front+RF24-105mm+f4L+IS+USM.png",
  },
  {
    id: "prod-dji-mini-4-pro",
    name: "DJI Mini 4 Pro Drone with RC 2 Controller (Omnidirectional Sensing)",
    brand: "DJI",
    category: "Cameras & Drones",
    categoryId: "cameras",
    price: 94990,
    originalPrice: 109990,
    discount: "14% OFF",
    rating: 4.9,
    reviewsCount: 4600,
    regretScore: "Very Low (2%)",
    platform: "Amazon",
    tag: "4K/60 HDR Drone",
    image: "https://dji-official-fe.djicdn.com/dps/2a4b8ee34f686dc072d677864f7bdf75.png",
  },
  {
    id: "prod-gopro-hero-12",
    name: "GoPro HERO12 Black Waterproof Action Camera (5.3K60 Video)",
    brand: "GoPro",
    category: "Cameras & Drones",
    categoryId: "cameras",
    price: 34990,
    originalPrice: 44990,
    discount: "22% OFF",
    rating: 4.7,
    reviewsCount: 9800,
    regretScore: "Low (5%)",
    platform: "Croma",
    tag: "Tough Action Cam",
    image: "https://static.gopro.com/assets/blta2b8562de0e37fa9/bltc9fe5f59c8646b9a/64f0f63901b0ff42be879f41/hero12-black-pdp-carousel-01.png?width=600",
  },

  // ==========================================
  // 7. SMART WEARABLES
  // ==========================================
  {
    id: "prod-apple-watch-ultra-2",
    name: "Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case)",
    brand: "Apple",
    category: "Smart Wearables",
    categoryId: "wearables",
    price: 84900,
    originalPrice: 89900,
    discount: "6% OFF",
    rating: 4.9,
    reviewsCount: 6200,
    regretScore: "Ultra Safe (1%)",
    platform: "Croma",
    tag: "Extreme Rugged",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/watch-ultra2-finish-select-202409-49mm-titanium?wid=600&hei=600&fmt=png-alpha",
  },
  {
    id: "prod-galaxy-watch-6-classic",
    name: "Samsung Galaxy Watch 6 Classic (47mm LTE with Rotating Bezel)",
    brand: "Samsung",
    category: "Smart Wearables",
    categoryId: "wearables",
    price: 27999,
    originalPrice: 40999,
    discount: "32% OFF",
    rating: 4.7,
    reviewsCount: 8900,
    regretScore: "Very Low (3%)",
    platform: "Amazon",
    tag: "Rotating Bezel",
    image: "https://m.media-amazon.com/images/I/61Nl0oZ-B6L._SL1500_.jpg",
  },
  {
    id: "prod-garmin-forerunner-965",
    name: "Garmin Forerunner 965 Premium GPS Running Smartwatch (AMOLED)",
    brand: "Garmin",
    category: "Smart Wearables",
    categoryId: "wearables",
    price: 64990,
    originalPrice: 67490,
    discount: "4% OFF",
    rating: 4.9,
    reviewsCount: 2800,
    regretScore: "Very Low (2%)",
    platform: "Amazon",
    tag: "Pro Athlete GPS",
    image: "https://res.garmin.com/en/products/010-02809-00/v/cf-lg.jpg",
  },
  {
    id: "prod-oneplus-watch-2",
    name: "OnePlus Watch 2 (Dual-Engine Architecture, 100-Hour Battery)",
    brand: "OnePlus",
    category: "Smart Wearables",
    categoryId: "wearables",
    price: 21999,
    originalPrice: 27999,
    discount: "21% OFF",
    rating: 4.6,
    reviewsCount: 4700,
    regretScore: "Low (5%)",
    platform: "Reliance Digital",
    tag: "100-Hr Battery",
    image: "https://oasis.opstatics.com/content/dam/oasis/page/2024/watch2/specs/black.png",
  },
  {
    id: "prod-ultrahuman-ring-air",
    name: "Ultrahuman Ring AIR Raw Titanium Smart Ring (Sleep & HRV)",
    brand: "Ultrahuman",
    category: "Smart Wearables",
    categoryId: "wearables",
    price: 28499,
    originalPrice: 29999,
    discount: "5% OFF",
    rating: 4.7,
    reviewsCount: 3100,
    regretScore: "Low (4%)",
    platform: "Amazon",
    tag: "Ultra-Light Smart Ring",
    image: "https://m.media-amazon.com/images/I/61y49vFjUqL._SL1500_.jpg",
  },

  // ==========================================
  // 8. HOME & SMART OFFICE
  // ==========================================
  {
    id: "prod-herman-miller-aeron",
    name: "Herman Miller Aeron Ergonomic Office Chair with PostureFit SL",
    brand: "Herman Miller",
    category: "Home & Smart Office",
    categoryId: "home-office",
    price: 139999,
    originalPrice: 165000,
    discount: "15% OFF",
    rating: 4.9,
    reviewsCount: 4100,
    regretScore: "Ultra Safe (1%)",
    platform: "Amazon",
    tag: "Ergonomic Gold Standard",
    image: "https://www.hermanmiller.com/content/dam/hmicom/page_assets/products/aeron_chairs/prod_aeron_chair_pdp_g1.png",
  },
  {
    id: "prod-benq-screenbar-halo",
    name: "BenQ ScreenBar Halo Wireless Monitor Light with Backlight",
    brand: "BenQ",
    category: "Home & Smart Office",
    categoryId: "home-office",
    price: 15990,
    originalPrice: 19990,
    discount: "20% OFF",
    rating: 4.8,
    reviewsCount: 5200,
    regretScore: "Minimal Regret (2%)",
    platform: "Amazon",
    tag: "Eye-Care Monitor Bar",
    image: "https://image.benq.com/is/image/benqco/screenbar-halo-front?$ResponsivePreset$",
  },
  {
    id: "prod-logitech-mx-master-3s",
    name: "Logitech MX Master 3S Wireless Performance Mouse (8K DPI Quiet Click)",
    brand: "Logitech",
    category: "Home & Smart Office",
    categoryId: "home-office",
    price: 8495,
    originalPrice: 10995,
    discount: "23% OFF",
    rating: 4.9,
    reviewsCount: 36000,
    regretScore: "Very Low (1%)",
    platform: "Croma",
    tag: "Productivity King",
    image: "https://resource.logitech.com/w_600,c_limit,q_auto,f_auto,dpr_auto/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png",
  },
  {
    id: "prod-dyson-purifier-cool",
    name: "Dyson Purifier Cool Gen1 Air Purifier with HEPA H13 Filter",
    brand: "Dyson",
    category: "Home & Smart Office",
    categoryId: "home-office",
    price: 32900,
    originalPrice: 39900,
    discount: "18% OFF",
    rating: 4.7,
    reviewsCount: 8200,
    regretScore: "Low (4%)",
    platform: "Reliance Digital",
    tag: "Pure Air Cleanse",
    image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/419914-01.png?$responsive$&fmt=png-alpha&wid=600",
  },

  // ==========================================
  // 9. FASHION & APPAREL
  // ==========================================
  {
    id: "prod-air-jordan-1",
    name: "Nike Air Jordan 1 Retro High OG Men's Leather Sneakers",
    brand: "Nike",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 16995,
    originalPrice: 18995,
    discount: "11% OFF",
    rating: 4.8,
    reviewsCount: 14000,
    regretScore: "Very Low (3%)",
    platform: "Myntra",
    tag: "Iconic Sneaker",
    image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/AIR+JORDAN+1+RETRO+HIGH+OG.png",
  },
  {
    id: "prod-nike-air-max-pulse",
    name: "Nike Air Max Pulse Men's Athletic Running Sneakers",
    brand: "Nike",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 8995,
    originalPrice: 12999,
    discount: "31% OFF",
    rating: 4.8,
    reviewsCount: 8400,
    regretScore: "Very Low (2%)",
    platform: "Myntra",
    tag: "Athletic Sneaker",
    image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/e98d9e26-224a-4a2a-b78f-ef8cebbdf94a/AIR+MAX+PULSE.png",
  },
  {
    id: "prod-ultraboost-light",
    name: "Adidas Ultraboost Light Performance Running Shoes",
    brand: "Adidas",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 11999,
    originalPrice: 18999,
    discount: "37% OFF",
    rating: 4.8,
    reviewsCount: 9200,
    regretScore: "Very Low (2%)",
    platform: "Myntra",
    tag: "Cloud Comfort",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7ebf279185a54e959ec2af4200fd6117_9366/Ultraboost_Light_Running_Shoes_White_HQ6339_01_standard.jpg",
  },
  {
    id: "prod-puma-rs-x",
    name: "Puma RS-X Reinvent Unisex Chunky Lifestyle Sneakers",
    brand: "Puma",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 4799,
    originalPrice: 9999,
    discount: "52% OFF",
    rating: 4.7,
    reviewsCount: 7800,
    regretScore: "Low (4%)",
    platform: "Meesho",
    tag: "Chunky Sneaker",
    image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/391174/01/sv01/fnd/IND/fmt/png",
  },
  {
    id: "prod-levis-classic-tshirt",
    name: "Levi's Men Classic Graphic Cotton Crew-Neck T-Shirt",
    brand: "Levi's",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 899,
    originalPrice: 1999,
    discount: "55% OFF",
    rating: 4.8,
    reviewsCount: 16500,
    regretScore: "Very Low (1%)",
    platform: "Meesho",
    tag: "Best Value T-Shirt",
    image: "https://m.media-amazon.com/images/I/71wLpW6s7aL._SL1500_.jpg",
  },
  {
    id: "prod-puma-graphic-tshirt",
    name: "Puma Men Graphic Pure Cotton Slim Fit Sports T-Shirt",
    brand: "Puma",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 699,
    originalPrice: 1499,
    discount: "53% OFF",
    rating: 4.7,
    reviewsCount: 11200,
    regretScore: "Low (3%)",
    platform: "Meesho",
    tag: "Sports Cotton",
    image: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/674488/01/fnd/IND/fmt/png",
  },
  {
    id: "prod-uspa-polo-tshirt",
    name: "U.S. Polo Assn. Men Solid Pure Cotton Regular Fit Polo T-Shirt",
    brand: "U.S. Polo Assn.",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 1299,
    originalPrice: 2199,
    discount: "41% OFF",
    rating: 4.8,
    reviewsCount: 14800,
    regretScore: "Very Low (1%)",
    platform: "Myntra",
    tag: "Classic Polo",
    image: "https://m.media-amazon.com/images/I/71cvoGVystL._SL1500_.jpg",
  },
  {
    id: "prod-levis-511-jeans",
    name: "Levi's 511 Slim Fit Stretchable Denim Jeans",
    brand: "Levi's",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 2299,
    originalPrice: 3999,
    discount: "43% OFF",
    rating: 4.8,
    reviewsCount: 19500,
    regretScore: "Very Low (1%)",
    platform: "Myntra",
    tag: "Stretch Denim",
    image: "https://m.media-amazon.com/images/I/71g0rC+1h0L._SL1500_.jpg",
  },
  {
    id: "prod-allen-solly-shirt",
    name: "Allen Solly Men Pure Cotton Regular Fit Casual Shirt",
    brand: "Allen Solly",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 1499,
    originalPrice: 2499,
    discount: "40% OFF",
    rating: 4.7,
    reviewsCount: 8200,
    regretScore: "Very Low (2%)",
    platform: "Myntra",
    tag: "Pure Cotton Shirt",
    image: "https://m.media-amazon.com/images/I/71g2E7G8ZHL._SL1500_.jpg",
  },
  {
    id: "prod-fossil-gen-6-leather",
    name: "Fossil Gen 6 Smartwatch with Brown Leather Strap",
    brand: "Fossil",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 14995,
    originalPrice: 24995,
    discount: "40% OFF",
    rating: 4.6,
    reviewsCount: 6300,
    regretScore: "Low (6%)",
    platform: "Myntra",
    tag: "Classic Leather",
    image: "https://fossil.scene7.com/is/image/FossilPartners/FTW4059_main?$sfcc_fos_hi-res$",
  },
  {
    id: "prod-rayban-aviator",
    name: "Ray-Ban Classic Polarized Green Lens Aviator Sunglasses",
    brand: "Ray-Ban",
    category: "Fashion & Apparel",
    categoryId: "fashion",
    price: 8490,
    originalPrice: 10590,
    discount: "20% OFF",
    rating: 4.9,
    reviewsCount: 18400,
    regretScore: "Very Low (1%)",
    platform: "Myntra",
    tag: "Timeless Shade",
    image: "https://india.ray-ban.com/media/catalog/product/cache/image/600x300/e9c07042306f2905fae6c41d8049ccde/0/R/0RB3025I__001_58_01.png",
  },
  {
    id: "prod-philips-trimmer-3000",
    name: "Philips Series 3000 All-in-One Cordless Beard Trimmer",
    brand: "Philips",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 1499,
    originalPrice: 1995,
    discount: "25% OFF",
    rating: 4.8,
    reviewsCount: 34500,
    regretScore: "Very Low (1%)",
    platform: "Blinkit",
    tag: "10-Min Instant Delivery",
    image: "https://m.media-amazon.com/images/I/51wB7-7Qx3L._SL1000_.jpg",
  },
  {
    id: "prod-wild-stone-edge-edp",
    name: "Wild Stone Edge Premium Eau De Parfum for Men (100ml)",
    brand: "Wild Stone",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 549,
    originalPrice: 799,
    discount: "31% OFF",
    rating: 4.6,
    reviewsCount: 22800,
    regretScore: "Very Low (2%)",
    platform: "Blinkit",
    tag: "10-Min Delivery",
    image: "https://m.media-amazon.com/images/I/51wB7-7Qx3L._SL1000_.jpg",
  },
  {
    id: "prod-american-tourister-backpack",
    name: "American Tourister 32L Casual Laptop Backpack",
    brand: "American Tourister",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 1299,
    originalPrice: 2800,
    discount: "54% OFF",
    rating: 4.8,
    reviewsCount: 18900,
    regretScore: "Very Low (1%)",
    platform: "Meesho",
    tag: "Best Value Bag",
    image: "https://m.media-amazon.com/images/I/718y6tLw2bL._SL1500_.jpg",
  },

  // ==========================================
  // 10. SMART GIFTS & TECH
  // ==========================================
  {
    id: "prod-echo-show-10",
    name: "Amazon Echo Show 10 (3rd Gen) with Motion Tracking HD Screen",
    brand: "Amazon",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 20999,
    originalPrice: 24999,
    discount: "16% OFF",
    rating: 4.7,
    reviewsCount: 8900,
    regretScore: "Low (4%)",
    platform: "Amazon",
    tag: "Smart Hub with Screen",
    image: "https://m.media-amazon.com/images/I/51wB7-7Qx3L._SL1000_.jpg",
  },
  {
    id: "prod-dyson-v12-vacuum",
    name: "Dyson V12 Detect Slim Cordless Vacuum Cleaner with Laser",
    brand: "Dyson",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 49900,
    originalPrice: 55900,
    discount: "11% OFF",
    rating: 4.9,
    reviewsCount: 11400,
    regretScore: "Very Low (2%)",
    platform: "Croma",
    tag: "Laser Dust Detector",
    image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/368340-01.png?$responsive$&fmt=png-alpha&wid=600",
  },
  {
    id: "prod-kindle-paperwhite",
    name: "Kindle Paperwhite (16 GB) 6.8-inch Glare-Free Display with Warm Light",
    brand: "Amazon",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 13999,
    originalPrice: 14999,
    discount: "7% OFF",
    rating: 4.9,
    reviewsCount: 26000,
    regretScore: "Ultra Safe (1%)",
    platform: "Amazon",
    tag: "Best E-Reader",
    image: "https://m.media-amazon.com/images/I/61NvykYF4CL._SL1000_.jpg",
  },
  {
    id: "prod-airtag-4pack",
    name: "Apple AirTag (4 Pack) Precision Finding Bluetooth Trackers",
    brand: "Apple",
    category: "Smart Gifts & Tech",
    categoryId: "gifts",
    price: 10490,
    originalPrice: 11900,
    discount: "12% OFF",
    rating: 4.8,
    reviewsCount: 19800,
    regretScore: "Very Low (1%)",
    platform: "Blinkit",
    tag: "10-Min Instant Delivery",
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airtag-4pack-select-202104?wid=600&hei=600&fmt=png-alpha",
  },
];

function CategoriesPage() {
  const { category: initialCatQuery } = Route.useSearch();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCatQuery || "smartphones"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"featured" | "price_low" | "price_high" | "rating" | "discount">("featured");
  const { isLiked, toggleLike } = useLikes();

  // Find active category
  const activeCategory = useMemo(() => {
    return ALL_CATEGORIES.find((c) => c.id === selectedCategoryId) || ALL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Intelligent search matching: searches active category, all categories, and brand/token fallbacks
  const { filteredProducts, isFallbackMatch, activeSuggestions } = useMemo(() => {
    if (!searchQuery.trim()) {
      let prods = COMPREHENSIVE_CATALOG.filter((p) => p.categoryId === activeCategory.id);
      if (sortOption === "price_low") {
        prods.sort((a, b) => a.price - b.price);
      } else if (sortOption === "price_high") {
        prods.sort((a, b) => b.price - a.price);
      } else if (sortOption === "rating") {
        prods.sort((a, b) => b.rating - a.rating);
      } else if (sortOption === "discount") {
        prods.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price));
      }
      return { filteredProducts: prods, isFallbackMatch: false, activeSuggestions: [] };
    }

    const q = searchQuery.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);

    // 1. Direct match in active category
    let directCatMatches = COMPREHENSIVE_CATALOG.filter(
      (p) =>
        p.categoryId === activeCategory.id &&
        (p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q))
    );

    if (directCatMatches.length > 0) {
      applySorting(directCatMatches, sortOption);
      return { filteredProducts: directCatMatches, isFallbackMatch: false, activeSuggestions: [] };
    }

    // 2. Direct match across ALL categories
    let allCatMatches = COMPREHENSIVE_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
    );

    if (allCatMatches.length > 0) {
      applySorting(allCatMatches, sortOption);
      return { filteredProducts: allCatMatches, isFallbackMatch: false, activeSuggestions: [] };
    }

    // 3. Token & Brand matching (e.g. searching "iqoo 15r" finds "iQOO Neo 9 Pro", "iQOO 12", "iQOO Z9s Pro")
    const brandFromQuery = inferBrand(q).toLowerCase();
    let tokenMatches = COMPREHENSIVE_CATALOG.filter((p) => {
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      
      // Match by inferred brand
      if (brandFromQuery !== "verified" && pBrand.includes(brandFromQuery)) return true;

      // Match by any significant search token (e.g. "iqoo", "pixel", "macbook", "airpods")
      return tokens.some((t) => pName.includes(t) || pBrand.includes(t));
    });

    if (tokenMatches.length > 0) {
      applySorting(tokenMatches, sortOption);
      return { filteredProducts: tokenMatches, isFallbackMatch: true, activeSuggestions: [] };
    }

    // 4. No verified product found - calculate real brand recommendations
    const sugs = getRealBrandSuggestions(searchQuery);
    return { filteredProducts: [], isFallbackMatch: false, activeSuggestions: sugs };
  }, [activeCategory, searchQuery, sortOption]);

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

  const getStoreBadgeColor = (store: string) => {
    const s = store.toLowerCase();
    if (s.includes("amazon")) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    if (s.includes("flipkart")) return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    if (s.includes("croma")) return "bg-teal-500/10 text-teal-700 border-teal-500/20";
    if (s.includes("reliance")) return "bg-red-500/10 text-red-700 border-red-500/20";
    if (s.includes("blinkit")) return "bg-yellow-500/10 text-yellow-800 border-yellow-500/20";
    if (s.includes("myntra")) return "bg-rose-500/10 text-rose-700 border-rose-500/20";
    return "bg-purple-500/10 text-purple-700 border-purple-500/20";
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] font-bold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Full Product Catalog
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                Official Brand Release Assets
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Explore Products by Category
            </h1>
            <p className="text-xs text-muted-foreground">
              Select any category from the left panel to browse products, filter deals, and compare real-time prices across stores.
            </p>
          </div>
        </div>

        {/* Master-Detail Layout: Left Side Categories | Right Side Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Categories Navigation List */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-2 sticky top-20">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                All Categories
              </span>
            </div>

            <div className="space-y-1.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
              {ALL_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = cat.id === activeCategory.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSearchQuery("");
                    }}
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

                    <div className="flex items-center gap-1 shrink-0">
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
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Active Category Header Card with Integrated Search */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeCategory.accent}`}>
                    <activeCategory.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">{activeCategory.name}</h2>
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
                    { id: "rating", label: "Top Rated" },
                    { id: "discount", label: "Max Discount" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortOption(opt.id as any)}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search inside ${activeCategory.name} (e.g. model, brand, features)...`}
                  className="h-11 rounded-2xl pl-10 pr-12 text-xs bg-background text-foreground shadow-2xs border-border/80"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
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

            {/* Products Grid or Rich No-Results Recommendations */}
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
                    We couldn't find a verified commercial product matching <strong className="text-foreground">"{searchQuery}"</strong> in Indian retailer catalogs.
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
                          onClick={() => setSearchQuery(sug)}
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
                    onClick={() => setSearchQuery("")}
                    className="rounded-2xl text-xs font-semibold h-10 px-4 cursor-pointer"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const liked = isLiked(p.id);

                  return (
                    <Card
                      key={p.id}
                      className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Card Visual Image Header (Clean Canvas for Official Product Cutout) */}
                        <div className="relative aspect-[16/11] bg-white dark:bg-slate-900/90 p-3 flex flex-col justify-between border-b border-border/40 overflow-hidden">
                          {/* Official Product Release Cutout Image */}
                          <div className="absolute inset-0 flex items-center justify-center p-5">
                            <img
                              src={p.image}
                              alt={p.name}
                              loading="lazy"
                              className="h-full w-full object-contain scale-110 group-hover:scale-125 transition-transform duration-300 drop-shadow-sm"
                              onError={(e) => {
                                // Fallback icon container if image network fails
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
                            <span className="text-[10px] uppercase font-black text-foreground/80 bg-background/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/40 tracking-wider">
                              {p.brand}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border backdrop-blur-xs shadow-2xs ${getStoreBadgeColor(
                                p.platform
                              )}`}
                            >
                              {p.platform}
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
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
