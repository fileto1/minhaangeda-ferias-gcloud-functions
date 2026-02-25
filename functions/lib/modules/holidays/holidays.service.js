"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidaysService = exports.HolidaysService = void 0;
// modules/holidays/holiday.service.ts
const dayjs_1 = __importDefault(require("dayjs"));
const holidaycachestore_service_1 = require("./holidaycachestore.service");
class HolidaysService {
    async findByDateRange(startDate, endDate, locale = "PT_BR") {
        const start = (0, dayjs_1.default)(startDate);
        const end = (0, dayjs_1.default)(endDate);
        const result = [];
        for (let year = start.year(); year <= end.year(); year++) {
            const holidaysOfYear = await holidaycachestore_service_1.holidayCacheStoreService.findByLocaleAndYear(locale, year);
            for (const holiday of holidaysOfYear) {
                if (!this.isHolidayInRange(holiday, startDate, endDate, year)) {
                    continue;
                }
                if (holiday.fixed) {
                    const adjustedDate = (0, dayjs_1.default)(`${year}-${holiday.date.slice(5)}`).format("YYYY-MM-DD");
                    result.push({
                        ...holiday,
                        date: adjustedDate,
                    });
                }
                else {
                    result.push(holiday);
                }
            }
        }
        return result;
    }
    isHolidayInRange(holiday, startDate, endDate, year) {
        const holidayDate = holiday.fixed
            ? `${year}-${holiday.date.slice(5)}`
            : holiday.date;
        return holidayDate >= startDate && holidayDate <= endDate;
    }
}
exports.HolidaysService = HolidaysService;
exports.holidaysService = new HolidaysService();
//# sourceMappingURL=holidays.service.js.map