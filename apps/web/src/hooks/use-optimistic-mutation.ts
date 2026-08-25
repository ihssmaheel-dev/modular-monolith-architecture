import {
  type MutationFunction,
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export interface OptimisticMutationOptions<TData, TVariables, TQueryData> {
  mutationFn: MutationFunction<TData, TVariables>;
  queryKey: QueryKey;
  updater: (oldData: TQueryData | undefined, variables: TVariables) => TQueryData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, context: { previousData: TQueryData | undefined } | undefined) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

export function useOptimisticMutation<TData, TVariables, TQueryData>({
  mutationFn,
  queryKey,
  updater,
  onSuccess,
  onError,
  onSettled,
}: OptimisticMutationOptions<TData, TVariables, TQueryData>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, { previousData: TQueryData | undefined }>({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TQueryData>(queryKey);

      queryClient.setQueryData<TQueryData>(queryKey, (old) => updater(old, variables));

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData<TQueryData>(queryKey, context.previousData);
      }
      onError?.(error, variables, context);
    },
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables);
    },
    onSettled: (data, error, variables) => {
      void queryClient.invalidateQueries({ queryKey });
      onSettled?.(data, error, variables);
    },
  });
}
