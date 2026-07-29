import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — ZGenie" },
      {
        name: "description",
        content:
          "Sign in to ZGenie to access your Shopping Twin, wishlists, and AI-powered recommendations.",
      },
      { property: "og:title", content: "Sign in — ZGenie" },
      {
        property: "og:description",
        content: "Access your AI-powered ZGenie shopping account.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue shopping smarter with ZGenie."
      footer={
        <>
          New to ZGenie?{" "}
          <Link to="/auth/sign-up" className="font-semibold text-brand hover:underline">
            Create an account
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/sign-in"
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11 rounded-xl px-9"
              required
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
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
            Remember me for 30 days
          </Label>
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold">
          Sign in
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              or continue with
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