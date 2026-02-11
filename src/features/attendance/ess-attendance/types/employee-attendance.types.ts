export type AttendanceStatus = "present" | "late" | "absent" | "weekend";

export type AttendanceRecord = {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
};
