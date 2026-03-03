import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HolidaysController } from "./holidays.controller";

const controller = new HolidaysController();
export const holidaysRoutes = Router();

const wrap = (method: any) => asyncHandler(method.bind(controller));

// GET
holidaysRoutes.get("/", wrap(controller.getAll));

// POST
holidaysRoutes.post("/", wrap(controller.create));

// PUT
holidaysRoutes.put("/:id", wrap(controller.update));

// DELETE (soft)
holidaysRoutes.delete("/:id", wrap(controller.delete));
