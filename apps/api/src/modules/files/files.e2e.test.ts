import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ClsModule } from "nestjs-cls";
import { TsRestModule } from "@ts-rest/nest";
import { FilesModule } from "./files.module";
import { StorageService } from "../../infrastructure/storage/storage.service";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { ok } from "neverthrow";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://admin:password@localhost:27017/app?authSource=admin";

describe("FilesController E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        MongooseModule.forRoot(MONGODB_URI),
        TsRestModule,
        FilesModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue({
        getPresignedUploadUrl: vi.fn().mockResolvedValue(ok("https://s3.example.com/upload")),
        getPresignedDownloadUrl: vi.fn().mockResolvedValue(ok("https://s3.example.com/download")),
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

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /api/files should return files list", async () => {
    const response = await app.getHttpServer().get("/api/files?parentType=note");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("total");
  });
});
