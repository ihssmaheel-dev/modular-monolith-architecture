import { mutationOptions } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";

export function acceptInvitationMutationOptions() {
  return mutationOptions({
    mutationKey: ["tenancy", "accept-invitation"] as const,
    mutationFn: async (token: string) => {
      const client = getApiClient();
      const res = await client.tenancy.acceptInvitation({ body: { token } });
      if (res.status !== 200) throw new Error("tenancy.acceptFailed");
    },
  });
}
