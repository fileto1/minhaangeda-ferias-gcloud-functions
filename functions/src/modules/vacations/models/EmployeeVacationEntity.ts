import { EmployeeVacationStatusEnum } from "./EmployeeVacationStatusEnum";

export interface EmployeeVacationEntity {
  id: string; // doc.id
  employeeUid: string; // referência ao employee
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes?: string;
  daysQuantity: number;
  balanceUsedDays: number;
  status: EmployeeVacationStatusEnum;
  deleted: boolean;

  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  deletedAt?: FirebaseFirestore.Timestamp;
}
