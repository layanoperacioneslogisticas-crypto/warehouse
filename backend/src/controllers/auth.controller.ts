import { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload.email, payload.password);
  res.json(result);
}

export async function me(req: AuthRequest, res: Response) {
  const result = await authService.getMe(req.user!.id);
  res.json(result);
}

