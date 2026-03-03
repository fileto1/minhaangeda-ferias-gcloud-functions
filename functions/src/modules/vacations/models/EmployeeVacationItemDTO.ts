// modules/employeesVacation/dtos/EmployeeVacationItemDTO.ts
import { DateUtils } from "../../../shared/utils/date.utils";
import { EmployeeVacationEntity } from "./EmployeeVacationEntity";
import { EmployeeVacationStatusEnum } from "./EmployeeVacationStatusEnum";

export class EmployeeVacationItemDTO {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes?: string;
  readonly daysQuantity: number;
  readonly balanceUsedDays: number;
  readonly realUsedDays: number;
  readonly status: EmployeeVacationStatusEnum;
  readonly employeeUid: string;
  readonly employeeName: string;
  readonly splited: boolean;

  constructor(employeeVacation: EmployeeVacationEntity, realUsedDays: number, splited: boolean = false) {
    this.id = employeeVacation.id;
    this.startDate = DateUtils.toISO(employeeVacation.startDate)!;
    this.endDate = DateUtils.toISO(employeeVacation.endDate)!;
    this.notes = employeeVacation.notes;
    this.daysQuantity = employeeVacation.daysQuantity;
    this.balanceUsedDays = employeeVacation.balanceUsedDays;
    this.realUsedDays = realUsedDays;
    this.status = employeeVacation.status as EmployeeVacationStatusEnum;
    this.employeeUid = employeeVacation.employeeUid;
    this.employeeName = employeeVacation.employeeName;
    this.splited = splited;
  }
}
