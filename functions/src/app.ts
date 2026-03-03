import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { vacationsRoutes } from "./modules/vacations/vacation.routes";
import { employeesRoutes } from "./modules/employees/employee.routes";
import { authenticate } from "./middlewares/auth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { holidaysRoutes } from "./modules/holidays/holiday.routes";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(authenticate);

// rotas
app.use("/vacations", vacationsRoutes);
app.use("/employees", employeesRoutes);
app.use("/holidays", holidaysRoutes);

// error middleware
app.use(errorMiddleware);

export default app;
