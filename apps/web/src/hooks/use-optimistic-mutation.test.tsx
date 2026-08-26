import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useOptimisticMutation } from "./use-optimistic-mutation";

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe("useOptimisticMutation", () => {
  it("optimistically updates cache and settles successfully", async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const queryKey = ["items"];
    queryClient.setQueryData(queryKey, ["Item 1"]);

    let resolveMutation!: (val: string) => void;
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveMutation = resolve;
        }),
    );

    const { result } = renderHook(
      () =>
        useOptimisticMutation<string, string, string[]>({
          queryKey,
          mutationFn,
          updater: (old, newItem) => [...(old ?? []), newItem],
        }),
      { wrapper },
    );

    result.current.mutate("Item 2");

    // Optimistically present in cache while in-flight
    await waitFor(() => {
      expect(queryClient.getQueryData(queryKey)).toEqual(["Item 1", "Item 2"]);
    });

    resolveMutation("Server Response");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledWith("Item 2", expect.anything());
  });

  it("rolls back cache to snapshot on mutation failure", async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const queryKey = ["items"];
    queryClient.setQueryData(queryKey, ["Initial Item"]);

    let rejectMutation!: (err: Error) => void;
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectMutation = reject;
        }),
    );

    const { result } = renderHook(
      () =>
        useOptimisticMutation<string, string, string[]>({
          queryKey,
          mutationFn,
          updater: (old, newItem) => [...(old ?? []), newItem],
        }),
      { wrapper },
    );

    result.current.mutate("Failed Item");

    // Optimistically updated while request is in-flight
    await waitFor(() => {
      expect(queryClient.getQueryData(queryKey)).toEqual(["Initial Item", "Failed Item"]);
    });

    // Reject the in-flight request
    rejectMutation(new Error("Network Failure"));

    // After failure, cache must be cleanly rolled back to previous snapshot
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(queryKey)).toEqual(["Initial Item"]);
  });
});
