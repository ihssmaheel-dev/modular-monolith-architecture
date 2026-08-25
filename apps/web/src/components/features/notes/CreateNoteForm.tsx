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
    <Card>
      <CardHeader>
        <CardTitle>{t("notes.createNote")}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("notes.noteTitle")}</Label>
            <Input
              id="title"
              placeholder={t("notes.noteTitlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">{t("notes.content")}</Label>
            <textarea
              id="content"
              placeholder={t("notes.contentPlaceholder")}
              {...register("content")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? t("notes.creating") : t("notes.createButton")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
