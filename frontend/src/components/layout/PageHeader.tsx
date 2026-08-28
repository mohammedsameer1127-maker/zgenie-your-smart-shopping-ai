import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Fragment, type ReactNode } from "react";

type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  description,
  crumbs = [],
  actions,
}: {
  title?: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border/70 bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {crumbs.map((c, i) => (
              <Fragment key={i}>
                <ChevronRight className="h-3 w-3" />
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        </div>
        {(title || actions) && (
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
              )}
              {description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}