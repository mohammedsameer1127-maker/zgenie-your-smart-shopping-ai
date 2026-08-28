import { createFileRoute } from "@tanstack/react-router";
import { OrdersView } from "@/components/orders/OrdersView";

export const Route = createFileRoute("/shopping-history")({
  validateSearch: (search: Record<string, unknown>): { gmail_status?: string; error?: string } => {
    return {
      gmail_status: typeof search.gmail_status === "string" ? search.gmail_status : undefined,
      error: typeof search.error === "string" ? search.error : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shopping History & Multi-Store Orders — ZGenie" },
      {
        name: "description",
        content: "Track orders and purchase receipts across Amazon, Flipkart, Meesho, Myntra, and Croma.",
      },
    ],
  }),
  component: ShoppingHistoryPage,
});

function ShoppingHistoryPage() {
  const search = Route.useSearch();
  return <OrdersView gmailStatusParam={search.gmail_status} errorParam={search.error} />;
}
