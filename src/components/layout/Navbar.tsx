import { Link, useNavigate } from "@tanstack/react-router";
import logoUrl from "@/assets/zgenie-logo.png";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Heart,
  LogOut,
  Menu,
  Scale,
  User,
  X,
  ChevronDown,
  Bot,
  History,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import { useLikes } from "@/context/LikesContext";
import { DigitalTwinModal } from "@/components/twin/DigitalTwinModal";
import { ComparisonHistoryModal } from "@/components/compare/ComparisonHistoryModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const { openTwinModal } = useDigitalTwin();
  const { requireAuth, currentUser, logout } = useAuth();
  const { likesCount } = useLikes();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate({ to: "/" });
      toast.success("Successfully signed out.");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out.");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src={logoUrl}
            alt="ZGenie Logo"
            className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105 drop-shadow-xs"
          />
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-blue-600 font-semibold bg-blue-50/80" }}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Digital Twin Button */}
          <button
            onClick={() => requireAuth(() => openTwinModal(), "Sign in to access your AI Digital Twin.")}
            aria-label="AI Digital Twin"
            className="hidden sm:flex h-9 items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/10 shadow-xs"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Digital Twin</span>
          </button>

          {/* Comparison History Quick Button (Desktop) */}
          <button
            onClick={() => setHistoryModalOpen(true)}
            aria-label="Comparison History"
            title="View Comparison History"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground shadow-xs hover:border-emerald-300"
          >
            <History className="h-4 w-4 text-emerald-500" />
          </button>

          {/* Wishlist Button with Badge */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground shadow-xs hover:border-rose-300"
          >
            <Heart className={`h-4 w-4 ${likesCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
            {likesCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-75 duration-200">
                {likesCount}
              </span>
            )}
          </Link>

          {/* Conditional Auth Rendering */}
          {currentUser ? (
            <>
              {/* User Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 rounded-full px-2.5 hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs border-border/70 shadow-xs"
                  >
                    <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-brand text-white text-[11px] font-semibold">
                      {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-semibold hidden sm:inline text-foreground text-xs">Account</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-lg border-border">
                  <DropdownMenuLabel className="px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{currentUser.displayName || "User"}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2 text-xs font-medium">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/orders" className="flex items-center gap-2 text-xs font-medium">
                      <Package className="h-4 w-4 text-indigo-500" />
                      <span>Shopping History</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Comparison History Modal Trigger */}
                  <DropdownMenuItem 
                    onClick={() => setHistoryModalOpen(true)}
                    className="rounded-xl cursor-pointer flex items-center gap-2 text-xs font-medium"
                  >
                    <Scale className="h-4 w-4 text-emerald-500" />
                    <span>Comparison History</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/wishlist" className="flex items-center gap-2 text-xs font-medium">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="rounded-xl cursor-pointer text-brand font-semibold flex items-center gap-2 text-xs w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
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
                className="hidden sm:inline-flex rounded-full font-semibold text-xs h-9 px-3.5 text-foreground hover:bg-muted"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => requireAuth(() => {})}
                className="rounded-full font-semibold text-xs h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden border border-border/70 bg-card hover:bg-muted shadow-xs"
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
                  className="flex items-center gap-2 rounded-xl bg-card border border-border/60 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
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
                className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3.5 py-2.5 text-xs font-semibold text-blue-600"
              >
                <Bot className="h-4 w-4" /> Digital Twin
              </button>

              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2.5 text-xs font-semibold text-indigo-600"
              >
                <Package className="h-4 w-4" /> Orders
              </Link>

              <button 
                onClick={() => { 
                  setHistoryModalOpen(true); 
                  setMobileMenuOpen(false); 
                }} 
                className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs font-semibold text-emerald-600"
              >
                <Scale className="h-4 w-4" /> History
              </button>

              <button 
                onClick={() => { 
                  requireAuth(() => { navigate({ to: "/wishlist" }); setMobileMenuOpen(false); }, "Sign in to view your saved products.");
                }} 
                className="flex items-center gap-2 rounded-xl bg-card border border-border/60 px-3.5 py-2.5 text-xs font-medium text-left"
              >
                <Heart className="h-4 w-4 text-rose-500" /> Wishlist ({likesCount})
              </button>

              {currentUser && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-card border border-border/60 px-3.5 py-2.5 text-xs font-medium text-left"
                >
                  <User className="h-4 w-4 text-blue-500" /> Profile
                </Link>
              )}
            </div>
          </div>

          {!currentUser ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { requireAuth(() => {}); setMobileMenuOpen(false); }} 
                className="w-full rounded-full font-semibold text-xs h-10"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => { requireAuth(() => {}); setMobileMenuOpen(false); }} 
                className="w-full rounded-full font-semibold text-xs h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                Get Started
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={async () => { 
                await handleSignOut(); 
                setMobileMenuOpen(false); 
              }} 
              className="w-full rounded-full font-semibold text-xs h-10 text-brand border-brand/20"
            >
              Sign Out
            </Button>
          )}
        </div>
      )}
      
      <DigitalTwinModal />
      <ComparisonHistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} />
    </header>
  );
}
