"use strict";
// modules/employeesVacation/dtos/EmployeeWithVacationsResponseDTO.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeWithVacationsResponseDTO = void 0;
class EmployeeWithVacationsResponseDTO {
    constructor(employee, containsVacationToApprove, balanceDays, usedDays) {
        this.employee = employee;
        this.containsVacationToApprove = containsVacationToApprove;
        this.balanceDays = balanceDays;
        this.usedDays = usedDays;
    }
}
exports.EmployeeWithVacationsResponseDTO = EmployeeWithVacationsResponseDTO;
//# sourceMappingURL=EmployeeWithVacationsResponseDTO.js.map