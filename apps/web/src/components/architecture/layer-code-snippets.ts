export const layerCodeSnippets: Record<string, string> = {
  presentation: `@Controller("notes")
@UseGuards(AuthGuard, TenantContextGuard, PermissionsGuard)
export class NotesController {
  @Post()
  @RequirePermission("notes:create")
  @Idempotent()
  async create(@Body() body: CreateNoteInput, @CurrentUser() user: UserPayload) {
    const result = await this.createNoteCommand.execute({
      title: body.title,
      content: body.content,
      userId: user.id,
    });
    return handleResult(result, (note) => noteResponseMapper(note), this.i18n);
  }
}`,

  application: `@Injectable()
export class CreateNoteCommand {
  async execute(input: CreateNoteDto): Promise<Result<Note, NoteCreationError>> {
    const noteResult = Note.create(input);
    if (noteResult.isErr()) return err(noteResult.error);
    const note = noteResult.value;
    return await this.notesRepository.transaction(async (tx) => {
      const saved = await this.notesRepository.save(note, tx);
      await this.outbox.emit(new NoteCreatedEvent(saved), tx);
      return ok(saved);
    });
  }
}`,

  domain: `export class Note {
  static create(props: CreateNoteProps): Result<Note, NoteValidationError> {
    if (!props.title || props.title.trim().length === 0) {
      return err(new NoteValidationError("Note title cannot be empty"));
    }
    return ok(new Note(crypto.randomUUID(), props.tenantId, props.userId, props.title.trim(), props.content, new Date()));
  }
}`,

  infrastructure: `@Injectable()
export class NotesRepository extends TenantScopedRepository<NoteTable> {
  async findById(id: string): Promise<Note | null> {
    const row = await this.scopedQuery()
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, id))
      .limit(1);
    return row[0] ? NoteMapper.toDomain(row[0]) : null;
  }
}`,

  packages: `// @repo/contracts/src/contracts/notes.contract.ts
export const notesContract = {
  create: oc.route({ method: "POST", path: "/notes" }).input(CreateNoteSchema).output(NoteSchema),
  list: oc.route({ method: "GET", path: "/notes" }).input(PaginationQuerySchema).output(NoteListResponseSchema),
};`,
};
