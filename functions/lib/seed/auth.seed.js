"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAuthUsers = seedAuthUsers;
const firebase_1 = require("../firebase");
const USERS = [
    {
        email: "admin@local.com",
        password: "123456",
        name: "Administrador Local",
        role: "ADMIN",
        ceo: true,
    },
    {
        email: "employee@local.com",
        password: "123456",
        name: "Funcionário Local",
        role: "EMPLOYEE",
        ceo: false,
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
        }
        // =========================
        // FIRESTORE (EMPLOYEE)
        // =========================
        const employeeRef = firebase_1.db.collection("employees").doc(uid);
        const snapshot = await employeeRef.get();
        if (!snapshot.exists) {
            const employee = {
                uid,
                name: user.name,
                email: user.email,
                enabled: true,
                forceResetPassword: true, // 🔑 força troca no primeiro login
                role: user.role,
                birthDate: new Date().toISOString().substring(0, 10),
                hiringDate: new Date().toISOString().substring(0, 10),
                ceo: user.ceo,
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