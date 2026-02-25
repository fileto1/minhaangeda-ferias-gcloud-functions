"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const employees_repository_1 = require("../employees/employees.repository");
class EmployeesService {
    async findById(id, principal) {
        const employee = await employees_repository_1.employeesRepository.findByUid(id);
        if (!employee) {
            throw new Error("Funcionário não encontrado");
        }
        return employee;
    }
}
exports.EmployeesService = EmployeesService;
//# sourceMappingURL=employee.service.js.map