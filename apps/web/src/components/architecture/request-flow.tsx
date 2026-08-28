import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { ArrowRight } from "lucide-react";

const steps = [
  { actor: "React", action: "POST /notes", detail: "api.notes.createNote + Zod" },
  { actor: "Controller", action: "Validate", detail: "ZodValidationPipe" },
  { actor: "Command", action: "CreateNoteCommand", detail: "Result<T,E> • neverthrow" },
  { actor: "Entity", action: "Note.create()", detail: "Pure domain • no DB" },
  { actor: "Repository", action: "TenantScopedRepository", detail: "Drizzle • mapper" },
  { actor: "Postgres", action: "INSERT + RLS", detail: "tenant_id + soft-delete" },
];

export function RequestFlow() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Request Flow — POST /notes</CardTitle>
        <p className="text-xs text-muted-foreground">End-to-end from UI to Postgres via 4 layers.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {steps.map((s, i) => (
            <div key={s.actor} className="flex items-center gap-1.5">
              <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 flex items-center gap-1.5">
                <span className="font-semibold">{s.actor}</span>
                <span className="text-muted-foreground hidden sm:inline">• {s.action}</span>
              </div>
              {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-muted/30 border border-dashed p-3 font-mono text-[11px] leading-relaxed">
          User → <span className="text-primary font-semibold">Controller</span> → Command → Entity → Repository → DB → <span className="text-emerald-600 font-semibold">201 Created</span> + <span className="text-primary">Result.ok</span> → <span className="text-muted-foreground">I18nService</span>
        </div>
      </CardContent>
    </Card>
  );
}
