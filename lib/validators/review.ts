import { z } from "zod";

export const CreateReviewSchema = z.strictObject({
  rating: z.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
