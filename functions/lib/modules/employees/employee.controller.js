"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const employee_service_1 = require("./employee.service");
const models_1 = require("./models");
const AppError_1 = require("../../shared/errors/AppError");
class EmployeesController {
    async getAll(req, res) {
        const result = await employee_service_1.employeesService.findAll();
        return res.json(result.map((e) => new models_1.EmployeeDto(e)));
    }
    async getById(req, res) {
        const { id } = req.params;
        const result = await employee_service_1.employeesService.findById(id);
        return res.json(new models_1.EmployeeDto(result));
    }
    async create(req, res) {
        const user = req.user;
        if (user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para criar funcionário.", 404);
        }
        const result = await employee_service_1.employeesService.create(req.body);
        return res.status(201).json(new models_1.EmployeeDto(result));
    }
    async update(req, res) {
        const { id } = req.params;
        const user = req.user;
        const form = req.body;
        if (user.uid !== form.uid && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para editar este funcionário.", 404);
        }
        const result = await employee_service_1.employeesService.update(id, form, user);
        return res.json(new models_1.EmployeeDto(result));
    }
    async delete(req, res) {
        const { id } = req.params;
        await employee_service_1.employeesService.softDelete(id);
        return res.send();
    }
    async clearForceResetPassword(req, res) {
        const user = req.user;
        const updated = await employee_service_1.employeesService.updateForceResetPwd(user.uid, false);
        return res.json(new models_1.EmployeeDto(updated));
    }
}
exports.EmployeesController = EmployeesController;
//# sourceMappingURL=employee.controller.js.map