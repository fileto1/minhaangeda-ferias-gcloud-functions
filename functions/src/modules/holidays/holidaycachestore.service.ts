// // modules/holidays/holidaycachestore.service.ts
// import { holidaysRepository } from "./holidays.repository";
// import { HolidayEntity } from "./models/HolidayEntity";

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

import { holidaysRepository } from "./holidays.repository";
import { HolidayEntity } from "./models/HolidayEntity";

type CacheKey = string;

class HolidayCacheStoreService {
  private cache = new Map<CacheKey, HolidayEntity[]>();

  private buildLocaleKey(locale: string): CacheKey {
    return `locale:${locale}`;
  }

  private buildLocaleYearKey(locale: string, year: number): CacheKey {
    return `locale:${locale}:year:${year}`;
  }

  // ===============================
  // FIND BY LOCALE
  // ===============================
  async findByLocale(locale: string): Promise<HolidayEntity[]> {
    const key = this.buildLocaleKey(locale);

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const holidays = await holidaysRepository.findByLocale(locale);

    this.cache.set(key, holidays);

    return holidays;
  }

  // ===============================
  // FIND BY LOCALE AND YEAR
  // ===============================
  async findByLocaleAndYear(locale: string, year: number): Promise<HolidayEntity[]> {
    const key = this.buildLocaleYearKey(locale, year);

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const holidays = await holidaysRepository.findByLocaleAndYear(locale, year);

    this.cache.set(key, holidays);

    return holidays;
  }

  // ===============================
  // INVALIDATE BY LOCALE
  // ===============================
  invalidate(locale?: string) {
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

export const holidayCacheStoreService = new HolidayCacheStoreService();
