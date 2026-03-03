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
const date_utils_1 = require("../../shared/utils/date.utils");
const firestore_1 = require("firebase-admin/firestore");
const HolidayDto_1 = require("../holidays/models/HolidayDto");
const AppError_1 = require("../../shared/errors/AppError");
// import { Timestamp } from "firebase-admin/firestore";
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
     * GET ALL NOT PENDING
     * ===================================================== */
    async getAllNotPendingStatus(date) {
        const targetYear = (0, dayjs_1.default)(date).year();
        if (targetYear < exports.FIRST_YEAR_TO_COUNT) {
            throw new AppError_1.AppError(`Não é possível buscar para ano anterior a: ${exports.FIRST_YEAR_TO_COUNT}`);
        }
        const startDate = date_utils_1.DateUtils.toTimestamp((0, dayjs_1.default)(`${targetYear}-01-01`));
        const maxDate = date_utils_1.DateUtils.toTimestamp((0, dayjs_1.default)(`${targetYear}-12-31`));
        console.log("START:", startDate.toDate());
        console.log("END:", maxDate.toDate());
        const vacations = await vacations_repository_1.vacationsRepository.findAllNotPendingByDateRange(startDate, maxDate);
        return vacations.map((v) => new models_1.EmployeeVacationItemDTO(v, 0));
    }
    /* =====================================================
     * CALENDAR
     * ===================================================== */
    async getCalendarSummary(startDate, endDate) {
        const { start, end } = date_utils_1.DateUtils.toRange(startDate, endDate);
        const vacations = await vacations_repository_1.vacationsRepository.findApprovedByDateRange(start, end);
        const holidays = await holidays_service_1.holidaysService.findByDateRange(start, end, "PT_BR");
        return new models_1.CalendarSummaryResponseDTO(vacations.map((v) => new models_1.EmployeeVacationItemDTO(v, 0)), holidays.map((v) => new HolidayDto_1.HolidayDto(v)));
    }
    /* =====================================================
     * GET BY ID
     * ===================================================== */
    async getById(id, user) {
        const vacation = await vacations_repository_1.vacationsRepository.findById(id);
        if (!vacation) {
            throw new AppError_1.AppError("Férias não encontrada", 404);
        }
        if (vacation.employeeUid !== user.uid && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não tem permissão para buscar as férias deste funcionário.");
        }
        return vacation;
    }
    /* =====================================================
     * BALANCE BY YEAR
     * ===================================================== */
    async getAllEmployeeVacationsByDate(date) {
        const targetYear = (0, dayjs_1.default)(date).year();
        console.log("date:", date);
        console.log("targetYear:", targetYear);
        if (targetYear < exports.FIRST_YEAR_TO_COUNT) {
            throw new AppError_1.AppError(`Não é possível buscar para ano anterior a: ${exports.FIRST_YEAR_TO_COUNT}`);
        }
        const employees = await employees_repository_1.employeesRepository.findAllNotAdmin();
        const maxDate = date_utils_1.DateUtils.toTimestamp((0, dayjs_1.default)(`${targetYear}-12-31`).add(1, "year"));
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
            throw new AppError_1.AppError("Necessário configurar data de contratação antes de buscar férias.");
        }
        const currentYearPlusOne = (0, dayjs_1.default)().year() + 1;
        const yearControl = new Map();
        // set the firstYearToGet to not be more than 6 years ago
        const firstYearToGet = currentYearPlusOne - exports.FIRST_YEAR_TO_COUNT > 6 ? currentYearPlusOne - 6 : exports.FIRST_YEAR_TO_COUNT;
        for (let year = firstYearToGet; year <= currentYearPlusOne; year++) {
            yearControl.set(year, { year, usedDays: 0, vacations: [] });
        }
        const vacations = await vacations_repository_1.vacationsRepository.findByEmployee(employeeUid);
        for (const vacation of vacations) {
            const holidays = await holidays_service_1.holidaysService.findByDateRange(vacation.startDate, vacation.endDate, "PT_BR");
            let businessDays = this.calculateBusinessDays(vacation.startDate, vacation.endDate, holidays);
            const realBusinessDays = Number(businessDays);
            for (const control of yearControl.values()) {
                if (businessDays <= 0)
                    break;
                const available = exports.VACATION_DAYS_IN_A_YEAR - control.usedDays;
                if (available <= 0)
                    continue;
                const toUse = Math.min(businessDays, available);
                control.usedDays += toUse;
                const splited = realBusinessDays !== toUse;
                control.vacations.push(new models_1.EmployeeVacationItemDTO(vacation, toUse, splited));
                businessDays -= toUse;
            }
        }
        return Array.from(yearControl.values())
            .filter((year) => year.vacations.length > 0)
            .map((c) => new models_1.EmployeeVacationsResponseDTO(exports.VACATION_DAYS_IN_A_YEAR - c.usedDays, c.usedDays, String(c.year), c.vacations))
            .sort((a, b) => Number(b.referenceYear) - Number(a.referenceYear));
    }
    /* =====================================================
     * CREATE / UPDATE / STATUS
     * ===================================================== */
    async create(form) {
        const employee = await employees_repository_1.employeesRepository.findByUid(form.employeeUid);
        if (!employee) {
            throw new AppError_1.AppError("Funcionário não encontrado", 404);
        }
        const { start, end } = date_utils_1.DateUtils.toRange(form.startDate, form.endDate);
        // 🔥 Verificar conflito agora usando Timestamp
        const exists = await vacations_repository_1.vacationsRepository.existsInRange(start, end, form.employeeUid);
        if (exists) {
            throw new AppError_1.AppError("Já existe férias no período selecionado.");
        }
        // 🔥 Validar datas
        const days = this.validateForm(start, end, employee.hiringDate);
        const businessDays = await this.getBusinessDays(start, end);
        await vacations_repository_1.vacationsRepository.create({
            employeeUid: employee.uid,
            employeeName: employee.name,
            startDate: start,
            endDate: end,
            notes: form.notes,
            daysQuantity: days,
            balanceUsedDays: businessDays,
            status: models_1.EmployeeVacationStatusEnum.PENDING,
            createdAt: firestore_1.Timestamp.now(),
        });
    }
    async update(id, form) {
        const vacation = await vacations_repository_1.vacationsRepository.findById(id);
        if (!vacation) {
            throw new AppError_1.AppError("Férias não encontrada", 404);
        }
        const employee = await employees_repository_1.employeesRepository.findByUid(form.employeeUid);
        if (!employee) {
            throw new AppError_1.AppError("Funcionário não encontrado", 404);
        }
        const isNotSameStartDate = !date_utils_1.DateUtils.isSameTimestamp(date_utils_1.DateUtils.toTimestamp(form.startDate), vacation.startDate);
        const isNotSameEndDate = !date_utils_1.DateUtils.isSameTimestamp(date_utils_1.DateUtils.toTimestamp(form.endDate), vacation.endDate);
        if (employee.role != "ADMIN" &&
            vacation.status == models_1.EmployeeVacationStatusEnum.APPROVED &&
            (isNotSameStartDate || isNotSameEndDate)) {
            throw new AppError_1.AppError("Não é possível alterar período após a férias ter sido aprovada. Por favor contate o Admin.");
        }
        const { start, end } = date_utils_1.DateUtils.toRange(form.startDate, form.endDate);
        // 🔥 Verificar conflito excluindo o próprio registro
        const exists = await vacations_repository_1.vacationsRepository.existsInRangeExcept(start, end, form.employeeUid, id);
        if (exists) {
            throw new AppError_1.AppError("Já existe férias no período selecionado.");
        }
        // 🔥 Validar datas
        const days = this.validateForm(start, end, employee.hiringDate);
        const businessDays = await this.getBusinessDays(start, end);
        await vacations_repository_1.vacationsRepository.update(id, {
            startDate: start,
            endDate: end,
            notes: form.notes,
            daysQuantity: days,
            balanceUsedDays: businessDays,
            updatedAt: firestore_1.Timestamp.now(),
        });
    }
    async updateStatus(id, status) {
        const newStatus = (0, models_1.vacationStatusFromString)(status);
        if (newStatus == null) {
            throw new AppError_1.AppError(`Status inválido: ${status}`);
        }
        await vacations_repository_1.vacationsRepository.update(id, { status: newStatus });
    }
    async delete(id, user) {
        const vacation = await vacations_repository_1.vacationsRepository.findById(id);
        if (!vacation)
            throw new AppError_1.AppError("Férias não encontrada", 404);
        if (vacation.status === "APPROVED" && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Você não pode deletar férias aprovadas.");
        }
        if (vacation.employeeUid !== user.uid && user.role !== "ADMIN") {
            throw new AppError_1.AppError("Sem permissão para deletar férias.");
        }
        await vacations_repository_1.vacationsRepository.delete(id);
    }
    /* =====================================================
     * HELPERS
     * ===================================================== */
    validateForm(start, end, hiringDate) {
        // private validateForm(
        //   form: EmployeeVacationItemFormRequest,
        //   hiringDate: Timestamp | undefined,
        // ) {
        if (!hiringDate) {
            throw new AppError_1.AppError("Data de contratação não encontrada.");
        }
        const startDate = date_utils_1.DateUtils.toDayjsStartOfDay(start);
        const endDate = date_utils_1.DateUtils.toDayjsStartOfDay(end);
        const hiring = date_utils_1.DateUtils.toDayjsStartOfDay(hiringDate);
        if (startDate.isBefore(hiring)) {
            throw new AppError_1.AppError("Data início inferior à contratação.");
        }
        if (!endDate.isAfter(startDate)) {
            throw new AppError_1.AppError("Data fim inválida.");
        }
        const days = endDate.diff(startDate, "day") + 1;
        if (days > 60) {
            throw new AppError_1.AppError("Intervalo maior que 60 dias.");
        }
        return days;
    }
    async getBusinessDays(start, end) {
        const holidays = await holidays_service_1.holidaysService.findByDateRange(start, end, "PT_BR");
        return this.calculateBusinessDays(start, end, holidays);
    }
    calculateBusinessDays(startTimestamp, endTimestamp, holidays) {
        const start = date_utils_1.DateUtils.toDayjsStartOfDay(startTimestamp);
        const end = date_utils_1.DateUtils.toDayjsStartOfDay(endTimestamp);
        // 🔥 Normalizar feriados como YYYY-MM-DD
        const holidaySet = new Set();
        holidays.forEach((h) => {
            const holidayDate = (0, dayjs_1.default)(h.date?.toDate ? h.date.toDate() : h.date).format("YYYY-MM-DD");
            holidaySet.add(holidayDate);
        });
        let count = 0;
        for (let d = start.clone(); d.isSameOrBefore(end, "day"); d = d.add(1, "day")) {
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
        // vacations.sort((a, b) => a.startDate.localeCompare(b.startDate));
        vacations.sort((a, b) => a.startDate.toMillis() - b.startDate.toMillis());
        for (const vacation of vacations) {
            const holidays = await holidays_service_1.holidaysService.findByDateRange(vacation.startDate, vacation.endDate, "PT_BR");
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