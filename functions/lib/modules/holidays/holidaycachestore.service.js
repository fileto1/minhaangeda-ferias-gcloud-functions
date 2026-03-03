"use strict";
// // modules/holidays/holidaycachestore.service.ts
// import { holidaysRepository } from "./holidays.repository";
// import { HolidayEntity } from "./models/HolidayEntity";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayCacheStoreService = void 0;
// type CacheKey = string;
// class HolidayCacheStoreService {
//   private cache = new Map<CacheKey, HolidayEntity[]>();
//   async findByLocale(locale: string): Promise<HolidayEntity[]> {
//     const key = `locale:${locale}`;
//     if (this.cache.has(key)) {
//       return this.cache.get(key)!;
//     }
//     const holidays = await holidaysRepository.findByLocale(locale);
//     this.cache.set(key, holidays);
//     return holidays;
//   }
//   async findByLocaleAndYear(
//     locale: string,
//     year: number,
//   ): Promise<HolidayEntity[]> {
//     const key = `${locale}:${year}`;
//     if (this.cache.has(key)) {
//       return this.cache.get(key)!;
//     }
//     const holidays = await holidaysRepository.findByLocaleAndYear(locale, year);
//     this.cache.set(key, holidays);
//     return holidays;
//   }
//   /**
//    * Útil se você editar feriados via admin
//    */
//   clearCache() {
//     this.cache.clear();
//   }
// }
// export const holidayCacheStoreService = new HolidayCacheStoreService();
const holidays_repository_1 = require("./holidays.repository");
class HolidayCacheStoreService {
    constructor() {
        this.cache = new Map();
    }
    buildLocaleKey(locale) {
        return `locale:${locale}`;
    }
    buildLocaleYearKey(locale, year) {
        return `locale:${locale}:year:${year}`;
    }
    // ===============================
    // FIND BY LOCALE
    // ===============================
    async findByLocale(locale) {
        const key = this.buildLocaleKey(locale);
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const holidays = await holidays_repository_1.holidaysRepository.findByLocale(locale);
        this.cache.set(key, holidays);
        return holidays;
    }
    // ===============================
    // FIND BY LOCALE AND YEAR
    // ===============================
    async findByLocaleAndYear(locale, year) {
        const key = this.buildLocaleYearKey(locale, year);
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const holidays = await holidays_repository_1.holidaysRepository.findByLocaleAndYear(locale, year);
        this.cache.set(key, holidays);
        return holidays;
    }
    // ===============================
    // INVALIDATE BY LOCALE
    // ===============================
    invalidate(locale) {
        if (!locale) {
            this.cache.clear();
            return;
        }
        const prefix = `locale:${locale}`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
    // ===============================
    // CLEAR ALL CACHE
    // ===============================
    clear() {
        this.cache.clear();
    }
}
exports.holidayCacheStoreService = new HolidayCacheStoreService();
//# sourceMappingURL=holidaycachestore.service.js.map