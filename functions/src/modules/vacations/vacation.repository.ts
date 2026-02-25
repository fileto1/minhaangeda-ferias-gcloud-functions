import { db } from "../../firebase";
import { Vacation } from "./vacation.model";

const COLLECTION = "vacations";

export class VacationRepository {
  async create(data: any) {
    const doc = await db.collection(COLLECTION).add(data);
    return { id: doc.id, ...data };
  }

  async findByUser(userId: string) {
    const snap = await db
      .collection(COLLECTION)
      .where("userId", "==", userId)
      .get();

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async save(vacation: Vacation): Promise<Vacation> {
    const doc = await db.collection(COLLECTION).add(vacation);
    return { ...vacation, id: doc.id };
  }

  async findAll(): Promise<Vacation[]> {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vacation[];
  }
}
