import { QueryClient } from "@tanstack/react-query";

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const GC_TIME_MS = 10 * 60 * 1000; // 10 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
