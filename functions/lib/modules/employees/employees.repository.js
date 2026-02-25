"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesRepository = void 0;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
const COLLECTION = "employees";
class EmployeesRepository {
    /* ===============================
     * BY UID
     * =============================== */
    async findByUid(uid) {
        const snap = await db.collection(COLLECTION).doc(uid).get();
        if (!snap.exists)
            return null;
        const data = snap.data();
        if (data.deleted)
            return null;
        return {
            uid: snap.id,
            ...data,
        };
    }
    /* ===============================
     * BY EMAIL
     * =============================== */
    async findByEmail(email) {
        const snap = await db
            .collection(COLLECTION)
            .where("email", "==", email)
            .where("deleted", "==", false)
            .limit(1)
            .get();
        if (snap.empty)
            return null;
        const d = snap.docs[0];
        const data = d.data();
        return {
            uid: d.id,
            ...data,
        };
    }
    /* ===============================
     * ALL (NOT DELETED)
     * =============================== */
    async findAll() {
        const snap = await db
            .collection(COLLECTION)
            .where("deleted", "==", false)
            .get();
        return snap.docs.map((d) => ({
            uid: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * ALL NOT CEO
     * =============================== */
    async findAllNotCeo() {
        const snap = await db
            .collection(COLLECTION)
            .where("ceo", "==", false)
            .where("deleted", "==", false)
            .get();
        return snap.docs.map((d) => ({
            uid: d.id,
            ...d.data(),
        }));
    }
}
exports.employeesRepository = new EmployeesRepository();
//# sourceMappingURL=employees.repository.js.map