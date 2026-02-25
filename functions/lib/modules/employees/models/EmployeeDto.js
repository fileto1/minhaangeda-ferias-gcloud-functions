"use strict";
// modules/employees/dtos/EmployeeDto.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeDto = void 0;
class EmployeeDto {
    constructor(employee) {
        this.uid = employee.uid;
        this.name = employee.name;
        this.enabled = employee.enabled;
        this.forceResetPassword = employee.forceResetPassword;
        this.role = employee.role;
        this.birthDate = employee.birthDate;
        this.hiringDate = employee.hiringDate;
        this.ceo = employee.ceo;
    }
}
exports.EmployeeDto = EmployeeDto;
//# sourceMappingURL=EmployeeDto.js.map