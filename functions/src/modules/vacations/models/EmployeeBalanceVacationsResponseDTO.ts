// modules/employeesVacation/dtos/EmployeeBalanceVacationsResponseDTO.ts
import { EmployeeDto } from "../../employees/models";

export class EmployeeBalanceVacationsResponseDTO {
  readonly balanceDays: number;
  readonly usedDays: number;
  readonly referenceYear: string;
  readonly employee: EmployeeDto;

  constructor(
    balanceDays: number,
    usedDays: number,
    referenceYear: string,
    employee: EmployeeDto,
  ) {
    this.balanceDays = balanceDays;
    this.usedDays = usedDays;
    this.referenceYear = referenceYear;
    this.employee = employee;
  }
}
