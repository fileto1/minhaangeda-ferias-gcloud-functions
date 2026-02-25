"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayCacheStoreService = void 0;
// modules/holidays/holidaycachestore.service.ts
const holidays_repository_1 = require("./holidays.repository");
class HolidayCacheStoreService {
    constructor() {
        this.cache = new Map();
    }
    async findByLocale(locale) {
        const key = `locale:${locale}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const holidays = await holidays_repository_1.holidaysRepository.findByLocale(locale);
        this.cache.set(key, holidays);
        return holidays;
    }
    async findByLocaleAndYear(locale, year) {
        const key = `${locale}:${year}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const holidays = await holidays_repository_1.holidaysRepository.findByLocaleAndYear(locale, year);
        this.cache.set(key, holidays);
        return holidays;
    }
    /**
     * Útil se você editar feriados via admin
     */
    clearCache() {
        this.cache.clear();
    }
}
exports.holidayCacheStoreService = new HolidayCacheStoreService();
//# sourceMappingURL=holidaycachestore.service.js.map