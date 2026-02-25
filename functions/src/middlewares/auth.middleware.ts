import { Request, Response, NextFunction } from "express";
import { auth } from "../firebase";

/**
 * Usuário autenticado no sistema
 * Equivalente ao CustomUserDetails do Spring
 */
export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: "CEO" | "EMPLOYEE";
}

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token ausente" });
    return;
  }

  const token = header.replace("Bearer ", "");

  try {
    const decoded = await auth.verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      role: (decoded.role as "CEO" | "EMPLOYEE") ?? "EMPLOYEE",
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}
