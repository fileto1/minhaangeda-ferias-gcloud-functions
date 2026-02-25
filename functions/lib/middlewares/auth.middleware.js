"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const firebase_1 = require("../firebase");
async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token ausente" });
        return;
    }
    const token = header.replace("Bearer ", "");
    try {
        const decoded = await firebase_1.auth.verifyIdToken(token);
        req.user = {
            uid: decoded.uid,
            email: decoded.email ?? "",
            role: decoded.role ?? "EMPLOYEE",
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
}
//# sourceMappingURL=auth.middleware.js.map