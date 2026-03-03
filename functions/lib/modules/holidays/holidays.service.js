"use strict";
// import dayjs from "dayjs";
// import { Timestamp } from "firebase-admin/firestore";
// import { holidayCacheStoreService } from "./holidaycachestore.service";
// import { HolidayEntity } from "./models/HolidayEntity";
// import { DateUtils } from "../../shared/utils/date.utils";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidaysService = exports.HolidaysService = void 0;
// export class HolidaysService {
//   async findByDateRange(
//     startTimestamp: Timestamp,
//     endTimestamp: Timestamp,
//     locale: string = "PT_BR",
//   ): Promise<HolidayEntity[]> {
//     const start = dayjs(startTimestamp.toDate()).startOf("day");
//     const end = dayjs(endTimestamp.toDate()).startOf("day");
//     const result: HolidayEntity[] = [];
//     for (let year = start.year(); year <= end.year(); year++) {
//       const holidaysOfYear = await holidayCacheStoreService.findByLocaleAndYear(
//         locale,
//         year,
//       );
//       for (const holiday of holidaysOfYear) {
//         if (!this.isHolidayInRange(holiday, start, end, year)) {
//           continue;
//         }
//         const holidayDate = this.resolveHolidayDate(holiday, year);
//         result.push({
//           ...holiday,
//           date: DateUtils.toTimestamp(holidayDate),
//         });
//       }
//     }
//     return result;
//   }
//   private isHolidayInRange(
//     holiday: HolidayEntity,
//     start: dayjs.Dayjs,
//     end: dayjs.Dayjs,
//     year: number,
//   ): boolean {
//     const holidayDate = this.resolveHolidayDate(holiday, year);
//     return (
//       holidayDate.isSameOrAfter(start, "day") &&
//       holidayDate.isSameOrBefore(end, "day")
//     );
//   }
//   private resolveHolidayDate(
//     holiday: HolidayEntity,
//     year: number,
//   ): dayjs.Dayjs {
//     const originalDate = dayjs(holiday.date.toDate());
//     if (holiday.fixed) {
//       return dayjs()
//         .year(year)
//         .month(originalDate.month())
//         .date(originalDate.date())
//         .startOf("day");
//     }
//     return originalDate.startOf("day");
//   }
// }
// export const holidaysService = new HolidaysService();
const dayjs_1 = __importDefault(require("dayjs"));
const holidaycachestore_service_1 = require("./holidaycachestore.service");
const date_utils_1 = require("../../shared/utils/date.utils");
const AppError_1 = require("../../shared/errors/AppError");
const holidays_repository_1 = require("./holidays.repository");
class HolidaysService {
    // ===============================
    // GET ALL (com filtro opcional)
    // ===============================
    async getAll(params) {
        if (!params?.startDate || !params?.endDate) {
            return holidays_repository_1.holidaysRepository.findAll();
        }
        return this.findByDateRange(date_utils_1.DateUtils.toTimestamp(params.startDate), date_utils_1.DateUtils.toTimestamp(params.endDate), params.locale ?? "PT_BR");
    }
    // ===============================
    // CREATE
    // ===============================
    async create(form) {
        if (!form.name?.trim()) {
            throw new AppError_1.AppError("Nome do feriado é obrigatório");
        }
        if (!form.date) {
            throw new AppError_1.AppError("Data do feriado é obrigatória");
        }
        const holiday = await holidays_repository_1.holidaysRepository.create({
            name: form.name.trim(),
            date: date_utils_1.DateUtils.toTimestamp(form.date),
            fixed: form.fixed,
            locale: form.locale ?? 'PT_BR'
        });
        await holidaycachestore_service_1.holidayCacheStoreService.clear();
        return holiday;
    }
    // ===============================
    // UPDATE
    // ===============================
    async update(id, form) {
        const updateData = {};
        if (form.name !== undefined) {
            updateData.name = form.name.trim();
        }
        if (form.date !== undefined) {
            updateData.date = date_utils_1.DateUtils.toTimestamp(form.date);
        }
        if (form.fixed !== undefined) {
            updateData.fixed = form.fixed;
        }
        if (Object.keys(updateData).length === 0) {
            throw new AppError_1.AppError("Nenhum campo para atualizar");
        }
        const holiday = await holidays_repository_1.holidaysRepository.update(id, updateData);
        await holidaycachestore_service_1.holidayCacheStoreService.clear();
        return holiday;
    }
    // ===============================
    // DELETE (soft)
    // ===============================
    async delete(id) {
        await holidays_repository_1.holidaysRepository.delete(id);
        await holidaycachestore_service_1.holidayCacheStoreService.clear();
    }
    // ===============================
    // FIND BY DATE RANGE (já existia)
    // ===============================
    async findByDateRange(startTimestamp, endTimestamp, locale = "PT_BR") {
        const start = (0, dayjs_1.default)(startTimestamp.toDate()).startOf("day");
        const end = (0, dayjs_1.default)(endTimestamp.toDate()).startOf("day");
        const result = [];
        for (let year = start.year(); year <= end.year(); year++) {
            const holidaysOfYear = await holidaycachestore_service_1.holidayCacheStoreService.findByLocaleAndYear(locale, year);
            for (const holiday of holidaysOfYear) {
                if (!this.isHolidayInRange(holiday, start, end, year)) {
                    continue;
                }
                const holidayDate = this.resolveHolidayDate(holiday, year);
                result.push({
                    ...holiday,
                    date: date_utils_1.DateUtils.toTimestamp(holidayDate),
                });
            }
        }
        result.sort((a, b) => {
            const aDate = a.date.toDate();
            const bDate = b.date.toDate();
            const monthDiff = aDate.getMonth() - bDate.getMonth();
            if (monthDiff !== 0)
                return monthDiff;
            return aDate.getDate() - bDate.getDate();
        });
        return result;
    }
    isHolidayInRange(holiday, start, end, year) {
        const holidayDate = this.resolveHolidayDate(holiday, year);
        return holidayDate.isSameOrAfter(start, "day") && holidayDate.isSameOrBefore(end, "day");
    }
    resolveHolidayDate(holiday, year) {
        const originalDate = (0, dayjs_1.default)(holiday.date.toDate());
        if (holiday.fixed) {
            return (0, dayjs_1.default)().year(year).month(originalDate.month()).date(originalDate.date()).startOf("day");
        }
        return originalDate.startOf("day");
    }
}
exports.HolidaysService = HolidaysService;
exports.holidaysService = new HolidaysService();
//# sourceMappingURL=holidays.service.js.map