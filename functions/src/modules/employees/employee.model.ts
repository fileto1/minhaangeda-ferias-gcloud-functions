import { Timestamp } from "firebase-admin/firestore";

export interface Employee {
  uid: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  departmentId?: string;
  active: boolean;
  createdAt: Timestamp;
}
