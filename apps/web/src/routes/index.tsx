import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const destination = useAuthStore.getState().user ? "/dashboard" : "/auth";
    throw redirect({ to: destination });
  },
});
