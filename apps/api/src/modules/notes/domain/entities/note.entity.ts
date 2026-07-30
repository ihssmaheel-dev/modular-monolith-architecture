export class Note {
  private constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPersistence(data: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }): Note {
    return new Note(data.id, data.title, data.content, data.createdAt, data.updatedAt);
  }

  update(data: { title?: string; content?: string }): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.content !== undefined) this.content = data.content;
  }
}
