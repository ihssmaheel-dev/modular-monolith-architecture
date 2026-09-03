import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
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
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth.store";

export function RecentNotesWidget() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const notesQuery = useQuery({ ...notesListQuery(1, 5), enabled: Boolean(user) });
  return (
    <Card className="border-muted/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-5 pb-3">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold">
            {t("dashboard.recentNotes")}
          </CardTitle>
          <CardDescription className="text-xs">{t("notes.description")}</CardDescription>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          render={<Link to={FRONTEND_ROUTES.notes} />}
        >
          <span>{t("notes.title")}</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {notesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t("common.loading")}</p>
        ) : notesQuery.isError ? (
          <p className="text-sm text-destructive py-6 text-center">{t("errors.networkError")}</p>
        ) : notesQuery.data?.items && notesQuery.data.items.length > 0 ? (
          <div className="divide-y rounded-lg border bg-background">
            {notesQuery.data.items.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between gap-4 p-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">{note.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{note.content}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] font-mono">
                  {formatDate(note.createdAt)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center rounded-lg border border-dashed bg-muted/20 space-y-3">
            <FileText className="size-8 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{t("notes.noNotes")}</p>
            </div>
            <Button
              size="sm"
              render={<Link to={FRONTEND_ROUTES.newNote} />}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              <span>{t("notes.newNote")}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
