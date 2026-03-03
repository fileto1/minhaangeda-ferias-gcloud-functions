"use strict";
// // modules/holidays/holiday.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidaysRepository = exports.HOLIDAYS_COLLECTION = void 0;
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
const firestore_1 = require("firebase-admin/firestore");
const dayjs_1 = __importDefault(require("dayjs"));
const db = (0, firestore_1.getFirestore)();
exports.HOLIDAYS_COLLECTION = "holidays";
class HolidaysRepository {
    async findAll() {
        const snap = await db.collection(exports.HOLIDAYS_COLLECTION).get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    async findByLocale(locale) {
        const snap = await db
            .collection(exports.HOLIDAYS_COLLECTION)
            .where("locale", "==", locale)
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    async findByLocaleAndYear(locale, year) {
        const snap = await db
            .collection(exports.HOLIDAYS_COLLECTION)
            .where("locale", "==", locale)
            .get();
        return snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((h) => {
            if (h.fixed)
                return true;
            const holidayYear = (0, dayjs_1.default)(h.date.toDate()).year();
            return holidayYear === year;
        });
    }
    async create(data) {
        const ref = await db.collection(exports.HOLIDAYS_COLLECTION).add({
            ...data,
            deleted: false,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        const snap = await ref.get();
        return {
            id: snap.id,
            ...snap.data(),
        };
    }
    async update(id, data) {
        const ref = db.collection(exports.HOLIDAYS_COLLECTION).doc(id);
        await ref.update({
            ...data,
            updatedAt: firestore_1.Timestamp.now(),
        });
        const snap = await ref.get();
        return {
            id: snap.id,
            ...snap.data(),
        };
    }
    async delete(id) {
        await db.collection(exports.HOLIDAYS_COLLECTION).doc(id).delete();
    }
}
exports.holidaysRepository = new HolidaysRepository();
//# sourceMappingURL=holidays.repository.js.map