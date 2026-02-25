import { Vacation } from "./vacation.model";
import { VacationRepository } from "./vacation.repository";

export class VacationService {
  constructor(private repository = new VacationRepository()) {}

  async create(data: Vacation): Promise<Vacation> {
    // regra de negócio
    if (data.startDate > data.endDate) {
      throw new Error("Data inicial maior que data final");
    }

    data.status = "PENDING";
    data.createdAt = new Date();

    return this.repository.save(data);
  }

  async list(): Promise<Vacation[]> {
    return this.repository.findAll();
  }
}
