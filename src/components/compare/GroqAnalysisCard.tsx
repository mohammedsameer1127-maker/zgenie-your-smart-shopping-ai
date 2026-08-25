import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Bot,
  Zap,
  RefreshCw,
  Copy,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { fetchGroqProductAnalysis, CompareAnalysisPayload } from "@/lib/groq";
import { Link } from "@tanstack/react-router";
import { RichAiMessageRenderer } from "@/components/ai/RichAiMessageRenderer";

interface GroqAnalysisCardProps {
  products: CompareAnalysisPayload["products"];
  userQuery: string;
}

export function GroqAnalysisCard({ products, userQuery }: GroqAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (products.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchGroqProductAnalysis({
        products,
        userQuery,
      });

      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err: any) {
      console.error("ZGenie AI Analysis Error:", err);
      const msg = err.message || "Failed to analyze deals with ZGenie AI.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run analysis when product search query changes
  useEffect(() => {
    if (products.length > 0) {
      setAnalysis(null);
      runAnalysis();
    }
  }, [userQuery]);

  const copyAnalysis = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    toast.success("ZGenie AI analysis copied to clipboard!");
  };

  return (
    <Card className="rounded-3xl border-2 border-brand/30 bg-linear-to-br from-brand/5 via-card to-background p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-brand/15 text-brand border border-brand/30 text-[10px] font-bold">
                <Sparkles className="mr-1 h-3 w-3" /> ZGenie AI Intelligence
              </Badge>
              <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground">
                Live Market Analysis
              </Badge>
            </div>
            <h3 className="text-base font-black text-foreground mt-0.5">
              Live AI Product & Deal Analysis
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAnalysis()}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold gap-1.5 h-8 bg-card"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-Analyze</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3 py-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold text-brand animate-pulse">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>ZGenie AI is analyzing live store deals & buyer tradeoffs...</span>
          </div>
          <div className="max-w-md mx-auto space-y-2 pt-2">
            <div className="h-3 bg-muted/60 rounded-full animate-pulse w-full"></div>
            <div className="h-3 bg-muted/60 rounded-full animate-pulse w-4/5 mx-auto"></div>
            <div className="h-3 bg-muted/60 rounded-full animate-pulse w-3/5 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Error View */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-destructive font-bold">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>ZGenie AI Notice</span>
          </div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Output Content */}
      {!isLoading && analysis && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 text-foreground shadow-2xs">
            <RichAiMessageRenderer content={analysis} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAnalysis}
              className="rounded-xl text-xs font-semibold gap-1.5 h-8"
            >
              <Copy className="h-3 w-3" /> Copy AI Breakdown
            </Button>

            <Button
              asChild
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-8 bg-brand hover:bg-brand/90 text-white"
            >
              <Link to="/assistant">
                <Bot className="h-3.5 w-3.5" /> Ask ZGenie AI Follow-up <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
