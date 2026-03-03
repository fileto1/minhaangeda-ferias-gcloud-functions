import { Request, Response } from "express";
import { HolidaysService } from "./holidays.service";
import { HolidayDto } from "./models/HolidayDto";

export class HolidaysController {
  private holidaysService: HolidaysService;

  constructor() {
    this.holidaysService = new HolidaysService();
  }

  // ===============================
  // GET /holidays
  // ===============================
  async getAll(req: Request, res: Response) {
    const { startDate, endDate, locale } = req.query;

    const holidays = await this.holidaysService.getAll({
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      locale: locale as string | undefined,
    });

    return res.json(holidays.map((e) => new HolidayDto(e)));
  }

  // ===============================
  // POST /holidays
  // ===============================
  async create(req: Request, res: Response) {
    const created = await this.holidaysService.create(req.body);

    return res.status(201).json(new HolidayDto(created));
  }

  // ===============================
  // PUT /holidays/:id
  // ===============================
  async update(req: Request, res: Response) {
    const { id } = req.params;

    const updated = await this.holidaysService.update(id, req.body);

    return res.status(200).json(new HolidayDto(updated));
  }

  // ===============================
  // DELETE /holidays/:id (soft delete)
  // ===============================
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await this.holidaysService.delete(id);

    return res.status(204).send();
  }
}
