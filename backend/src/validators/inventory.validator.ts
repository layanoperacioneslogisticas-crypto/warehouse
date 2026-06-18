import { InventoryStatus } from "@prisma/client";
import { z } from "zod";

export const inventoryAssignSchema = z.object({
  locationId: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().min(1),
  lot: z.string().optional(),
  expirationDate: z.string().datetime().optional(),
  palletCode: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  status: z.nativeEnum(InventoryStatus)
});

export const inventoryMoveSchema = z.object({
  originLocationId: z.string().min(1),
  destinationLocationId: z.string().min(1),
  sku: z.string().min(1),
  lot: z.string().optional(),
  palletCode: z.string().optional(),
  quantity: z.number().positive(),
  reason: z.string().min(3)
});

