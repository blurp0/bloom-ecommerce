import { z } from "zod";

export const SendMessageSchema = z.strictObject({
  text: z.string().min(1, "Message cannot be empty").max(500, "Message cannot exceed 500 characters"),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
