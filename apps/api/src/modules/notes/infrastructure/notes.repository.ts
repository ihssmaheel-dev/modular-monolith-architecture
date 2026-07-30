import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FlattenMaps } from "mongoose";
import { ClsService } from "nestjs-cls";
import { Note } from "../domain/entities/note.entity";
import { NoteMongooseSchema } from "./schemas/note.mongoose.schema";
import { BaseRepository } from "../../../infrastructure/database/base.repository";

type LeanNoteDocument = FlattenMaps<NoteMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class NotesRepository extends BaseRepository<Note, NoteMongooseSchema> {
  constructor(
    @InjectModel(NoteMongooseSchema.name) model: Model<NoteMongooseSchema>,
    cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(doc: LeanNoteDocument): Note {
    return Note.fromPersistence({
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }
}
