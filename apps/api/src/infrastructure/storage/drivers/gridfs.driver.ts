import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import mongoose, { Connection } from "mongoose";
import { StorageDriver, FileInput } from "../storage.types";

const BUCKET_NAME = "uploads";

type GridFSBucket = InstanceType<typeof mongoose.mongo.GridFSBucket>;

export class GridFsDriver implements StorageDriver {
  private bucket: GridFSBucket;

  constructor(private readonly connection: Connection) {
    // mongoose instance should be available or passed, but for now we can just import it.
    this.bucket = new mongoose.mongo.GridFSBucket(this.connection.db!, { bucketName: BUCKET_NAME });
  }

  async upload(key: string, body: FileInput, contentType: string) {
    await this.delete(key);
    const uploadStream = this.bucket.openUploadStream(key, {
      metadata: { key, contentType },
    });

    try {
      await pipeline(this.toReadable(body), uploadStream);
    } catch (error) {
      await uploadStream.abort().catch(() => undefined);
      throw error;
    }

    return { key, url: `/gridfs/${BUCKET_NAME}/${key}` };
  }

  async getPresignedUploadUrl(): Promise<string> {
    throw new Error("GridFS does not support direct upload URLs");
  }

  async getPresignedDownloadUrl(): Promise<string> {
    throw new Error("GridFS does not support direct download URLs");
  }

  async delete(key: string) {
    const files = await this.bucket.find({ "metadata.key": key }).toArray();
    await Promise.all(files.map((file) => this.bucket.delete(file._id)));
  }

  async getMetadata(key: string) {
    const file = await this.bucket.find({ "metadata.key": key }).next();
    if (!file) return null;
    const metadata = file.metadata as Record<string, unknown> | undefined;
    return {
      size: file.length,
      contentType: typeof metadata?.contentType === "string" ? metadata.contentType : undefined,
    };
  }

  async getDownloadStream(key: string): Promise<Readable> {
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
