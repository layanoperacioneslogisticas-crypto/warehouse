import { LocationStatus, LocationType, MovementType } from "@prisma/client";
import xlsx from "xlsx";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function listLocations() {
  return prisma.location.findMany({
    include: {
      warehouse: true,
      zone: true,
      inventory: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getLocation(id: string) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      warehouse: true,
      zone: true,
      inventory: true,
      blockLogs: { include: { user: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!location) {
    throw new HttpError(404, "Ubicacion no encontrada.");
  }
  return location;
}

export async function createLocation(payload: Record<string, unknown>) {
  return prisma.location.create({ data: payload as any });
}

export async function updateLocation(id: string, payload: Record<string, unknown>) {
  return prisma.location.update({ where: { id }, data: payload as any });
}

export async function removeLocation(id: string) {
  return prisma.location.delete({ where: { id } });
}

export async function updateCoordinates(id: string, coordinateX: number, coordinateY: number) {
  return prisma.location.update({
    where: { id },
    data: { coordinateX, coordinateY }
  });
}

export async function blockLocation(
  id: string,
  userId: string,
  reason: any,
  comment?: string
) {
  const location = await getLocation(id);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.location.update({
      where: { id },
      data: { status: LocationStatus.BLOQUEADO }
    });

    await tx.locationBlockLog.create({
      data: {
        locationId: id,
        previousStatus: location.status,
        newStatus: LocationStatus.BLOQUEADO,
        reason,
        comment,
        userId
      }
    });

    return updated;
  });
}

export async function unblockLocation(id: string) {
  const location = await getLocation(id);

  if (location.inventory.length > 0) {
    return prisma.location.update({
      where: { id },
      data: { status: LocationStatus.OCUPADO }
    });
  }

  return prisma.location.update({
    where: { id },
    data: { status: LocationStatus.LIBRE }
  });
}

export async function getLayoutByWarehouse(warehouseId: string) {
  return prisma.location.findMany({
    where: { warehouseId, active: true },
    include: { zone: true, inventory: true },
    orderBy: [{ zone: { code: "asc" } }, { locationCode: "asc" }]
  });
}

export async function getLocationQrPayload(id: string) {
  const location = await getLocation(id);
  return {
    locationCode: location.locationCode,
    warehouse: location.warehouse.code,
    zone: location.zone.code,
    url: `/locations/${location.id}`
  };
}

export async function bulkUploadLocations(filePath: string) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const created: string[] = [];

  for (const row of rows) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { code: String(row.warehouse_code) }
    });
    const zone = await prisma.zone.findFirst({
      where: {
        code: String(row.zone_code),
        warehouseId: warehouse?.id
      }
    });

    if (!warehouse || !zone) {
      throw new HttpError(400, "Bodega o zona no existe para una fila del Excel.");
    }

    const location = await prisma.location.create({
      data: {
        warehouseId: warehouse.id,
        zoneId: zone.id,
        locationCode: String(row.location_code),
        aisle: row.aisle ? String(row.aisle) : null,
        rack: row.rack ? String(row.rack) : null,
        level: row.level ? String(row.level) : null,
        position: row.position ? String(row.position) : null,
        locationType: String(row.location_type) as LocationType,
        status: String(row.status) as LocationStatus,
        maxBoxes: row.max_boxes ? Number(row.max_boxes) : null,
        maxWeightKg: row.max_weight_kg ? Number(row.max_weight_kg) : null,
        maxVolumeM3: row.max_volume_m3 ? Number(row.max_volume_m3) : null,
        coordinateX: row.coordinate_x ? Number(row.coordinate_x) : 0,
        coordinateY: row.coordinate_y ? Number(row.coordinate_y) : 0,
        width: row.width ? Number(row.width) : 180,
        height: row.height ? Number(row.height) : 64
      }
    });
    created.push(location.id);
  }

  return { createdCount: created.length };
}

export async function ensureLocationAcceptsInventory(locationId: string) {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: { inventory: true }
  });

  if (!location) {
    throw new HttpError(404, "Ubicacion no encontrada.");
  }

  if (location.status === LocationStatus.BLOQUEADO || location.status === LocationStatus.DANADO) {
    throw new HttpError(400, "La ubicacion no puede recibir inventario.");
  }

  return location;
}
