import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DIRECT_DATABASE_URL: z.string().url("DIRECT_DATABASE_URL must be a valid URL").optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  NEXT_PUBLIC_ABLY_API_KEY: z.string().min(1, "NEXT_PUBLIC_ABLY_API_KEY is required"),
  ABLY_API_KEY: z.string().min(1, "ABLY_API_KEY is required"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n", JSON.stringify(parsed.error.format(), null, 2));
  throw new Error("Invalid environment variables. Please check your .env file.");
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
