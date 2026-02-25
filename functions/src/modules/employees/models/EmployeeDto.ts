// modules/employees/dtos/EmployeeDto.ts

import { EmployeeEntity } from "./EmployeeEntity";

export interface EmployeeRole {
  id?: string;
  name: string;
}

export class EmployeeDto {
  readonly uid: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly forceResetPassword: boolean;
  readonly role?: EmployeeRole;
  readonly birthDate?: string;
  readonly hiringDate?: string;
  readonly ceo: boolean;

  constructor(employee: EmployeeEntity) {
    this.uid = employee.uid;
    this.name = employee.name;
    this.enabled = employee.enabled;
    this.forceResetPassword = employee.forceResetPassword;
    this.role = employee.role;
    this.birthDate = employee.birthDate;
    this.hiringDate = employee.hiringDate;
    this.ceo = employee.ceo;
  }
}
