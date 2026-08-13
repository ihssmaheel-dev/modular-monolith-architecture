# Storage infrastructure

`StorageService` provides one file-storage interface while selecting the configured driver at startup.

## Transfer behaviour

| Driver   | Upload                            | Download                          |
| -------- | --------------------------------- | --------------------------------- |
| `s3`     | Short-lived, direct presigned URL | Short-lived, direct presigned URL |
| `gridfs` | Authenticated, streamed API proxy | Authenticated, streamed API proxy |

GridFS cannot issue object-store presigned URLs. The file API therefore returns `uploadMode: "proxy"` with an upload-specific file key after metadata has been accepted. Web clients upload the bytes with `PUT` to that URL using `application/octet-stream`, then call the normal confirmation endpoint. GridFS proxy downloads are available at the URL returned by the normal download-URL endpoint.

The proxy routes stay behind the global authentication, tenant context, permission, idempotency, rate-limit, origin-validation, tracing, and error layers. They intentionally use native Fastify streaming rather than ts-rest because ts-rest contracts cannot describe a true streaming binary request body.

## Integrity and limits

- Binary streams are capped at their approved file size (maximum `MAX_FILE_SIZE_BYTES`, 10 MB); normal API JSON remains limited to 1 MB.
- A pending record is atomically claimed as `uploading` before GridFS writes. Only matching content type and byte size move it to `uploaded`.
- Upload failures release the record back to `pending`; an upload retry removes any partial GridFS object before writing.
- Download routes expose only `uploaded` files owned by the requesting user (or an administrator) and send a safe attachment filename.

Use `StorageService` from application commands and queries. Do not import S3 or GridFS drivers from a module directly.
