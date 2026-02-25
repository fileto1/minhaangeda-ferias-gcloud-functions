"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacationService = void 0;
const vacation_repository_1 = require("./vacation.repository");
class VacationService {
    constructor(repository = new vacation_repository_1.VacationRepository()) {
        this.repository = repository;
    }
    async create(data) {
        // regra de negócio
        if (data.startDate > data.endDate) {
            throw new Error("Data inicial maior que data final");
        }
        data.status = "PENDING";
        data.createdAt = new Date();
        return this.repository.save(data);
    }
    async list() {
        return this.repository.findAll();
    }
}
exports.VacationService = VacationService;
//# sourceMappingURL=vacation.service.js.map