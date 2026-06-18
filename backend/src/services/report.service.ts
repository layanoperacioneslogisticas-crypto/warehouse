import { LocationStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { buildWorkbookBuffer } from "../utils/excel.js";

export async function getDashboardReport() {
  const locations = await prisma.location.findMany({
    include: { zone: true }
  });

  const totals = {
    totalLocations: locations.length,
    freeLocations: locations.filter((item) => item.status === LocationStatus.LIBRE).length,
    occupiedLocations: locations.filter((item) => item.status === LocationStatus.OCUPADO).length,
    blockedLocations: locations.filter((item) => item.status === LocationStatus.BLOQUEADO).length,
    damagedLocations: locations.filter((item) => item.status === LocationStatus.DANADO).length,
    pavLocations: locations.filter((item) => item.status === LocationStatus.PAV).length,
    npiLocations: locations.filter((item) => item.status === LocationStatus.NPI).length
  };

  const occupancyRate = totals.totalLocations
    ? (totals.occupiedLocations / totals.totalLocations) * 100
    : 0;

  const zoneSummary = locations.reduce<Record<string, number>>((acc, item) => {
    acc[item.zone.code] = (acc[item.zone.code] || 0) + 1;
    return acc;
  }, {});

  const topZones = Object.entries(zoneSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([zone, total]) => ({ zone, total }));

  return {
    ...totals,
    occupancyRate,
    topZones
  };
}

export async function getOccupancyReport() {
  return prisma.location.groupBy({
    by: ["status"],
    _count: { id: true }
  });
}

export async function getBlockedLocationsReport() {
  return prisma.location.findMany({
    where: { status: LocationStatus.BLOQUEADO },
    include: { warehouse: true, zone: true }
  });
}

export async function exportLocationsReport() {
  const rows = await prisma.location.findMany({
    include: { warehouse: true, zone: true }
  });

  return buildWorkbookBuffer("Locations", rows.map((item) => ({
    locationCode: item.locationCode,
    warehouse: item.warehouse.code,
    zone: item.zone.code,
    status: item.status,
    type: item.locationType,
    active: item.active
  })));
}

export async function exportInventoryReport() {
  const rows = await prisma.inventoryLocation.findMany({
    include: { location: true }
  });

  return buildWorkbookBuffer("Inventory", rows.map((item) => ({
    locationCode: item.location.locationCode,
    sku: item.sku,
    description: item.description,
    lot: item.lot,
    palletCode: item.palletCode,
    quantity: item.quantity,
    unit: item.unit
  })));
}

