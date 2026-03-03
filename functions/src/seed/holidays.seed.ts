import { db } from "../firebase";
import { DateUtils } from "../shared/utils/date.utils";
import { HOLIDAYS_COLLECTION } from "../modules/holidays/holidays.repository";

interface HolidaySeed {
  id: string;
  name: string;
  date: string;
  fixed: boolean;
  locale: string;
}

export async function seedHolidays() {

  const holidays: HolidaySeed[] = [
    { id: "1", name: "Ano Novo", date: "2021-01-01", fixed: true, locale: "PT_BR" },
    { id: "2", name: "Tiradentes", date: "2021-04-21", fixed: true, locale: "PT_BR" },
    { id: "3", name: "Dia do trabalho", date: "2021-05-01", fixed: true, locale: "PT_BR" },
    { id: "4", name: "Independência do Brasil", date: "2021-09-07", fixed: true, locale: "PT_BR" },
    { id: "5", name: "Nossa Sra. Aparecida", date: "2021-10-12", fixed: true, locale: "PT_BR" },
    { id: "6", name: "Finados", date: "2021-11-02", fixed: true, locale: "PT_BR" },
    { id: "7", name: "Proclamação da República", date: "2021-11-15", fixed: true, locale: "PT_BR" },
    { id: "8", name: "Natal", date: "2021-12-25", fixed: true, locale: "PT_BR" },
    { id: "9", name: "Carnaval", date: "2022-02-28", fixed: false, locale: "PT_BR" },
    { id: "10", name: "Carnaval", date: "2022-03-01", fixed: false, locale: "PT_BR" },
    { id: "11", name: "Paixão de Cristo", date: "2022-04-15", fixed: false, locale: "PT_BR" },
    { id: "12", name: "Corpus Christi", date: "2022-06-16", fixed: false, locale: "PT_BR" },
    { id: "13", name: "Carnaval 2026", date: "2026-02-17", fixed: false, locale: "PT_BR" },
    { id: "14", name: "Véspera Carnaval", date: "2026-02-16", fixed: false, locale: "PT_BR" },
  ];

  for (const holiday of holidays) {

    await db.collection(HOLIDAYS_COLLECTION).doc(holiday.id).set({
      name: holiday.name,
      date: DateUtils.toTimestamp(holiday.date),
      fixed: holiday.fixed,
      locale: holiday.locale,
    }, { merge: true });

  }

  console.log("✅ Holidays seed executado com sucesso.");
}