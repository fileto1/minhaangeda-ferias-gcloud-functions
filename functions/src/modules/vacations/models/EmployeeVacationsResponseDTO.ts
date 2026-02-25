// modules/employeesVacation/dtos/EmployeeVacationsResponseDTO.ts
import { EmployeeVacationItemDTO } from './EmployeeVacationItemDTO';

export class EmployeeVacationsResponseDTO {
  readonly balanceDays: number;
  readonly usedDays: number;
  readonly referenceYear: string;
  readonly employeeVacationItems: EmployeeVacationItemDTO[];

  constructor(
    balanceDays: number,
    usedDays: number,
    referenceYear: string,
    employeeVacationItems: EmployeeVacationItemDTO[]
  ) {
    this.balanceDays = balanceDays;
    this.usedDays = usedDays;
    this.referenceYear = referenceYear;
    this.employeeVacationItems = employeeVacationItems;
  }
}