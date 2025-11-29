import { z } from "zod";

export const jobRoleSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  level: z.enum(["entry", "junior", "mid", "senior", "lead"], {
    required_error: "Level is required",
  }),
  description: z.string().min(1, { message: "Description is required" }),
});

export type JobRoleFormValues = z.infer<typeof jobRoleSchema>;
