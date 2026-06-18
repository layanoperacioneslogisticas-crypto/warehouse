import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import bcrypt from "bcryptjs";

export const crudService = {
  users: {
    list: () => prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } }),
    get: (id: string) => prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, active: true } }),
    create: async (payload: { name: string; email: string; password: string; role: any; active?: boolean }) => {
      const password = await bcrypt.hash(payload.password, 10);
      return prisma.user.create({ data: { ...payload, password } });
    },
    update: async (id: string, payload: Record<string, unknown>) => {
      const data = { ...payload } as Record<string, unknown>;
      if (typeof data.password === "string") {
        data.password = await bcrypt.hash(data.password, 10);
      }
      return prisma.user.update({ where: { id }, data });
    },
    remove: async (id: string) => prisma.user.delete({ where: { id } })
  },
  warehouses: {
    list: () => prisma.warehouse.findMany({ orderBy: { createdAt: "desc" } }),
    get: async (id: string) => {
      const record = await prisma.warehouse.findUnique({ where: { id }, include: { zones: true } });
      if (!record) throw new HttpError(404, "Bodega no encontrada.");
      return record;
    },
    create: (payload: Record<string, unknown>) => prisma.warehouse.create({ data: payload as any }),
    update: (id: string, payload: Record<string, unknown>) => prisma.warehouse.update({ where: { id }, data: payload as any }),
    remove: (id: string) => prisma.warehouse.delete({ where: { id } })
  },
  zones: {
    list: () => prisma.zone.findMany({ include: { warehouse: true }, orderBy: { createdAt: "desc" } }),
    get: async (id: string) => {
      const record = await prisma.zone.findUnique({ where: { id }, include: { warehouse: true, locations: true } });
      if (!record) throw new HttpError(404, "Zona no encontrada.");
      return record;
    },
    create: (payload: Record<string, unknown>) => prisma.zone.create({ data: payload as any }),
    update: (id: string, payload: Record<string, unknown>) => prisma.zone.update({ where: { id }, data: payload as any }),
    remove: (id: string) => prisma.zone.delete({ where: { id } })
  }
};

