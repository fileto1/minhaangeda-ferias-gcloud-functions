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
exports.api = (0, https_1.onRequest)({
    region: "southamerica-east1",
}, app_1.default);
// Seed só no emulador
if (process.env.FUNCTIONS_EMULATOR === "true") {
    (0, auth_seed_1.seedAuthUsers)()
        .then(() => console.log("🔥 Seed Auth concluído"))
        .catch(console.error);
}
//# sourceMappingURL=index.js.map