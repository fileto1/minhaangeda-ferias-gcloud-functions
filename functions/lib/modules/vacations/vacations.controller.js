"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacationsController = void 0;
const vacations_service_1 = require("./vacations.service");
const AppError_1 = require("../../shared/errors/AppError");
class VacationsController {
    async getAllPending(req, res) {
        const user = req.user;
        if (user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para consultar férias de todos funcionários.", 404);
        }
        const result = await vacations_service_1.vacationsService.getAllPendingStatus();
        return res.json(result);
    }
    async getAllNotPending(req, res) {
        const { date } = req.query;
        const user = req.user;
        if (user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para consultar férias de todos funcionários.", 404);
        }
        const result = await vacations_service_1.vacationsService.getAllNotPendingStatus(date);
        return res.json(result);
    }
    async getById(req, res) {
        const { id } = req.params;
        const user = req.user;
        const result = await vacations_service_1.vacationsService.getById(id, user);
        return res.json(result);
    }
    async getAllByEmployeeId(req, res) {
        const { employeeId } = req.params;
        const user = req.user;
        if (user.uid !== employeeId && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para buscar férias deste funcionário.", 404);
        }
        const result = await vacations_service_1.vacationsService.getByEmployeeId(employeeId);
        return res.json(result);
    }
    async getAllEmployeesBalance(req, res) {
        const { date } = req.query;
        const user = req.user;
        if (user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para buscar férias de todos os funcionários.", 404);
        }
        const result = await vacations_service_1.vacationsService.getAllEmployeeVacationsByDate(date);
        return res.json(result);
    }
    async getCalendar(req, res) {
        const { startDate, endDate } = req.query;
        const result = await vacations_service_1.vacationsService.getCalendarSummary(startDate, endDate);
        return res.json(result);
    }
    async create(req, res) {
        const user = req.user;
        const form = req.body;
        if (user.uid !== form.employeeUid && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão criar férias para este funcionário.", 404);
        }
        await vacations_service_1.vacationsService.create(form);
        return res.status(201).send();
    }
    async update(req, res) {
        const { id } = req.params;
        const user = req.user;
        const form = req.body;
        if (user.uid !== form.employeeUid && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para editar férias para este funcionário.", 404);
        }
        await vacations_service_1.vacationsService.update(id, form);
        return res.send();
    }
    async updateStatus(req, res) {
        const { id, status } = req.params;
        const user = req.user;
        if (user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para editar férias para este funcionário.", 404);
        }
        await vacations_service_1.vacationsService.updateStatus(id, status);
        return res.send();
    }
    async delete(req, res) {
        const { id } = req.params;
        const user = req.user;
        await vacations_service_1.vacationsService.delete(id, user);
        return res.status(204).send();
    }
}
exports.VacationsController = VacationsController;
//# sourceMappingURL=vacations.controller.js.map