"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesService = void 0;
const firebase_1 = require("../../firebase");
const firestore_1 = require("firebase-admin/firestore");
const AppError_1 = require("../../shared/errors/AppError");
const date_utils_1 = require("../../shared/utils/date.utils");
const employees_repository_1 = require("./employees.repository");
class EmployeesService {
    async findAll() {
        return employees_repository_1.employeesRepository.findAll();
    }
    async findById(uid) {
        const employee = await employees_repository_1.employeesRepository.findByUid(uid);
        if (!employee)
            throw new AppError_1.AppError("Funcionário não encontrado", 404);
        return employee;
    }
    async create(form) {
        // 🔐 1. Criar no Auth
        const createdAuth = await firebase_1.auth.createUser({
            email: form.email,
            password: form.password,
            disabled: false,
        });
        const uid = createdAuth.uid;
        const data = {
            name: form.name,
            email: form.email,
            enabled: true,
            role: "EMPLOYEE",
            forceResetPassword: true,
            deleted: false,
            createdAt: firestore_1.Timestamp.now(),
        };
        // 🔥 Só adiciona se existir
        if (form.birthDate) {
            data.birthDate = date_utils_1.DateUtils.toTimestamp(form.birthDate);
        }
        if (form.hiringDate) {
            data.hiringDate = date_utils_1.DateUtils.toTimestamp(form.hiringDate);
        }
        // 📄 2. Criar Firestore
        const employee = await employees_repository_1.employeesRepository.create(uid, data);
        return employee;
    }
    async update(uid, form, user) {
        const employee = await employees_repository_1.employeesRepository.findByUid(uid);
        if (!employee)
            throw new AppError_1.AppError("Funcionário não encontrado", 404);
        const isAdmin = user.role === "ADMIN";
        // 🔐 Validações de permissão
        if (!isAdmin) {
            if (form.email && form.email !== employee.email) {
                throw new AppError_1.AppError("Você não tem permissão para editar email de funcionário", 403);
            }
            if (form.role && form.role !== employee.role) {
                throw new AppError_1.AppError("Você não tem permissão para editar perfil de funcionário", 403);
            }
            if (form.password !== undefined) {
                throw new AppError_1.AppError("Você não tem permissão para redefinir a senha", 403);
            }
        }
        // 🧠 Monta objeto tipado
        const data = {
            updatedAt: firestore_1.Timestamp.now(),
        };
        if (form.name !== undefined)
            data.name = form.name;
        if (form.email !== undefined)
            data.email = form.email;
        if (form.role !== undefined)
            data.role = form.role;
        if (form.enabled !== undefined)
            data.enabled = form.enabled;
        if (form.birthDate !== undefined && form.birthDate != null) {
            data.birthDate = date_utils_1.DateUtils.toTimestamp(form.birthDate);
        }
        if (form.hiringDate !== undefined && form.hiringDate != null) {
            data.hiringDate = date_utils_1.DateUtils.toTimestamp(form.hiringDate);
        }
        // 🔥 Se vier password (admin only), marcar reset obrigatório
        if (form.password !== undefined) {
            data.forceResetPassword = true;
        }
        // 📄 Atualiza Firestore
        const updated = await employees_repository_1.employeesRepository.update(uid, data);
        // 🔐 Atualiza Firebase Auth
        const authUpdatePayload = {};
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
            await firebase_1.auth.updateUser(uid, authUpdatePayload);
        }
        return updated;
    }
    async softDelete(uid) {
        const employee = await employees_repository_1.employeesRepository.findByUid(uid);
        if (!employee)
            throw new AppError_1.AppError("Funcionário não encontrado", 404);
        // 🔐 Desabilita Auth
        await firebase_1.auth.updateUser(uid, { disabled: true });
        // 📄 Soft delete Firestore
        await employees_repository_1.employeesRepository.update(uid, {
            deleted: true,
            enabled: false,
            updatedAt: firestore_1.Timestamp.now(),
        });
    }
    async updateForceResetPwd(uid, value) {
        const employee = await employees_repository_1.employeesRepository.findByUid(uid);
        if (!employee)
            throw new AppError_1.AppError("Funcionário não encontrado", 404);
        return employees_repository_1.employeesRepository.update(uid, {
            forceResetPassword: value,
        });
    }
}
exports.employeesService = new EmployeesService();
//# sourceMappingURL=employee.service.js.map