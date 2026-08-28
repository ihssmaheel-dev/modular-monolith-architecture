import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateNoteSchema, type CreateNoteDto } from "@repo/contracts";
import { useCreateNote } from "@/hooks/use-notes";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Label } from "@repo/ui";
import { Sparkles, FileText } from "lucide-react";

export function CreateNoteForm({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateNote();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateNoteDto>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: { title: "", content: "" },
  });

  const onSubmit = async (data: CreateNoteDto) => {
    setError(null);
    try {
      await createMutation.mutateAsync(data);
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("api.note.createFailed");
      setError(msg);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-muted/20 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <CardTitle className="text-sm font-semibold">{t("notes.createNote")}</CardTitle>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            B12
          </span>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium">
              {t("notes.noteTitle")}
            </Label>
            <Input
              id="title"
              placeholder={t("notes.noteTitlePlaceholder")}
              className="h-9 bg-background border-input focus-visible:border-primary/30 focus-visible:ring-primary/20"
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-destructive font-medium">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-xs font-medium">
              {t("notes.content")}
            </Label>
            <textarea
              id="content"
              placeholder={t("notes.contentPlaceholder")}
              {...register("content")}
              className="flex min-h-[110px] w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30 disabled:opacity-50 resize-none shadow-sm"
            />
            {errors.content && <p className="text-xs text-destructive font-medium">{errors.content.message}</p>}
          </div>
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">{error}</div>}
        </CardContent>
        <CardFooter className="pt-4 bg-muted/20 border-t border-border/60 flex gap-2">
          <Button type="submit" disabled={createMutation.isPending} className="flex-1 h-9 font-medium shadow-sm">
            {createMutation.isPending ? t("notes.creating") : t("notes.createButton")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
