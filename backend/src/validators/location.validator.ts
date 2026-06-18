import { BlockReason, LocationStatus, LocationType } from "@prisma/client";
import { z } from "zod";

export const locationSchema = z.object({
  warehouseId: z.string().min(1),
  zoneId: z.string().min(1),
  locationCode: z.string().min(3),
  aisle: z.string().optional(),
  rack: z.string().optional(),
  level: z.string().optional(),
  position: z.string().optional(),
  locationType: z.nativeEnum(LocationType),
  status: z.nativeEnum(LocationStatus),
  maxBoxes: z.number().int().optional(),
  maxWeightKg: z.number().optional(),
  maxVolumeM3: z.number().optional(),
  coordinateX: z.number().optional(),
  coordinateY: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  active: z.boolean().optional()
});

export const locationCoordinatesSchema = z.object({
  coordinateX: z.number(),
  coordinateY: z.number()
});

export const locationBlockSchema = z.object({
  reason: z.nativeEnum(BlockReason),
  comment: z.string().optional()
});

