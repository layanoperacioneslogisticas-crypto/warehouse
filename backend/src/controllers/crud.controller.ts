import { Request, Response } from "express";
import { crudService } from "../services/crud.service.js";
import { userSchema, userUpdateSchema } from "../validators/user.validator.js";
import { warehouseSchema } from "../validators/warehouse.validator.js";
import { zoneSchema } from "../validators/zone.validator.js";

export const userController = {
  list: async (_req: Request, res: Response) => res.json(await crudService.users.list()),
  create: async (req: Request, res: Response) => res.status(201).json(await crudService.users.create(userSchema.parse(req.body))),
  update: async (req: Request, res: Response) => res.json(await crudService.users.update(req.params.id, userUpdateSchema.parse(req.body))),
  remove: async (req: Request, res: Response) => res.json(await crudService.users.remove(req.params.id))
};

export const warehouseController = {
  list: async (_req: Request, res: Response) => res.json(await crudService.warehouses.list()),
  get: async (req: Request, res: Response) => res.json(await crudService.warehouses.get(req.params.id)),
  create: async (req: Request, res: Response) => res.status(201).json(await crudService.warehouses.create(warehouseSchema.parse(req.body))),
  update: async (req: Request, res: Response) => res.json(await crudService.warehouses.update(req.params.id, warehouseSchema.partial().parse(req.body))),
  remove: async (req: Request, res: Response) => res.json(await crudService.warehouses.remove(req.params.id))
};

export const zoneController = {
  list: async (_req: Request, res: Response) => res.json(await crudService.zones.list()),
  get: async (req: Request, res: Response) => res.json(await crudService.zones.get(req.params.id)),
  create: async (req: Request, res: Response) => res.status(201).json(await crudService.zones.create(zoneSchema.parse(req.body))),
  update: async (req: Request, res: Response) => res.json(await crudService.zones.update(req.params.id, zoneSchema.partial().parse(req.body))),
  remove: async (req: Request, res: Response) => res.json(await crudService.zones.remove(req.params.id))
};

