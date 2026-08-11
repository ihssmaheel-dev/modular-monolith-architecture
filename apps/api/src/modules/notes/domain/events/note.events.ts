export class NoteCreatedEvent {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly tenantId?: string,
  ) {}
}

export class NoteUpdatedEvent {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly content?: string,
    public readonly tenantId?: string,
  ) {}
}

export class NoteDeletedEvent {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
    public readonly tenantId?: string,
  ) {}
}
