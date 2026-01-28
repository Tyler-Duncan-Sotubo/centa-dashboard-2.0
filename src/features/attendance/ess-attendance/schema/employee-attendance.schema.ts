import { z } from "zod";

export const attendanceRecordSchema = z.object({
  date: z.string(),
  checkInTime: z.string().nullable(),
  checkOutTime: z.string().nullable(),
  status: z.enum(["present", "late", "absent"]),
});

export const attendanceMonthResponseSchema = z.object({
  data: z.object({
    data: z.object({
      summaryList: z.array(attendanceRecordSchema),
    }),
  }),
});

export type AttendanceRecordSchema = z.infer<typeof attendanceRecordSchema>;
