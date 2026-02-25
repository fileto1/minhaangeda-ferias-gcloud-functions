"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidaysRepository = void 0;
// modules/holidays/holiday.repository.ts
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
const COLLECTION = "holidays";
class HolidaysRepository {
    async findByLocale(locale) {
        const snap = await db
            .collection(COLLECTION)
            .where("locale", "==", locale)
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /**
     * 🔁 Equivalente ao:
     * WHERE locale = ?
     * AND ((fixed = false AND YEAR(date) = ?) OR fixed = true)
     */
    async findByLocaleAndYear(locale, year) {
        const snap = await db
            .collection(COLLECTION)
            .where("locale", "==", locale)
            .get();
        return snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((h) => {
            if (h.fixed)
                return true;
            return h.date.startsWith(`${year}-`);
        });
    }
}
exports.holidaysRepository = new HolidaysRepository();
//# sourceMappingURL=holidays.repository.js.map