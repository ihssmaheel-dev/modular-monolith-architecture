export class Note {
  private constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public readonly createdBy: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly tenantId?: string,
  ) {}

  static fromPersistence(data: {
    id: string;
    title: string;
    content: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
    tenantId?: string;
  }): Note {
    return new Note(
      data.id,
      data.title,
      data.content,
      data.createdBy,
      data.createdAt,
      data.updatedAt,
      data.tenantId,
    );
  }

  update(data: { title?: string; content?: string }): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.content !== undefined) this.content = data.content;
  }
}
