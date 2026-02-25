"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationsApi = void 0;
const https_1 = require("firebase-functions/v2/https");
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const vacation_service_1 = require("./vacation.service");
const app = (0, express_1.default)();
const service = new vacation_service_1.VacationService();
const API_URL = "/vacations";
app.use(express_1.default.json());
app.use(auth_middleware_1.authenticate);
app.post(API_URL, async (req, res) => {
    const user = req.user;
    const vacation = await service.create({
        ...req.body,
        userId: user.uid,
    });
    res.status(201).json(vacation);
});
app.get(API_URL, async (req, res) => {
    // const user = (req as any).user;
    // const vacations = await service.listByUser(user.uid);
    const vacations = await service.list();
    res.json(vacations);
});
exports.vacationsApi = (0, https_1.onRequest)({ region: "southamerica-east1" }, app);
//# sourceMappingURL=vacation.controllerold.js.map