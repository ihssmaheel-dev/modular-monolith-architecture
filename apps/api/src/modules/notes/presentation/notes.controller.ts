import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateNoteSchema, UpdateNoteSchema } from "@repo/shared";
import { CreateNoteCommand } from "../application/commands/create-note.command";
import { UpdateNoteCommand } from "../application/commands/update-note.command";
import { DeleteNoteCommand } from "../application/commands/delete-note.command";
import { GetNotesQuery } from "../application/queries/get-notes.query";
import { GetNoteByIdQuery } from "../application/queries/get-note-by-id.query";
import { toNoteResponse } from "./notes.mapper";

@Controller("notes")
export class NotesController {
  constructor(
    private readonly createNoteCommand: CreateNoteCommand,
    private readonly updateNoteCommand: UpdateNoteCommand,
    private readonly deleteNoteCommand: DeleteNoteCommand,
    private readonly getNotesQuery: GetNotesQuery,
    private readonly getNoteByIdQuery: GetNoteByIdQuery,
  ) {}

  @Get()
  async getNotes(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const result = await this.getNotesQuery.execute({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    if (result.isErr()) {
      throw new BadRequestException("Failed to fetch notes");
    }
    return {
      items: result.value.items.map(toNoteResponse),
      total: result.value.total,
      page: result.value.page,
      totalPages: result.value.totalPages,
    };
  }

  @Get(":id")
  async getNoteById(@Param("id") id: string) {
    const result = await this.getNoteByIdQuery.execute(id);
    if (result.isErr()) {
      throw new NotFoundException("Note not found");
    }
    return toNoteResponse(result.value);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNote(@Body() body: unknown) {
    const parsed = CreateNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid data");
    }
    const result = await this.createNoteCommand.execute(parsed.data);
    if (result.isErr()) {
      throw new BadRequestException("Failed to create note");
    }
    return toNoteResponse(result.value);
  }

  @Patch(":id")
  async updateNote(@Param("id") id: string, @Body() body: unknown) {
    const parsed = UpdateNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid data");
    }
    const result = await this.updateNoteCommand.execute(id, parsed.data);
    if (result.isErr()) {
      throw new NotFoundException("Note not found");
    }
    return toNoteResponse(result.value);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNote(@Param("id") id: string) {
    const result = await this.deleteNoteCommand.execute(id);
    if (result.isErr()) {
      throw new NotFoundException("Note not found");
    }
    return;
  }
}
