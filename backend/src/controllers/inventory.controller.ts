import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { assignInventory, deleteInventory, getInventoryByLocation, moveInventory } from "../services/inventory.service.js";
import { inventoryAssignSchema, inventoryMoveSchema } from "../validators/inventory.validator.js";

export async function byLocation(req: Request, res: Response) {
  res.json(await getInventoryByLocation(String(req.params.locationId)));
}

export async function assign(req: AuthRequest, res: Response) {
  res.status(201).json(await assignInventory(inventoryAssignSchema.parse(req.body), req.user!.id));
}

export async function move(req: AuthRequest, res: Response) {
  res.json(await moveInventory(inventoryMoveSchema.parse(req.body), req.user!.id));
}

export async function remove(req: Request, res: Response) {
  res.json(await deleteInventory(String(req.params.id)));
}
