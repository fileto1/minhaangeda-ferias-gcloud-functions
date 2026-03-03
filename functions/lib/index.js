"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// index.ts
require("./firebase"); // 🔑 garante inicialização cedo
const https_1 = require("firebase-functions/v2/https");
const app_1 = __importDefault(require("./app"));
const auth_seed_1 = require("./seed/auth.seed");
const holidays_seed_1 = require("./seed/holidays.seed");
const vacations_seed_1 = require("./seed/vacations.seed");
// export const api = onRequest(
//   {
//     region: "southamerica-east1",
//   },
//   app,
// );
exports.api = (0, https_1.onRequest)({ region: "southamerica-east1" }, (req, res) => {
    // Remove o prefixo /api quando vier do Hosting
    if (req.url.startsWith("/api")) {
        req.url = req.url.replace("/api", "") || "/";
    }
    (0, app_1.default)(req, res);
});
// Seed só no emulador
if (process.env.FUNCTIONS_EMULATOR === "true") {
    runSeeds();
}
async function runSeeds() {
    try {
        console.log("🌱 Iniciando seeds...");
        await Promise.all([(0, auth_seed_1.seedAuthUsers)(), (0, holidays_seed_1.seedHolidays)(), (0, vacations_seed_1.seedVacations)()]);
        console.log("🔥 Seeds concluídos com sucesso.");
    }
    catch (error) {
        console.error("❌ Erro ao executar seeds:", error);
    }
}
//# sourceMappingURL=index.js.map