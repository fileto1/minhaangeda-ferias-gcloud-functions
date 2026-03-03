"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAuthUsers = seedAuthUsers;
const dayjs_1 = __importDefault(require("dayjs"));
const firebase_1 = require("../firebase");
const employees_repository_1 = require("../modules/employees/employees.repository");
const date_utils_1 = require("../shared/utils/date.utils");
const USERS = [
    {
        email: "admin@local.com",
        password: "123123",
        name: "Administrador Local",
        role: "ADMIN",
        birthDate: (0, dayjs_1.default)("1992-08-20").toDate(),
        hiringDate: (0, dayjs_1.default)().subtract(4, "year").add(12, "day").toDate(),
        forceResetPassword: false,
    },
    {
        email: "employee@local.com",
        password: "123123",
        name: "Funcionário Local",
        role: "EMPLOYEE",
        birthDate: (0, dayjs_1.default)("1995-02-24").toDate(),
        hiringDate: (0, dayjs_1.default)().subtract(1, "year").toDate(),
        forceResetPassword: false,
    },
];
async function seedAuthUsers() {
    for (const user of USERS) {
        let uid;
        // =========================
        // AUTH
        // =========================
        try {
            const existing = await firebase_1.auth.getUserByEmail(user.email);
            uid = existing.uid;
            // console.log(`🔹 Auth já existe: ${user.email}`);
        }
        catch (error) {
            if (error.code !== "auth/user-not-found") {
                throw error;
            }
            const created = await firebase_1.auth.createUser({
                email: user.email,
                password: user.password,
                displayName: user.name,
                disabled: false,
            });
            uid = created.uid;
            console.log(`✅ Auth criado: ${user.email}`);
            // 🔥 CUSTOM CLAIM
            await firebase_1.auth.setCustomUserClaims(uid, {
                role: user.role,
                forceResetPassword: user.forceResetPassword,
            });
        }
        // =========================
        // FIRESTORE (EMPLOYEE)
        // =========================
        const employeeRef = firebase_1.db.collection(employees_repository_1.EMPLOYEES_COLLECTION).doc(uid);
        const snapshot = await employeeRef.get();
        if (!snapshot.exists) {
            const employee = {
                uid,
                name: user.name,
                email: user.email,
                enabled: true,
                forceResetPassword: user.forceResetPassword, // 🔑 força troca no primeiro login
                role: user.role,
                birthDate: date_utils_1.DateUtils.toTimestamp(user.birthDate),
                hiringDate: date_utils_1.DateUtils.toTimestamp(user.hiringDate),
                deleted: false,
            };
            await employeeRef.set(employee);
            console.log(`📄 Employee criado: ${user.email}`);
        }
        else {
            // console.log(`📄 Employee já existe: ${user.email}`);
        }
    }
}
//# sourceMappingURL=auth.seed.js.map