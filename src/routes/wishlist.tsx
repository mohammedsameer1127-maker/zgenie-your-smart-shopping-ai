import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trash2, ShoppingCart, Scale, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [{ title: "My Saved Wishlist — ZGenie" }],
  }),
  component: WishlistPage,
});

const INITIAL_WISHLIST = [
  { id: "w1", name: "Aether Pro 14 Laptop", price: "$1,299", was: "$1,499", status: "Price Dropped -$200" },
  { id: "w2", name: "Nimbus Wireless Headphones", price: "$249", was: "$299", status: "Lowest Price in 30 Days" },
];

function WishlistPage() {
  const [items, setItems] = useState(INITIAL_WISHLIST);

  const removeItem = (id: string, name: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.info(`Removed ${name} from your Wishlist`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold">
            <Heart className="mr-1.5 h-3.5 w-3.5 fill-rose-500" /> Saved Items ({items.length})
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            My Wishlist & Price Alerts
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-bold text-foreground">Your Wishlist is currently empty</p>
            <Button asChild size="sm" className="mt-4 rounded-xl text-xs font-bold">
              <Link to="/home">Explore Products to Compare</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-black text-foreground">{item.price}</span>
                    <span className="text-xs text-muted-foreground line-through">{item.was}</span>
                    <Badge className="rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1">
                    <Link to="/compare"><Scale className="h-3.5 w-3.5" /> Compare</Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.success(`Moved ${item.name} to Cart!`)}
                    className="rounded-xl text-xs font-bold gap-1"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                  </Button>
                  <button
                    onClick={() => removeItem(item.id, item.name)}
                    className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
