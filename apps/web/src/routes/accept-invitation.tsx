import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { MemberResponseSchema, MessageResponseSchema } from "@repo/shared";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";

function AcceptInvitationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectTenant = useTenantStore((state) => state.selectTenant);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    if (!token) return;
    setIsAccepting(true);
    setError(null);
    const response = await api.tenancy.acceptInvitation({ body: { token } });
    if (response.status === 200) {
      const membership = MemberResponseSchema.parse(response.body);
      selectTenant(membership.tenantId);
      queryClient.removeQueries({ queryKey: ["organizations"] });
      await navigate({ to: "/" });
      return;
    }
    const failure = MessageResponseSchema.safeParse(response.body);
    setError(failure.success ? failure.data.message : t("common.error"));
    setIsAccepting(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("tenancy.acceptInvitation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && <p>{t("tenancy.invalidInvitationLink")}</p>}
          {token && !isAuthenticated && (
            <Link to="/login" search={{ invitationToken: token }} className="block">
              <Button className="w-full">{t("tenancy.signInToAccept")}</Button>
            </Link>
          )}
          {token && isAuthenticated && (
            <Button className="w-full" disabled={isAccepting} onClick={accept}>
              {isAccepting ? t("tenancy.accepting") : t("tenancy.acceptInvitation")}
            </Button>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}

export const Route = createFileRoute("/accept-invitation")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: AcceptInvitationPage,
});
