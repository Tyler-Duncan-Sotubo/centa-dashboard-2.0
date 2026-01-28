import { z } from "zod";

export const benefitSchema = z.object({
  name: z.string().min(1, "Benefit name is required"),
  description: z.string().optional(),
  coverageOptions: z.array(z.string()).min(1, "Benefit name is required"),
  cost: z.record(z.string(), z.string()).optional(),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date().optional(),
  split: z.enum(["employee", "employer", "shared"]),
  employerContribution: z.coerce
    .number()
    .min(0, "Employer contribution must be at least 0"),
  benefitGroupId: z.string().uuid({
    message: "Benefit group ID must be a valid UUID",
  }),
});
