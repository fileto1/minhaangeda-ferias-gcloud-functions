"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationsRoutes = void 0;
const express_1 = require("express");
const vacations_controller_1 = require("./vacations.controller");
// import { authMiddleware } from '../../middlewares/auth.middleware';
const controller = new vacations_controller_1.VacationsController();
exports.vacationsRoutes = (0, express_1.Router)();
// vacationsRoutes.use(authMiddleware);
exports.vacationsRoutes.get('/pending', controller.getAllPending);
exports.vacationsRoutes.get('/:id', controller.getById);
exports.vacationsRoutes.get('/byEmployee/:employeeId', controller.getAllByEmployeeId);
exports.vacationsRoutes.get('/allEmployeesBalance', controller.getAllEmployeesBalance);
exports.vacationsRoutes.get('/calendar', controller.getCalendar);
exports.vacationsRoutes.post('/', controller.create);
exports.vacationsRoutes.put('/:id', controller.update);
exports.vacationsRoutes.put('/status/:status/:id', controller.updateStatus);
exports.vacationsRoutes.delete('/:id', controller.delete);
//# sourceMappingURL=vacation.routes.js.map