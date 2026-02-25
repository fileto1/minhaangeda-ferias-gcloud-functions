// index.ts
import "./firebase"; // 🔑 garante inicialização cedo
import { onRequest } from "firebase-functions/v2/https";
import app from "./app";
import { seedAuthUsers } from "./seed/auth.seed";

export const api = onRequest(
  {
    region: "southamerica-east1",
  },
  app,
);

// Seed só no emulador
if (process.env.FUNCTIONS_EMULATOR === "true") {
  seedAuthUsers()
    .then(() => console.log("🔥 Seed Auth concluído"))
    .catch(console.error);
}
