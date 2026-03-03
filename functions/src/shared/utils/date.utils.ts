import dayjs, { Dayjs } from "dayjs";
import { Timestamp } from "firebase-admin/firestore";

export class DateUtils {
  /**
   * Converte string | Date | Dayjs para Firestore Timestamp
   */
  static toTimestamp(value: string | Date | Dayjs, normalize: boolean = true): Timestamp {
    const d = dayjs(value);
    const normalized = normalize ? d.startOf("day") : d;

    return Timestamp.fromDate(normalized.toDate());
  }

  /**
   * Converte Timestamp para Dayjs
   */
  static toDayjs(timestamp?: Timestamp): Dayjs | undefined {
    if (!timestamp) return undefined;
    return dayjs(timestamp.toDate());
  }

  /**
   * Converte Timestamp para Dayjs no StartOfDay
   */
  static toDayjsStartOfDay(timestamp: Timestamp): Dayjs {
    return dayjs(timestamp.toDate()).startOf("day");
  }

  /**
   * Converte Timestamp para YYYY-MM-DD
   */
  static toISO(timestamp?: Timestamp): string | undefined {
    if (!timestamp) return undefined;
    return dayjs(timestamp.toDate()).format("YYYY-MM-DD");
  }

  /**
   * Cria range de Timestamp
   */
  static toRange(start: string, end: string) {
    return {
      start: this.toTimestamp(start),
      end: this.toTimestamp(end),
    };
  }

  static isSameTimestamp(a?: Timestamp, b?: Timestamp) {
    if (!a || !b) return a === b;
    return a.toMillis() === b.toMillis();
  }
}
