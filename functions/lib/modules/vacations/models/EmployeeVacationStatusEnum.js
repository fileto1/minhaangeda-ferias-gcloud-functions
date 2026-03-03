"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeVacationStatusEnum = void 0;
exports.vacationStatusFromString = vacationStatusFromString;
exports.getStatusesExcept = getStatusesExcept;
// modules/employeesVacation/dtos/EmployeeVacationStatusEnum.ts
var EmployeeVacationStatusEnum;
(function (EmployeeVacationStatusEnum) {
    EmployeeVacationStatusEnum["PENDING"] = "PENDING";
    EmployeeVacationStatusEnum["APPROVED"] = "APPROVED";
    EmployeeVacationStatusEnum["DECLINED"] = "DECLINED";
})(EmployeeVacationStatusEnum || (exports.EmployeeVacationStatusEnum = EmployeeVacationStatusEnum = {}));
function vacationStatusFromString(value) {
    try {
        return EmployeeVacationStatusEnum[value.toUpperCase()];
    }
    catch {
        return null;
    }
}
function getStatusesExcept(...excluded) {
    return Object.values(EmployeeVacationStatusEnum).filter((status) => !excluded.includes(status));
}
//# sourceMappingURL=EmployeeVacationStatusEnum.js.map