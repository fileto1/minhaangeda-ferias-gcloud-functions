// modules/employeesVacation/dtos/EmployeeVacationItemFormRequest.ts
export interface EmployeeVacationItemFormRequest {
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  employeeUid: string;
  notes?: string;
}