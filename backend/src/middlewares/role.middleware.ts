import { NextFunction, Response } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware.js";
import { HttpError } from "../utils/http-error.js";

export function requireRoles(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "No autenticado."));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "No autorizado."));
    }
    next();
  };
}

