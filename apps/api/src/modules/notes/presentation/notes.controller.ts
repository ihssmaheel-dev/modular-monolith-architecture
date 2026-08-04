import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, Req } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions, Idempotent } from "../../../common";
import { CreateNoteSchema, UpdateNoteSchema } from "@repo/shared";
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

  @Get()
  @RequirePermissions("notes:read")
  async getNotes(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Req() req?: FastifyRequest,
  ) {
    const lang = req?.headers["accept-language"];
    const result = await this.getNotesQuery.execute({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    const val = handleResult(result, {}, this.i18n, lang);
    return {
      items: val.items.map(toNoteResponse),
      total: val.total,
      page: val.page,
      totalPages: val.totalPages,
    };
  }

  @Get(":id")
  @RequirePermissions("notes:read")
  async getNoteById(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.getNoteByIdQuery.execute(id);
    const note = handleResult(result, {
      NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
    }, this.i18n, lang);
    return toNoteResponse(note);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @RequirePermissions("notes:write")
  async createNote(@Body() body: unknown, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const parsed = CreateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: this.i18n.t("api.error.badRequest", lang), errors: parsed.error.flatten() };
    }
    const result = await this.createNoteCommand.execute(parsed.data);
    const note = handleResult(result, {}, this.i18n, lang);
    return toNoteResponse(note);
  }

  @Patch(":id")
  @RequirePermissions("notes:write")
  async updateNote(@Param("id") id: string, @Body() body: unknown, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const parsed = UpdateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: this.i18n.t("api.error.badRequest", lang), errors: parsed.error.flatten() };
    }
    const result = await this.updateNoteCommand.execute(id, parsed.data);
    const note = handleResult(result, {
      NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
    }, this.i18n, lang);
    return toNoteResponse(note);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions("notes:write")
  async deleteNote(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.deleteNoteCommand.execute(id);
    handleResult(result, {
      NOTE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
    }, this.i18n, lang);
    return;
  }
}
