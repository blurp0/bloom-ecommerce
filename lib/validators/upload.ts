import { z } from "zod";

export const UploadParamsSchema = z.strictObject({
  folder: z.enum(["products", "custom-requests"]),
});

export type UploadParamsInput = z.infer<typeof UploadParamsSchema>;
