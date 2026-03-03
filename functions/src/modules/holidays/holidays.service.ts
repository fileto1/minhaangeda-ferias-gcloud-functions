// import dayjs from "dayjs";
// import { Timestamp } from "firebase-admin/firestore";
// import { holidayCacheStoreService } from "./holidaycachestore.service";
// import { HolidayEntity } from "./models/HolidayEntity";
// import { DateUtils } from "../../shared/utils/date.utils";

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

import dayjs from "dayjs";
import { Timestamp } from "firebase-admin/firestore";
import { holidayCacheStoreService } from "./holidaycachestore.service";
import { HolidayEntity } from "./models/HolidayEntity";
import { DateUtils } from "../../shared/utils/date.utils";
import { AppError } from "../../shared/errors/AppError";
import { holidaysRepository } from "./holidays.repository";
import { HolidayFormRequest } from "./models/HolidayFormRequest";

export class HolidaysService {
  // ===============================
  // GET ALL (com filtro opcional)
  // ===============================
  async getAll(params?: { startDate?: string; endDate?: string; locale?: string }): Promise<HolidayEntity[]> {
    if (!params?.startDate || !params?.endDate) {
      return holidaysRepository.findAll();
    }

    return this.findByDateRange(
      DateUtils.toTimestamp(params.startDate),
      DateUtils.toTimestamp(params.endDate),
      params.locale ?? "PT_BR",
    );
  }

  // ===============================
  // CREATE
  // ===============================
  async create(form: HolidayFormRequest) {
    if (!form.name?.trim()) {
      throw new AppError("Nome do feriado é obrigatório");
    }

    if (!form.date) {
      throw new AppError("Data do feriado é obrigatória");
    }

    const holiday = await holidaysRepository.create({
      name: form.name.trim(),
      date: DateUtils.toTimestamp(form.date),
      fixed: form.fixed,
      locale: form.locale ?? 'PT_BR'
    });

    await holidayCacheStoreService.clear();

    return holiday;
  }

  // ===============================
  // UPDATE
  // ===============================
  async update(id: string, form: Partial<HolidayFormRequest>) {
    const updateData: Partial<HolidayEntity> = {};

    if (form.name !== undefined) {
      updateData.name = form.name.trim();
    }

    if (form.date !== undefined) {
      updateData.date = DateUtils.toTimestamp(form.date);
    }

    if (form.fixed !== undefined) {
      updateData.fixed = form.fixed;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Nenhum campo para atualizar");
    }

    const holiday = await holidaysRepository.update(id, updateData);

    await holidayCacheStoreService.clear();

    return holiday;
  }

  // ===============================
  // DELETE (soft)
  // ===============================
  async delete(id: string) {
    await holidaysRepository.delete(id);

    await holidayCacheStoreService.clear();
  }

  // ===============================
  // FIND BY DATE RANGE (já existia)
  // ===============================
  async findByDateRange(
    startTimestamp: Timestamp,
    endTimestamp: Timestamp,
    locale: string = "PT_BR",
  ): Promise<HolidayEntity[]> {
    const start = dayjs(startTimestamp.toDate()).startOf("day");
    const end = dayjs(endTimestamp.toDate()).startOf("day");

    const result: HolidayEntity[] = [];

    for (let year = start.year(); year <= end.year(); year++) {
      const holidaysOfYear = await holidayCacheStoreService.findByLocaleAndYear(locale, year);

      for (const holiday of holidaysOfYear) {
        if (!this.isHolidayInRange(holiday, start, end, year)) {
          continue;
        }

        const holidayDate = this.resolveHolidayDate(holiday, year);

        result.push({
          ...holiday,
          date: DateUtils.toTimestamp(holidayDate),
        });
      }
    }

    result.sort((a, b) => {
      const aDate = a.date.toDate();
      const bDate = b.date.toDate();

      const monthDiff = aDate.getMonth() - bDate.getMonth();
      if (monthDiff !== 0) return monthDiff;

      return aDate.getDate() - bDate.getDate();
    });

    return result;
  }

  private isHolidayInRange(holiday: HolidayEntity, start: dayjs.Dayjs, end: dayjs.Dayjs, year: number): boolean {
    const holidayDate = this.resolveHolidayDate(holiday, year);

    return holidayDate.isSameOrAfter(start, "day") && holidayDate.isSameOrBefore(end, "day");
  }

  private resolveHolidayDate(holiday: HolidayEntity, year: number): dayjs.Dayjs {
    const originalDate = dayjs(holiday.date.toDate());

    if (holiday.fixed) {
      return dayjs().year(year).month(originalDate.month()).date(originalDate.date()).startOf("day");
    }

    return originalDate.startOf("day");
  }
}

export const holidaysService = new HolidaysService();
