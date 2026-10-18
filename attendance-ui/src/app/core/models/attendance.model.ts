export interface AttendanceRecord {
  id: number;
  employeeId: number;
  workDate: string;
  checkIn: string;
  checkOut: string | null;
  workingHours: number | null;
}
