/**
 * Utility to inspect buffer header magic bytes and verify matching MIME types
 * protecting against content-type spoofing and disguised executable payloads.
 */

function matchBytes(buffer: Buffer, bytes: number[], offset = 0): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length === 0) return false;

  const normalizedMime = mimeType.toLowerCase().trim();

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (normalizedMime === "image/png") {
    return matchBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }

  // 2. JPEG / JPG: FF D8 FF
  if (normalizedMime === "image/jpeg" || normalizedMime === "image/jpg") {
    return matchBytes(buffer, [0xff, 0xd8, 0xff]);
  }

  // 3. GIF: GIF87a or GIF89a
  if (normalizedMime === "image/gif") {
    return (
      matchBytes(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
      matchBytes(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    );
  }

  // 4. WEBP: RIFF....WEBP
  if (normalizedMime === "image/webp") {
    return (
      matchBytes(buffer, [0x52, 0x49, 0x46, 0x46]) &&
      matchBytes(buffer, [0x57, 0x45, 0x42, 0x50], 8)
    );
  }

  // 5. PDF: %PDF- (25 50 44 46)
  if (normalizedMime === "application/pdf") {
    return matchBytes(buffer, [0x25, 0x50, 0x44, 0x46]);
  }

  // 6. ZIP and Office OpenXML (DOCX, XLSX, PPTX): 50 4B 03 04
  if (
    normalizedMime === "application/zip" ||
    normalizedMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    normalizedMime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return matchBytes(buffer, [0x50, 0x4b, 0x03, 0x04]);
  }

  // 7. Plain text / JSON / CSV: Verify no binary null bytes in initial chunk
  if (
    normalizedMime === "text/plain" ||
    normalizedMime === "text/csv" ||
    normalizedMime === "application/json"
  ) {
    const chunkLength = Math.min(buffer.length, 512);
    for (let i = 0; i < chunkLength; i++) {
      if (buffer[i] === 0x00) return false;
    }
    return true;
  }

  // Permissive default for unmapped application types (or SVG text)
  return true;
}
