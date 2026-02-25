import { auth, db } from "../firebase";
import { EmployeeEntity } from "../modules/employees/models/EmployeeEntity";

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: any;
  ceo: boolean;
};

const USERS: SeedUser[] = [
  {
    email: "admin@local.com",
    password: "123456",
    name: "Administrador Local",
    role: "ADMIN",
    ceo: true,
  },
  {
    email: "employee@local.com",
    password: "123456",
    name: "Funcionário Local",
    role: "EMPLOYEE",
    ceo: false,
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
    }

    // =========================
    // FIRESTORE (EMPLOYEE)
    // =========================
    const employeeRef = db.collection("employees").doc(uid);
    const snapshot = await employeeRef.get();

    if (!snapshot.exists) {
      const employee: EmployeeEntity = {
        uid,
        name: user.name,
        email: user.email,
        enabled: true,
        forceResetPassword: true, // 🔑 força troca no primeiro login
        role: user.role,
        birthDate: new Date().toISOString().substring(0, 10),
        hiringDate: new Date().toISOString().substring(0, 10),
        ceo: user.ceo,
        deleted: false,
      };

      await employeeRef.set(employee);
      console.log(`📄 Employee criado: ${user.email}`);
    } else {
      // console.log(`📄 Employee já existe: ${user.email}`);
    }
  }
}
