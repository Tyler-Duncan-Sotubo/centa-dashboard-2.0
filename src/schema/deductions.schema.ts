import { z } from "zod";

export const DeductionSchema = z.object({
  amount: z.coerce.number().default(50),
  deduction_name: z.string({
    message: "Please enter a name",
  }),
  employeeId: z.string({
    message: "Please select an employee",
  }),
  reason: z.string().min(1, "Please enter a reason"),
});

export type DeductionType = z.infer<typeof DeductionSchema>;

export const RateTypeEnum = z.enum(["fixed", "percentage"]);

export const CreateEmployeeDeductionSchema = z.object({
  employeeId: z
    .string({ required_error: "Employee is required" })
    .uuid("Invalid employee ID"),

  deductionTypeId: z
    .string({ required_error: "Deduction type is required" })
    .uuid("Invalid deduction type"),

  rateType: RateTypeEnum,

  rateValue: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Rate value must be a valid number",
    }),

  startDate: z
    .string({ required_error: "Start date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),

  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),

  metadata: z.record(z.any()).optional(),

  isActive: z.boolean().optional().default(true),
});
