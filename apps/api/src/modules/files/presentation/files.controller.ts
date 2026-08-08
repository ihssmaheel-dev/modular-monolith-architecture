import { Controller, Req, HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions } from "../../../common";
import { filesContract, RequestUploadInput } from "@repo/shared";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { RequestUploadCommand } from "../application/commands/request-upload.command";
import { ConfirmUploadCommand } from "../application/commands/confirm-upload.command";
import { DeleteFileCommand } from "../application/commands/delete-file.command";
import { GetFileByIdQuery } from "../application/queries/get-file-by-id.query";
import { GetFileDownloadUrlQuery } from "../application/queries/get-file-download-url.query";
import { ListFilesByParentQuery } from "../application/queries/list-files-by-parent.query";
import { toFileResponse } from "./files.mapper";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { handleResult } from "../../../common/utils/presentation.utils";

@Controller("files")
export class FilesController {
  constructor(
    private readonly requestUploadCmd: RequestUploadCommand,
    private readonly confirmUploadCmd: ConfirmUploadCommand,
    private readonly deleteFileCmd: DeleteFileCommand,
    private readonly getFileByIdQuery: GetFileByIdQuery,
    private readonly getDownloadUrlQuery: GetFileDownloadUrlQuery,
    private readonly listFilesQuery: ListFilesByParentQuery,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(filesContract.requestUpload)
  @RequirePermissions("files:write")
  async requestUpload(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(filesContract.requestUpload, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const userId = (req as any)?.user?.id;
      const result = await this.requestUploadCmd.execute(body as RequestUploadInput, userId);
      const response = handleResult(result, {
        PRESIGN_FAILED: { status: HttpStatus.INTERNAL_SERVER_ERROR, i18nKey: "api.error.presignFailed" },
        UPLOAD_FAILED: { status: HttpStatus.INTERNAL_SERVER_ERROR, i18nKey: "api.error.uploadFailed" },
      }, this.i18n, lang);
      return { status: 201, body: response };
    });
  }

  @TsRestHandler(filesContract.confirmUpload)
  @RequirePermissions("files:write")
  async confirmUpload(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(filesContract.confirmUpload, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.confirmUploadCmd.execute(body.fileKey);
      const file = handleResult(result, {
        FILE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
        UPLOAD_FAILED: { status: HttpStatus.INTERNAL_SERVER_ERROR, i18nKey: "api.error.uploadFailed" },
      }, this.i18n, lang);
      return { status: 200, body: toFileResponse(file) };
    });
  }

  @TsRestHandler(filesContract.getDownloadUrl)
  @RequirePermissions("files:read")
  async getDownloadUrl(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(filesContract.getDownloadUrl, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.getDownloadUrlQuery.execute(id);
      const response = handleResult(result, {
        FILE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
        PRESIGN_FAILED: { status: HttpStatus.INTERNAL_SERVER_ERROR, i18nKey: "api.error.presignFailed" },
      }, this.i18n, lang);
      return { status: 200, body: response };
    });
  }

  @TsRestHandler(filesContract.getById)
  @RequirePermissions("files:read")
  async getById(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(filesContract.getById, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.getFileByIdQuery.execute(id);
      const file = handleResult(result, {
        FILE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
      }, this.i18n, lang);
      return { status: 200, body: toFileResponse(file) };
    });
  }

  @TsRestHandler(filesContract.listByParent)
  @RequirePermissions("files:read")
  async listByParent() {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(filesContract.listByParent, async ({ query }: any) => {
      const result = await this.listFilesQuery.execute(query.parentType, query.parentId);
      const data = result._unsafeUnwrap();
      return {
        status: 200,
        body: {
          items: data.items.map(toFileResponse),
          total: data.total,
        },
      };
    });
  }

  @TsRestHandler(filesContract.delete)
  @RequirePermissions("files:delete")
  async delete(@Req() req?: FastifyRequest) {
    // @ts-ignore ts-rest v3 + Zod v4 type inference broken
    return tsRestHandler(filesContract.delete, async ({ params: { id } }: any) => {
      const lang = req?.headers["accept-language"];
      const userId = (req as any)?.user?.id;
      const result = await this.deleteFileCmd.execute(id, userId);
      handleResult(result, {
        FILE_NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.note.notFound" },
        UNAUTHORIZED: { status: HttpStatus.FORBIDDEN, i18nKey: "api.error.unauthorized" },
        DELETE_FAILED: { status: HttpStatus.INTERNAL_SERVER_ERROR, i18nKey: "api.error.deleteFailed" },
      }, this.i18n, lang);
      return { status: 204, body: undefined as any };
    });
  }
}
