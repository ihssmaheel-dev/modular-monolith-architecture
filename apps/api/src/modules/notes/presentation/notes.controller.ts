import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, Req } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { CreateNoteSchema, UpdateNoteSchema } from "@repo/shared";
import { CreateNoteCommand } from "../application/commands/create-note.command";
import { UpdateNoteCommand } from "../application/commands/update-note.command";
import { DeleteNoteCommand } from "../application/commands/delete-note.command";
import { GetNotesQuery } from "../application/queries/get-notes.query";
import { GetNoteByIdQuery } from "../application/queries/get-note-by-id.query";
import { toNoteResponse } from "./notes.mapper";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";

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
    if (result.isErr()) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: this.i18n.t("api.note.fetchFailed", lang) };
    }
    return {
      items: result.value.items.map(toNoteResponse),
      total: result.value.total,
      page: result.value.page,
      totalPages: result.value.totalPages,
    };
  }

  @Get(":id")
  async getNoteById(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.getNoteByIdQuery.execute(id);
    if (result.isErr()) {
      return { statusCode: HttpStatus.NOT_FOUND, message: this.i18n.t("api.note.notFound", lang) };
    }
    return toNoteResponse(result.value);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNote(@Body() body: unknown, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const parsed = CreateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: this.i18n.t("api.error.badRequest", lang), errors: parsed.error.flatten() };
    }
    const result = await this.createNoteCommand.execute(parsed.data);
    if (result.isErr()) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: this.i18n.t("api.note.createFailed", lang) };
    }
    return toNoteResponse(result.value);
  }

  @Patch(":id")
  async updateNote(@Param("id") id: string, @Body() body: unknown, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const parsed = UpdateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: this.i18n.t("api.error.badRequest", lang), errors: parsed.error.flatten() };
    }
    const result = await this.updateNoteCommand.execute(id, parsed.data);
    if (result.isErr()) {
      return { statusCode: HttpStatus.NOT_FOUND, message: this.i18n.t("api.note.notFound", lang) };
    }
    return toNoteResponse(result.value);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNote(@Param("id") id: string, @Req() req?: FastifyRequest) {
    const lang = req?.headers["accept-language"];
    const result = await this.deleteNoteCommand.execute(id);
    if (result.isErr()) {
      return { statusCode: HttpStatus.NOT_FOUND, message: this.i18n.t("api.note.notFound", lang) };
    }
    return;
  }
}
