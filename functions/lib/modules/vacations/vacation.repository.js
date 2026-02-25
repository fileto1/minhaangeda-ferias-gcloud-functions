"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacationRepository = void 0;
const firebase_1 = require("../../firebase");
const COLLECTION = "vacations";
class VacationRepository {
    async create(data) {
        const doc = await firebase_1.db.collection(COLLECTION).add(data);
        return { id: doc.id, ...data };
    }
    async findByUser(userId) {
        const snap = await firebase_1.db
            .collection(COLLECTION)
            .where("userId", "==", userId)
            .get();
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    async save(vacation) {
        const doc = await firebase_1.db.collection(COLLECTION).add(vacation);
        return { ...vacation, id: doc.id };
    }
    async findAll() {
        const snapshot = await firebase_1.db.collection(COLLECTION).get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
}
exports.VacationRepository = VacationRepository;
//# sourceMappingURL=vacation.repository.js.map