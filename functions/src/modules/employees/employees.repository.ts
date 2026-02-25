import { getFirestore } from "firebase-admin/firestore";
import { EmployeeEntity } from "./models/EmployeeEntity";

const db = getFirestore();
const COLLECTION = "employees";

class EmployeesRepository {
  /* ===============================
   * BY UID
   * =============================== */
  async findByUid(uid: string): Promise<EmployeeEntity | null> {
    const snap = await db.collection(COLLECTION).doc(uid).get();

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
      .collection(COLLECTION)
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
    const snap = await db
      .collection(COLLECTION)
      .where("deleted", "==", false)
      .get();

    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<EmployeeEntity, "uid">),
    }));
  }

  /* ===============================
   * ALL NOT CEO
   * =============================== */
  async findAllNotCeo(): Promise<EmployeeEntity[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("ceo", "==", false)
      .where("deleted", "==", false)
      .get();

    return snap.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<EmployeeEntity, "uid">),
    }));
  }
}

export const employeesRepository = new EmployeesRepository();
