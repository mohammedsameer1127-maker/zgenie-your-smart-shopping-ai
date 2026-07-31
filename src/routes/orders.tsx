import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [{ title: "My Orders — ZGenie" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-bold">
            <Package className="mr-1.5 h-3.5 w-3.5" /> Purchase History
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            Orders & Shipments
          </h1>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <p className="text-xs font-bold text-foreground">Order #CP-948201</p>
                <p className="text-[11px] text-muted-foreground">Placed on July 28, 2026</p>
              </div>
              <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold gap-1">
                <Truck className="h-3.5 w-3.5" /> Out for Delivery
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Aether Pro 14 Laptop</span>
              <span className="font-black text-foreground">$1,299.00</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
