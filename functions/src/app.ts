import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { vacationsRoutes } from "./modules/vacations/vacation.routes";
import { employeesRoutes } from "./modules/employees/employee.routes";

dayjs.extend(isSameOrBefore);
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// rotas
app.use("/vacations", vacationsRoutes);
app.use("/employees", employeesRoutes);

export default app;
