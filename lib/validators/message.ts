import { z } from "zod";

export const SendMessageSchema = z.strictObject({
  content: z.string().min(1, "Message content is required").max(1000, "Message cannot exceed 1000 characters"),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
