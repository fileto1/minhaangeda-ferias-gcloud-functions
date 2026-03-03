import dayjs from "dayjs";
import { auth, db } from "../firebase";
import { EMPLOYEES_COLLECTION } from "../modules/employees/employees.repository";
import { EmployeeEntity } from "../modules/employees/models/EmployeeEntity";
import { DateUtils } from "../shared/utils/date.utils";

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: any;
  forceResetPassword: boolean;
  birthDate: Date;
  hiringDate: Date;
};

const USERS: SeedUser[] = [
  {
    email: "admin@local.com",
    password: "123123",
    name: "Administrador Local",
    role: "ADMIN",
    birthDate: dayjs("1992-08-20").toDate(),
    hiringDate: dayjs().subtract(4, "year").add(12, "day").toDate(),
    forceResetPassword: false,
  },
  {
    email: "employee@local.com",
    password: "123123",
    name: "Funcionário Local",
    role: "EMPLOYEE",
    birthDate: dayjs("1995-02-24").toDate(),
    hiringDate: dayjs().subtract(1, "year").toDate(),
    forceResetPassword: false,
  },
];

export async function seedAuthUsers() {
  for (const user of USERS) {
    let uid: string;

    // =========================
    // AUTH
    // =========================
    try {
      const existing = await auth.getUserByEmail(user.email);
      uid = existing.uid;
      // console.log(`🔹 Auth já existe: ${user.email}`);
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }

      const created = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.name,
        disabled: false,
      });

      uid = created.uid;
      console.log(`✅ Auth criado: ${user.email}`);

      // 🔥 CUSTOM CLAIM
      await auth.setCustomUserClaims(uid, {
        role: user.role,
        forceResetPassword: user.forceResetPassword,
      });
    }

    // =========================
    // FIRESTORE (EMPLOYEE)
    // =========================
    const employeeRef = db.collection(EMPLOYEES_COLLECTION).doc(uid);
    const snapshot = await employeeRef.get();

    if (!snapshot.exists) {
      const employee: EmployeeEntity = {
        uid,
        name: user.name,
        email: user.email,
        enabled: true,
        forceResetPassword: user.forceResetPassword, // 🔑 força troca no primeiro login
        role: user.role,
        birthDate: DateUtils.toTimestamp(user.birthDate),
        hiringDate: DateUtils.toTimestamp(user.hiringDate),
        deleted: false,
      };

      await employeeRef.set(employee);
      console.log(`📄 Employee criado: ${user.email}`);
    } else {
      // console.log(`📄 Employee já existe: ${user.email}`);
    }
  }
}
