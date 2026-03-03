"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedVacations = seedVacations;
const firebase_1 = require("../firebase");
const date_utils_1 = require("../shared/utils/date.utils");
const vacations_repository_1 = require("../modules/vacations/vacations.repository");
const models_1 = require("../modules/vacations/models");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const auth = (0, auth_1.getAuth)();
async function seedVacations() {
    // 🔥 Buscar usuário pelo emaail
    const userRecord = await auth.getUserByEmail("employee@local.com");
    const employeeUid = userRecord.uid;
    const employeeName = userRecord.displayName ?? "Funcionário Local";
    const vacations = [
        {
            id: "vac1",
            employeeUid: employeeUid,
            employeeName: employeeName,
            startDate: "2026-03-12",
            endDate: "2026-03-23",
            notes: "8 dias reais",
            status: models_1.EmployeeVacationStatusEnum.APPROVED,
        },
        {
            id: "vac2",
            employeeUid: employeeUid,
            employeeName: employeeName,
            startDate: "2026-03-01",
            endDate: "2026-03-10",
            notes: "7 dias reais",
            status: models_1.EmployeeVacationStatusEnum.APPROVED,
        },
        {
            id: "vac3",
            employeeUid: employeeUid,
            employeeName: employeeName,
            startDate: "2026-04-13",
            endDate: "2026-04-26",
            notes: "9 dias reais",
            status: models_1.EmployeeVacationStatusEnum.APPROVED,
        },
    ];
    for (const v of vacations) {
        const startTimestamp = date_utils_1.DateUtils.toTimestamp(v.startDate);
        const endTimestamp = date_utils_1.DateUtils.toTimestamp(v.endDate);
        const daysQuantity = date_utils_1.DateUtils.toDayjs(endTimestamp).diff(date_utils_1.DateUtils.toDayjs(startTimestamp), "day") + 1;
        await firebase_1.db.collection(vacations_repository_1.VACATIONS_COLLECTION).doc(v.id).set({
            employeeUid: v.employeeUid,
            employeeName: v.employeeName,
            startDate: startTimestamp,
            endDate: endTimestamp,
            notes: v.notes,
            daysQuantity,
            balanceUsedDays: daysQuantity,
            status: v.status,
            deleted: false,
            createdAt: firestore_1.Timestamp.now(),
        }, { merge: true });
    }
}
//# sourceMappingURL=vacations.seed.js.map