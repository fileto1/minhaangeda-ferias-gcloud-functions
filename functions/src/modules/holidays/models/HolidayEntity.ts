import { Timestamp } from "firebase-admin/firestore";

export interface HolidayEntity {
  id?: string;
  name: string;
  date: Timestamp;
  fixed: boolean;
  locale: string;
}
