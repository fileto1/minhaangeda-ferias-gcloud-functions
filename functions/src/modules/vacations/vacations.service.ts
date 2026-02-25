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
   * CALENDAR
   * ===================================================== */
  async getCalendarSummary(
    startDate: string,
    endDate: string,
  ): Promise<CalendarSummaryResponseDTO> {
    const vacations = await vacationsRepository.findApprovedByDateRange(
      startDate,
      endDate,
    );

    const holidays = await holidaysService.findByDateRange(
      startDate,
      endDate,
      "PT_BR",
    );

    return new CalendarSummaryResponseDTO(
      vacations.map((v) => new EmployeeVacationItemDTO(v, 0)),
      holidays,
    );
  }

  /* =====================================================
   * GET BY ID
   * ===================================================== */
  async getById(id: string, user: AuthenticatedUser) {
    const vacation = await vacationsRepository.findById(id);

    if (!vacation) {
      throw new Error("Férias não encontrada");
    }

    if (vacation.employeeUid !== user.uid && user.role !== "CEO") {
      throw new Error(
        "Você não tem permissão para buscar as férias deste funcionário.",
      );
    }

    return vacation;
  }

  /* =====================================================
   * BALANCE BY YEAR
   * ===================================================== */
  async getAllEmployeeVacationsByDate(
    date: string,
  ): Promise<EmployeeBalanceVacationsResponseDTO[]> {
    const targetYear = dayjs(date).year();

    if (targetYear < FIRST_YEAR_TO_COUNT) {
      throw new Error(
        `Não é possível buscar para ano anterior a: ${FIRST_YEAR_TO_COUNT}`,
      );
    }

    const employees = await employeesRepository.findAllNotCeo();
    const maxDate = dayjs(`${targetYear}-12-31`)
      .add(1, "year")
      .format("YYYY-MM-DD");

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

      const usedDaysMap = await this.calculateUsedDaysPerYearFromList(
        employeeVacations,
        targetYear,
      );

      const usedDays = usedDaysMap[targetYear] ?? 0;
      const remaining = VACATION_DAYS_IN_A_YEAR - usedDays;

      response.push(
        new EmployeeBalanceVacationsResponseDTO(
          remaining,
          usedDays,
          String(targetYear),
          new EmployeeDto(employee)
        ),
      );
    }

    return response.sort((a, b) => b.balanceDays - a.balanceDays);
  }

  /* =====================================================
   * BY EMPLOYEE
   * ===================================================== */
  async getByEmployeeId(
    employeeUid: string,
  ): Promise<EmployeeVacationsResponseDTO[]> {
    const employee = await employeesRepository.findByUid(employeeUid);

    if (!employee?.hiringDate) {
      throw new Error(
        "Necessário configurar data de contratação antes de buscar férias.",
      );
    }

    const currentYear = dayjs().year();
    const yearControl = new Map<number, any>();

    for (let year = FIRST_YEAR_TO_COUNT; year <= currentYear; year++) {
      yearControl.set(year, { year, usedDays: 0, vacations: [] });
    }

    const vacations = await vacationsRepository.findByEmployee(employeeUid);

    for (const vacation of vacations) {
      const holidays = await holidaysService.findByDateRange(
        vacation.startDate,
        vacation.endDate,
        "PT_BR",
      );

      let businessDays = this.calculateBusinessDays(
        vacation.startDate,
        vacation.endDate,
        holidays,
      );

      for (const control of yearControl.values()) {
        if (businessDays <= 0) break;

        const available = VACATION_DAYS_IN_A_YEAR - control.usedDays;
        if (available <= 0) continue;

        const toUse = Math.min(businessDays, available);
        control.usedDays += toUse;
        control.vacations.push(new EmployeeVacationItemDTO(vacation, toUse));
        businessDays -= toUse;
      }
    }

    return Array.from(yearControl.values())
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

    if (!employee) throw new Error("Funcionário não encontrado");

    const exists = await vacationsRepository.existsInRange(
      form.startDate,
      form.endDate,
      form.employeeUid,
    );

    if (exists) {
      throw new Error("Já existe férias no período selecionado.");
    }

    const days = this.validateForm(form, employee.hiringDate);
    const businessDays = await this.getBusinessDays(form);

    await vacationsRepository.create({
      ...form,
      daysQuantity: days,
      balanceUsedDays: businessDays,
      status: EmployeeVacationStatusEnum.PENDING,
    });
  }

  async update(id: string, form: EmployeeVacationItemFormRequest) {
    const vacation = await vacationsRepository.findById(id);
    if (!vacation) throw new Error("Férias não encontrada");

    const employee = await employeesRepository.findByUid(form.employeeUid);
    if (!employee) throw new Error("Funcionário não encontrado");

    const exists = await vacationsRepository.existsInRangeExcept(
      form.startDate,
      form.endDate,
      form.employeeUid,
      id,
    );

    if (exists) {
      throw new Error("Já existe férias no período selecionado.");
    }

    const days = this.validateForm(form, employee.hiringDate);
    const businessDays = await this.getBusinessDays(form);

    await vacationsRepository.update(id, {
      ...form,
      daysQuantity: days,
      balanceUsedDays: businessDays,
      status: EmployeeVacationStatusEnum.PENDING,
    });
  }

  async updateStatus(id: string, status: string) {
    const newStatus = vacationStatusFromString(status);
    if (newStatus == null) {
      throw new Error(`Status inválido: ${status}`);
    }

    await vacationsRepository.update(id, { status: newStatus});
  }

  async delete(id: string, user: AuthenticatedUser) {
    const vacation = await vacationsRepository.findById(id);
    if (!vacation) throw new Error("Férias não encontrada");

    if (vacation.status === "APPROVED" && user.role !== "CEO") {
      throw new Error("Você não pode deletar férias aprovadas.");
    }

    if (vacation.employeeUid !== user.uid && user.role !== "CEO") {
      throw new Error("Sem permissão para deletar férias.");
    }

    await vacationsRepository.delete(id);
  }

  /* =====================================================
   * HELPERS
   * ===================================================== */
  private validateForm(
    form: EmployeeVacationItemFormRequest,
    hiringDate: string | undefined,
  ) {
    const start = dayjs(form.startDate);
    const end = dayjs(form.endDate);

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

  private async getBusinessDays(form: EmployeeVacationItemFormRequest) {
    const holidays = await holidaysService.findByDateRange(
      form.startDate,
      form.endDate,
      "PT_BR",
    );

    return this.calculateBusinessDays(form.startDate, form.endDate, holidays);
  }

  private calculateBusinessDays(
    startDate: string,
    endDate: string,
    holidays: any[],
  ) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const holidaySet = new Set<string>();
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

  private async calculateUsedDaysPerYearFromList(
  vacations: any[],
  targetYear: number
): Promise<Record<number, number>> {

  const usedDaysMap: Record<number, number> = {};

  // Inicializa anos
  for (let year = FIRST_YEAR_TO_COUNT; year <= targetYear; year++) {
    usedDaysMap[year] = 0;
  }

  // Ordena por startDate
  vacations.sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  for (const vacation of vacations) {

    const holidays = await holidaysService.findByDateRange(
      vacation.startDate,
      vacation.endDate,
      'PT_BR'
    );

    let businessDays = this.calculateBusinessDays(
      vacation.startDate,
      vacation.endDate,
      holidays
    );

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
