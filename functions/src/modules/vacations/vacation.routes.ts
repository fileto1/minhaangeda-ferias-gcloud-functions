import { Router } from "express";
import { VacationsController } from "./vacations.controller";
import { asyncHandler } from "../../middlewares/asyncHandler";

const controller = new VacationsController();
export const vacationsRoutes = Router();

// 🔥 Wrapper elegante
const wrap = (method: any) => asyncHandler(method.bind(controller));

// GET
vacationsRoutes.get("/notPending", wrap(controller.getAllNotPending));
vacationsRoutes.get("/pending", wrap(controller.getAllPending));
vacationsRoutes.get("/calendar", wrap(controller.getCalendar));
vacationsRoutes.get("/byEmployee/:employeeId", wrap(controller.getAllByEmployeeId));
vacationsRoutes.get("/allEmployeesBalance", wrap(controller.getAllEmployeesBalance));

// Sempre por último
vacationsRoutes.get("/:id", wrap(controller.getById));

// POST
vacationsRoutes.post("/", wrap(controller.create));

// PUT
vacationsRoutes.put("/status/:status/:id", wrap(controller.updateStatus));
vacationsRoutes.put("/:id", wrap(controller.update));

// DELETE
vacationsRoutes.delete("/:id", wrap(controller.delete));
