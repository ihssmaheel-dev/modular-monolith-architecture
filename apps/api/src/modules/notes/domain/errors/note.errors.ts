export class NoteNotFound {
  readonly type = "NOTE_NOT_FOUND";
  constructor(public readonly noteId: string) {}
}

export type NoteEventDispatchFailed = { type: "NOTE_EVENT_DISPATCH_FAILED" };
