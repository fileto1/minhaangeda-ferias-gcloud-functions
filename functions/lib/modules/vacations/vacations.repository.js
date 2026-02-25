"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationsRepository = void 0;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
const COLLECTION = "vacations";
class VacationsRepository {
    /* ===============================
     * FIND BY ID (NOT DELETED)
     * =============================== */
    async findById(id) {
        const snap = await db.collection(COLLECTION).doc(id).get();
        if (!snap.exists)
            return null;
        const data = snap.data();
        if (data.deleted)
            return null;
        return {
            id: snap.id,
            ...data,
        };
    }
    /* ===============================
     * BY EMPLOYEE
     * =============================== */
    async findByEmployee(employeeUid) {
        const snap = await db
            .collection(COLLECTION)
            .where("employeeUid", "==", employeeUid)
            .where("deleted", "==", false)
            .orderBy("startDate", "desc")
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * ALL PENDING
     * =============================== */
    async findAllPending() {
        const snap = await db
            .collection(COLLECTION)
            .where("status", "==", "PENDING")
            .where("deleted", "==", false)
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * BY DATE RANGE + STATUS
     * =============================== */
    async findApprovedByDateRange(startDate, endDate) {
        const snap = await db
            .collection(COLLECTION)
            .where("endDate", ">=", startDate)
            .where("startDate", "<=", endDate)
            .where("status", "==", "APPROVED")
            .where("deleted", "==", false)
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * APPROVED UNTIL DATE
     * =============================== */
    async findApprovedUntil(maxDate) {
        const snap = await db
            .collection(COLLECTION)
            .where("startDate", "<", maxDate)
            .where("status", "==", "APPROVED")
            .where("deleted", "==", false)
            .orderBy("startDate", "desc")
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * EXISTS IN RANGE
     * =============================== */
    async existsInRange(startDate, endDate, employeeUid) {
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
    async existsInRangeExcept(startDate, endDate, employeeUid, exceptId) {
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
    async create(data) {
        await db.collection(COLLECTION).add({
            ...data,
            deleted: false,
            createdAt: firestore_1.Timestamp.now(),
        });
    }
    async update(id, data) {
        await db
            .collection(COLLECTION)
            .doc(id)
            .update({
            ...data,
            updatedAt: firestore_1.Timestamp.now(),
        });
    }
    async delete(id) {
        await db.collection(COLLECTION).doc(id).update({
            deleted: true,
            deletedAt: firestore_1.Timestamp.now(),
        });
    }
}
exports.vacationsRepository = new VacationsRepository();
//# sourceMappingURL=vacations.repository.js.map