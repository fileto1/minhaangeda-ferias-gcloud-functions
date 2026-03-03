import { Request, Response } from "express";
import { employeesService } from "./employee.service";
import { EmployeeDto } from "./models";
import { AppError } from "../../shared/errors/AppError";

export class EmployeesController {
  async getAll(req: Request, res: Response) {
    const result = await employeesService.findAll();
    return res.json(result.map((e) => new EmployeeDto(e)));
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await employeesService.findById(id);
    return res.json(new EmployeeDto(result));
  }

  async create(req: Request, res: Response) {
    const user = req.user;
    if (user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para criar funcionário.", 404);
    }

    const result = await employeesService.create(req.body);
    return res.status(201).json(new EmployeeDto(result));
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    const form = req.body;

    if (user.uid !== form.uid && user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para editar este funcionário.", 404);
    }

    const result = await employeesService.update(id, form, user);
    return res.json(new EmployeeDto(result));
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await employeesService.softDelete(id);
    return res.send();
  }

  async clearForceResetPassword(req: Request, res: Response) {
    const user = req.user;
    const updated = await employeesService.updateForceResetPwd(user.uid, false);
    return res.json(new EmployeeDto(updated));
  }
}
