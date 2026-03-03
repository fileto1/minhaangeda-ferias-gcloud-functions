import dayjs from "dayjs";
import { AuthenticatedUser } from "../../middlewares/auth.middleware";
import { vacationsRepository } from "./vacations.repository";
import { employeesRepository } from "../employees/employees.repository";
import {
  EmployeeVacationItemFormRequest,
  EmployeeVacationItemDTO,
  EmployeeVacationsResponseDTO,
  EmployeeBalanceVacationsResponseDTO,
  CalendarSummaryResponseDTO,
  EmployeeVacationStatusEnum,
  vacationStatusFromString,
} from "./models";
import { holidaysService } from "../holidays/holidays.service";
import { EmployeeDto } from "../employees/models";
import { DateUtils } from "../../shared/utils/date.utils";
import { Timestamp } from "firebase-admin/firestore";
import { HolidayDto } from "../holidays/models/HolidayDto";
import { AppError } from "../../shared/errors/AppError";
// import { Timestamp } from "firebase-admin/firestore";

export const VACATION_DAYS_IN_A_YEAR = 20;
export const FIRST_YEAR_TO_COUNT = 2025;

class VacationsService {
  /* =====================================================
   * GET ALL PENDING
   * ===================================================== */
  async getAllPendingStatus(): Promise<EmployeeVacationItemDTO[]> {
    const vacations = await vacationsRepository.findAllPending();
    return vacations.map((v) => new EmployeeVacationItemDTO(v, 0));
  }

  /* =====================================================
   * GET ALL NOT PENDING
   * ===================================================== */
  async getAllNotPendingStatus(date: string): Promise<EmployeeVacationItemDTO[]> {
    const targetYear = dayjs(date).year();

    if (targetYear < FIRST_YEAR_TO_COUNT) {
      throw new AppError(`Não é possível buscar para ano anterior a: ${FIRST_YEAR_TO_COUNT}`);
    }

    const startDate = DateUtils.toTimestamp(dayjs(`${targetYear}-01-01`));
    const maxDate = DateUtils.toTimestamp(dayjs(`${targetYear}-12-31`));

    console.log("START:", startDate.toDate());
    console.log("END:", maxDate.toDate());

    const vacations = await vacationsRepository.findAllNotPendingByDateRange(startDate, maxDate);
    return vacations.map((v) => new EmployeeVacationItemDTO(v, 0));
  }

  /* =====================================================
   * CALENDAR
   * ===================================================== */
  async getCalendarSummary(startDate: string, endDate: string): Promise<CalendarSummaryResponseDTO> {
    const { start, end } = DateUtils.toRange(startDate, endDate);

    const vacations = await vacationsRepository.findApprovedByDateRange(start, end);

    const holidays = await holidaysService.findByDateRange(start, end, "PT_BR");

    return new CalendarSummaryResponseDTO(
      vacations.map((v) => new EmployeeVacationItemDTO(v, 0)),
      holidays.map((v) => new HolidayDto(v)),
    );
  }

  /* =====================================================
   * GET BY ID
   * ===================================================== */
  async getById(id: string, user: AuthenticatedUser) {
    const vacation = await vacationsRepository.findById(id);

    if (!vacation) {
      throw new AppError("Férias não encontrada", 404);
    }

    if (vacation.employeeUid !== user.uid && user.role !== "ADMIN") {
      throw new AppError("Você não tem permissão para buscar as férias deste funcionário.");
    }

    return vacation;
  }

  /* =====================================================
   * BALANCE BY YEAR
   * ===================================================== */
  async getAllEmployeeVacationsByDate(date: string): Promise<EmployeeBalanceVacationsResponseDTO[]> {
    const targetYear = dayjs(date).year();
    console.log("date:", date);
    console.log("targetYear:", targetYear);

    if (targetYear < FIRST_YEAR_TO_COUNT) {
      throw new AppError(`Não é possível buscar para ano anterior a: ${FIRST_YEAR_TO_COUNT}`);
    }

    const employees = await employeesRepository.findAllNotAdmin();
    const maxDate = DateUtils.toTimestamp(dayjs(`${targetYear}-12-31`).add(1, "year"));

    const vacations = await vacationsRepository.findApprovedUntil(maxDate);

    const vacationsByEmployee = new Map<string, any[]>();

    vacations.forEach((v) => {
      const list = vacationsByEmployee.get(v.employeeUid) ?? [];
      list.push(v);
      vacationsByEmployee.set(v.employeeUid, list);
    });

    const response: EmployeeBalanceVacationsResponseDTO[] = [];

    for (const employee of employees) {
      const employeeVacations = vacationsByEmployee.get(employee.uid) ?? [];

      const usedDaysMap = await this.calculateUsedDaysPerYearFromList(employeeVacations, targetYear);

      const usedDays = usedDaysMap[targetYear] ?? 0;
      const remaining = VACATION_DAYS_IN_A_YEAR - usedDays;

      response.push(
        new EmployeeBalanceVacationsResponseDTO(remaining, usedDays, String(targetYear), new EmployeeDto(employee)),
      );
    }

    return response.sort((a, b) => b.balanceDays - a.balanceDays);
  }

  /* =====================================================
   * BY EMPLOYEE
   * ===================================================== */
  async getByEmployeeId(employeeUid: string): Promise<EmployeeVacationsResponseDTO[]> {
    const employee = await employeesRepository.findByUid(employeeUid);

    if (!employee?.hiringDate) {
      throw new AppError("Necessário configurar data de contratação antes de buscar férias.");
    }

    const currentYearPlusOne = dayjs().year() + 1;
    const yearControl = new Map<number, any>();
    // set the firstYearToGet to not be more than 6 years ago
    const firstYearToGet = currentYearPlusOne - FIRST_YEAR_TO_COUNT > 6 ? currentYearPlusOne - 6 : FIRST_YEAR_TO_COUNT;

    for (let year = firstYearToGet; year <= currentYearPlusOne; year++) {
      yearControl.set(year, { year, usedDays: 0, vacations: [] });
    }

    const vacations = await vacationsRepository.findByEmployee(employeeUid);

    for (const vacation of vacations) {
      const holidays = await holidaysService.findByDateRange(vacation.startDate, vacation.endDate, "PT_BR");

      let businessDays = this.calculateBusinessDays(vacation.startDate, vacation.endDate, holidays);
      const realBusinessDays = Number(businessDays);

      for (const control of yearControl.values()) {
        if (businessDays <= 0) break;

        const available = VACATION_DAYS_IN_A_YEAR - control.usedDays;
        if (available <= 0) continue;

        const toUse = Math.min(businessDays, available);
        control.usedDays += toUse;
        const splited = realBusinessDays !== toUse;
        control.vacations.push(new EmployeeVacationItemDTO(vacation, toUse, splited));
        businessDays -= toUse;
      }
    }

    return Array.from(yearControl.values())
      .filter((year) => year.vacations.length > 0)
      .map(
        (c) =>
          new EmployeeVacationsResponseDTO(
            VACATION_DAYS_IN_A_YEAR - c.usedDays,
            c.usedDays,
            String(c.year),
            c.vacations,
          ),
      )
      .sort((a, b) => Number(b.referenceYear) - Number(a.referenceYear));
  }

  /* =====================================================
   * CREATE / UPDATE / STATUS
   * ===================================================== */
  async create(form: EmployeeVacationItemFormRequest) {
    const employee = await employeesRepository.findByUid(form.employeeUid);

    if (!employee) {
      throw new AppError("Funcionário não encontrado", 404);
    }

    const { start, end } = DateUtils.toRange(form.startDate, form.endDate);

    // 🔥 Verificar conflito agora usando Timestamp
    const exists = await vacationsRepository.existsInRange(start, end, form.employeeUid);

    if (exists) {
      throw new AppError("Já existe férias no período selecionado.");
    }

    // 🔥 Validar datas
    const days = this.validateForm(start, end, employee.hiringDate);

    const businessDays = await this.getBusinessDays(start, end);

    await vacationsRepository.create({
      employeeUid: employee.uid,
      employeeName: employee.name,
      startDate: start,
      endDate: end,
      notes: form.notes,
      daysQuantity: days,
      balanceUsedDays: businessDays,
      status: EmployeeVacationStatusEnum.PENDING,
      createdAt: Timestamp.now(),
    });
  }

  async update(id: string, form: EmployeeVacationItemFormRequest) {
    const vacation = await vacationsRepository.findById(id);
    if (!vacation) {
      throw new AppError("Férias não encontrada", 404);
    }

    const employee = await employeesRepository.findByUid(form.employeeUid);
    if (!employee) {
      throw new AppError("Funcionário não encontrado", 404);
    }

    const isNotSameStartDate = !DateUtils.isSameTimestamp(DateUtils.toTimestamp(form.startDate), vacation.startDate);
    const isNotSameEndDate = !DateUtils.isSameTimestamp(DateUtils.toTimestamp(form.endDate), vacation.endDate);

    if (
      employee.role != "ADMIN" &&
      vacation.status == EmployeeVacationStatusEnum.APPROVED &&
      (isNotSameStartDate || isNotSameEndDate)
    ) {
      throw new AppError("Não é possível alterar período após a férias ter sido aprovada. Por favor contate o Admin.");
    }

    const { start, end } = DateUtils.toRange(form.startDate, form.endDate);

    // 🔥 Verificar conflito excluindo o próprio registro
    const exists = await vacationsRepository.existsInRangeExcept(start, end, form.employeeUid, id);

    if (exists) {
      throw new AppError("Já existe férias no período selecionado.");
    }

    // 🔥 Validar datas
    const days = this.validateForm(start, end, employee.hiringDate);

    const businessDays = await this.getBusinessDays(start, end);

    await vacationsRepository.update(id, {
      startDate: start,
      endDate: end,
      notes: form.notes,
      daysQuantity: days,
      balanceUsedDays: businessDays,
      updatedAt: Timestamp.now(),
    });
  }

  async updateStatus(id: string, status: string) {
    const newStatus = vacationStatusFromString(status);
    if (newStatus == null) {
      throw new AppError(`Status inválido: ${status}`);
    }

    await vacationsRepository.update(id, { status: newStatus });
  }

  async delete(id: string, user: AuthenticatedUser) {
    const vacation = await vacationsRepository.findById(id);
    if (!vacation) throw new AppError("Férias não encontrada", 404);

    if (vacation.status === "APPROVED" && user.role !== "ADMIN") {
      throw new AppError("Você não pode deletar férias aprovadas.");
    }

    if (vacation.employeeUid !== user.uid && user.role !== "ADMIN") {
      throw new AppError("Sem permissão para deletar férias.");
    }

    await vacationsRepository.delete(id);
  }

  /* =====================================================
   * HELPERS
   * ===================================================== */
  private validateForm(start: Timestamp, end: Timestamp, hiringDate?: Timestamp) {
    // private validateForm(
    //   form: EmployeeVacationItemFormRequest,
    //   hiringDate: Timestamp | undefined,
    // ) {
    if (!hiringDate) {
      throw new AppError("Data de contratação não encontrada.");
    }

    const startDate = DateUtils.toDayjsStartOfDay(start);
    const endDate = DateUtils.toDayjsStartOfDay(end);
    const hiring = DateUtils.toDayjsStartOfDay(hiringDate);

    if (startDate.isBefore(hiring)) {
      throw new AppError("Data início inferior à contratação.");
    }

    if (!endDate.isAfter(startDate)) {
      throw new AppError("Data fim inválida.");
    }

    const days = endDate.diff(startDate, "day") + 1;
    if (days > 60) {
      throw new AppError("Intervalo maior que 60 dias.");
    }

    return days;
  }

  private async getBusinessDays(start: Timestamp, end: Timestamp) {
    const holidays = await holidaysService.findByDateRange(start, end, "PT_BR");

    return this.calculateBusinessDays(start, end, holidays);
  }

  private calculateBusinessDays(startTimestamp: Timestamp, endTimestamp: Timestamp, holidays: any[]) {
    const start = DateUtils.toDayjsStartOfDay(startTimestamp);
    const end = DateUtils.toDayjsStartOfDay(endTimestamp);

    // 🔥 Normalizar feriados como YYYY-MM-DD
    const holidaySet = new Set<string>();

    holidays.forEach((h) => {
      const holidayDate = dayjs(h.date?.toDate ? h.date.toDate() : h.date).format("YYYY-MM-DD");

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

  private async calculateUsedDaysPerYearFromList(
    vacations: any[],
    targetYear: number,
  ): Promise<Record<number, number>> {
    const usedDaysMap: Record<number, number> = {};

    // Inicializa anos
    for (let year = FIRST_YEAR_TO_COUNT; year <= targetYear; year++) {
      usedDaysMap[year] = 0;
    }

    // Ordena por startDate
    // vacations.sort((a, b) => a.startDate.localeCompare(b.startDate));
    vacations.sort((a, b) => a.startDate.toMillis() - b.startDate.toMillis());

    for (const vacation of vacations) {
      const holidays = await holidaysService.findByDateRange(vacation.startDate, vacation.endDate, "PT_BR");

      let businessDays = this.calculateBusinessDays(vacation.startDate, vacation.endDate, holidays);

      for (const year of Object.keys(usedDaysMap).map(Number)) {
        if (businessDays <= 0) {
          break;
        }

        const used = usedDaysMap[year];
        const available = VACATION_DAYS_IN_A_YEAR - used;

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

export const vacationsService = new VacationsService();
