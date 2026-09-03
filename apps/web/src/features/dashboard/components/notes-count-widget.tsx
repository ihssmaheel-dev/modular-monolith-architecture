import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { FRONTEND_ROUTES } from "@repo/contracts";
import { notesListQuery } from "@/features/notes/notes.queries";
import { useAuthStore } from "@/stores/auth.store";

export function NotesCountWidget() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const notesQuery = useQuery({ ...notesListQuery(1, 5), enabled: Boolean(user) });
  return (
    <Card className="border-muted/80 bg-background/60 shadow-xs hover:border-primary/40 transition-colors">
      <CardHeader className="p-5 pb-2 space-y-1">
        <CardDescription className="flex items-center justify-between text-xs font-medium">
          <span>{t("notes.title")}</span>
          <FileText className="size-4 text-primary" />
        </CardDescription>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          {notesQuery.data?.total ? String(notesQuery.data.total) : "0"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{t("common.items")}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 p-0"
          render={<Link to={FRONTEND_ROUTES.notes} />}
        >
          <span>{t("notes.title")}</span>
          <ArrowRight className="size-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
