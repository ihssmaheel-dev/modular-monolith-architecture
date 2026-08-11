import { Readable } from "stream";
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
    const stream = this.toReadable(body);
    const uploadStream = this.bucket.openUploadStream(key, {
      metadata: { key, contentType },
    });

    await new Promise<void>((resolve, reject) => {
      stream.pipe(uploadStream);
      uploadStream.on("error", reject);
      uploadStream.on("finish", resolve);
    });

    return { key, url: `/gridfs/${BUCKET_NAME}/${key}` };
  }

  async getPresignedUploadUrl(_key: string, _contentType?: string, _ttlSeconds?: number) {
    if (_contentType || _ttlSeconds) {
      /* unused */
    }
    return `/gridfs/${BUCKET_NAME}/${_key}`;
  }

  async getPresignedDownloadUrl(key: string, _ttlSeconds?: number) {
    if (_ttlSeconds) {
      /* unused */
    }
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

  async getMetadata(key: string) {
    const file = await this.bucket.find({ "metadata.key": key }).next();
    if (!file) return null;
    const metadata = file.metadata as Record<string, unknown> | undefined;
    return {
      size: file.length,
      contentType: typeof metadata?.contentType === "string" ? metadata.contentType : undefined,
    };
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
