import { Injectable } from "@nestjs/common";
import { ok, Result } from "neverthrow";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";

interface ListFilesResult {
  items: FileEntity[];
  total: number;
}

@Injectable()
export class ListFilesByParentQuery {
  constructor(private readonly filesRepo: FilesRepository) {}

  async execute(
    parentType: string,
    parentId?: string,
  ): Promise<Result<ListFilesResult, never>> {
    if (!parentId) {
      const findResult = await this.filesRepo.find({ parentType });
      const files = findResult._unsafeUnwrap();
      return ok({ items: files, total: files.length });
    }

    const files = await this.filesRepo.findByParent(parentType, parentId);
    return ok({ items: files, total: files.length });
  }
}
