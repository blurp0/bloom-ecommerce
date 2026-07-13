import { z } from 'zod';

/**
 * Schema for creating a review.
 * Rating is required (1–5), text is optional (1–500 chars after trimming).
 */
export const CreateReviewSchema = z.strictObject({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z
    .string()
    .max(500, 'Review must be 500 characters or less')
    .optional()
    .transform(v => (v ? v.trim() : undefined))
    .refine(v => !v || v.length > 0, 'Review cannot be only whitespace'),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
