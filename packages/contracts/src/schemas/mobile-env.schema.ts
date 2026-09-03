import { z } from "zod";

export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_APP_NAME: z.string().trim().min(1).max(100).default("Workspace"),
});

export type MobileEnv = z.infer<typeof mobileEnvSchema>;
