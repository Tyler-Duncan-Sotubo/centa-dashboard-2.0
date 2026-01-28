export type ShiftEvent = {
  id: string;
  employeeName: string;
  shiftName: string;
  date: string;
  startTime: string;
  endTime: string;
  jobTitle?: string;
  employeeId: string;
  locationId: string;
  shiftId: string;
};

export type CreateShiftEventPrefill = {
  employeeId: string;
  date: string;
  shiftId: string;
  employeeName: string;
  locationId: string;
};
