import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateNoteSchema, type CreateNoteDto } from "@repo/contracts";
import { useCreateNote } from "@/hooks/use-notes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
} from "@repo/ui";

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
    <Card variant="featured">
      <CardHeader>
        <CardTitle className="text-lg">{t("notes.createNote")}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-foreground">
              {t("notes.noteTitle")}
            </Label>
            <Input
              id="title"
              placeholder={t("notes.noteTitlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-xs font-medium text-foreground">
              {t("notes.content")}
            </Label>
            <textarea
              id="content"
              placeholder={t("notes.contentPlaceholder")}
              {...register("content")}
              className="flex min-h-[90px] w-full rounded-sm border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.content && (
              <p className="text-xs text-destructive font-medium">{errors.content.message}</p>
            )}
          </div>
          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? t("notes.creating") : t("notes.createButton")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
