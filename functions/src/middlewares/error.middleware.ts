import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";

export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  console.error("🔥 Unexpected Error:", error);

  return res.status(500).json({
    message: "Erro interno do servidor.",
  });
}
