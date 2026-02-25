import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { EmployeeVacationEntity } from "./models/EmployeeVacationEntity";

const db = getFirestore();
const COLLECTION = "vacations";

class VacationsRepository {
  /* ===============================
   * FIND BY ID (NOT DELETED)
   * =============================== */
  async findById(id: string): Promise<EmployeeVacationEntity | null> {
    const snap = await db.collection(COLLECTION).doc(id).get();

    if (!snap.exists) return null;

    const data = snap.data() as Omit<EmployeeVacationEntity, "id">;
    if (data.deleted) return null;

    return {
      id: snap.id,
      ...data,
    };
  }

  /* ===============================
   * BY EMPLOYEE
   * =============================== */
  async findByEmployee(employeeUid: string): Promise<EmployeeVacationEntity[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("employeeUid", "==", employeeUid)
      .where("deleted", "==", false)
      .orderBy("startDate", "desc")
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EmployeeVacationEntity, "id">),
    }));
  }

  /* ===============================
   * ALL PENDING
   * =============================== */
  async findAllPending(): Promise<EmployeeVacationEntity[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("status", "==", "PENDING")
      .where("deleted", "==", false)
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EmployeeVacationEntity, "id">),
    }));
  }

  /* ===============================
   * BY DATE RANGE + STATUS
   * =============================== */
  async findApprovedByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<EmployeeVacationEntity[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("endDate", ">=", startDate)
      .where("startDate", "<=", endDate)
      .where("status", "==", "APPROVED")
      .where("deleted", "==", false)
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EmployeeVacationEntity, "id">),
    }));
  }

  /* ===============================
   * APPROVED UNTIL DATE
   * =============================== */
  async findApprovedUntil(maxDate: string): Promise<EmployeeVacationEntity[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("startDate", "<", maxDate)
      .where("status", "==", "APPROVED")
      .where("deleted", "==", false)
      .orderBy("startDate", "desc")
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EmployeeVacationEntity, "id">),
    }));
  }

  /* ===============================
   * EXISTS IN RANGE
   * =============================== */
  async existsInRange(
    startDate: string,
    endDate: string,
    employeeUid: string,
  ): Promise<boolean> {
    const snap = await db
      .collection(COLLECTION)
      .where("employeeUid", "==", employeeUid)
      .where("endDate", ">=", startDate)
      .where("startDate", "<=", endDate)
      .where("deleted", "==", false)
      .limit(1)
      .get();

    return !snap.empty;
  }

  async existsInRangeExcept(
    startDate: string,
    endDate: string,
    employeeUid: string,
    exceptId: string,
  ): Promise<boolean> {
    const snap = await db
      .collection(COLLECTION)
      .where("employeeUid", "==", employeeUid)
      .where("endDate", ">=", startDate)
      .where("startDate", "<=", endDate)
      .where("deleted", "==", false)
      .get();

    return snap.docs.some((d) => d.id !== exceptId);
  }

  /* ===============================
   * CREATE / UPDATE / SOFT DELETE
   * =============================== */
  async create(
    data: Omit<EmployeeVacationEntity, "id" | "deleted">,
  ): Promise<void> {
    await db.collection(COLLECTION).add({
      ...data,
      deleted: false,
      createdAt: Timestamp.now(),
    });
  }

  async update(
    id: string,
    data: Partial<EmployeeVacationEntity>,
  ): Promise<void> {
    await db
      .collection(COLLECTION)
      .doc(id)
      .update({
        ...data,
        updatedAt: Timestamp.now(),
      });
  }

  async delete(id: string): Promise<void> {
    await db.collection(COLLECTION).doc(id).update({
      deleted: true,
      deletedAt: Timestamp.now(),
    });
  }
}

export const vacationsRepository = new VacationsRepository();
