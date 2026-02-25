import { Request, Response } from "express";
import { EmployeesService } from "./employee.service";

export class EmployeesController {
  private employeesService: EmployeesService;

  constructor() {
    this.employeesService = new EmployeesService();
  }

  /**
   * GET /employees/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // equivalente ao Authentication authentication
      const principal = req.user; // vindo do authMiddleware

      // if (!principal) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }

      const employee = await this.employeesService.findById(id, principal);

      return res.status(200).json(employee);
    } catch (error: any) {
      return res.status(500).json({
        message: "Error fetching employee",
        error: error.message,
      });
    }
  }
}
