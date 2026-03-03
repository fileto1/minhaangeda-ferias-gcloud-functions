// index.ts
import "./firebase"; // 🔑 garante inicialização cedo
import { onRequest } from "firebase-functions/v2/https";
import app from "./app";
import { seedAuthUsers } from "./seed/auth.seed";
import { seedHolidays } from "./seed/holidays.seed";
import { seedVacations } from "./seed/vacations.seed";

// export const api = onRequest(
//   {
//     region: "southamerica-east1",
//   },
//   app,
// );

export const api = onRequest({ region: "southamerica-east1" }, (req, res) => {
  // Remove o prefixo /api quando vier do Hosting
  if (req.url.startsWith("/api")) {
    req.url = req.url.replace("/api", "") || "/";
  }

  app(req, res);
});

// Seed só no emulador
if (process.env.FUNCTIONS_EMULATOR === "true") {
  runSeeds();
}

async function runSeeds() {
  try {
    console.log("🌱 Iniciando seeds...");

    await Promise.all([seedAuthUsers(), seedHolidays(), seedVacations()]);

    console.log("🔥 Seeds concluídos com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao executar seeds:", error);
  }
}
