import { Request, Response } from "express";
import fs from "node:fs/promises";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  blockLocation,
  bulkUploadLocations,
  createLocation,
  getLayoutByWarehouse,
  getLocation,
  getLocationQrPayload,
  listLocations,
  removeLocation,
  unblockLocation,
  updateCoordinates,
  updateLocation
} from "../services/location.service.js";
import {
  locationBlockSchema,
  locationCoordinatesSchema,
  locationSchema
} from "../validators/location.validator.js";
import { HttpError } from "../utils/http-error.js";

export async function list(req: Request, res: Response) {
  res.json(await listLocations());
}

export async function get(req: Request, res: Response) {
  res.json(await getLocation(req.params.id));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await createLocation(locationSchema.parse(req.body)));
}

export async function update(req: Request, res: Response) {
  res.json(await updateLocation(req.params.id, locationSchema.partial().parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  res.json(await removeLocation(req.params.id));
}

export async function upload(req: Request, res: Response) {
  if (!req.file?.path) {
    throw new HttpError(400, "Archivo no recibido.");
  }

  const result = await bulkUploadLocations(req.file.path);
  await fs.unlink(req.file.path);
  res.status(201).json(result);
}

export async function block(req: AuthRequest, res: Response) {
  const payload = locationBlockSchema.parse(req.body);
  res.json(await blockLocation(req.params.id, req.user!.id, payload.reason, payload.comment));
}

export async function unblock(req: Request, res: Response) {
  res.json(await unblockLocation(req.params.id));
}

export async function coordinates(req: Request, res: Response) {
  const payload = locationCoordinatesSchema.parse(req.body);
  res.json(await updateCoordinates(req.params.id, payload.coordinateX, payload.coordinateY));
}

export async function qr(req: Request, res: Response) {
  res.json(await getLocationQrPayload(req.params.id));
}

export async function layout(req: Request, res: Response) {
  res.json(await getLayoutByWarehouse(req.params.warehouseId));
}

