import { ZoneType } from "@prisma/client";
import { z } from "zod";

export const zoneSchema = z.object({
  warehouseId: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
  type: z.nativeEnum(ZoneType),
  active: z.boolean().optional()
});

