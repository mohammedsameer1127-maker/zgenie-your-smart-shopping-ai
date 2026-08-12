import { Navigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth/sign-in" search={{ redirect: location.href }} />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
}
