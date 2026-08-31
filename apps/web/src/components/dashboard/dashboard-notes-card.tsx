import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FileText, ArrowRight, Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import type { NoteResponse } from "@repo/contracts";

export function DashboardNotesCard({
  isLoading,
  isError,
  notes,
}: {
  isLoading: boolean;
  isError: boolean;
  notes?: NoteResponse[];
}) {
  const { t } = useTranslation();

  return (
    <Card className="border-muted/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-5 pb-3">
        <div>
          <CardTitle className="text-lg font-bold">{t("dashboard.recentNotes")}</CardTitle>
          <CardDescription className="text-xs">{t("notes.description")}</CardDescription>
        </div>
        <Button size="sm" variant="ghost" className="gap-1.5 text-xs" render={<Link to="/notes" />}>
          <span>View All Notes</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t("common.loading")}</p>
        ) : isError ? (
          <p className="text-sm text-destructive py-6 text-center">{t("errors.networkError")}</p>
        ) : notes && notes.length > 0 ? (
          <div className="divide-y rounded-lg border bg-background">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between gap-4 p-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">{note.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{note.content}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] font-mono">
                  ID: {note.id.slice(0, 8)}...
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center rounded-lg border border-dashed bg-muted/20 space-y-3">
            <FileText className="size-8 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{t("notes.noNotes")}</p>
              <p className="text-xs text-muted-foreground">
                Test the end-to-end CQRS vertical slice by creating your first note.
              </p>
            </div>
            <Button size="sm" render={<Link to="/notes/new" />} className="gap-1.5 text-xs">
              <Plus className="size-3.5" />
              <span>Create Sample Note</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
