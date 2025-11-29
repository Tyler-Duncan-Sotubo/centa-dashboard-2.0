import { z } from "zod";

export const salaryBreakdownSchema = z.object({
  basic: z.coerce
    .number()
    .min(0, { message: "Basic must be at least 0%" })
    .max(100, { message: "Basic cannot exceed 100%" }),

  housing: z.coerce
    .number()
    .min(0, { message: "Housing must be at least 0%" })
    .max(100, { message: "Housing cannot exceed 100%" }),

  transport: z.coerce
    .number()
    .min(0, { message: "Transport must be at least 0%" })
    .max(100, { message: "Transport cannot exceed 100%" }),

  allowances: z
    .array(
      z.object({
        allowance_type: z.string().nonempty(),
        allowance_percentage: z.coerce
          .number()
          .min(0, { message: "Allowance percentage must be at least 0%" })
          .max(100, { message: "Allowance percentage cannot exceed 100%" }),
      })
    )
    .optional(), // Allow empty allowances
});

export type salaryBreakdownType = z.infer<typeof salaryBreakdownSchema>;
