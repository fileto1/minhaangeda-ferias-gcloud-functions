// // modules/holidays/holiday.repository.ts

// import { getFirestore } from "firebase-admin/firestore";
// import dayjs from "dayjs";
// import { HolidayEntity } from "./models/HolidayEntity";

// const db = getFirestore();
// export const HOLIDAYS_COLLECTION = "holidays";

// class HolidaysRepository {
//   async findByLocale(locale: string): Promise<HolidayEntity[]> {
//     const snap = await db
//       .collection(HOLIDAYS_COLLECTION)
//       .where("locale", "==", locale)
//       .get();

//     return snap.docs.map((d) => ({
//       id: d.id,
//       ...(d.data() as HolidayEntity),
//     }));
//   }

//   /**
//    * 🔁 Equivalente ao:
//    * WHERE locale = ?
//    * AND ((fixed = false AND YEAR(date) = ?) OR fixed = true)
//    */
//   async findByLocaleAndYear(
//     locale: string,
//     year: number,
//   ): Promise<HolidayEntity[]> {
//     const snap = await db
//       .collection(HOLIDAYS_COLLECTION)
//       .where("locale", "==", locale)
//       .get();

//     return snap.docs
//       .map((d) => ({ id: d.id, ...(d.data() as HolidayEntity) }))
//       .filter((h) => {
//         if (h.fixed) return true;

//         const holidayYear = dayjs(h.date.toDate()).year();
//         return holidayYear === year;
//       });
//   }
// }

// export const holidaysRepository = new HolidaysRepository();

import { getFirestore, Timestamp } from "firebase-admin/firestore";
import dayjs from "dayjs";
import { HolidayEntity } from "./models/HolidayEntity";

const db = getFirestore();
export const HOLIDAYS_COLLECTION = "holidays";

class HolidaysRepository {
  async findAll(): Promise<HolidayEntity[]> {
    const snap = await db.collection(HOLIDAYS_COLLECTION).get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<HolidayEntity, "id">),
    }));
  }

  async findByLocale(locale: string): Promise<HolidayEntity[]> {
    const snap = await db
      .collection(HOLIDAYS_COLLECTION)
      .where("locale", "==", locale)
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as HolidayEntity),
    }));
  }

  async findByLocaleAndYear(locale: string, year: number): Promise<HolidayEntity[]> {
    const snap = await db
      .collection(HOLIDAYS_COLLECTION)
      .where("locale", "==", locale)
      .get();

    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as HolidayEntity) }))
      .filter((h) => {
        if (h.fixed) return true;

        const holidayYear = dayjs(h.date.toDate()).year();
        return holidayYear === year;
      });
  }

  async create(data: Partial<HolidayEntity>): Promise<HolidayEntity> {
    const ref = await db.collection(HOLIDAYS_COLLECTION).add({
      ...data,
      deleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const snap = await ref.get();

    return {
      id: snap.id,
      ...(snap.data() as HolidayEntity),
    };
  }

  async update(id: string, data: Partial<HolidayEntity>): Promise<HolidayEntity> {
    const ref = db.collection(HOLIDAYS_COLLECTION).doc(id);

    await ref.update({
      ...data,
      updatedAt: Timestamp.now(),
    });

    const snap = await ref.get();

    return {
      id: snap.id,
      ...(snap.data() as HolidayEntity),
    };
  }

  async delete(id: string): Promise<void> {
    await db.collection(HOLIDAYS_COLLECTION).doc(id).delete();
  }
}

export const holidaysRepository = new HolidaysRepository();
