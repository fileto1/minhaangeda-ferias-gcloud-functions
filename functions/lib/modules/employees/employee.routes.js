"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesRoutes = void 0;
const express_1 = require("express");
const employee_controller_1 = require("./employee.controller");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const controller = new employee_controller_1.EmployeesController();
exports.employeesRoutes = (0, express_1.Router)();
const wrap = (method) => (0, asyncHandler_1.asyncHandler)(method.bind(controller));
// GET
exports.employeesRoutes.get("/", wrap(controller.getAll));
exports.employeesRoutes.get("/:id", wrap(controller.getById));
// POST
exports.employeesRoutes.post("/", wrap(controller.create));
// PUT
exports.employeesRoutes.put("/clearForceResetPassword", wrap(controller.clearForceResetPassword));
exports.employeesRoutes.put("/:id", wrap(controller.update));
// DELETE (soft)
exports.employeesRoutes.delete("/:id", wrap(controller.delete));
//# sourceMappingURL=employee.routes.js.map