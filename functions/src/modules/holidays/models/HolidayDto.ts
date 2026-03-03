import { HolidayEntity } from "./HolidayEntity";
import { DateUtils } from "../../../shared/utils/date.utils";

export class HolidayDto {
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly fixed: boolean;
  readonly locale: string;

  constructor(holiday: HolidayEntity) {
    this.id = holiday.id ?? '';
    this.name = holiday.name;
    this.date = DateUtils.toISO(holiday.date)!;
    this.fixed = holiday.fixed;
    this.locale = holiday.locale;
  }
}
