"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * QueryProvider — wraps the app with a TanStack QueryClientProvider.
 *
 * Must be a client component because it uses React state to create the
 * QueryClient. Place it high in the tree (inside ClerkProvider/ThemeProvider
 * but wrapping page content) so all client components can use useQuery hooks.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}