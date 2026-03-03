import { Request, Response, NextFunction } from "express";
import { auth } from "../firebase";
import { employeesRepository } from "../modules/employees/employees.repository";

/**
 * Usuário autenticado no sistema
 * Equivalente ao CustomUserDetails do Spring
 */
export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
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

  // try {
  //   const decoded = await auth.verifyIdToken(token);

  //   const employeeDoc = await db
  //     .collection(EMPLOYEES_COLLECTION)
  //     .doc(decoded.uid)
  //     .get();

  //   if (!employeeDoc.exists) {
  //     res.status(403).json({ error: "Funcionário não encontrado." });
  //   }

  //   const employee = employeeDoc.data();

  //   if (employee?.deleted || !employee?.enabled) {
  //     res.status(403).json({ error: "Usuário desabilitado." });
  //   }

  //   req.user = {
  //     uid: decoded.uid,
  //     email: decoded.email ?? "",
  //     role: employee.role ?? "EMPLOYEE",
  //   };

  //   next();
  // } catch (error) {
  //   res.status(401).json({ error: "Token inválido" });
  // }

  try {
    const decoded = await auth.verifyIdToken(token);
    const employee = await employeesRepository.findByUid(decoded.uid);

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      role: employee?.role ?? "EMPLOYEE",
      // role: (decoded.role as "ADMIN" | "EMPLOYEE") ?? "EMPLOYEE",
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}
