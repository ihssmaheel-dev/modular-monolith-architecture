import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateNoteSchema, FRONTEND_ROUTES, type CreateNoteDto } from "@repo/contracts";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "@repo/ui/components/ui/toast";
import { getApiClient } from "@/lib/api";

export const Route = createFileRoute("/_app/notes/new")({ component: CreateNotePage });

function CreateNotePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<CreateNoteDto>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: { title: "", content: "" },
  });
  const mutation = useMutation({
    mutationFn: async (data: CreateNoteDto) => {
      const response = await getApiClient().notes.create({ body: data });
      if (response.status !== 201) throw new Error("api.note.createFailed");
    },
    onSuccess: () => {
      toast.add({ title: t("api.note.created"), type: "success" } as never);
      navigate({ to: FRONTEND_ROUTES.notes });
    },
    onError: () => toast.add({ title: t("api.note.createFailed"), type: "error" } as never),
  });

  return (
    <div className="w-full space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: FRONTEND_ROUTES.notes })}>
          {t("common.back")}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("notes.createNote")}</CardTitle>
          <CardDescription>{t("notes.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="note-title">{t("notes.noteTitle")}</Label>
              <Input
                id="note-title"
                aria-invalid={Boolean(form.formState.errors.title)}
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">{t("notes.content")}</Label>
              <Textarea
                id="note-content"
                rows={9}
                aria-invalid={Boolean(form.formState.errors.content)}
                {...form.register("content")}
              />
              {form.formState.errors.content && (
                <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: FRONTEND_ROUTES.notes })}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("notes.creating") : t("notes.createButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
