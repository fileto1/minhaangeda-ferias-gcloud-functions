import { Request, Response } from "express";
import { vacationsService } from "./vacations.service";
import { AppError } from "../../shared/errors/AppError";

export class VacationsController {
  async getAllPending(req: Request, res: Response) {
    const user = req.user;

    if (user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para consultar férias de todos funcionários.", 404);
    }

    const result = await vacationsService.getAllPendingStatus();
    return res.json(result);
  }

  async getAllNotPending(req: Request, res: Response) {
    const { date } = req.query;
    const user = req.user;

    if (user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para consultar férias de todos funcionários.", 404);
    }

    const result = await vacationsService.getAllNotPendingStatus(date as string);
    return res.json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;

    const result = await vacationsService.getById(id, user);
    return res.json(result);
  }

  async getAllByEmployeeId(req: Request, res: Response) {
    const { employeeId } = req.params;
    const user = req.user;

    if (user.uid !== employeeId && user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para buscar férias deste funcionário.", 404);
    }

    const result = await vacationsService.getByEmployeeId(employeeId);
    return res.json(result);
  }

  async getAllEmployeesBalance(req: Request, res: Response) {
    const { date } = req.query;
    const user = req.user;

    if (user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para buscar férias de todos os funcionários.", 404);
    }

    const result = await vacationsService.getAllEmployeeVacationsByDate(date as string);

    return res.json(result);
  }

  async getCalendar(req: Request, res: Response) {
    const { startDate, endDate } = req.query;

    const result = await vacationsService.getCalendarSummary(startDate as string, endDate as string);

    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const user = req.user;
    const form = req.body;

    if (user.uid !== form.employeeUid && user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão criar férias para este funcionário.", 404);
    }

    await vacationsService.create(form);
    return res.status(201).send();
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    const form = req.body;

    if (user.uid !== form.employeeUid && user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para editar férias para este funcionário.", 404);
    }

    await vacationsService.update(id, form);
    return res.send();
  }

  async updateStatus(req: Request, res: Response) {
    const { id, status } = req.params;
    const user = req.user;

    if (user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para editar férias para este funcionário.", 404);
    }

    await vacationsService.updateStatus(id, status);
    return res.send();
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;

    await vacationsService.delete(id, user);
    return res.status(204).send();
  }
}
