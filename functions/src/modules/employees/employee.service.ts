import { employeesRepository } from "../employees/employees.repository";

export class EmployeesService {
  async findById(id: string, principal: any) {
    const employee = await employeesRepository.findByUid(id);

    if (!employee) {
      throw new Error("Funcionário não encontrado");
    }

    return employee;
  }
}
