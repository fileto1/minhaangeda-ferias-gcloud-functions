"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const firebase_1 = require("../firebase");
const employees_repository_1 = require("../modules/employees/employees.repository");
async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token ausente" });
        return;
    }
    const token = header.replace("Bearer ", "");
    // try {
    //   const decoded = await auth.verifyIdToken(token);
    //   const employeeDoc = await db
    //     .collection(EMPLOYEES_COLLECTION)
    //     .doc(decoded.uid)
    //     .get();
    //   if (!employeeDoc.exists) {
    //     res.status(403).json({ error: "Funcionário não encontrado." });
    //   }
    //   const employee = employeeDoc.data();
    //   if (employee?.deleted || !employee?.enabled) {
    //     res.status(403).json({ error: "Usuário desabilitado." });
    //   }
    //   req.user = {
    //     uid: decoded.uid,
    //     email: decoded.email ?? "",
    //     role: employee.role ?? "EMPLOYEE",
    //   };
    //   next();
    // } catch (error) {
    //   res.status(401).json({ error: "Token inválido" });
    // }
    try {
        const decoded = await firebase_1.auth.verifyIdToken(token);
        const employee = await employees_repository_1.employeesRepository.findByUid(decoded.uid);
        req.user = {
            uid: decoded.uid,
            email: decoded.email ?? "",
            role: employee?.role ?? "EMPLOYEE",
            // role: (decoded.role as "ADMIN" | "EMPLOYEE") ?? "EMPLOYEE",
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
}
//# sourceMappingURL=auth.middleware.js.map