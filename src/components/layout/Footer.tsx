import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Sparkles, Twitter, Youtube } from "lucide-react";

const groups = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/careers", label: "Careers" },
      { to: "/press", label: "Press" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/support", label: "Help center" },
      { to: "/contact", label: "Contact" },
      { to: "/orders", label: "Track order" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-brand)] text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-foreground">ZGenie</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Your intelligent shopping companion. Predict prices, avoid regret,
            and shop for the life you're actually living.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {[Twitter, Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                aria-label="social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-sm font-semibold text-foreground">{g.title}</p>
            <ul className="mt-4 space-y-3">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ZGenie. All rights reserved.</p>
          <p>Made with intelligence, curated with care.</p>
        </div>
      </div>
    </footer>
  );
}