import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000/api'),
  VITE_APP_NAME: z.string().default('Modular Monolith'),
})

export type WebEnv = z.infer<typeof envSchema>

function loadEnv(): WebEnv {
  // Vite exposes env via import.meta.env
  const raw = {
    VITE_API_URL: (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL,
    VITE_APP_NAME: (import.meta as unknown as { env: Record<string, string> }).env?.VITE_APP_NAME,
  }
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) {
    console.warn('Invalid web env, using defaults', parsed.error.flatten().fieldErrors)
    return envSchema.parse({})
  }
  return parsed.data
}

// Lazy to avoid SSR issues
let cached: WebEnv | null = null
export function getWebEnv(): WebEnv {
  if (cached) return cached
  // On server, import.meta.env may not be available — fallback to process.env
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    const serverRaw = {
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_APP_NAME: process.env.VITE_APP_NAME,
    }
    const parsed = envSchema.safeParse(serverRaw)
    cached = parsed.success ? parsed.data : envSchema.parse({})
    return cached
  }
  cached = loadEnv()
  return cached
}
