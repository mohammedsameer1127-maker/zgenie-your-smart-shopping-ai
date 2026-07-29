import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Heart,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/compare", label: "Compare" },
  { to: "/life-events", label: "Life Events" },
];

const iconLinks = [
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            ZGenie
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "text-brand" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, brands, ideas…"
            className="h-10 rounded-full border-border/70 bg-muted/60 pl-9 pr-4 text-sm focus-visible:bg-background"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {iconLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="relative hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
            >
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2 hidden rounded-full md:inline-flex">
            <Link to="/auth/sign-in">Sign in</Link>
          </Button>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-background lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ZGenie"
              className="h-11 rounded-full bg-muted/60 pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...primaryLinks, ...iconLinks].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button asChild className="mt-4 w-full rounded-full">
            <Link to="/auth/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}