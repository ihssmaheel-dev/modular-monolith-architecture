export class NoteCreatedEvent {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly content: string,
  ) {}
}

export class NoteUpdatedEvent {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly content?: string,
  ) {}
}

export class NoteDeletedEvent {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
  ) {}
}
