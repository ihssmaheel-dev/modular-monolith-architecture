import { Readable } from "stream";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, GridFSBucket, ObjectId } from "mongoose";
import { StorageDriver, FileInput, PRESIGN_TTL_SECONDS } from "./storage.types";

const BUCKET_NAME = "uploads";

export class GridFsDriver implements StorageDriver {
  private bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db!, { bucketName: BUCKET_NAME });
  }

  async upload(key: string, body: FileInput, contentType: string) {
    const stream = this.toReadable(body);
    const uploadStream = this.bucket.openUploadStream(key, {
      contentType,
      metadata: { key },
    });

    await new Promise<void>((resolve, reject) => {
      stream.pipe(uploadStream);
      uploadStream.on("error", reject);
      uploadStream.on("finish", resolve);
    });

    return { key, url: `/gridfs/${BUCKET_NAME}/${key}` };
  }

  async getPresignedUploadUrl(key: string, _contentType: string, _ttlSeconds?: number) {
    return `/gridfs/${BUCKET_NAME}/${key}`;
  }

  async getPresignedDownloadUrl(key: string, _ttlSeconds?: number) {
    const file = await this.bucket.find({ "metadata.key": key }).next();
    if (!file) throw new Error("File not found");
    return `/gridfs/${BUCKET_NAME}/${key}`;
  }

  async delete(key: string) {
    const file = await this.bucket.find({ "metadata.key": key }).next();
    if (file) {
      await this.bucket.delete(file._id);
    }
  }

  async download(key: string): Promise<Readable> {
    const file = await this.bucket.find({ "metadata.key": key }).next();
    if (!file) throw new Error("File not found");
    return this.bucket.openDownloadStream(file._id);
  }

  private toReadable(input: FileInput): Readable {
    if (input instanceof Readable) return input;
    if (input instanceof Buffer) return Readable.from(input);
    return Readable.fromWeb(input as ReadableStream);
  }
}
