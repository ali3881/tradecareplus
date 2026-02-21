import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(), // Make optional for dev if not strictly needed immediately
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errorMsg = "❌ Invalid environment variables: " + JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
  
  // In production, we crash the app to avoid running with bad config
  if (process.env.NODE_ENV === "production") {
    console.error(errorMsg);
    throw new Error("Invalid environment variables");
  } else {
    // In development, we warn but allow execution
    console.warn(errorMsg);
  }
}

// Export the parsed environment variables, or fallback to process.env
// We cast to any to avoid strict type checks blocking compilation if we return process.env
export const env = parsed.success 
  ? parsed.data 
  : (process.env as any);
