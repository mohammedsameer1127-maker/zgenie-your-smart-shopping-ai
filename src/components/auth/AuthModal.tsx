import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { handleProviderSignIn } from "@/lib/auth-helpers";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import compareLogo from "@/assets/zgenie-logo.png";

type AuthMode = "signIn" | "signUp" | "forgotPassword";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, onAuthSuccess, authModalMessage } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode("signIn");
      setPassword("");
    }
  }, [isAuthModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signIn") {
        if (!password) throw new Error("Password is required.");
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back to ZGenie!");
        onAuthSuccess();
      } else if (mode === "signUp") {
        if (!name || !password) throw new Error("Name and password are required.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }
        toast.success("Account created successfully!");
        onAuthSuccess();
      } else if (mode === "forgotPassword") {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent! Check your inbox.");
        setMode("signIn");
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password.");
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error("Email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProvider = async (provider: any) => {
    try {
      await handleProviderSignIn(provider);
      onAuthSuccess();
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[425px] border-border bg-background/90 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
        <div className="p-6 pt-8 text-center space-y-4">
          <img src={compareLogo} alt="ZGenie Logo" className="h-12 w-auto mx-auto mb-4 drop-shadow-md" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center text-foreground">
              {mode === "signIn" ? "Welcome Back" : mode === "signUp" ? "Create Account" : "Reset Password"}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground pt-2">
              {authModalMessage || "Sign in to unlock ZGenie's AI-powered features."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4 text-left mt-4" onSubmit={handleSubmit}>
            {mode === "signUp" && (
              <div className="space-y-2">
                <Label htmlFor="modal-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="modal-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="h-11 rounded-xl pl-10 bg-slate-50 border-slate-200" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="modal-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="modal-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="h-11 rounded-xl pl-10 bg-slate-50 border-slate-200" required />
              </div>
            </div>

            {mode !== "forgotPassword" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="modal-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                  {mode === "signIn" && (
                    <button type="button" onClick={() => setMode("forgotPassword")} className="text-xs font-semibold text-brand hover:underline">Forgot Password?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="modal-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="h-11 rounded-xl px-10 bg-slate-50 border-slate-200" required />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm font-bold shadow-md gap-2 mt-6">
              {loading ? "Please wait..." : mode === "signIn" ? "Sign In" : mode === "signUp" ? "Sign Up" : "Send Reset Link"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {mode !== "forgotPassword" && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/70" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-3 font-semibold uppercase tracking-wider text-muted-foreground">or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" onClick={() => handleProvider(googleProvider)} className="h-11 rounded-xl gap-2 font-semibold text-xs border-border bg-card">
                  <GoogleIcon /> Google
                </Button>
                <Button variant="outline" type="button" onClick={() => handleProvider(appleProvider)} className="h-11 rounded-xl gap-2 font-semibold text-xs border-border bg-card">
                  <AppleIcon /> Apple
                </Button>
              </div>
            </>
          )}

          <div className="pt-4 text-center text-xs text-muted-foreground">
            {mode === "signIn" ? (
              <>Don't have an account? <button type="button" onClick={() => setMode("signUp")} className="font-bold text-brand hover:underline">Create one</button></>
            ) : mode === "signUp" ? (
              <>Already have an account? <button type="button" onClick={() => setMode("signIn")} className="font-bold text-brand hover:underline">Sign in</button></>
            ) : (
              <button type="button" onClick={() => setMode("signIn")} className="font-bold text-brand hover:underline">← Back to Sign In</button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
