import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { handleProviderSignIn } from "@/lib/auth-helpers";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { PublicOnlyRoute } from "@/components/auth/ProtectedRoute";

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
  component: () => <PublicOnlyRoute><SignInPage /></PublicOnlyRoute>,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for errors from a previous redirect login
    getRedirectResult(auth).catch((error: any) => {
      if (error.code !== 'auth/invalid-api-key') {
        console.error("Redirect login error:", error);
        toast.error(`Login failed: ${error.message}`);
      }
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back to ZGenie! Logged in as ${userCredential.user.email}`);
      navigate({ to: "/" });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password.");
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
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
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@company.com"
              className="h-10 rounded-xl pl-9 text-xs border-border/80 bg-background"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <Link
              to="/auth/forgot-password"
              className="text-[11px] font-semibold text-brand hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="h-10 rounded-xl pl-9 pr-9 text-xs border-border/80 bg-background"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground cursor-pointer">
            Remember me on this device
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-full text-xs font-semibold shadow-xs gap-2"
        >
          {loading ? "Signing in..." : <>Sign In <ArrowRight className="h-3.5 w-3.5" /></>}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button 
            variant="outline" 
            type="button" 
            onClick={async () => {
              try {
                await handleProviderSignIn(googleProvider);
              } catch (error: any) {
                toast.error(`Login failed: ${error.message}`);
              }
            }} 
            className="h-9.5 rounded-full gap-2 font-medium text-xs border-border bg-card hover:bg-muted"
          >
            <GoogleIcon /> Google
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            onClick={async () => {
              try {
                await handleProviderSignIn(appleProvider);
              } catch (error: any) {
                toast.error(`Login failed: ${error.message}`);
              }
            }} 
            className="h-9.5 rounded-full gap-2 font-medium text-xs border-border bg-card hover:bg-muted"
          >
            <AppleIcon /> Apple
          </Button>
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand transition-colors"
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
