import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "User Profile — ZGenie" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile preferences saved successfully!");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
            <User className="mr-1.5 h-3.5 w-3.5" /> Account Details
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            User Profile Overview
          </h1>
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4 border-b border-border/60 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-black text-2xl shadow-md">
              U
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Active Member Account</h2>
              <p className="text-xs text-muted-foreground">Smart Shopping AI Enabled</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Full Name</Label>
              <Input defaultValue="Alex Morgan" className="h-10 rounded-xl text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Email Address</Label>
              <Input defaultValue="alex.morgan@example.com" className="h-10 rounded-xl text-xs" />
            </div>
          </div>

          <Button type="submit" className="rounded-xl font-bold text-xs h-10 gap-1.5 mt-4">
            <Save className="h-4 w-4" /> Save Profile Changes
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
