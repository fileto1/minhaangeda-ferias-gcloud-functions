"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dayjs_1 = __importDefault(require("dayjs"));
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
const vacation_routes_1 = require("./modules/vacations/vacation.routes");
const employee_routes_1 = require("./modules/employees/employee.routes");
dayjs_1.default.extend(isSameOrBefore_1.default);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// rotas
app.use("/vacations", vacation_routes_1.vacationsRoutes);
app.use("/employees", employee_routes_1.employeesRoutes);
exports.default = app;
//# sourceMappingURL=app.js.map