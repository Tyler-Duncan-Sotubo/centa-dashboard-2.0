import { format, isToday, isYesterday } from "date-fns";

export function formatDateHumanReadable(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "PPP"); // e.g., Jan 3, 2025
}
