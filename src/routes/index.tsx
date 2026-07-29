import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Camera,
  Flame,
  Gift,
  Heart,
  Laptop,
  LineChart,
  Mic,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Star,
  TrendingUp,
  Watch,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImg from "@/assets/hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZGenie — Shop smarter with AI" },
      {
        name: "description",
        content:
          "Discover, compare, and buy with confidence. ZGenie's AI predicts prices, scores regret risk, and builds shopping lists for every life moment.",
      },
      { property: "og:title", content: "ZGenie — Shop smarter with AI" },
      {
        property: "og:description",
        content:
          "AI-powered discovery, regret scores, price predictions, and life-event shopping.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppLayout>
      <Hero />
      <FeaturedCategories />
      <TrendingProducts />
      <AiFeatures />
      <FlashDeals />
      <Testimonials />
      <CtaBanner />
    </AppLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--brand-soft),transparent_70%)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
        <div>
          <Badge className="rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-brand hover:bg-brand-soft">
            <Sparkles className="mr-1 h-3 w-3" /> Powered by ZGenie AI
          </Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your intelligent
            <br />
            shopping{" "}
            <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              companion
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Predict prices before they drop. Avoid regret before you buy.
            Discover products that fit the life you're actually living.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="What are you looking for today?"
                className="h-12 w-full rounded-xl bg-transparent pl-11 pr-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Voice search">
                <Mic className="h-4 w-4" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Image search">
                <Camera className="h-4 w-4" />
              </button>
              <Button className="h-10 rounded-xl px-5">Search</Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Try:</span>
            {[
              "Gaming laptop under $900",
              "Gift for my mom",
              "Eco-friendly essentials",
              "iPhone vs Pixel",
            ].map((s) => (
              <Link
                key={s}
                to="/assistant"
                className="rounded-full border border-border bg-background px-3 py-1 transition-colors hover:border-brand hover:text-brand"
              >
                {s}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-brand" />
              Regret score on every product
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <LineChart className="h-4 w-4 text-teal" />
              AI price prediction
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[image:var(--gradient-brand)] opacity-10 blur-3xl" />
          <img
            src={heroImg}
            alt="AI shopping illustration"
            width={1400}
            height={1200}
            className="w-full rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-elevated)]"
          />
          <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-soft text-teal">
                <Brain className="h-3.5 w-3.5" />
              </span>
              ZGenie insight
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              Wait 6 days — this drops ~12% before the weekend sale.
            </p>
          </div>
          <div className="absolute -right-2 top-6 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:block">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Regret score</span>
              <span className="rounded-full bg-teal-soft px-2 py-0.5 font-medium text-teal">Low</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div className="h-2 w-[18%] rounded-full bg-teal" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Based on 12,480 reviews & return signals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const CATEGORIES = [
  { name: "Electronics", icon: Laptop, tint: "bg-brand-soft text-brand" },
  { name: "Fashion", icon: Shirt, tint: "bg-teal-soft text-teal" },
  { name: "Home", icon: Sofa, tint: "bg-brand-soft text-brand" },
  { name: "Beauty", icon: Heart, tint: "bg-teal-soft text-teal" },
  { name: "Wearables", icon: Watch, tint: "bg-brand-soft text-brand" },
  { name: "Gifts", icon: Gift, tint: "bg-teal-soft text-teal" },
];

function FeaturedCategories() {
  return (
    <Section eyebrow="Featured" title="Shop by category" description="Curated collections tuned by your Shopping Twin.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ name, icon: Icon, tint }) => (
          <Link
            key={name}
            to="/categories"
            className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand/40"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-foreground">{name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Trending picks</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}

const PRODUCTS = [
  { name: "Aether Pro 14 Laptop", price: 1299, was: 1499, rating: 4.8, regret: "Low", tag: "Best value" },
  { name: "Nimbus Wireless Headphones", price: 249, was: 299, rating: 4.7, regret: "Low", tag: "Editor's pick" },
  { name: "Halo Smart Watch Series 6", price: 379, was: 429, rating: 4.6, regret: "Medium", tag: "Trending" },
  { name: "Lumen Desk Lamp", price: 89, was: 109, rating: 4.9, regret: "Low", tag: "Eco-friendly" },
];

function TrendingProducts() {
  return (
    <Section
      eyebrow="Trending now"
      title="What everyone's buying"
      description="Real-time picks from the ZGenie community."
      action={
        <Button asChild variant="ghost" className="rounded-full text-brand hover:text-brand">
          <Link to="/shop">See all <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <Card key={p.name} className="group overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
            <div className="relative aspect-square overflow-hidden bg-[image:var(--gradient-soft)]">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                <ShoppingBag className="h-16 w-16" />
              </div>
              <Badge className="absolute left-3 top-3 rounded-full bg-background text-foreground shadow-sm">{p.tag}</Badge>
              <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-brand" aria-label="Add to wishlist">
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{p.rating}</span>
                <span>·</span>
                <span>Regret <span className={p.regret === "Low" ? "font-medium text-teal" : "font-medium text-amber-600"}>{p.regret}</span></span>
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-foreground">{p.name}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">${p.price}</span>
                <span className="text-xs text-muted-foreground line-through">${p.was}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const FEATURES = [
  { icon: Brain, title: "AI Shopping Twin", body: "A living profile that learns your taste, budget, and lifestyle." },
  { icon: ShieldCheck, title: "AI Regret Score", body: "Return risk, fake reviews, and complaints — scored in one number." },
  { icon: LineChart, title: "Price Prediction", body: "See where a price is headed and the best day to buy." },
  { icon: Gift, title: "Life-Event Shopping", body: "Auto-generated lists for new jobs, homes, babies, and beyond." },
];

function AiFeatures() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="rounded-full border border-teal/20 bg-teal-soft px-3 py-1 text-teal hover:bg-teal-soft">Intelligence, built-in</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">An AI that actually shops with you</h2>
          <p className="mt-3 text-muted-foreground">Four models working quietly in the background so every decision feels obvious.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlashDeals() {
  return (
    <Section
      eyebrow="Flash deals"
      title="Ending in the next few hours"
      description="Prices our AI expects to bounce back tomorrow."
      action={
        <Badge className="rounded-full bg-brand-soft text-brand hover:bg-brand-soft">
          <Flame className="mr-1 h-3 w-3" /> 24 live deals
        </Badge>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Everyday Essentials Bundle", off: "-32%", price: 48 },
          { name: "Home Office Starter Pack", off: "-24%", price: 129 },
          { name: "Fitness Comeback Kit", off: "-40%", price: 79 },
        ].map((d) => (
          <div key={d.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand)] text-white">
              <TrendingUp className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">From ${d.price} · Predicted to rise +9% tomorrow</p>
            </div>
            <span className="rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal">{d.off}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials() {
  const quotes = [
    { name: "Ava R.", role: "Product designer", text: "ZGenie warned me the laptop I was eyeing had a spike in returns. Saved me a real headache." },
    { name: "Marcus L.", role: "New dad", text: "The New Baby list was uncanny. It knew what I needed before I did." },
    { name: "Priya S.", role: "Grad student", text: "Price prediction told me to wait 4 days. Saved $120 on my headphones." },
  ];
  return (
    <Section eyebrow="Loved by shoppers" title="Built with the good decisions in mind">
      <div className="grid gap-5 md:grid-cols-3">
        {quotes.map((q) => (
          <div key={q.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">"{q.text}"</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">{q.name[0]}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CtaBanner() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[image:var(--gradient-brand)] p-10 text-white shadow-[var(--shadow-elevated)] sm:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet the smartest shopping profile you'll ever build.</h2>
            <p className="mt-3 max-w-xl text-white/85">Create your Shopping Twin in 60 seconds. Every recommendation, price alert, and life-event list gets sharper from day one.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Button asChild size="lg" className="rounded-full bg-white text-brand hover:bg-white/90">
              <Link to="/auth/sign-up">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/assistant">Try the AI assistant</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({ eyebrow, title, description, action, children }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>}
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
