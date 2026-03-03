"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationsRepository = exports.VACATIONS_COLLECTION = void 0;
const firestore_1 = require("firebase-admin/firestore");
const models_1 = require("./models");
const db = (0, firestore_1.getFirestore)();
exports.VACATIONS_COLLECTION = "vacations";
class VacationsRepository {
    /* ===============================
     * FIND BY ID (NOT DELETED)
     * =============================== */
    async findById(id) {
        const snap = await db.collection(exports.VACATIONS_COLLECTION).doc(id).get();
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
            .collection(exports.VACATIONS_COLLECTION)
            .where("employeeUid", "==", employeeUid)
            .where("deleted", "==", false)
            .orderBy("startDate", "asc")
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
            .collection(exports.VACATIONS_COLLECTION)
            .where("status", "==", "PENDING")
            .where("deleted", "==", false)
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * ALL NOT PENDING
     * =============================== */
    async findAllNotPendingByDateRange(start, end) {
        const statuses = (0, models_1.getStatusesExcept)(models_1.EmployeeVacationStatusEnum.PENDING);
        const snap = await db
            .collection(exports.VACATIONS_COLLECTION)
            .where("deleted", "==", false)
            .where("status", "in", statuses)
            .where("startDate", "<=", end)
            .where("endDate", ">=", start)
            .get();
        return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
    }
    /* ===============================
     * BY DATE RANGE + STATUS
     * =============================== */
    async findApprovedByDateRange(start, end) {
        const snap = await db
            .collection(exports.VACATIONS_COLLECTION)
            .where("deleted", "==", false)
            .where("status", "==", "APPROVED")
            .where("startDate", "<=", end)
            .where("endDate", ">=", start)
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
            .collection(exports.VACATIONS_COLLECTION)
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
    // async existsInRange(
    //   startDate: string,
    //   endDate: string,
    //   employeeUid: string,
    // ): Promise<boolean> {
    //   const snap = await db
    //     .collection(VACATIONS_COLLECTION)
    //     .where("employeeUid", "==", employeeUid)
    //     .where("endDate", ">=", startDate)
    //     .where("startDate", "<=", endDate)
    //     .where("deleted", "==", false)
    //     .limit(1)
    //     .get();
    //   return !snap.empty;
    // }
    async existsInRange(start, end, employeeUid) {
        const snapshot = await db
            .collection("vacations")
            .where("employeeUid", "==", employeeUid)
            .where("deleted", "==", false)
            .where("startDate", "<=", end)
            .where("endDate", ">=", start)
            .get();
        return !snapshot.empty;
    }
    async existsInRangeExcept(start, end, employeeUid, exceptId) {
        const snap = await db
            .collection(exports.VACATIONS_COLLECTION)
            .where("employeeUid", "==", employeeUid)
            .where("deleted", "==", false)
            .where("startDate", "<=", end)
            .where("endDate", ">=", start)
            .get();
        return snap.docs.some((doc) => doc.id !== exceptId);
    }
    /* ===============================
     * CREATE / UPDATE / SOFT DELETE
     * =============================== */
    async create(data) {
        await db.collection(exports.VACATIONS_COLLECTION).add({
            ...data,
            deleted: false,
            createdAt: firestore_1.Timestamp.now(),
        });
    }
    async update(id, data) {
        await db
            .collection(exports.VACATIONS_COLLECTION)
            .doc(id)
            .update({
            ...data,
            updatedAt: firestore_1.Timestamp.now(),
        });
    }
    async delete(id) {
        await db.collection(exports.VACATIONS_COLLECTION).doc(id).update({
            deleted: true,
            deletedAt: firestore_1.Timestamp.now(),
        });
    }
}
exports.vacationsRepository = new VacationsRepository();
//# sourceMappingURL=vacations.repository.js.map