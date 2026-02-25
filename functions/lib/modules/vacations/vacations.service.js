"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationsService = exports.FIRST_YEAR_TO_COUNT = exports.VACATION_DAYS_IN_A_YEAR = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const vacations_repository_1 = require("./vacations.repository");
const employees_repository_1 = require("../employees/employees.repository");
const models_1 = require("./models");
const holidays_service_1 = require("../holidays/holidays.service");
const models_2 = require("../employees/models");
exports.VACATION_DAYS_IN_A_YEAR = 20;
exports.FIRST_YEAR_TO_COUNT = 2025;
class VacationsService {
    /* =====================================================
     * GET ALL PENDING
     * ===================================================== */
    async getAllPendingStatus() {
        const vacations = await vacations_repository_1.vacationsRepository.findAllPending();
        return vacations.map((v) => new models_1.EmployeeVacationItemDTO(v, 0));
    }
    /* =====================================================
     * CALENDAR
     * ===================================================== */
    async getCalendarSummary(startDate, endDate) {
        const vacations = await vacations_repository_1.vacationsRepository.findApprovedByDateRange(startDate, endDate);
        const holidays = await holidays_service_1.holidaysService.findByDateRange(startDate, endDate, "PT_BR");
        return new models_1.CalendarSummaryResponseDTO(vacations.map((v) => new models_1.EmployeeVacationItemDTO(v, 0)), holidays);
    }
    /* =====================================================
     * GET BY ID
     * ===================================================== */
    async getById(id, user) {
        const vacation = await vacations_repository_1.vacationsRepository.findById(id);
        if (!vacation) {
            throw new Error("Férias não encontrada");
        }
        if (vacation.employeeUid !== user.uid && user.role !== "CEO") {
            throw new Error("Você não tem permissão para buscar as férias deste funcionário.");
        }
        return vacation;
    }
    /* =====================================================
     * BALANCE BY YEAR
     * ===================================================== */
    async getAllEmployeeVacationsByDate(date) {
        const targetYear = (0, dayjs_1.default)(date).year();
        if (targetYear < exports.FIRST_YEAR_TO_COUNT) {
            throw new Error(`Não é possível buscar para ano anterior a: ${exports.FIRST_YEAR_TO_COUNT}`);
        }
        const employees = await employees_repository_1.employeesRepository.findAllNotCeo();
        const maxDate = (0, dayjs_1.default)(`${targetYear}-12-31`)
            .add(1, "year")
            .format("YYYY-MM-DD");
        const vacations = await vacations_repository_1.vacationsRepository.findApprovedUntil(maxDate);
        const vacationsByEmployee = new Map();
        vacations.forEach((v) => {
            const list = vacationsByEmployee.get(v.employeeUid) ?? [];
            list.push(v);
            vacationsByEmployee.set(v.employeeUid, list);
        });
        const response = [];
        for (const employee of employees) {
            const employeeVacations = vacationsByEmployee.get(employee.uid) ?? [];
            const usedDaysMap = await this.calculateUsedDaysPerYearFromList(employeeVacations, targetYear);
            const usedDays = usedDaysMap[targetYear] ?? 0;
            const remaining = exports.VACATION_DAYS_IN_A_YEAR - usedDays;
            response.push(new models_1.EmployeeBalanceVacationsResponseDTO(remaining, usedDays, String(targetYear), new models_2.EmployeeDto(employee)));
        }
        return response.sort((a, b) => b.balanceDays - a.balanceDays);
    }
    /* =====================================================
     * BY EMPLOYEE
     * ===================================================== */
    async getByEmployeeId(employeeUid) {
        const employee = await employees_repository_1.employeesRepository.findByUid(employeeUid);
        if (!employee?.hiringDate) {
            throw new Error("Necessário configurar data de contratação antes de buscar férias.");
        }
        const currentYear = (0, dayjs_1.default)().year();
        const yearControl = new Map();
        for (let year = exports.FIRST_YEAR_TO_COUNT; year <= currentYear; year++) {
            yearControl.set(year, { year, usedDays: 0, vacations: [] });
        }
        const vacations = await vacations_repository_1.vacationsRepository.findByEmployee(employeeUid);
        for (const vacation of vacations) {
            const holidays = await holidays_service_1.holidaysService.findByDateRange(vacation.startDate, vacation.endDate, "PT_BR");
            let businessDays = this.calculateBusinessDays(vacation.startDate, vacation.endDate, holidays);
            for (const control of yearControl.values()) {
                if (businessDays <= 0)
                    break;
                const available = exports.VACATION_DAYS_IN_A_YEAR - control.usedDays;
                if (available <= 0)
                    continue;
                const toUse = Math.min(businessDays, available);
                control.usedDays += toUse;
                control.vacations.push(new models_1.EmployeeVacationItemDTO(vacation, toUse));
                businessDays -= toUse;
            }
        }
        return Array.from(yearControl.values())
            .map((c) => new models_1.EmployeeVacationsResponseDTO(exports.VACATION_DAYS_IN_A_YEAR - c.usedDays, c.usedDays, String(c.year), c.vacations))
            .sort((a, b) => Number(b.referenceYear) - Number(a.referenceYear));
    }
    /* =====================================================
     * CREATE / UPDATE / STATUS
     * ===================================================== */
    async create(form) {
        const employee = await employees_repository_1.employeesRepository.findByUid(form.employeeUid);
        if (!employee)
            throw new Error("Funcionário não encontrado");
        const exists = await vacations_repository_1.vacationsRepository.existsInRange(form.startDate, form.endDate, form.employeeUid);
        if (exists) {
            throw new Error("Já existe férias no período selecionado.");
        }
        const days = this.validateForm(form, employee.hiringDate);
        const businessDays = await this.getBusinessDays(form);
        await vacations_repository_1.vacationsRepository.create({
            ...form,
            daysQuantity: days,
            balanceUsedDays: businessDays,
            status: models_1.EmployeeVacationStatusEnum.PENDING,
        });
    }
    async update(id, form) {
        const vacation = await vacations_repository_1.vacationsRepository.findById(id);
        if (!vacation)
            throw new Error("Férias não encontrada");
        const employee = await employees_repository_1.employeesRepository.findByUid(form.employeeUid);
        if (!employee)
            throw new Error("Funcionário não encontrado");
        const exists = await vacations_repository_1.vacationsRepository.existsInRangeExcept(form.startDate, form.endDate, form.employeeUid, id);
        if (exists) {
            throw new Error("Já existe férias no período selecionado.");
        }
        const days = this.validateForm(form, employee.hiringDate);
        const businessDays = await this.getBusinessDays(form);
        await vacations_repository_1.vacationsRepository.update(id, {
            ...form,
            daysQuantity: days,
            balanceUsedDays: businessDays,
            status: models_1.EmployeeVacationStatusEnum.PENDING,
        });
    }
    async updateStatus(id, status) {
        const newStatus = (0, models_1.vacationStatusFromString)(status);
        if (newStatus == null) {
            throw new Error(`Status inválido: ${status}`);
        }
        await vacations_repository_1.vacationsRepository.update(id, { status: newStatus });
    }
    async delete(id, user) {
        const vacation = await vacations_repository_1.vacationsRepository.findById(id);
        if (!vacation)
            throw new Error("Férias não encontrada");
        if (vacation.status === "APPROVED" && user.role !== "CEO") {
            throw new Error("Você não pode deletar férias aprovadas.");
        }
        if (vacation.employeeUid !== user.uid && user.role !== "CEO") {
            throw new Error("Sem permissão para deletar férias.");
        }
        await vacations_repository_1.vacationsRepository.delete(id);
    }
    /* =====================================================
     * HELPERS
     * ===================================================== */
    validateForm(form, hiringDate) {
        const start = (0, dayjs_1.default)(form.startDate);
        const end = (0, dayjs_1.default)(form.endDate);
        if (start.isBefore(hiringDate)) {
            throw new Error("Data início inferior à contratação.");
        }
        if (!end.isAfter(start)) {
            throw new Error("Data fim inválida.");
        }
        const days = end.diff(start, "day") + 1;
        if (days > 60) {
            throw new Error("Intervalo maior que 60 dias.");
        }
        return days;
    }
    async getBusinessDays(form) {
        const holidays = await holidays_service_1.holidaysService.findByDateRange(form.startDate, form.endDate, "PT_BR");
        return this.calculateBusinessDays(form.startDate, form.endDate, holidays);
    }
    calculateBusinessDays(startDate, endDate, holidays) {
        const start = (0, dayjs_1.default)(startDate);
        const end = (0, dayjs_1.default)(endDate);
        const holidaySet = new Set();
        holidays.forEach((h) => holidaySet.add(h.date));
        let count = 0;
        for (let d = start.clone(); d.isSameOrBefore(end); d = d.add(1, "day")) {
            const weekend = d.day() === 0 || d.day() === 6;
            if (!weekend && !holidaySet.has(d.format("YYYY-MM-DD"))) {
                count++;
            }
        }
        return count;
    }
    async calculateUsedDaysPerYearFromList(vacations, targetYear) {
        const usedDaysMap = {};
        // Inicializa anos
        for (let year = exports.FIRST_YEAR_TO_COUNT; year <= targetYear; year++) {
            usedDaysMap[year] = 0;
        }
        // Ordena por startDate
        vacations.sort((a, b) => a.startDate.localeCompare(b.startDate));
        for (const vacation of vacations) {
            const holidays = await holidays_service_1.holidaysService.findByDateRange(vacation.startDate, vacation.endDate, 'PT_BR');
            let businessDays = this.calculateBusinessDays(vacation.startDate, vacation.endDate, holidays);
            for (const year of Object.keys(usedDaysMap).map(Number)) {
                if (businessDays <= 0) {
                    break;
                }
                const used = usedDaysMap[year];
                const available = exports.VACATION_DAYS_IN_A_YEAR - used;
                if (available <= 0) {
                    continue;
                }
                const toUse = Math.min(businessDays, available);
                usedDaysMap[year] = used + toUse;
                businessDays -= toUse;
            }
        }
        return usedDaysMap;
    }
}
exports.vacationsService = new VacationsService();
//# sourceMappingURL=vacations.service.js.map