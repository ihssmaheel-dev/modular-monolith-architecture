import { describe, expect, it } from "vitest";
import { validateMagicBytes } from "./magic-bytes.utils";

describe("validateMagicBytes", () => {
  it("validates PNG signatures accurately", () => {
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const fakePng = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // DOS / EXE header

    expect(validateMagicBytes(validPng, "image/png")).toBe(true);
    expect(validateMagicBytes(fakePng, "image/png")).toBe(false);
  });

  it("validates JPEG signatures accurately", () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const invalidJpeg = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    expect(validateMagicBytes(validJpeg, "image/jpeg")).toBe(true);
    expect(validateMagicBytes(invalidJpeg, "image/jpeg")).toBe(false);
  });

  it("validates PDF signatures accurately", () => {
    const validPdf = Buffer.from("%PDF-1.7 header content", "utf-8");
    const fakePdf = Buffer.from("MZ binary executable", "utf-8");

    expect(validateMagicBytes(validPdf, "application/pdf")).toBe(true);
    expect(validateMagicBytes(fakePdf, "application/pdf")).toBe(false);
  });

  it("validates text/csv and text/json preventing binary files disguised as text", () => {
    const validJson = Buffer.from(JSON.stringify({ hello: "world" }), "utf-8");
    const binaryWithNull = Buffer.from([0x7b, 0x22, 0x00, 0x7d]);

    expect(validateMagicBytes(validJson, "application/json")).toBe(true);
    expect(validateMagicBytes(binaryWithNull, "application/json")).toBe(false);
  });

  it("returns false for empty buffers", () => {
    expect(validateMagicBytes(Buffer.alloc(0), "image/png")).toBe(false);
  });
});
