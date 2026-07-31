import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications & Alerts — ZGenie" }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold">
            <Bell className="mr-1.5 h-3.5 w-3.5" /> Price Drop Alerts
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            Notifications & Price Drop Radar
          </h1>
        </div>

        <div className="space-y-3">
          {[
            { title: "Price Drop Alert: Aether Pro 14 Laptop", desc: "Price dropped by $200 (13% off). Now $1,299 at major retailers.", time: "2 hours ago" },
            { title: "AI Regret Analysis Updated", desc: "Nimbus Headphones regret risk decreased to 5% based on 400 new verified reviews.", time: "1 day ago" },
          ].map((n, idx) => (
            <div
              key={idx}
              onClick={() => toast.info(`Viewing notification: ${n.title}`)}
              className="p-4 rounded-2xl border border-border bg-card shadow-xs cursor-pointer hover:border-brand/40 transition-all flex items-start gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-foreground">{n.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                <span className="text-[10px] text-muted-foreground mt-2 block">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
