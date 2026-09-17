"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider — wraps the app so all components can use TanStack Query hooks.
 * Created once per app mount.
 */
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,        // data is fresh for 30s
            retry: 1,                    // 1 retry on failure
            refetchOnWindowFocus: false, // no refetch on tab switch
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
