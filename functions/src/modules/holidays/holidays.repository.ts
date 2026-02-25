// modules/holidays/holiday.repository.ts
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
const COLLECTION = "holidays";

export interface Holiday {
  id?: string;
  name: string;
  date: string; // YYYY-MM-DD
  fixed: boolean;
  locale: string;
}

class HolidaysRepository {
  async findByLocale(locale: string): Promise<Holiday[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("locale", "==", locale)
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Holiday),
    }));
  }

  /**
   * 🔁 Equivalente ao:
   * WHERE locale = ?
   * AND ((fixed = false AND YEAR(date) = ?) OR fixed = true)
   */
  async findByLocaleAndYear(locale: string, year: number): Promise<Holiday[]> {
    const snap = await db
      .collection(COLLECTION)
      .where("locale", "==", locale)
      .get();

    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Holiday) }))
      .filter((h) => {
        if (h.fixed) return true;
        return h.date.startsWith(`${year}-`);
      });
  }
}

export const holidaysRepository = new HolidaysRepository();
