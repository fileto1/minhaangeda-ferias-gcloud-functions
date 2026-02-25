// modules/employeesVacation/dtos/EmployeeVacationStatusEnum.ts
export enum EmployeeVacationStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export function vacationStatusFromString(
  value: string
): EmployeeVacationStatusEnum | null {
  try {
    return EmployeeVacationStatusEnum[value.toUpperCase() as keyof typeof EmployeeVacationStatusEnum];
  } catch {
    return null;
  }
}