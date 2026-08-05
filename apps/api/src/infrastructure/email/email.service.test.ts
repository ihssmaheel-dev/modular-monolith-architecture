import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./email.service";

const mockSendMail = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "resend-123" }, error: null }),
    },
  })),
}));

vi.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    REDIS_URL: "redis://localhost:6379",
    S3_ENDPOINT: "localhost",
    S3_REGION: "us-east-1",
    S3_BUCKET: "test",
    S3_ACCESS_KEY_ID: "test",
    S3_SECRET_ACCESS_KEY: "test",
    S3_FORCE_PATH_STYLE: true,
    EMAIL_DRIVER: "smtp",
    RESEND_API_KEY: "",
    EMAIL_FROM: "test@example.com",
    SMTP_HOST: "localhost",
    SMTP_PORT: 1025,
    SMTP_USER: "",
    SMTP_PASS: "",
  },
}));

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockLogger = { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() } as any;
    mockLogger.child = () => mockLogger;
    const mockMetrics = {
      setGauge: vi.fn(),
      incrementCounter: vi.fn(),
    } as any;
    service = new EmailService(mockLogger, mockMetrics);
  });

  it("should send email via SMTP", async () => {
    mockSendMail.mockResolvedValue({ messageId: "smtp-123" });
    const result = await service.send({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.provider).toBe("smtp");
    }
  });

  it("should return error for empty recipients", async () => {
    const result = await service.send({
      to: [],
      subject: "Test",
      html: "<p>Hello</p>",
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe("INVALID_ADDRESS");
    }
  });

  it("should return error on SMTP failure", async () => {
    mockSendMail.mockRejectedValue(new Error("SMTP error"));
    const result = await service.send({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe("SEND_FAILED");
    }
  });
});
