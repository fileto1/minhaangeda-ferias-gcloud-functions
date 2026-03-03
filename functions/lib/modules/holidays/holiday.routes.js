"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidaysRoutes = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const holidays_controller_1 = require("./holidays.controller");
const controller = new holidays_controller_1.HolidaysController();
exports.holidaysRoutes = (0, express_1.Router)();
const wrap = (method) => (0, asyncHandler_1.asyncHandler)(method.bind(controller));
// GET
exports.holidaysRoutes.get("/", wrap(controller.getAll));
// POST
exports.holidaysRoutes.post("/", wrap(controller.create));
// PUT
exports.holidaysRoutes.put("/:id", wrap(controller.update));
// DELETE (soft)
exports.holidaysRoutes.delete("/:id", wrap(controller.delete));
//# sourceMappingURL=holiday.routes.js.map