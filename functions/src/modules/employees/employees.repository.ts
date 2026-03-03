//employees.repository.ts
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { EmployeeEntity } from "./models/EmployeeEntity";

const db = getFirestore();
export const EMPLOYEES_COLLECTION = "employees";

class EmployeesRepository {
  /* ===============================
   * BY UID
   * =============================== */
  async findByUid(uid: string): Promise<EmployeeEntity | null> {
    const snap = await db.collection(EMPLOYEES_COLLECTION).doc(uid).get();

    if (!snap.exists) return null;

    const data = snap.data() as Omit<EmployeeEntity, "uid">;

    if (data.deleted) return null;

    return {
      uid: snap.id,
      ...data,
    };
  }

  /* ===============================
   * BY EMAIL
   * =============================== */
  async findByEmail(email: string): Promise<EmployeeEntity | null> {
    const snap = await db
      .collection(EMPLOYEES_COLLECTION)
      .where("email", "==", email)
      .where("deleted", "==", false)
      .limit(1)
      .get();

    if (snap.empty) return null;

    const d = snap.docs[0];
    const data = d.data() as Omit<EmployeeEntity, "uid">;

    return {
      uid: d.id,
      ...data,
    };
  }

  /* ===============================
   * ALL (NOT DELETED)
   * =============================== */
  async findAll(): Promise<EmployeeEntity[]> {
    const snap = await db.collection(EMPLOYEES_COLLECTION).where("deleted", "==", false).get();

    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<EmployeeEntity, "uid">),
    }));
  }

  /* ===============================
   * ALL NOT ADMIN
   * =============================== */
  async findAllNotAdmin(): Promise<EmployeeEntity[]> {
    const snap = await db
      .collection(EMPLOYEES_COLLECTION)
      .where("role", "!=", "ADMIN")
      .where("deleted", "==", false)
      .get();

    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<EmployeeEntity, "uid">),
    }));
  }

  async create(uid: string, data: Omit<EmployeeEntity, "uid">) {
    const ref = db.collection(EMPLOYEES_COLLECTION).doc(uid);
    await ref.set(data);

    return {
      uid,
      ...data,
    };
  }

  async update(id: string, data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    const employeeRef = db.collection(EMPLOYEES_COLLECTION).doc(id);

    await employeeRef.update({
      ...data,
      updatedAt: Timestamp.now(),
    });

    const updatedSnapshot = await employeeRef.get();
    return updatedSnapshot.data() as EmployeeEntity;
  }
}

export const employeesRepository = new EmployeesRepository();
