import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — ZGenie" },
      {
        name: "description",
        content:
          "Join ZGenie to unlock AI Regret Scores, price predictions, and your personal Shopping Twin.",
      },
      { property: "og:title", content: "Create your account — ZGenie" },
      {
        property: "og:description",
        content:
          "Sign up for ZGenie and start shopping smarter with AI-powered insights.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ZGenie and let AI guide every purchase."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              className="h-11 rounded-xl pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11 rounded-xl pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="h-11 rounded-xl px-9"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use 8+ characters with a mix of letters, numbers & symbols.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="terms" className="mt-0.5" required />
          <Label htmlFor="terms" className="text-sm font-normal leading-relaxed text-muted-foreground">
            I agree to the{" "}
            <a href="#" className="text-brand hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-brand hover:underline">Privacy Policy</a>.
          </Label>
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold">
          Create account
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              or sign up with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" className="h-11 rounded-xl">
            <GoogleIcon /> Google
          </Button>
          <Button variant="outline" type="button" className="h-11 rounded-xl">
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