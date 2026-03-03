"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayDto = void 0;
const date_utils_1 = require("../../../shared/utils/date.utils");
class HolidayDto {
    constructor(holiday) {
        this.id = holiday.id ?? '';
        this.name = holiday.name;
        this.date = date_utils_1.DateUtils.toISO(holiday.date);
        this.fixed = holiday.fixed;
        this.locale = holiday.locale;
    }
}
exports.HolidayDto = HolidayDto;
//# sourceMappingURL=HolidayDto.js.map