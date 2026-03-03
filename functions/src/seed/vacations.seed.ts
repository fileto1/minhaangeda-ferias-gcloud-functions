import { db } from "../firebase";
import { DateUtils } from "../shared/utils/date.utils";
import { VACATIONS_COLLECTION } from "../modules/vacations/vacations.repository";
import { EmployeeVacationStatusEnum } from "../modules/vacations/models";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";

const auth = getAuth();

export async function seedVacations() {
  // 🔥 Buscar usuário pelo emaail
  const userRecord = await auth.getUserByEmail("employee@local.com");

  const employeeUid = userRecord.uid;
  const employeeName = userRecord.displayName ?? "Funcionário Local";

  const vacations = [
    {
      id: "vac1",
      employeeUid: employeeUid,
      employeeName: employeeName,
      startDate: "2026-03-12",
      endDate: "2026-03-23",
      notes: "8 dias reais",
      status: EmployeeVacationStatusEnum.APPROVED,
    },
    {
      id: "vac2",
      employeeUid: employeeUid,
      employeeName: employeeName,
      startDate: "2026-03-01",
      endDate: "2026-03-10",
      notes: "7 dias reais",
      status: EmployeeVacationStatusEnum.APPROVED,
    },
    {
      id: "vac3",
      employeeUid: employeeUid,
      employeeName: employeeName,
      startDate: "2026-04-13",
      endDate: "2026-04-26",
      notes: "9 dias reais",
      status: EmployeeVacationStatusEnum.APPROVED,
    },
  ];

  for (const v of vacations) {
    const startTimestamp = DateUtils.toTimestamp(v.startDate);
    const endTimestamp = DateUtils.toTimestamp(v.endDate);

    const daysQuantity = DateUtils.toDayjs(endTimestamp)!.diff(DateUtils.toDayjs(startTimestamp)!, "day") + 1;

    await db.collection(VACATIONS_COLLECTION).doc(v.id).set(
      {
        employeeUid: v.employeeUid,
        employeeName: v.employeeName,

        startDate: startTimestamp,
        endDate: endTimestamp,

        notes: v.notes,
        daysQuantity,
        balanceUsedDays: daysQuantity,
        status: v.status,
        deleted: false,

        createdAt: Timestamp.now(),
      },
      { merge: true },
    );
  }
}
