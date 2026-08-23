import { Link, useNavigate } from "@tanstack/react-router";
import logoUrl from "@/assets/zgenie-logo.png";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  X,
  ChevronDown,
  Scale,
  LayoutGrid,
  Bot,
  Sun,
  Moon,
  TrendingDown,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import { DigitalTwinModal } from "@/components/twin/DigitalTwinModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/compare", label: "Compare" },
  { to: "/shop", label: "Price Tracker" },
  { to: "/categories", label: "Categories" },
  { to: "/deals", label: "Deals" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { openTwinModal } = useDigitalTwin();
  const { requireAuth, currentUser, logout } = useAuth();
  const [wishlistCount] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    // Sync theme state on load
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - EXACT ORIGINAL UNCHANGED */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src={logoUrl}
            alt="ZGenie Logo"
            className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105 drop-shadow-sm"
          />
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40" }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border/70 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-xs"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Digital Twin Button (Accessible anytime) */}
          <button
            onClick={() => requireAuth(() => openTwinModal(), "Sign in to access your AI Digital Twin.")}
            aria-label="AI Digital Twin"
            className="hidden sm:flex h-8.5 items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/10 dark:bg-blue-950/30 dark:text-blue-400"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Digital Twin</span>
          </button>

          {/* Conditional Auth Rendering */}
          {currentUser ? (
            <>
              {/* Wishlist Button with Badge */}
              <button
                onClick={() => requireAuth(() => navigate({ to: "/wishlist" }), "Sign in to view your saved products.")}
                aria-label="Wishlist"
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border/70 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-xs"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* User Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8.5 gap-1.5 rounded-lg px-2 hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs border-border/70 shadow-xs"
                  >
                    <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-brand text-white text-[11px] font-semibold">
                      {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-semibold hidden sm:inline text-foreground text-xs">Account</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg border-border">
                  <DropdownMenuLabel className="px-2 py-1.5 flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{currentUser.displayName || "User"}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2 text-xs font-medium">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/compare" search={{ q: "" }} className="flex items-center gap-2 text-xs font-medium">
                      <Scale className="h-4 w-4 text-emerald-500" />
                      <span>Comparison History</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/wishlist" className="flex items-center gap-2 text-xs font-medium">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-brand font-semibold">
                    <button 
                      onClick={async () => {
                        try {
                          await logout();
                          toast.success("Successfully signed out.");
                        } catch (error) {
                          toast.error("Failed to sign out.");
                        }
                      }} 
                      className="flex items-center gap-2 text-xs w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => requireAuth(() => {})}
                className="hidden sm:inline-flex rounded-lg font-semibold text-xs h-8.5 px-3 text-foreground hover:bg-muted"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => requireAuth(() => {})}
                className="rounded-lg font-semibold text-xs h-8.5 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg text-foreground lg:hidden border border-border/70 bg-card hover:bg-muted shadow-xs"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md px-4 py-4 lg:hidden space-y-4">
          <div className="space-y-1">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Navigation</p>
            <div className="grid grid-cols-2 gap-1.5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-card border border-border/60 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-border/60">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Features & Account</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => { 
                  requireAuth(() => { openTwinModal(); setMobileMenuOpen(false); }, "Sign in to access your AI Digital Twin.");
                }} 
                className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3.5 py-2.5 text-xs font-semibold text-blue-600"
              >
                <Bot className="h-4 w-4" /> Digital Twin
              </button>
              <button 
                onClick={() => { 
                  requireAuth(() => { navigate({ to: "/wishlist" }); setMobileMenuOpen(false); }, "Sign in to view your saved products.");
                }} 
                className="flex items-center gap-2 rounded-lg bg-card border border-border/60 px-3.5 py-2.5 text-xs font-medium text-left"
              >
                <Heart className="h-4 w-4 text-rose-500" /> Wishlist ({wishlistCount})
              </button>
            </div>
          </div>

          {!currentUser ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { requireAuth(() => {}); setMobileMenuOpen(false); }} 
                className="w-full rounded-lg font-semibold text-xs h-9.5"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => { requireAuth(() => {}); setMobileMenuOpen(false); }} 
                className="w-full rounded-lg font-semibold text-xs h-9.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                Get Started
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={async () => { 
                await logout(); 
                setMobileMenuOpen(false); 
              }} 
              className="w-full rounded-lg font-semibold text-xs h-9.5"
            >
              Sign Out
            </Button>
          )}
        </div>
      )}
      <DigitalTwinModal />
    </header>
  );
}
