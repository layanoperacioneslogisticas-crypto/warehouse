import { z } from "zod";

export const warehouseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(2),
  active: z.boolean().optional()
});

