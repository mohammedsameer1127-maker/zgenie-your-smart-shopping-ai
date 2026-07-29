import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Create Account — Comparing Products" },
      {
        name: "description",
        content:
          "Join Comparing Products to unlock AI Regret Scores, price predictions, and side-by-side product comparisons.",
      },
      { property: "og:title", content: "Create Account — Comparing Products" },
      {
        property: "og:description",
        content:
          "Sign up for Comparing Products and start shopping smarter with AI.",
      },
    ],
  }),
  component: SignUpPage,
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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Account created! Welcome to Comparing Products, ${name}!`);
      navigate({ to: "/home" });
    }, 800);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Comparing Products and let AI guide every purchase decision."
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
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Alex Morgan"
              className="h-11 rounded-xl pl-10"
              required
            />
          </div>
        </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="8+ characters"
                className="h-11 rounded-xl px-10"
                required
                minLength={8}
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

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat password"
                className="h-11 rounded-xl px-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-0.5"
            required
          />
          <Label htmlFor="terms" className="text-xs font-normal leading-relaxed text-muted-foreground cursor-pointer">
            I agree to the{" "}
            <a href="#" className="font-semibold text-brand hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="font-semibold text-brand hover:underline">Privacy Policy</a> of Comparing Products.
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl text-sm font-bold shadow-md gap-2"
        >
          {loading ? "Creating Account..." : <>Create Account <ArrowRight className="h-4 w-4" /></>}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 font-semibold uppercase tracking-wider text-muted-foreground">
              or sign up with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" onClick={() => toast.info("Google Sign-Up ready!")} className="h-11 rounded-xl gap-2 font-semibold text-xs">
            <GoogleIcon /> Google
          </Button>
          <Button variant="outline" type="button" onClick={() => toast.info("Apple Sign-Up ready!")} className="h-11 rounded-xl gap-2 font-semibold text-xs">
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