"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeVacationItemDTO = void 0;
// modules/employeesVacation/dtos/EmployeeVacationItemDTO.ts
const models_1 = require("../../employees/models");
class EmployeeVacationItemDTO {
    constructor(employeeVacation, realUsedDays) {
        this.id = employeeVacation.id;
        this.startDate = employeeVacation.startDate;
        this.endDate = employeeVacation.endDate;
        this.notes = employeeVacation.notes;
        this.daysQuantity = employeeVacation.daysQuantity;
        this.balanceUsedDays = employeeVacation.balanceUsedDays;
        this.realUsedDays = realUsedDays;
        this.status = employeeVacation.status;
        this.employee = new models_1.EmployeeDto(employeeVacation.employee);
    }
}
exports.EmployeeVacationItemDTO = EmployeeVacationItemDTO;
//# sourceMappingURL=EmployeeVacationItemDTO.js.map