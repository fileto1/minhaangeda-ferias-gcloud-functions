// modules/holidays/holidaycachestore.service.ts
import { Holiday, holidaysRepository } from "./holidays.repository";

type CacheKey = string;

class HolidayCacheStoreService {
  private cache = new Map<CacheKey, Holiday[]>();

  async findByLocale(locale: string): Promise<Holiday[]> {
    const key = `locale:${locale}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const holidays = await holidaysRepository.findByLocale(locale);
    this.cache.set(key, holidays);

    return holidays;
  }

  async findByLocaleAndYear(locale: string, year: number): Promise<Holiday[]> {
    const key = `${locale}:${year}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const holidays = await holidaysRepository.findByLocaleAndYear(locale, year);

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

export const holidayCacheStoreService = new HolidayCacheStoreService();
