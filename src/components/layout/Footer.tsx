import { Link } from "@tanstack/react-router";
import compareLogo from "@/assets/zgenie-logo.png";

const groups = [
  {
    title: "Company",
    links: [
      { to: "/", label: "About Us" },
      { to: "/", label: "Careers" },
      { to: "/", label: "Press & Media" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/assistant", label: "Help Center & AI" },
      { href: "https://mail.google.com/mail/?view=cm&fs=1&to=zgeniecompany@gmail.com", label: "Contact Us", isExternal: true },
      { to: "/orders", label: "Track Order" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/", label: "Privacy Policy" },
      { to: "/", label: "Terms of Service" },
      { to: "/", label: "Cookie Policy" },
    ],
  },
];

export function Footer() {
  const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=zgeniecompany@gmail.com";

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

          {/* Contact / Gmail Symbol */}
          <div className="mt-6 flex items-center gap-2">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background transition-all hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 hover:scale-105 shadow-2xs"
              aria-label="Contact ZGenie on Gmail"
              title="Contact us via Gmail"
            >
              <GmailIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">{g.title}</p>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l, idx) => (
                <li key={idx}>
                  {l.isExternal && l.href ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  ) : l.to ? (
                    <Link
                      to={l.to}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ) : null}
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

function GmailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M2 7.5V18a2 2 0 0 0 2 2h3V11.5L2 7.5z" />
      <path fill="#34A853" d="M17 20h3a2 2 0 0 0 2-2V7.5L17 11.5V20z" />
      <path fill="#EA4335" d="M17 4H7L12 8.5 17 4z" />
      <path fill="#FBBC05" d="M2 7.5L12 15l10-7.5V6a2 2 0 0 0-2-2h-3L12 8.5 7 4H4a2 2 0 0 0-2 2v1.5z" />
    </svg>
  );
}
