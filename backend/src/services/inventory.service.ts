import { InventoryStatus, LocationStatus, MovementType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { ensureLocationAcceptsInventory } from "./location.service.js";

export async function getInventoryByLocation(locationId: string) {
  return prisma.inventoryLocation.findMany({
    where: { locationId },
    orderBy: { createdAt: "desc" }
  });
}

export async function assignInventory(payload: {
  locationId: string;
  sku: string;
  description: string;
  lot?: string;
  expirationDate?: string;
  palletCode?: string;
  quantity: number;
  unit: string;
  status: InventoryStatus;
}, userId: string) {
  const location = await ensureLocationAcceptsInventory(payload.locationId);

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventoryLocation.create({
      data: {
        ...payload,
        expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null
      }
    });

    await tx.location.update({
      where: { id: payload.locationId },
      data: { status: LocationStatus.OCUPADO }
    });

    await tx.locationMovement.create({
      data: {
        destinationLocationId: payload.locationId,
        sku: payload.sku,
        lot: payload.lot,
        palletCode: payload.palletCode,
        quantity: payload.quantity,
        movementType: MovementType.ASSIGNMENT,
        reason: "Asignacion inicial",
        userId
      }
    });

    return { location, inventory };
  });
}

export async function moveInventory(payload: {
  originLocationId: string;
  destinationLocationId: string;
  sku: string;
  lot?: string;
  palletCode?: string;
  quantity: number;
  reason: string;
}, userId: string) {
  const origin = await prisma.location.findUnique({
    where: { id: payload.originLocationId },
    include: { inventory: true }
  });

  if (!origin) {
    throw new HttpError(404, "Ubicacion origen no encontrada.");
  }

  if (origin.status === LocationStatus.CUARENTENA) {
    throw new HttpError(400, "No se permite despacho desde cuarentena.");
  }

  await ensureLocationAcceptsInventory(payload.destinationLocationId);

  const record = origin.inventory.find((item) => {
    return item.sku === payload.sku
      && (payload.lot ? item.lot === payload.lot : true)
      && (payload.palletCode ? item.palletCode === payload.palletCode : true);
  });

  if (!record || record.quantity < payload.quantity) {
    throw new HttpError(400, "Inventario insuficiente en la ubicacion origen.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.inventoryLocation.update({
      where: { id: record.id },
      data: { quantity: record.quantity - payload.quantity }
    });

    await tx.inventoryLocation.create({
      data: {
        locationId: payload.destinationLocationId,
        sku: record.sku,
        description: record.description,
        lot: record.lot,
        expirationDate: record.expirationDate,
        palletCode: record.palletCode,
        quantity: payload.quantity,
        unit: record.unit,
        status: record.status
      }
    });

    await tx.locationMovement.create({
      data: {
        originLocationId: payload.originLocationId,
        destinationLocationId: payload.destinationLocationId,
        sku: payload.sku,
        lot: payload.lot,
        palletCode: payload.palletCode,
        quantity: payload.quantity,
        movementType: MovementType.TRANSFER,
        reason: payload.reason,
        userId
      }
    });

    const remaining = record.quantity - payload.quantity;
    if (remaining <= 0) {
      await tx.inventoryLocation.delete({ where: { id: record.id } });
      await tx.location.update({
        where: { id: payload.originLocationId },
        data: { status: LocationStatus.LIBRE }
      });
    }

    await tx.location.update({
      where: { id: payload.destinationLocationId },
      data: { status: LocationStatus.OCUPADO }
    });

    return { moved: true };
  });
}

export async function deleteInventory(id: string) {
  return prisma.inventoryLocation.delete({ where: { id } });
}

