"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeDto = void 0;
const date_utils_1 = require("../../../shared/utils/date.utils");
class EmployeeDto {
    constructor(employee) {
        this.uid = employee.uid;
        this.name = employee.name;
        this.email = employee.email;
        this.enabled = employee.enabled;
        this.forceResetPassword = employee.forceResetPassword;
        this.role = employee.role;
        this.birthDate = date_utils_1.DateUtils.toISO(employee.birthDate);
        this.hiringDate = date_utils_1.DateUtils.toISO(employee.hiringDate);
    }
}
exports.EmployeeDto = EmployeeDto;
//# sourceMappingURL=EmployeeDto.js.map