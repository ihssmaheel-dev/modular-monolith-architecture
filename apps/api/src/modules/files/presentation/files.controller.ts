import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { Idempotent, RequirePermission, requireAuthenticatedUser } from "../../../common";
import {
  type RequestUploadInput,
  type ConfirmUploadInput,
  type PresignedUrlResponse,
  type FileMetadataResponse,
  type DownloadUrlResponse,
  type FileListResponse,
} from "@repo/shared";
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

  @Post("upload-url")
  @HttpCode(HttpStatus.CREATED)
  @Idempotent()
  @RequirePermission("files:upload")
  async requestUpload(
    @Body() body: RequestUploadInput,
    @Req() req: FastifyRequest,
  ): Promise<PresignedUrlResponse> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.requestUploadCmd.execute(body, actor.sub);
    return handleResult(result, REQUEST_UPLOAD_ERRORS, this.i18n, lang);
  }

  @Post("confirm")
  @HttpCode(HttpStatus.OK)
  @Idempotent()
  @RequirePermission("files:upload")
  async confirmUpload(
    @Body() body: ConfirmUploadInput,
    @Req() req: FastifyRequest,
  ): Promise<FileMetadataResponse> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.confirmUploadCmd.execute(body.fileKey, actor);
    const file = handleResult(result, CONFIRM_UPLOAD_ERRORS, this.i18n, lang);
    return toFileResponse(file);
  }

  @Get(":id/download-url")
  @RequirePermission("files:read")
  async getDownloadUrl(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<DownloadUrlResponse> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.getDownloadUrlQuery.execute(id, actor);
    return handleResult(result, DOWNLOAD_ERRORS, this.i18n, lang);
  }

  @Get(":id")
  @RequirePermission("files:read")
  async getById(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<FileMetadataResponse> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.getFileByIdQuery.execute(id, actor);
    const file = handleResult(result, FILE_NOT_FOUND_ERRORS, this.i18n, lang);
    return toFileResponse(file);
  }

  @Get()
  @RequirePermission("files:read")
  async listByParent(
    @Query() query: { parentType: "note" | "user" | "general"; parentId?: string; page?: number; limit?: number },
    @Req() req: FastifyRequest,
  ): Promise<FileListResponse> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.listFilesQuery.execute(
      query.parentType,
      actor,
      query.parentId,
      Number(query.page ?? 1),
      Number(query.limit ?? 20),
    );
    const data = handleResult(result, {}, this.i18n, lang);
    return {
      items: data.items.map(toFileResponse),
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Idempotent()
  @RequirePermission("files:delete")
  async delete(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
  ): Promise<void> {
    const lang = req?.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.deleteFileCmd.execute(id, actor);
    handleResult(result, DELETE_FILE_ERRORS, this.i18n, lang);
  }
}
