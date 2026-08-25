import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Shield, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Account Settings — ZGenie" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 text-xs font-bold">
            <Settings className="mr-1.5 h-3.5 w-3.5" /> Preferences
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            Account Settings & Preferences
          </h1>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-foreground">AI Price Drop Alerts</Label>
              <p className="text-xs text-muted-foreground">Receive instant notifications when watched items drop in price.</p>
            </div>
            <Switch defaultChecked onCheckedChange={(v) => toast.success(`Price drop alerts ${v ? "enabled" : "disabled"}`)} />
          </div>

          <div className="border-t border-border/60 pt-4 flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-foreground">AI Regret Warning Badges</Label>
              <p className="text-xs text-muted-foreground">Display AI risk warnings on high-return products.</p>
            </div>
            <Switch defaultChecked onCheckedChange={(v) => toast.success(`Regret badges ${v ? "enabled" : "disabled"}`)} />
          </div>

          <div className="border-t border-border/60 pt-4 flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-foreground">Email Deal Digests</Label>
              <p className="text-xs text-muted-foreground">Receive weekly side-by-side product deal summaries.</p>
            </div>
            <Switch defaultChecked onCheckedChange={(v) => toast.success(`Email digests ${v ? "enabled" : "disabled"}`)} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
