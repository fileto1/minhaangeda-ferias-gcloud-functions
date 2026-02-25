// modules/employeesVacation/dtos/EmployeeWithVacationsResponseDTO.ts

import { EmployeeDto } from "../../employees/models";

export class EmployeeWithVacationsResponseDTO {
  readonly employee: EmployeeDto;
  readonly containsVacationToApprove: boolean;
  readonly balanceDays: number | null;
  readonly usedDays: number | null;

  constructor(
    employee: EmployeeDto,
    containsVacationToApprove: boolean,
    balanceDays: number | null,
    usedDays: number | null
  ) {
    this.employee = employee;
    this.containsVacationToApprove = containsVacationToApprove;
    this.balanceDays = balanceDays;
    this.usedDays = usedDays;
  }
}