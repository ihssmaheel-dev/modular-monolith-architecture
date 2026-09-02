import { z } from "zod";

export const EmptyResponseSchema = z.undefined().or(z.null()).or(z.void());

export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
