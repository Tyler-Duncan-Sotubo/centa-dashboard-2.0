export type AttendanceStatus = "present" | "late" | "absent";

export type AttendanceRecord = {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
};
