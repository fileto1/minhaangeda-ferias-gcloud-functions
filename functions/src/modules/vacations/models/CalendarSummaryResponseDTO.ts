// modules/employeesVacation/dtos/CalendarSummaryResponseDTO.ts

import { Holiday } from '../../holidays/holidays.repository';
import { EmployeeVacationItemDTO } from './EmployeeVacationItemDTO';

export class CalendarSummaryResponseDTO {
  readonly vacations: EmployeeVacationItemDTO[];
  readonly holidays: Holiday[];

  constructor(
    vacations: EmployeeVacationItemDTO[],
    holidays: Holiday[]
  ) {
    this.vacations = vacations;
    this.holidays = holidays;
  }
}