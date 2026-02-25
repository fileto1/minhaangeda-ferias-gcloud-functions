"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeVacationStatusEnum = void 0;
exports.vacationStatusFromString = vacationStatusFromString;
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
//# sourceMappingURL=EmployeeVacationStatusEnum.js.map