import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign In — ZGenie" },
      {
        name: "description",
        content:
          "Sign in to ZGenie to access your saved comparisons, price alerts, and AI insights.",
      },
      { property: "og:title", content: "Sign In — ZGenie" },
      {
        property: "og:description",
        content: "Access your AI-powered ZGenie account.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Welcome back to ZGenie! Logged in as ${email}`);
      navigate({ to: "/home" });
    }, 800);
  };

  return (
    <AuthLayout
      title="Welcome back to ZGenie"
      subtitle="Sign in to access your saved product comparisons and price alerts."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="font-bold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSignIn}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@company.com"
              className="h-11 rounded-xl pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Password reset link sent to your email!");
              }}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="h-11 rounded-xl px-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer">
            Remember me on this device
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl text-sm font-bold shadow-md gap-2"
        >
          {loading ? "Signing in..." : <>Sign In <ArrowRight className="h-4 w-4" /></>}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 font-semibold uppercase tracking-wider text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" onClick={() => toast.info("Google Sign-In ready!")} className="h-11 rounded-xl gap-2 font-semibold text-xs">
            <GoogleIcon /> Google
          </Button>
          <Button variant="outline" type="button" onClick={() => toast.info("Apple Sign-In ready!")} className="h-11 rounded-xl gap-2 font-semibold text-xs">
            <AppleIcon /> Apple
          </Button>
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Continue as Guest to Storefront →
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c6.9 0 9.2-4.9 9.2-7.4 0-.5-.1-.9-.1-1.4H12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M16.365 12.86c-.02-2.09 1.71-3.09 1.79-3.14-.98-1.43-2.5-1.63-3.04-1.65-1.29-.13-2.53.76-3.18.76-.67 0-1.68-.75-2.77-.73-1.42.02-2.74.83-3.47 2.1-1.48 2.56-.38 6.35 1.06 8.43.71 1.02 1.55 2.17 2.65 2.13 1.07-.04 1.47-.69 2.76-.69 1.28 0 1.64.69 2.77.67 1.14-.02 1.87-1.04 2.57-2.06.81-1.18 1.15-2.33 1.16-2.39-.03-.01-2.22-.85-2.24-3.37zM14.3 6.28c.58-.7.97-1.68.86-2.65-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.62-.88 2.57.93.07 1.88-.47 2.46-1.17z" />
    </svg>
  );
}