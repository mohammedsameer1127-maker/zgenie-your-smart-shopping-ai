import { createFileRoute } from "@tanstack/react-router";
import { Route as OrdersRoute } from "./orders";

export const Route = createFileRoute("/shopping-history")({
  head: () => ({
    meta: [
      { title: "Shopping History & Orders — ZGenie" },
      {
        name: "description",
        content: "View and track your imported multi-store orders across Amazon, Flipkart, Meesho, Myntra, and more.",
      },
    ],
  }),
  component: OrdersRoute.options.component,
});
