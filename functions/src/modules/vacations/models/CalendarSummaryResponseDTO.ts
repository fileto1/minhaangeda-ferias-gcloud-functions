import { HolidayDto } from "../../holidays/models/HolidayDto";
import { EmployeeVacationItemDTO } from "./EmployeeVacationItemDTO";

export class CalendarSummaryResponseDTO {
  readonly vacations: EmployeeVacationItemDTO[];
  readonly holidays: HolidayDto[];

  constructor(vacations: EmployeeVacationItemDTO[], holidays: HolidayDto[]) {
    this.vacations = vacations;
    this.holidays = holidays;
  }
}
