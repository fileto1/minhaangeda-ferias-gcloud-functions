import { db } from "../../firebase";
import { Employee } from "./employee.model";

const COLLECTION = "employees";

export class EmployeeRepository {
  async create(data: any) {
    const doc = await db.collection(COLLECTION).add(data);
    return { id: doc.id, ...data };
  }

  async save(employee: Employee): Promise<Employee> {
    const doc = await db.collection(COLLECTION).add(employee);
    return { ...employee, uid: doc.id };
  }

  async findAll(): Promise<Employee[]> {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Employee[];
  }
}
