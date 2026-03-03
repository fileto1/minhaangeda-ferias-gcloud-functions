"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesRepository = exports.EMPLOYEES_COLLECTION = void 0;
//employees.repository.ts
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
exports.EMPLOYEES_COLLECTION = "employees";
class EmployeesRepository {
    /* ===============================
     * BY UID
     * =============================== */
    async findByUid(uid) {
        const snap = await db.collection(exports.EMPLOYEES_COLLECTION).doc(uid).get();
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
            .collection(exports.EMPLOYEES_COLLECTION)
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
        const snap = await db.collection(exports.EMPLOYEES_COLLECTION).where("deleted", "==", false).get();
        return snap.docs.map((d) => ({
            uid: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * ALL NOT ADMIN
     * =============================== */
    async findAllNotAdmin() {
        const snap = await db
            .collection(exports.EMPLOYEES_COLLECTION)
            .where("role", "!=", "ADMIN")
            .where("deleted", "==", false)
            .get();
        return snap.docs.map((d) => ({
            uid: d.id,
            ...d.data(),
        }));
    }
    async create(uid, data) {
        const ref = db.collection(exports.EMPLOYEES_COLLECTION).doc(uid);
        await ref.set(data);
        return {
            uid,
            ...data,
        };
    }
    async update(id, data) {
        const employeeRef = db.collection(exports.EMPLOYEES_COLLECTION).doc(id);
        await employeeRef.update({
            ...data,
            updatedAt: firestore_1.Timestamp.now(),
        });
        const updatedSnapshot = await employeeRef.get();
        return updatedSnapshot.data();
    }
}
exports.employeesRepository = new EmployeesRepository();
//# sourceMappingURL=employees.repository.js.map