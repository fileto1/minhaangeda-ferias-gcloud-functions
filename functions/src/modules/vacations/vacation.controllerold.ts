import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { VacationService } from "./vacation.service";

const app = express();
const service = new VacationService();
const API_URL = "/vacations";

app.use(express.json());
app.use(authenticate);

app.post(API_URL, async (req, res) => {
  const user = (req as any).user;

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

export const vacationsApi = onRequest({ region: "southamerica-east1" }, app);
