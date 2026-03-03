export interface EmployeeFormRequest {
  uid: string;
  name: string;
  email?: string;
  role?: string;
  enabled?: boolean;
  password?: string;
  birthDate?: string;
  hiringDate?: string;
}
