"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesRoutes = void 0;
const express_1 = require("express");
const employee_controller_1 = require("./employee.controller");
// import { authMiddleware } from '../../middlewares/auth.middleware';
const controller = new employee_controller_1.EmployeesController();
exports.employeesRoutes = (0, express_1.Router)();
// employeesRoutes.use(authMiddleware);
// consultas
exports.employeesRoutes.get("/:id", controller.getById);
//# sourceMappingURL=employee.routes.js.map