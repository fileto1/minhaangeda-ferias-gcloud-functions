"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dayjs_1 = __importDefault(require("dayjs"));
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
const isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
const vacation_routes_1 = require("./modules/vacations/vacation.routes");
const employee_routes_1 = require("./modules/employees/employee.routes");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const holiday_routes_1 = require("./modules/holidays/holiday.routes");
dayjs_1.default.extend(isSameOrBefore_1.default);
dayjs_1.default.extend(isSameOrAfter_1.default);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.use(auth_middleware_1.authenticate);
// rotas
app.use("/vacations", vacation_routes_1.vacationsRoutes);
app.use("/employees", employee_routes_1.employeesRoutes);
app.use("/holidays", holiday_routes_1.holidaysRoutes);
// error middleware
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map