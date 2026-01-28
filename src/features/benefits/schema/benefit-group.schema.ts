import { z } from "zod";

export const benefitGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teamId: z.string().optional(),
  description: z.string().optional(),
  rules: z
    .object({
      onlyConfirmed: z.boolean().optional(),
      minMonths: z.coerce.number().optional(),
      minAge: z.coerce.number().optional(),
      departments: z.array(z.string()).optional(),
      employmentTypes: z.array(z.string()).optional(),
    })
    .optional(),
});

export type BenefitGroupFormValues = z.infer<typeof benefitGroupSchema>;
