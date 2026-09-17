"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
/**
 * AuthGuard
 *
 * Wraps the dashboard layout. While session is loading, shows a spinner.
 * If user is not authenticated, redirects to /login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-medium tracking-wide">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Will be redirected — render nothing
    return null;
  }

  return <>{children}</>;
}
