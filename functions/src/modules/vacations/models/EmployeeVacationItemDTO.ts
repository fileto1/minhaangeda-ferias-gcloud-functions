// modules/employeesVacation/dtos/EmployeeVacationItemDTO.ts
import { EmployeeDto } from '../../employees/models';
import { EmployeeVacationStatusEnum } from './EmployeeVacationStatusEnum';

export class EmployeeVacationItemDTO {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes?: string;
  readonly daysQuantity: number;
  readonly balanceUsedDays: number;
  readonly realUsedDays: number;
  readonly status: EmployeeVacationStatusEnum;
  readonly employee: EmployeeDto;

  constructor(employeeVacation: any, realUsedDays: number) {
    this.id = employeeVacation.id;
    this.startDate = employeeVacation.startDate;
    this.endDate = employeeVacation.endDate;
    this.notes = employeeVacation.notes;
    this.daysQuantity = employeeVacation.daysQuantity;
    this.balanceUsedDays = employeeVacation.balanceUsedDays;
    this.realUsedDays = realUsedDays;
    this.status = employeeVacation.status as EmployeeVacationStatusEnum;
    this.employee = new EmployeeDto(employeeVacation.employee);
  }
}