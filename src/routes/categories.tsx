import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Laptop,
  Shirt,
  Sofa,
  Watch,
  Gift,
  Sparkles,
  ArrowRight,
  Headphones,
  Smartphone,
  Tv,
  Gamepad2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Product Categories — ZGenie" },
      { name: "description", content: "Explore all product categories available for AI side-by-side comparison." },
    ],
  }),
  component: CategoriesPage,
});

const ALL_CATEGORIES = [
  { name: "Laptops & Computers", icon: Laptop, count: "1,240+ Items", desc: "Ultrabooks, Gaming Rig, MacBooks & Workstations" },
  { name: "Smartphones & Tablets", icon: Smartphone, count: "890+ Items", desc: "iOS, Android, Foldables & Accessories" },
  { name: "Headphones & Audio", icon: Headphones, count: "650+ Items", desc: "ANC Earbuds, Over-Ear & Studio Monitors" },
  { name: "Smart TVs & Home Theater", icon: Tv, count: "520+ Items", desc: "OLED 4K, QLED, Soundbars & Streaming" },
  { name: "Gaming & Consoles", icon: Gamepad2, count: "480+ Items", desc: "PS5, Xbox, Handhelds & Accessories" },
  { name: "Cameras & Drones", icon: Camera, count: "310+ Items", desc: "Mirrorless, Action Cams & Lenses" },
  { name: "Smart Wearables", icon: Watch, count: "410+ Items", desc: "Fitness Trackers, Smartwatches & Rings" },
  { name: "Home & Smart Office", icon: Sofa, count: "1,100+ Items", desc: "Ergonomic Chairs, Desks & Lighting" },
  { name: "Fashion & Apparel", icon: Shirt, count: "2,400+ Items", desc: "Shoes, Jackets, Activewear & Watches" },
  { name: "Smart Gifts & Tech", icon: Gift, count: "420+ Items", desc: "Curated gift recommendations for every budget" },
];

function CategoriesPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge className="rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-bold">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Product Directory
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            Browse All Product Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Select a category to explore side-by-side product comparisons, specs matrices, and real-time deal predictions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to="/compare"
              search={{ q: cat.name }}
              className="block"
            >
              <Card
                className="group cursor-pointer rounded-2xl border-border/80 bg-card p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-brand transition-transform group-hover:scale-110">
                      <cat.icon className="h-5 w-5" />
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold rounded-lg">
                      {cat.count}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-4 group-hover:text-brand transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-brand gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Compare Category Live Prices</span> <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
