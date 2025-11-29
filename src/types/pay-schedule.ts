export interface PaySchedule {
  id: string;
  companyId: string;
  startDate: string;
  paySchedule: string[];
  payFrequency: "weekly" | "biweekly" | "monthly" | "semi-monthly";
  weekendAdjustment: "friday" | "monday" | "none";
  holidayAdjustment: "previous" | "next" | "none";
  createdAt: string;
  updatedAt: string;
}
