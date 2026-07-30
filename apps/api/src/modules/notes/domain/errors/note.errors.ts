export class NoteNotFound {
  readonly type = "NOTE_NOT_FOUND";
  constructor(public readonly noteId: string) {}
}
