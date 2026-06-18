import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Ruta no encontrada."));
}

export function errorHandler(
  error: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  res.status(statusCode).json({
    message: error.message || "Error interno del servidor"
  });
}

