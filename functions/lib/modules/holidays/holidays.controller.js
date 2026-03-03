"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidaysController = void 0;
const holidays_service_1 = require("./holidays.service");
const HolidayDto_1 = require("./models/HolidayDto");
class HolidaysController {
    constructor() {
        this.holidaysService = new holidays_service_1.HolidaysService();
    }
    // ===============================
    // GET /holidays
    // ===============================
    async getAll(req, res) {
        const { startDate, endDate, locale } = req.query;
        const holidays = await this.holidaysService.getAll({
            startDate: startDate,
            endDate: endDate,
            locale: locale,
        });
        return res.json(holidays.map((e) => new HolidayDto_1.HolidayDto(e)));
    }
    // ===============================
    // POST /holidays
    // ===============================
    async create(req, res) {
        const created = await this.holidaysService.create(req.body);
        return res.status(201).json(new HolidayDto_1.HolidayDto(created));
    }
    // ===============================
    // PUT /holidays/:id
    // ===============================
    async update(req, res) {
        const { id } = req.params;
        const updated = await this.holidaysService.update(id, req.body);
        return res.status(200).json(new HolidayDto_1.HolidayDto(updated));
    }
    // ===============================
    // DELETE /holidays/:id (soft delete)
    // ===============================
    async delete(req, res) {
        const { id } = req.params;
        await this.holidaysService.delete(id);
        return res.status(204).send();
    }
}
exports.HolidaysController = HolidaysController;
//# sourceMappingURL=holidays.controller.js.map