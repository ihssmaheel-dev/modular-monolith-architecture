import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { RequirePermission, Idempotent, requireAuthenticatedUser } from "../../../common";
import {
  type CreateNoteDto,
  type UpdateNoteDto,
  type PaginationQuery,
  type NoteResponseDto,
  type NoteListResponseDto,
} from "@repo/shared";
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
  @RequirePermission("notes:read")
  async list(
    @Query() query: PaginationQuery,
    @Req() req: FastifyRequest,
  ): Promise<NoteListResponseDto> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.getNotesQuery.execute({ page, limit }, actor);
    const val = handleResult(result, {}, this.i18n, lang);
    return {
      items: val.items.map(toNoteResponse),
      total: val.total,
      page: val.page,
      limit: val.limit,
      totalPages: val.totalPages,
    };
  }

  @Get(":id")
  @RequirePermission("notes:read")
  async getById(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<NoteResponseDto> {
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
    return toNoteResponse(note);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @RequirePermission("notes:create")
  async create(
    @Body() body: CreateNoteDto,
    @Req() req: FastifyRequest,
  ): Promise<NoteResponseDto> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.createNoteCommand.execute(body, actor);
    const note = handleResult(result, {}, this.i18n, lang);
    return toNoteResponse(note);
  }

  @Patch(":id")
  @Idempotent()
  @RequirePermission("notes:update")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateNoteDto,
    @Req() req: FastifyRequest,
  ): Promise<NoteResponseDto> {
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
    return toNoteResponse(note);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Idempotent()
  @RequirePermission("notes:delete")
  async delete(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<void> {
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
  }
}
