import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/compare-logo.svg";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { to: "/home", label: "Store", icon: LayoutGrid },
  { to: "/compare", label: "Compare", icon: Scale },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount] = useState(2);
  const [cartCount] = useState(3);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <Link to="/home" className="flex items-center gap-3 shrink-0 group">
          <img
            src={logoUrl}
            alt="Comparing Products"
            className="h-9 w-9 rounded-xl shadow-sm transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-foreground leading-none">
              Comparing <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Products</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hidden sm:block mt-0.5">
              Smart Shopping Engine
            </span>
          </div>
        </Link>

        {/* Primary Navigation - Categorized & Streamlined */}
        <nav className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "bg-muted text-brand font-semibold shadow-xs" }}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar - Center */}
        <div className="relative hidden max-w-xs flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products to compare..."
            className="h-9 rounded-full border-border/70 bg-muted/50 pl-9 pr-4 text-xs focus-visible:bg-background transition-all"
          />
        </div>

        {/* Categorized Actions & Account Dropdown */}
        <div className="flex items-center gap-2">
          {/* Wishlist Button with Badge */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button with Badge */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown Menu (Consolidates Profile, Orders, Notifications, Settings) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 rounded-full px-2.5 hover:bg-muted text-muted-foreground hover:text-foreground font-medium"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white text-xs font-bold">
                  U
                </div>
                <span className="text-xs font-semibold hidden sm:inline">Account</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg border-border">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link to="/profile" className="flex items-center gap-2 text-xs font-medium">
                  <User className="h-4 w-4 text-blue-500" />
                  <span>Profile Overview</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link to="/orders" className="flex items-center gap-2 text-xs font-medium">
                  <Package className="h-4 w-4 text-purple-500" />
                  <span>Orders & Purchases</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link to="/notifications" className="flex items-center gap-2 text-xs font-medium">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <span>Notifications & Alerts</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link to="/settings" className="flex items-center gap-2 text-xs font-medium">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-brand font-semibold">
                <Link to="/" className="flex items-center gap-2 text-xs">
                  <LogOut className="h-4 w-4" />
                  <span>Sign In / Switch Account</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Sign In Button */}
          <Button asChild size="sm" className="hidden rounded-full md:inline-flex font-bold shadow-xs text-xs px-4">
            <Link to="/">Sign In</Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground md:hidden hover:bg-muted"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products to compare..."
              className="h-10 rounded-full bg-muted/60 pl-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Main Menu</p>
            <div className="grid grid-cols-2 gap-1.5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <link.icon className="h-4 w-4 text-brand" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-border/60">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account & Tools</p>
            <div className="grid grid-cols-2 gap-1.5">
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs font-medium">
                <Heart className="h-4 w-4 text-rose-500" /> Wishlist ({wishlistCount})
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs font-medium">
                <ShoppingCart className="h-4 w-4 text-purple-500" /> Cart ({cartCount})
              </Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs font-medium">
                <Package className="h-4 w-4 text-blue-500" /> Orders
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs font-medium">
                <Settings className="h-4 w-4 text-slate-500" /> Settings
              </Link>
            </div>
          </div>

          <Button asChild className="w-full rounded-full font-bold text-xs h-10">
            <Link to="/">Sign In / Register</Link>
          </Button>
        </div>
      )}
    </header>
  );
}