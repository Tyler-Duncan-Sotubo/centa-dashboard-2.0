import { z } from "zod";

export const assignAssetSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
});

export type AssignAssetSchema = z.infer<typeof assignAssetSchema>;
