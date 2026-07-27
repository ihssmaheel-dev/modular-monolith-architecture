export type UserRole = "admin" | "user";

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly data: UserData) {}

  static create(input: { email: string; name: string; role?: UserRole }): User {
    const now = new Date();
    return new User({
      id: "",
      email: input.email,
      name: input.name,
      role: input.role ?? "user",
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: UserData): User {
    return new User(data);
  }

  get id() {
    return this.data.id;
  }
  get email() {
    return this.data.email;
  }
  get name() {
    return this.data.name;
  }
  get role() {
    return this.data.role;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }

  update(fields: { email?: string; name?: string }): void {
    if (fields.email) this.data.email = fields.email;
    if (fields.name) this.data.name = fields.name;
    this.data.updatedAt = new Date();
  }

  toJSON(): UserData {
    return { ...this.data };
  }
}
