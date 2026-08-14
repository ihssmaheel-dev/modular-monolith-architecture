import { BadRequestException, Controller, Get, HttpCode, Put, Req, Res } from "@nestjs/common";
import { ConfirmUploadSchema } from "@repo/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Readable } from "node:stream";
import { Idempotent, RequirePermissions, requireAuthenticatedUser } from "../../../common";
import { ZodValidationException } from "../../../common/exceptions/zod-validation.exception";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { UploadGridFsFileCommand } from "../application/commands/upload-gridfs-file.command";
import { GetGridFsFileContentQuery } from "../application/queries/get-gridfs-file-content.query";
import { GRIDFS_TRANSFER_ERRORS } from "./files.error-maps";

type BinaryRequest = FastifyRequest & { body?: Readable };

/** Binary transfer exception: ts-rest does not model streaming octet-stream bodies. */
@Controller("files")
export class FilesTransferController {
  constructor(
    private readonly uploadCommand: UploadGridFsFileCommand,
    private readonly contentQuery: GetGridFsFileContentQuery,
    private readonly i18n: I18nService,
  ) {}

  @Put("gridfs/upload")
  @HttpCode(200)
  @Idempotent()
  @RequirePermissions("files:write")
  async upload(@Req() request: BinaryRequest): Promise<{ uploaded: true }> {
    const fileKey = this.fileKey(request);
    const body = request.body;
    if (!(body instanceof Readable)) throw new BadRequestException();
    const result = await this.uploadCommand.execute(
      fileKey,
      body,
      requireAuthenticatedUser(request),
    );
    handleResult(result, GRIDFS_TRANSFER_ERRORS, this.i18n, request.headers["accept-language"]);
    return { uploaded: true };
  }

  @Get(":id/content")
  @RequirePermissions("files:read")
  async download(@Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<void> {
    const result = await this.contentQuery.execute(
      this.fileId(request),
      requireAuthenticatedUser(request),
    );
    const content = handleResult(
      result,
      GRIDFS_TRANSFER_ERRORS,
      this.i18n,
      request.headers["accept-language"],
    );
    reply
      .header("content-type", content.file.contentType)
      .header("content-length", content.file.fileSize)
      .header(
        "content-disposition",
        `attachment; filename="${this.safeName(content.file.fileName)}"`,
      )
      .header("x-content-type-options", "nosniff")
      .send(content.stream);
  }

  private fileKey(request: FastifyRequest): string {
    const parsed = ConfirmUploadSchema.safeParse({ fileKey: this.query(request, "fileKey") });
    if (!parsed.success) throw new ZodValidationException(parsed.error);
    return parsed.data.fileKey;
  }

  private fileId(request: FastifyRequest): string {
    const params = request.params as { id?: string };
    const parsed = ConfirmUploadSchema.safeParse({ fileKey: params.id });
    if (!parsed.success) throw new ZodValidationException(parsed.error);
    return parsed.data.fileKey;
  }

  private query(request: FastifyRequest, name: string): string | null {
    return new URL(request.url, "http://localhost").searchParams.get(name);
  }

  private safeName(name: string): string {
    return name.replace(/["\r\n\\]/g, "_");
  }
}
