import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  applyPaye: z.boolean().default(false),
  applyPension: z.boolean().default(false),
  applyNhf: z.boolean().default(false),
  payScheduleId: z.string().default(""),
});

export type GroupSchemaType = z.infer<typeof groupSchema>;
