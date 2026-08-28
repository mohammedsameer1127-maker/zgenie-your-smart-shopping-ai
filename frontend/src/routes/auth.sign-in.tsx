import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in")({
  component: () => <Navigate to="/" replace />,
});
