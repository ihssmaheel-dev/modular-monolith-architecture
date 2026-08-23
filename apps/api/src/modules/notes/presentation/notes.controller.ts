import { Controller, HttpStatus, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { RequirePermissions, Idempotent, requireAuthenticatedUser } from "../../../common";
import { notesContract } from "@repo/shared";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { CreateNoteCommand } from "../application/commands/create-note.command";
import { UpdateNoteCommand } from "../application/commands/update-note.command";
import { DeleteNoteCommand } from "../application/commands/delete-note.command";
import { GetNotesQuery } from "../application/queries/get-notes.query";
import { GetNoteByIdQuery } from "../application/queries/get-note-by-id.query";
import { toNoteResponse } from "./notes.mapper";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { handleResult } from "../../../common/utils/presentation.utils";

@Controller("notes")
export class NotesController {
  constructor(
    private readonly createNoteCommand: CreateNoteCommand,
    private readonly updateNoteCommand: UpdateNoteCommand,
    private readonly deleteNoteCommand: DeleteNoteCommand,
    private readonly getNotesQuery: GetNotesQuery,
    private readonly getNoteByIdQuery: GetNoteByIdQuery,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(notesContract.getNotes)
  @RequirePermissions("notes:read")
  list(@Req() req: FastifyRequest) {
    return tsRestHandler(notesContract.getNotes, async ({ query }) => {
      const { page, limit } = query;
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.getNotesQuery.execute(
        {
          page,
          limit,
        },
        actor,
      );
      const val = handleResult(result, {}, this.i18n, lang);
      return {
        status: 200 as const,
        body: {
          items: val.items.map(toNoteResponse),
          total: val.total,
          page: val.page,
          limit: val.limit,
          totalPages: val.totalPages,
        },
      };
    });
  }

  @TsRestHandler(notesContract.getNoteById)
  @RequirePermissions("notes:read")
  getById(@Req() req: FastifyRequest) {
    return tsRestHandler(notesContract.getNoteById, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.getNoteByIdQuery.execute(id, actor);
      const note = handleResult(
        result,
        {
          NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
        },
        this.i18n,
        lang,
      );
      return {
        status: 200 as const,
        body: toNoteResponse(note),
      };
    });
  }

  @TsRestHandler(notesContract.createNote)
  @Idempotent()
  @RequirePermissions("notes:write")
  create(@Req() req: FastifyRequest) {
    return tsRestHandler(notesContract.createNote, async ({ body }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.createNoteCommand.execute(body, actor);
      const note = handleResult(result, {}, this.i18n, lang);
      return {
        status: 201 as const,
        body: toNoteResponse(note),
      };
    });
  }

  @TsRestHandler(notesContract.updateNote)
  @Idempotent()
  @RequirePermissions("notes:write")
  update(@Req() req: FastifyRequest) {
    return tsRestHandler(notesContract.updateNote, async ({ params: { id }, body }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.updateNoteCommand.execute(id, body, actor);
      const note = handleResult(
        result,
        {
          NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
        },
        this.i18n,
        lang,
      );
      return {
        status: 200 as const,
        body: toNoteResponse(note),
      };
    });
  }

  @TsRestHandler(notesContract.deleteNote)
  @Idempotent()
  @RequirePermissions("notes:write")
  delete(@Req() req: FastifyRequest) {
    return tsRestHandler(notesContract.deleteNote, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.deleteNoteCommand.execute(id, actor);
      handleResult(
        result,
        {
          NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
        },
        this.i18n,
        lang,
      );
      return {
        status: 204 as const,
        body: undefined,
      };
    });
  }
}
