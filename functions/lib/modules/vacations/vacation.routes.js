"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationsRoutes = void 0;
const express_1 = require("express");
const vacations_controller_1 = require("./vacations.controller");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const controller = new vacations_controller_1.VacationsController();
exports.vacationsRoutes = (0, express_1.Router)();
// 🔥 Wrapper elegante
const wrap = (method) => (0, asyncHandler_1.asyncHandler)(method.bind(controller));
// GET
exports.vacationsRoutes.get("/notPending", wrap(controller.getAllNotPending));
exports.vacationsRoutes.get("/pending", wrap(controller.getAllPending));
exports.vacationsRoutes.get("/calendar", wrap(controller.getCalendar));
exports.vacationsRoutes.get("/byEmployee/:employeeId", wrap(controller.getAllByEmployeeId));
exports.vacationsRoutes.get("/allEmployeesBalance", wrap(controller.getAllEmployeesBalance));
// Sempre por último
exports.vacationsRoutes.get("/:id", wrap(controller.getById));
// POST
exports.vacationsRoutes.post("/", wrap(controller.create));
// PUT
exports.vacationsRoutes.put("/status/:status/:id", wrap(controller.updateStatus));
exports.vacationsRoutes.put("/:id", wrap(controller.update));
// DELETE
exports.vacationsRoutes.delete("/:id", wrap(controller.delete));
//# sourceMappingURL=vacation.routes.js.map