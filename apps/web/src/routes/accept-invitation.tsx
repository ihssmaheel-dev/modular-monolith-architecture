import { createFileRoute } from "@tanstack/react-router";
import { AcceptInvitationFlow } from "@/features/tenancy/components/accept-invitation-flow";

export const Route = createFileRoute("/accept-invitation")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { token } = Route.useSearch();
  return <AcceptInvitationFlow token={token} />;
}
