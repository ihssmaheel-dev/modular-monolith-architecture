import { mutationOptions } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import type { LoginInput, RegisterInput } from "@repo/contracts";

export function loginMutationOptions() {
  return mutationOptions({
    mutationKey: ["auth", "login"] as const,
    mutationFn: async (data: LoginInput) => {
      const client = getApiClient();
      const res = await client.auth.login({ body: data });
      if (res.status !== 200) throw new Error("api.auth.loginFailed");
      return res.body;
    },
  });
}

export function registerMutationOptions() {
  return mutationOptions({
    mutationKey: ["auth", "register"] as const,
    mutationFn: async (data: RegisterInput) => {
      const client = getApiClient();
      const res = await client.auth.register({ body: data });
      if (res.status !== 201 && res.status !== 200) throw new Error("api.auth.registrationFailed");
      return res.body;
    },
  });
}
