import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@repo/ui";
import { api } from "@/lib/api";
import { getResponseMessage } from "@/lib/api-response";
import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

function AcceptPage() {
  const { t } = useTranslation();
  const { token } = useSearch({ strict: false }) as { token?: string };
  const nav = useNavigate();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing token");
      const r = await api.tenancy.acceptInvitation({ body: { token } });
      if (r.status !== 200) throw new Error(getResponseMessage(r.body) ?? "Failed");
      return r.body;
    },
    onSuccess: () => {
      setMsg({ type: "ok", text: t("tenancy.invitationAccepted") });
      setTimeout(() => nav({ to: "/" }), 1200);
    },
    onError: (e: unknown) => setMsg({ type: "err", text: e instanceof Error ? e.message : t("tenancy.acceptFailed") }),
  });
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-border/60 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            {msg?.type === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-primary" />}
            {t("tenancy.acceptInvitation")}
          </CardTitle>
          <CardDescription className="text-xs">Token: <span className="font-mono text-foreground">{token?.slice(0, 12) ?? "—"}…</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {msg && <div className={`rounded-lg border p-3 text-xs font-medium ${msg.type === "ok" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>{msg.text}</div>}
          <Button onClick={() => m.mutate()} disabled={m.isPending || !token} className="w-full h-9 font-medium shadow-sm">{m.isPending ? t("common.loading") : t("tenancy.accept")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/accept-invitation")({ component: AcceptPage });
