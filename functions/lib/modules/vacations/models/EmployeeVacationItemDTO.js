"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeVacationItemDTO = void 0;
// modules/employeesVacation/dtos/EmployeeVacationItemDTO.ts
const date_utils_1 = require("../../../shared/utils/date.utils");
class EmployeeVacationItemDTO {
    constructor(employeeVacation, realUsedDays, splited = false) {
        this.id = employeeVacation.id;
        this.startDate = date_utils_1.DateUtils.toISO(employeeVacation.startDate);
        this.endDate = date_utils_1.DateUtils.toISO(employeeVacation.endDate);
        this.notes = employeeVacation.notes;
        this.daysQuantity = employeeVacation.daysQuantity;
        this.balanceUsedDays = employeeVacation.balanceUsedDays;
        this.realUsedDays = realUsedDays;
        this.status = employeeVacation.status;
        this.employeeUid = employeeVacation.employeeUid;
        this.employeeName = employeeVacation.employeeName;
        this.splited = splited;
    }
}
exports.EmployeeVacationItemDTO = EmployeeVacationItemDTO;
//# sourceMappingURL=EmployeeVacationItemDTO.js.map