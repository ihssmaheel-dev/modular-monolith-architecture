import Constants from 'expo-constants'
import { z } from 'zod'

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
})

export type MobileEnv = z.infer<typeof envSchema>

export function getMobileEnv(): MobileEnv {
  const raw = {
    EXPO_PUBLIC_API_URL:
      process.env.EXPO_PUBLIC_API_URL ??
      (Constants.expoConfig?.extra as Record<string, string> | undefined)?.EXPO_PUBLIC_API_URL ??
      (Constants.manifest as unknown as { extra?: Record<string, string> } | null)?.extra?.EXPO_PUBLIC_API_URL,
  }
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) return envSchema.parse({})
  return parsed.data
}
