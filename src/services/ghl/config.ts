import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  VITE_REDIRECT_URI: z.string().url()
});

// Validate environment variables
const env = envSchema.parse(import.meta.env);

export const GHL_CONFIG = {
  BASE_URL: 'https://api.gohighlevel.com',
  REDIRECT_URI: env.VITE_REDIRECT_URI,
} as const;

export const API_VERSION = '2021-07-28';