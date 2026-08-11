import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ClsModule } from "nestjs-cls";
import { Model } from "mongoose";
import { FilesRepository } from "./infrastructure/files.repository";
import { RequestUploadCommand } from "./application/commands/request-upload.command";
import { ConfirmUploadCommand } from "./application/commands/confirm-upload.command";
import { DeleteFileCommand } from "./application/commands/delete-file.command";
import { GetFileByIdQuery } from "./application/queries/get-file-by-id.query";
import { GetFileDownloadUrlQuery } from "./application/queries/get-file-download-url.query";
import { ListFilesByParentQuery } from "./application/queries/list-files-by-parent.query";
import { FileMongooseSchema, FileSchema } from "./infrastructure/schemas/file.mongoose.schema";
import { StorageService } from "../../infrastructure/storage/storage.service";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { I18nService } from "../../infrastructure/i18n/i18n.service";
import { ok } from "neverthrow";

const MONGODB_URI = process.env.TEST_MONGODB_URI;
const describeWithMongo = MONGODB_URI ? describe : describe.skip;
const ACTOR = { sub: "user-1", email: "user@example.com", role: "user" } as const;

describeWithMongo("FilesModule Integration", () => {
  let module: TestingModule;
  let requestUploadCmd: RequestUploadCommand;
  let confirmUploadCmd: ConfirmUploadCommand;
  let getFileByIdQuery: GetFileByIdQuery;
  let listFilesQuery: ListFilesByParentQuery;
  let fileModel: Model<FileMongooseSchema>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        MongooseModule.forRoot(requireTestDatabaseUri()),
        MongooseModule.forFeature([{ name: FileMongooseSchema.name, schema: FileSchema }]),
      ],
      providers: [
        FilesRepository,
        RequestUploadCommand,
        ConfirmUploadCommand,
        DeleteFileCommand,
        GetFileByIdQuery,
        GetFileDownloadUrlQuery,
        ListFilesByParentQuery,
        {
          provide: StorageService,
          useValue: {
            getPresignedUploadUrl: vi.fn().mockResolvedValue(ok("https://s3.example.com/upload")),
            getPresignedDownloadUrl: vi
              .fn()
              .mockResolvedValue(ok("https://s3.example.com/download")),
            getMetadata: vi
              .fn()
              .mockResolvedValue(ok({ size: 1024, contentType: "application/pdf" })),
            delete: vi.fn().mockResolvedValue(ok(undefined)),
          },
        },
        {
          provide: PinoLoggerService,
          useValue: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            child: vi.fn().mockReturnThis(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: vi.fn().mockReturnValue("translated"),
          },
        },
      ],
    }).compile();

    requestUploadCmd = module.get(RequestUploadCommand);
    confirmUploadCmd = module.get(ConfirmUploadCommand);
    getFileByIdQuery = module.get(GetFileByIdQuery);
    listFilesQuery = module.get(ListFilesByParentQuery);
    fileModel = module.get(getModelToken(FileMongooseSchema.name));
  });

  afterAll(async () => {
    await fileModel?.deleteMany({});
    await module?.close();
  });

  beforeEach(async () => {
    await fileModel.deleteMany({});
  });

  it("should request upload and create file record", async () => {
    const result = await requestUploadCmd.execute(
      {
        fileName: "test.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.uploadUrl).toBe("https://s3.example.com/upload");
      expect(result.value.fileKey).toContain("note/note-1/user-1/");
    }
  });

  it("should confirm upload and update status", async () => {
    await requestUploadCmd.execute(
      {
        fileName: "test.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    const files = await fileModel.find().exec();
    expect(files.length).toBe(1);

    const confirmResult = await confirmUploadCmd.execute(files[0]!.key, ACTOR);
    expect(confirmResult.isOk()).toBe(true);

    const updated = await fileModel.findById(files[0]!._id).exec();
    expect(updated!.status).toBe("uploaded");
  });

  it("should get file by id", async () => {
    await requestUploadCmd.execute(
      {
        fileName: "test.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    const files = await fileModel.find().exec();
    const result = await getFileByIdQuery.execute(files[0]!._id.toString(), ACTOR);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.fileName).toBe("test.pdf");
    }
  });

  it("should list files by parent", async () => {
    await requestUploadCmd.execute(
      {
        fileName: "test1.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );
    await requestUploadCmd.execute(
      {
        fileName: "test2.pdf",
        contentType: "application/pdf",
        fileSize: 2048,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    const result = await listFilesQuery.execute("note", ACTOR, "note-1");

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.total).toBe(2);
      expect(result.value.items.length).toBe(2);
    }
  });
});

function requireTestDatabaseUri(): string {
  if (!MONGODB_URI) throw new Error("TEST_MONGODB_URI is required");
  const database = new URL(MONGODB_URI).pathname.slice(1);
  if (!database.toLowerCase().includes("test")) {
    throw new Error("TEST_MONGODB_URI must point to a database containing 'test' in its name");
  }
  return MONGODB_URI;
}
