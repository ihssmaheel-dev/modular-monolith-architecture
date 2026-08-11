import { Controller, Req } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { RequirePermissions, requireAuthenticatedUser } from "../../../common";
import { filesContract } from "@repo/shared";
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
import {
  CONFIRM_UPLOAD_ERRORS,
  DELETE_FILE_ERRORS,
  DOWNLOAD_ERRORS,
  FILE_NOT_FOUND_ERRORS,
  REQUEST_UPLOAD_ERRORS,
} from "./files.error-maps";

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
  requestUpload(@Req() req: FastifyRequest) {
    return tsRestHandler(filesContract.requestUpload, async ({ body }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.requestUploadCmd.execute(body, actor.sub);
      const response = handleResult(result, REQUEST_UPLOAD_ERRORS, this.i18n, lang);
      return { status: 201 as const, body: response };
    });
  }

  @TsRestHandler(filesContract.confirmUpload)
  @RequirePermissions("files:write")
  confirmUpload(@Req() req: FastifyRequest) {
    return tsRestHandler(filesContract.confirmUpload, async ({ body }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.confirmUploadCmd.execute(body.fileKey, actor);
      const file = handleResult(result, CONFIRM_UPLOAD_ERRORS, this.i18n, lang);
      return { status: 200 as const, body: toFileResponse(file) };
    });
  }

  @TsRestHandler(filesContract.getDownloadUrl)
  @RequirePermissions("files:read")
  getDownloadUrl(@Req() req: FastifyRequest) {
    return tsRestHandler(filesContract.getDownloadUrl, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.getDownloadUrlQuery.execute(id, actor);
      const response = handleResult(result, DOWNLOAD_ERRORS, this.i18n, lang);
      return { status: 200 as const, body: response };
    });
  }

  @TsRestHandler(filesContract.getById)
  @RequirePermissions("files:read")
  getById(@Req() req: FastifyRequest) {
    return tsRestHandler(filesContract.getById, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.getFileByIdQuery.execute(id, actor);
      const file = handleResult(result, FILE_NOT_FOUND_ERRORS, this.i18n, lang);
      return { status: 200 as const, body: toFileResponse(file) };
    });
  }

  @TsRestHandler(filesContract.listByParent)
  @RequirePermissions("files:read")
  listByParent(@Req() req: FastifyRequest) {
    return tsRestHandler(filesContract.listByParent, async ({ query }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.listFilesQuery.execute(
        query.parentType,
        actor,
        query.parentId,
        query.page,
        query.limit,
      );
      const data = handleResult(result, {}, this.i18n, lang);
      return {
        status: 200 as const,
        body: {
          items: data.items.map(toFileResponse),
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        },
      };
    });
  }

  @TsRestHandler(filesContract.delete)
  @RequirePermissions("files:delete")
  delete(@Req() req: FastifyRequest) {
    return tsRestHandler(filesContract.delete, async ({ params: { id } }) => {
      const lang = req?.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.deleteFileCmd.execute(id, actor);
      handleResult(result, DELETE_FILE_ERRORS, this.i18n, lang);
      return { status: 204 as const, body: undefined };
    });
  }
}
