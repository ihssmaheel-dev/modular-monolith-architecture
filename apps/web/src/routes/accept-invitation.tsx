import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, MailWarning } from "lucide-react";
import { AcceptInvitationSchema, FRONTEND_ROUTES } from "@repo/contracts";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { getApiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export const Route = createFileRoute("/accept-invitation")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: AcceptInvitationPage,
});

function InvitationCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">{children}</Card>
    </div>
  );
}

function AcceptInvitationPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { token } = Route.useSearch();
  const isValidToken = AcceptInvitationSchema.safeParse({ token }).success;
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await getApiClient().tenancy.acceptInvitation({ body: { token } });
      if (response.status !== 200) throw new Error("tenancy.acceptFailed");
    },
  });

  if (!isValidToken) {
    return (
      <InvitationCard>
        <CardHeader>
          <MailWarning className="size-8 text-destructive" />
          <CardTitle>{t("tenancy.invalidInvitationLink")}</CardTitle>
          <CardDescription>{t("tenancy.invalidInvitationDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link to={FRONTEND_ROUTES.auth} />}>
            {t("auth.backToLogin")}
          </Button>
        </CardContent>
      </InvitationCard>
    );
  }

  if (!user) {
    return (
      <InvitationCard>
        <CardHeader>
          <CardTitle>{t("tenancy.acceptInvitation")}</CardTitle>
          <CardDescription>{t("tenancy.signInToAccept")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            render={<Link to={FRONTEND_ROUTES.auth} search={{ inviteToken: token }} />}
          >
            {t("auth.signIn")}
          </Button>
        </CardContent>
      </InvitationCard>
    );
  }

  if (mutation.isSuccess) {
    return (
      <InvitationCard>
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto size-10 text-primary" />
          <CardTitle>{t("tenancy.invitationAccepted")}</CardTitle>
          <CardDescription>{t("tenancy.invitationAcceptedDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link to={FRONTEND_ROUTES.dashboard} />}>
            {t("tenancy.goToWorkspace")}
          </Button>
        </CardContent>
      </InvitationCard>
    );
  }

  return (
    <InvitationCard>
      <CardHeader>
        <CardTitle>{t("tenancy.acceptInvitation")}</CardTitle>
        <CardDescription>{t("tenancy.acceptInvitationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mutation.isError && (
          <p className="text-sm text-destructive">{t("tenancy.acceptFailed")}</p>
        )}
        <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? t("tenancy.accepting") : t("tenancy.accept")}
        </Button>
      </CardContent>
    </InvitationCard>
  );
}
