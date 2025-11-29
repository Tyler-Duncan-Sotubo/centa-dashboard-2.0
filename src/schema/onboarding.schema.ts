import { z } from "zod";

export const OnboardingSchema = z.object({
  logo_url: z.string().optional(),
  name: z.string().min(2, "Company name is required"),
  country: z.string().min(2, "Country is required"),
  primaryContactName: z.string().min(2, "Primary contact name is required"),
  regNo: z.string().min(2, "Registration number is required"),
  primaryContactEmail: z
    .string()
    .email("Enter a valid email")
    .min(5, "Email is required"),
  primaryContactPhone: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

export type OnboardingSchemaType = z.infer<typeof OnboardingSchema>;
