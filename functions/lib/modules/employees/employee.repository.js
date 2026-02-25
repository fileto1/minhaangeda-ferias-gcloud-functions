"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRepository = void 0;
const firebase_1 = require("../../firebase");
const COLLECTION = "employees";
class EmployeeRepository {
    async create(data) {
        const doc = await firebase_1.db.collection(COLLECTION).add(data);
        return { id: doc.id, ...data };
    }
    async save(employee) {
        const doc = await firebase_1.db.collection(COLLECTION).add(employee);
        return { ...employee, uid: doc.id };
    }
    async findAll() {
        const snapshot = await firebase_1.db.collection(COLLECTION).get();
        return snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
        }));
    }
}
exports.EmployeeRepository = EmployeeRepository;
//# sourceMappingURL=employee.repository.js.map