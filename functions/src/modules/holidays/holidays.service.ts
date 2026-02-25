// modules/holidays/holiday.service.ts
import dayjs from "dayjs";
import { holidayCacheStoreService } from "./holidaycachestore.service";
import { Holiday } from "./holidays.repository";

export class HolidaysService {
  async findByDateRange(
    startDate: string,
    endDate: string,
    locale: string = "PT_BR",
  ): Promise<Holiday[]> {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const result: Holiday[] = [];

    for (let year = start.year(); year <= end.year(); year++) {
      const holidaysOfYear = await holidayCacheStoreService.findByLocaleAndYear(
        locale,
        year,
      );

      for (const holiday of holidaysOfYear) {
        if (!this.isHolidayInRange(holiday, startDate, endDate, year)) {
          continue;
        }

        if (holiday.fixed) {
          const adjustedDate = dayjs(`${year}-${holiday.date.slice(5)}`).format(
            "YYYY-MM-DD",
          );

          result.push({
            ...holiday,
            date: adjustedDate,
          });
        } else {
          result.push(holiday);
        }
      }
    }

    return result;
  }

  private isHolidayInRange(
    holiday: Holiday,
    startDate: string,
    endDate: string,
    year: number,
  ): boolean {
    const holidayDate = holiday.fixed
      ? `${year}-${holiday.date.slice(5)}`
      : holiday.date;

    return holidayDate >= startDate && holidayDate <= endDate;
  }
}

export const holidaysService = new HolidaysService();
