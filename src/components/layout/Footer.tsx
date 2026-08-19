import { Link } from "@tanstack/react-router";
import compareLogo from "@/assets/zgenie-logo.png";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";

const groups = [
  {
    title: "Company",
    links: [
      { to: "/home", label: "About Us" },
      { to: "/home", label: "Careers" },
      { to: "/home", label: "Press & Media" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/assistant", label: "Help Center & AI" },
      { to: "/assistant", label: "Contact Us" },
      { to: "/orders", label: "Track Order" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/home", label: "Privacy Policy" },
      { to: "/home", label: "Terms of Service" },
      { to: "/home", label: "Cookie Policy" },
    ],
  },
];

const SOCIAL_LINKS = [
  { name: "Twitter", icon: Twitter },
  { name: "Instagram", icon: Instagram },
  { name: "Facebook", icon: Facebook },
  { name: "YouTube", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center">
            <img src={compareLogo} alt="ZGenie Logo" className="h-12 w-auto drop-shadow-sm" />
          </div>
          <p className="mt-4 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Your smart shopping AI assistant. Compare prices, analyze specs side-by-side across Amazon, Flipkart, Meesho, & more.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => toast.info(`Opening ZGenie on ${name}...`)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand hover:bg-muted"
                aria-label={name}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">{g.title}</p>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l, idx) => (
                <li key={idx}>
                  <Link
                    to={l.to}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ZGenie. All rights reserved.</p>
          <p>AI-Powered Side-by-Side Product Intelligence.</p>
        </div>
      </div>
    </footer>
  );
}