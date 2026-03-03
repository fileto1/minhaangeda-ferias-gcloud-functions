import { Router } from "express";
import { EmployeesController } from "./employee.controller";
import { asyncHandler } from "../../middlewares/asyncHandler";

const controller = new EmployeesController();
export const employeesRoutes = Router();

const wrap = (method: any) => asyncHandler(method.bind(controller));

// GET
employeesRoutes.get("/", wrap(controller.getAll));
employeesRoutes.get("/:id", wrap(controller.getById));

// POST
employeesRoutes.post("/", wrap(controller.create));

// PUT
employeesRoutes.put("/clearForceResetPassword", wrap(controller.clearForceResetPassword));
employeesRoutes.put("/:id", wrap(controller.update));

// DELETE (soft)
employeesRoutes.delete("/:id", wrap(controller.delete));
