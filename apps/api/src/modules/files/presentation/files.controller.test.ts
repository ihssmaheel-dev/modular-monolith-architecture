import { describe, it, expect, vi, beforeEach } from "vitest";
import { FilesController } from "./files.controller";
import { RequestUploadCommand } from "../application/commands/request-upload.command";
import { ConfirmUploadCommand } from "../application/commands/confirm-upload.command";
import { DeleteFileCommand } from "../application/commands/delete-file.command";
import { GetFileByIdQuery } from "../application/queries/get-file-by-id.query";
import { GetFileDownloadUrlQuery } from "../application/queries/get-file-download-url.query";
import { ListFilesByParentQuery } from "../application/queries/list-files-by-parent.query";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";

describe("FilesController", () => {
  let controller: FilesController;

  beforeEach(() => {
    controller = new FilesController(
      { execute: vi.fn() } as unknown as RequestUploadCommand,
      { execute: vi.fn() } as unknown as ConfirmUploadCommand,
      { execute: vi.fn() } as unknown as DeleteFileCommand,
      { execute: vi.fn() } as unknown as GetFileByIdQuery,
      { execute: vi.fn() } as unknown as GetFileDownloadUrlQuery,
      { execute: vi.fn() } as unknown as ListFilesByParentQuery,
      { translate: vi.fn() } as unknown as I18nService,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should have all required methods", () => {
    expect(typeof controller.requestUpload).toBe("function");
    expect(typeof controller.confirmUpload).toBe("function");
    expect(typeof controller.getDownloadUrl).toBe("function");
    expect(typeof controller.getById).toBe("function");
    expect(typeof controller.listByParent).toBe("function");
    expect(typeof controller.delete).toBe("function");
  });
});
