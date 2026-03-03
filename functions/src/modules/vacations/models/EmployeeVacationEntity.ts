import { EmployeeVacationStatusEnum } from "./EmployeeVacationStatusEnum";
import { Timestamp } from "firebase-admin/firestore";

export interface EmployeeVacationEntity {
  id: string;
  employeeUid: string;
  employeeName: string;

  startDate: Timestamp;
  endDate: Timestamp;

  notes?: string;
  daysQuantity: number;
  balanceUsedDays: number;
  status: EmployeeVacationStatusEnum;
  deleted: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deletedAt?: Timestamp;
}
