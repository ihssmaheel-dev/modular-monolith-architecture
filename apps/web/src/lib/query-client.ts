import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const GC_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours for offline persistence

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

if (typeof window !== "undefined" && window.localStorage) {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "REACT_QUERY_OFFLINE_CACHE",
    throttleTime: 1000,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: GC_TIME_MS,
  });
}

export function clearQueryCache(): void {
  queryClient.clear();
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
  }
}

