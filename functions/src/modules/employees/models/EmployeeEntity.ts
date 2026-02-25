export interface EmployeeEntity {
  uid: string;
  name: string;
  email?: string;
  enabled: boolean;
  forceResetPassword: boolean;
  role?: any;
  birthDate?: string;
  hiringDate?: string;
  ceo: boolean;
  deleted: boolean;
}
