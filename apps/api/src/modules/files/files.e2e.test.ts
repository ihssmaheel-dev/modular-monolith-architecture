import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ClsModule } from "nestjs-cls";
import { TsRestModule } from "@ts-rest/nest";
import { FilesModule } from "./files.module";
import { StorageService } from "../../infrastructure/storage/storage.service";
import { StorageModule } from "../../infrastructure/storage/storage.module";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { LoggerModule } from "../../infrastructure/logger/logger.module";
import { I18nModule } from "../../infrastructure/i18n/i18n.module";
import { ok } from "neverthrow";

const MONGODB_URI = process.env.TEST_MONGODB_URI;
const describeWithMongo = MONGODB_URI ? describe : describe.skip;

describeWithMongo("FilesController E2E", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        MongooseModule.forRoot(requireTestDatabaseUri()),
        TsRestModule,
        StorageModule,
        LoggerModule,
        I18nModule,
        FilesModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue({
        usesDirectTransfer: vi.fn().mockReturnValue(true),
        getPresignedUploadUrl: vi.fn().mockResolvedValue(ok("https://s3.example.com/upload")),
        getPresignedDownloadUrl: vi.fn().mockResolvedValue(ok("https://s3.example.com/download")),
        getMetadata: vi.fn().mockResolvedValue(ok({ size: 1024, contentType: "application/pdf" })),
        delete: vi.fn().mockResolvedValue(ok(undefined)),
      })
      .overrideProvider(PinoLoggerService)
      .useValue({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        child: vi.fn().mockReturnThis(),
      })
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /api/files should return files list", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/files?parentType=note",
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("items");
    expect(response.json()).toHaveProperty("total");
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
