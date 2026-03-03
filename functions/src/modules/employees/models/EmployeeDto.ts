import { EmployeeEntity } from "./EmployeeEntity";
import { DateUtils } from "../../../shared/utils/date.utils";

export interface EmployeeRole {
  id?: string;
  name: string;
}

export class EmployeeDto {
  readonly uid: string;
  readonly name: string;
  readonly email: string;
  readonly enabled: boolean;
  readonly forceResetPassword: boolean;
  readonly role?: EmployeeRole;
  readonly birthDate?: string;
  readonly hiringDate?: string;

  constructor(employee: EmployeeEntity) {
    this.uid = employee.uid;
    this.name = employee.name;
    this.email = employee.email;
    this.enabled = employee.enabled;
    this.forceResetPassword = employee.forceResetPassword;
    this.role = employee.role;

    this.birthDate = DateUtils.toISO(employee.birthDate);
    this.hiringDate = DateUtils.toISO(employee.hiringDate);
  }
}
