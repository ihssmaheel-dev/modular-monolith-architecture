import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from "@repo/ui";
import { Layers, Clock, FileText, ArrowRight } from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function RecentNotesPanel({ items }: { items?: NoteItem[] }) {
  const { t } = useTranslation();
  const notes = items ?? [];
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Recent Notes
            </CardTitle>
            <CardDescription>Latest tenant-scoped content • {t("notes.description")}</CardDescription>
          </div>
          <Link to="/notes">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs text-muted-foreground">Create your first note to see it here.</p>
            </div>
            <Link to="/notes">
              <Button size="sm" className="mt-2 h-8">Create Note</Button>
            </Link>
          </div>
        ) : (
          notes.slice(0, 4).map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3.5 hover:bg-muted/40 transition-colors group">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-medium truncate group-hover:text-primary">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.content}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {new Date(n.createdAt).toLocaleDateString()} • {n.id.slice(0, 8)}
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[11px] font-mono">Note</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
