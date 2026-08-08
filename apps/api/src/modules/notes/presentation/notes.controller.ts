import { Controller, HttpStatus, Req } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions, Idempotent } from "../../../common";
import { CreateNoteDto, UpdateNoteDto, notesContract } from "@repo/shared";
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
  async list(
    @Req() req?: FastifyRequest,
  ) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(notesContract.getNotes, async ({ query }: any) => {
      const { page, limit } = query;
      const lang = req?.headers["accept-language"];
      const result = await this.getNotesQuery.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      const val = handleResult(result, {}, this.i18n, lang);
      return {
        status: 200,
        body: { 
          items: val.items.map(toNoteResponse), 
          total: val.total, 
          page: val.page, 
          totalPages: val.totalPages 
        },
      };
    });
  }

  @TsRestHandler(notesContract.getNoteById)
  @RequirePermissions("notes:read")
  async getById(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(notesContract.getNoteById, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.getNoteByIdQuery.execute(id);
      const note = handleResult(result, {
        NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
      }, this.i18n, lang);
      return {
        status: 200,
        body: toNoteResponse(note),
      };
    });
  }

  @TsRestHandler(notesContract.createNote)
  @Idempotent()
  @RequirePermissions("notes:write")
  async create(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(notesContract.createNote, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.createNoteCommand.execute(body as CreateNoteDto);
      const note = handleResult(result, {}, this.i18n, lang);
      return {
        status: 201,
        body: toNoteResponse(note),
      };
    });
  }

  @TsRestHandler(notesContract.updateNote)
  @RequirePermissions("notes:write")
  async update(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(notesContract.updateNote, async ({ params: { id }, body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.updateNoteCommand.execute(id, body as UpdateNoteDto);
      const note = handleResult(result, {
        NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
      }, this.i18n, lang);
      return {
        status: 200,
        body: toNoteResponse(note),
      };
    });
  }

  @TsRestHandler(notesContract.deleteNote)
  @RequirePermissions("notes:write")
  async delete(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(notesContract.deleteNote, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.deleteNoteCommand.execute(id);
      handleResult(result, {
        NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
      }, this.i18n, lang);
      return {
        status: 204,
        body: undefined as any,
      };
    });
  }
}
