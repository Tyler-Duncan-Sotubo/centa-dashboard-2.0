import { z } from "zod";

export const attendanceReportResponseSchema = z.object({
  dailySummary: z
    .object({
      dashboard: z.any().optional(),
    })
    .optional(),
  monthlySummary: z.array(z.any()).optional(),
});
