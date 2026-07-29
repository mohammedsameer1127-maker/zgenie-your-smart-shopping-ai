import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Shopping Cart — Comparing Products" }],
  }),
  component: CartPage,
});

const INITIAL_CART = [
  { id: "c1", name: "Aether Pro 14 Laptop", price: 1299, qty: 1 },
  { id: "c2", name: "Nimbus Wireless Headphones", price: 249, qty: 1 },
];

function CartPage() {
  const [cart, setCart] = useState(INITIAL_CART);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const removeItem = (id: string, name: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info(`Removed ${name} from Cart`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-bold">
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Checkout Cart ({cart.length})
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            My Shopping Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-bold text-foreground">Your Cart is empty</p>
            <Button asChild size="sm" className="mt-4 rounded-xl text-xs font-bold">
              <Link to="/home">Explore Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">${item.price} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-foreground">${item.price * item.qty}</span>
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

            <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 h-fit">
              <h3 className="text-sm font-bold text-foreground">Order Summary</h3>
              <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border/60">
                  <span>Total</span>
                  <span>${subtotal}</span>
                </div>
              </div>
              <Button
                onClick={() => toast.success("Redirecting to Secure Checkout...")}
                className="w-full rounded-xl font-bold text-xs h-11 gap-1.5"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
