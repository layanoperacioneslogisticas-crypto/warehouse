import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "../utils/http-error.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Token no proporcionado."));
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = verifyToken(token);
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role
  };
  next();
}

