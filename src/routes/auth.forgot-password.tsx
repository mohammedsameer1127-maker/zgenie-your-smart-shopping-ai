import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { PublicOnlyRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — ZGenie" },
      { name: "description", content: "Reset your ZGenie password." },
    ],
  }),
  component: () => <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to send reset email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={sent ? "Check your email for the reset link." : "Enter your email address and we'll send you a link to reset your password."}
      footer={
        <p>
          Remember your password?{" "}
          <Link to="/auth/sign-in" className="font-bold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {!sent ? (
        <form className="space-y-4" onSubmit={handleReset}>
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

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl text-sm font-bold shadow-md gap-2 mt-4"
          >
            {loading ? "Sending..." : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
          </Button>
          
          <div className="mt-4 text-center">
            <Link to="/auth/sign-in" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-6 py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <br/>
              <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setSent(false)}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            Try another email address
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
