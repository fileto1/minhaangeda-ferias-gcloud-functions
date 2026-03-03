import { Timestamp } from "firebase-admin/firestore";

export interface EmployeeEntity {
  uid: string;
  name: string;
  email: string;
  enabled: boolean;
  forceResetPassword: boolean;
  role?: any;
  birthDate?: Timestamp;
  hiringDate?: Timestamp;
  deleted: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deletedAt?: Timestamp;
}
