import { z } from "zod";

export const locationTypeSchema = z.enum(["OFFICE", "HOME", "REMOTE"]);

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  locationType: locationTypeSchema.default("OFFICE"),

  street: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
