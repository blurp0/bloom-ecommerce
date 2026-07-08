import { z } from "zod";

export const CreateCustomRequestSchema = z.strictObject({
  flowers: z.string().min(1, "Flowers description is required"),
  colors: z.string().min(1, "Colors description is required"),
  size: z.string().min(1, "Size is required"),
  occasion: z.string().optional(),
  budget: z.string().optional(),
  instructions: z.string().max(1000, "Instructions cannot exceed 1000 characters").optional(),
  referenceImages: z.array(z.string().url("Each reference image must be a valid URL")).max(5, "Cannot exceed 5 reference images"),
});

export const CreateProposalSchema = z.strictObject({
  designConcept: z.string().min(10, "Design concept must be at least 10 characters"),
  price: z.number().positive("Price must be a positive number"),
  estimatedDelivery: z.string().datetime({ message: "Invalid ISO date string" }).refine((val) => {
    return new Date(val) > new Date();
  }, { message: "Estimated delivery must be in the future" }),
});

export type CreateCustomRequestInput = z.infer<typeof CreateCustomRequestSchema>;
export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;
