import { Role } from "@prisma/client";
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  active: z.boolean().optional()
});

export const userUpdateSchema = userSchema.partial().extend({
  password: z.string().min(8).optional()
});

