import { createFileRoute } from "@tanstack/react-router";
import { OrdersView } from "@/components/orders/OrdersView";

export const Route = createFileRoute("/orders")({
  validateSearch: (search: Record<string, unknown>): { gmail_status?: string; error?: string } => {
    return {
      gmail_status: typeof search.gmail_status === "string" ? search.gmail_status : undefined,
      error: typeof search.error === "string" ? search.error : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shopping History & Orders — ZGenie" },
      {
        name: "description",
        content:
          "View and track your imported multi-store orders across Amazon, Flipkart, Meesho, Myntra, and more.",
      },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const search = Route.useSearch();
  return <OrdersView gmailStatusParam={search.gmail_status} errorParam={search.error} />;
}
