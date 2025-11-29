import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headId: z.string().min(0).optional(),
});
