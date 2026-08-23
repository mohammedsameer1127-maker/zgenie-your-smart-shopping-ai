import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { handleProviderSignIn } from "@/lib/auth-helpers";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { PublicOnlyRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Sign Up — ZGenie" },
      {
        name: "description",
        content:
          "Create your ZGenie account to start comparing products, tracking price drops, and shopping smarter with AI.",
      },
      { property: "og:title", content: "Sign Up — ZGenie" },
      {
        property: "og:description",
        content: "Join ZGenie today for intelligent side-by-side product analysis.",
      },
    ],
  }),
  component: () => <PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>,
});

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for errors from a previous redirect login
    getRedirectResult(auth).catch((error: any) => {
      if (error.code !== 'auth/invalid-api-key') {
        console.error("Redirect login error:", error);
        toast.error(`Sign up failed: ${error.message}`);
      }
    });
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    if (!agreed) {
      toast.error("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      toast.success("Account created successfully! Welcome to ZGenie.");
      navigate({ to: "/" });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email is already registered. Please sign in instead.");
      } else {
        toast.error(`Sign up failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ZGenie and let AI guide every purchase decision."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="font-bold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSignUp}>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Alex Morgan"
              className="h-9.5 rounded-lg pl-9 text-xs border-border/80 bg-background"
              required
            />
          </div>
        </div>

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
              className="h-9.5 rounded-lg pl-9 text-xs border-border/80 bg-background"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="8+ characters"
                className="h-9.5 rounded-lg pl-9 pr-9 text-xs border-border/80 bg-background"
                required
                minLength={8}
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

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat password"
                className="h-9.5 rounded-lg pl-9 pr-9 text-xs border-border/80 bg-background"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-0.5">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-0.5"
            required
          />
          <Label htmlFor="terms" className="text-xs font-normal leading-relaxed text-muted-foreground cursor-pointer">
            I agree to the{" "}
            <a href="#" className="font-medium text-brand hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="font-medium text-brand hover:underline">Privacy Policy</a>.
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-9.5 w-full rounded-lg text-xs font-semibold shadow-xs gap-2"
        >
          {loading ? "Creating Account..." : <>Create Account <ArrowRight className="h-3.5 w-3.5" /></>}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              or sign up with
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
                toast.error(`Sign up failed: ${error.message}`);
              }
            }} 
            className="h-9 rounded-lg gap-2 font-medium text-xs border-border bg-card hover:bg-muted"
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
                toast.error(`Sign up failed: ${error.message}`);
              }
            }} 
            className="h-9 rounded-lg gap-2 font-medium text-xs border-border bg-card hover:bg-muted"
          >
            <AppleIcon /> Apple
          </Button>
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
