import { z } from "zod";

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  employeeId: z.string().min(1, "Employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
  partialDay: z.enum(["AM", "PM"]).optional(),
});

export type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;

export const leaveFormSchema = z.object({
  review: z.enum(["approved", "rejected"], {
    message: "Review status is required",
  }),
  rejectionReason: z.string().optional(),
});

export type LeaveFormType = z.infer<typeof leaveFormSchema>;
