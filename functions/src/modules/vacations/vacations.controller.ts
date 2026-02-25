import { Request, Response } from 'express';
import { vacationsService } from './vacations.service';

export class VacationsController {
  async getAllPending(req: Request, res: Response) {
    const user = req.user;

    if (user.role !== 'CEO') {
      return res.status(403).json({
        message: 'Você não tem permissão para consultar férias de todos funcionários.'
      });
    }

    const result = await vacationsService.getAllPendingStatus();
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

    if (user.uid !== employeeId && user.role !== 'CEO') {
      return res.status(403).json({
        message: 'Você não tem permissão para buscar férias deste funcionário.'
      });
    }

    const result = await vacationsService.getByEmployeeId(employeeId);
    return res.json(result);
  }

  async getAllEmployeesBalance(req: Request, res: Response) {
    const { date } = req.query;
    const user = req.user;

    if (user.role !== 'CEO') {
      return res.status(403).json({
        message: 'Você não tem permissão para buscar férias de todos os funcionários.'
      });
    }

    const result = await vacationsService.getAllEmployeeVacationsByDate(
      date as string
    );

    return res.json(result);
  }

  async getCalendar(req: Request, res: Response) {
    const { startDate, endDate } = req.query;

    const result = await vacationsService.getCalendarSummary(
      startDate as string,
      endDate as string
    );

    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const user = req.user;
    const form = req.body;

    if (user.uid !== form.employeeUid && user.role !== 'CEO') {
      return res.status(403).json({
        message: 'Você não tem permissão criar férias para este funcionário.'
      });
    }

    await vacationsService.create(form);
    return res.status(201).send();
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    const form = req.body;

    if (user.uid !== form.employeeUid && user.role !== 'CEO') {
      return res.status(403).json({
        message: 'Você não tem permissão para editar férias para este funcionário.'
      });
    }

    await vacationsService.update(id, form);
    return res.send();
  }

  async updateStatus(req: Request, res: Response) {
    const { id, status } = req.params;
    const user = req.user;

    if (user.role !== 'CEO') {
      return res.status(403).json({
        message: 'Você não tem permissão para editar férias para este funcionário.'
      });
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