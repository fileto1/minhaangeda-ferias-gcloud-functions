import { auth } from "../../firebase";
import { Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../shared/errors/AppError";
import { DateUtils } from "../../shared/utils/date.utils";
import { employeesRepository } from "./employees.repository";
import { EmployeeFormRequest } from "./models/EmployeeFormRequest";
import { AuthenticatedUser } from "../../middlewares/auth.middleware";
import { EmployeeEntity } from "./models/EmployeeEntity";

class EmployeesService {
  async findAll() {
    return employeesRepository.findAll();
  }

  async findById(uid: string) {
    const employee = await employeesRepository.findByUid(uid);
    if (!employee) throw new AppError("Funcionário não encontrado", 404);
    return employee;
  }

  async create(form: EmployeeFormRequest) {
    // 🔐 1. Criar no Auth
    const createdAuth = await auth.createUser({
      email: form.email,
      password: form.password,
      disabled: false,
    });

    const uid = createdAuth.uid;

    const data: any = {
      name: form.name,
      email: form.email!,
      enabled: true,
      role: "EMPLOYEE",
      forceResetPassword: true,
      deleted: false,
      createdAt: Timestamp.now(),
    };

    // 🔥 Só adiciona se existir
    if (form.birthDate) {
      data.birthDate = DateUtils.toTimestamp(form.birthDate);
    }

    if (form.hiringDate) {
      data.hiringDate = DateUtils.toTimestamp(form.hiringDate);
    }

    // 📄 2. Criar Firestore
    const employee = await employeesRepository.create(uid, data);

    return employee;
  }

  async update(uid: string, form: EmployeeFormRequest, user: AuthenticatedUser) {
    const employee = await employeesRepository.findByUid(uid);
    if (!employee) throw new AppError("Funcionário não encontrado", 404);

    const isAdmin = user.role === "ADMIN";

    // 🔐 Validações de permissão
    if (!isAdmin) {
      if (form.email && form.email !== employee.email) {
        throw new AppError("Você não tem permissão para editar email de funcionário", 403);
      }

      if (form.role && form.role !== employee.role) {
        throw new AppError("Você não tem permissão para editar perfil de funcionário", 403);
      }

      if (form.password !== undefined) {
        throw new AppError("Você não tem permissão para redefinir a senha", 403);
      }
    }

    // 🧠 Monta objeto tipado
    const data: Partial<EmployeeEntity> = {
      updatedAt: Timestamp.now(),
    };

    if (form.name !== undefined) data.name = form.name;
    if (form.email !== undefined) data.email = form.email;
    if (form.role !== undefined) data.role = form.role;
    if (form.enabled !== undefined) data.enabled = form.enabled;

    if (form.birthDate !== undefined && form.birthDate != null) {
      data.birthDate = DateUtils.toTimestamp(form.birthDate);
    }

    if (form.hiringDate !== undefined && form.hiringDate != null) {
      data.hiringDate = DateUtils.toTimestamp(form.hiringDate);
    }

    // 🔥 Se vier password (admin only), marcar reset obrigatório
    if (form.password !== undefined) {
      data.forceResetPassword = true;
    }

    // 📄 Atualiza Firestore
    const updated = await employeesRepository.update(uid, data);

    // 🔐 Atualiza Firebase Auth
    const authUpdatePayload: {
      email?: string;
      disabled?: boolean;
      password?: string;
    } = {};

    if (form.email && form.email !== employee.email) {
      authUpdatePayload.email = form.email;
    }

    if (form.enabled !== undefined) {
      authUpdatePayload.disabled = !form.enabled;
    }

    if (form.password !== undefined) {
      authUpdatePayload.password = form.password;
    }

    if (Object.keys(authUpdatePayload).length > 0) {
      await auth.updateUser(uid, authUpdatePayload);
    }

    return updated;
  }

  async softDelete(uid: string) {
    const employee = await employeesRepository.findByUid(uid);
    if (!employee) throw new AppError("Funcionário não encontrado", 404);

    // 🔐 Desabilita Auth
    await auth.updateUser(uid, { disabled: true });

    // 📄 Soft delete Firestore
    await employeesRepository.update(uid, {
      deleted: true,
      enabled: false,
      updatedAt: Timestamp.now(),
    });
  }

  async updateForceResetPwd(uid: string, value: boolean) {
    const employee = await employeesRepository.findByUid(uid);
    if (!employee) throw new AppError("Funcionário não encontrado", 404);

    return employeesRepository.update(uid, {
      forceResetPassword: value,
    });
  }
}

export const employeesService = new EmployeesService();
