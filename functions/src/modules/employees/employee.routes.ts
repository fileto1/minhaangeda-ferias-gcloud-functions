import { Router } from "express";
import { EmployeesController } from "./employee.controller";
// import { authMiddleware } from '../../middlewares/auth.middleware';

const controller = new EmployeesController();
export const employeesRoutes = Router();

// employeesRoutes.use(authMiddleware);

// consultas
employeesRoutes.get("/:id", controller.getById);
