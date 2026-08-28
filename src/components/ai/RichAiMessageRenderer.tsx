import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Scale,
  Sparkles,
  ShieldCheck,
  Tag,
  Truck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface RichAiMessageRendererProps {
  content: string;
  isCompact?: boolean;
}

/**
 * Renders inline text with bold, italic, code, prices (₹xx,xxx), and store badges.
 */
export function renderInlineFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**...**), italic (*...*), and code (`...`)
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
      const boldText = token.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-foreground">
          {renderHighlightSubtokens(boldText)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
      const italicText = token.slice(1, -1);
      return (
        <em key={idx} className="italic text-foreground/90">
          {renderHighlightSubtokens(italicText)}
        </em>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
      return (
        <code
          key={idx}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-brand font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{renderHighlightSubtokens(token)}</React.Fragment>;
  });
}

/**
 * Highlights currency values (₹xx,xxx) and store names
 */
function renderHighlightSubtokens(str: string): React.ReactNode {
  // Regex to match prices like ₹21,499 or Rs. 21499
  const priceRegex = /(₹\s*[\d,]+(?:\.\d+)?|Rs\.?\s*[\d,]+(?:\.\d+)?)/g;
  const parts = str.split(priceRegex);

  return parts.map((part, i) => {
    if (priceRegex.test(part)) {
      return (
        <span
          key={i}
          className="inline-block font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md mx-0.5"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Checks if a block of lines is a Markdown table
 */
function parseMarkdownTable(lines: string[]): {
  headers: string[];
  rows: string[][];
} | null {
  if (lines.length < 2) return null;

  const isTableRow = (l: string) => l.trim().startsWith("|") && l.trim().endsWith("|");
  if (!lines.every(isTableRow)) return null;

  const parseCells = (l: string) =>
    l
      .trim()
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());

  const headers = parseCells(lines[0]);
  const separatorLine = lines[1];

  // Separator must contain dashes (e.g. |---|---|)
  if (!separatorLine.includes("-")) return null;

  const rows = lines.slice(2).map(parseCells);
  return { headers, rows };
}

/**
 * Rich AI Message Renderer
 * Formats raw AI outputs (Markdown tables, bullet lists, sections, prices) into modern, arranged UI cards.
 */
export function RichAiMessageRenderer({
  content,
  isCompact = false,
}: RichAiMessageRendererProps) {
  if (!content) return null;

  // Split content into paragraphs/blocks
  const rawLines = content.split("\n");
  const blocks: { type: "table" | "header" | "bullet" | "numbered" | "text" | "section-card"; lines: string[] }[] = [];

  let currentBlockType: "table" | "text" | null = null;
  let currentLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentLines.length > 0) {
        if (currentBlockType === "table" && parseMarkdownTable(currentLines)) {
          blocks.push({ type: "table", lines: [...currentLines] });
        } else {
          blocks.push({ type: "text", lines: [...currentLines] });
        }
        currentLines = [];
        currentBlockType = null;
      }
      continue;
    }

    const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|");
    if (isTableRow) {
      if (currentBlockType !== "table" && currentLines.length > 0) {
        blocks.push({ type: "text", lines: [...currentLines] });
        currentLines = [];
      }
      currentBlockType = "table";
      currentLines.push(trimmed);
    } else {
      if (currentBlockType === "table") {
        if (parseMarkdownTable(currentLines)) {
          blocks.push({ type: "table", lines: [...currentLines] });
        } else {
          blocks.push({ type: "text", lines: [...currentLines] });
        }
        currentLines = [];
        currentBlockType = null;
      }
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    if (currentBlockType === "table" && parseMarkdownTable(currentLines)) {
      blocks.push({ type: "table", lines: [...currentLines] });
    } else {
      blocks.push({ type: "text", lines: [...currentLines] });
    }
  }

  const getHeaderIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("recommend") || lower.includes("top") || lower.includes("pick") || lower.includes("winner"))
      return <Trophy className="h-4 w-4 text-emerald-600" />;
    if (lower.includes("trade") || lower.includes("compare") || lower.includes("vs"))
      return <Scale className="h-4 w-4 text-brand" />;
    if (lower.includes("saving") || lower.includes("discount") || lower.includes("offer") || lower.includes("deal"))
      return <Tag className="h-4 w-4 text-purple-600" />;
    if (lower.includes("protect") || lower.includes("warranty") || lower.includes("regret") || lower.includes("risk"))
      return <ShieldCheck className="h-4 w-4 text-blue-600" />;
    if (lower.includes("delivery") || lower.includes("speed") || lower.includes("shipping"))
      return <Truck className="h-4 w-4 text-amber-600" />;
    return <Sparkles className="h-4 w-4 text-brand" />;
  };

  return (
    <div className="space-y-3.5 text-xs leading-relaxed">
      {blocks.map((block, bIdx) => {
        if (block.type === "table") {
          const tableData = parseMarkdownTable(block.lines);
          if (!tableData) {
            return (
              <div key={bIdx} className="space-y-1">
                {block.lines.map((l, li) => (
                  <p key={li}>{renderInlineFormattedText(l)}</p>
                ))}
              </div>
            );
          }

          return (
            <div
              key={bIdx}
              className="my-3 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-bold">
                      {tableData.headers.map((h, hi) => (
                        <th key={hi} className="py-2.5 px-3.5 whitespace-nowrap text-[11px] font-bold text-foreground">
                          {renderInlineFormattedText(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {tableData.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2.5 px-3.5 text-foreground/90 font-medium">
                            {renderInlineFormattedText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // Process regular lines inside block
        return (
          <div key={bIdx} className="space-y-2">
            {block.lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Section Header (#, ##, ###, ####)
              if (trimmed.startsWith("#")) {
                const cleanHeader = trimmed.replace(/^#+\s*/, "");
                return (
                  <div
                    key={lIdx}
                    className="flex items-center gap-2 pt-2.5 pb-1 border-b border-border/40"
                  >
                    <div className="p-1 rounded-lg bg-muted/70 shrink-0">
                      {getHeaderIcon(cleanHeader)}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground tracking-tight">
                      {renderInlineFormattedText(cleanHeader)}
                    </h4>
                  </div>
                );
              }

              // Bullet List Item (- , * , • )
              const isBullet = /^[*\-•]\s+/.test(trimmed);
              if (isBullet) {
                const cleanBullet = trimmed.replace(/^[*\-•]\s+/, "");
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 pl-1 py-0.5 text-foreground/90"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                    <div className="flex-1 text-xs leading-relaxed">
                      {renderInlineFormattedText(cleanBullet)}
                    </div>
                  </div>
                );
              }

              // Numbered List Item (1. , 2. )
              const isNumbered = /^\d+[.)]\s+/.test(trimmed);
              if (isNumbered) {
                const match = trimmed.match(/^(\d+)[.)]\s+(.*)/);
                const num = match ? match[1] : "•";
                const cleanText = match ? match[2] : trimmed;

                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 pl-1 py-0.5 text-foreground/90"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-[10px] font-bold mt-0.5">
                      {num}
                    </span>
                    <div className="flex-1 text-xs leading-relaxed">
                      {renderInlineFormattedText(cleanText)}
                    </div>
                  </div>
                );
              }

              // Key-Value Deal Line (e.g. Store: Flipkart | Price: ₹21,499 | Regret Risk: Low)
              if (trimmed.includes(" | ") && (trimmed.toLowerCase().includes("store:") || trimmed.toLowerCase().includes("price:"))) {
                const segments = trimmed.split(" | ");
                return (
                  <div
                    key={lIdx}
                    className="flex items-center gap-2 flex-wrap p-2 rounded-xl bg-muted/40 border border-border/50 my-1"
                  >
                    {segments.map((seg, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground bg-card px-2 py-1 rounded-lg border border-border/40 shadow-2xs"
                      >
                        {renderInlineFormattedText(seg)}
                      </span>
                    ))}
                  </div>
                );
              }

              // Standard Paragraph
              return (
                <p key={lIdx} className="text-xs text-foreground/90 leading-relaxed">
                  {renderInlineFormattedText(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
