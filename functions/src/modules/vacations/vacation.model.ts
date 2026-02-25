export interface Vacation {
  id?: string;
  employeeId: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
}