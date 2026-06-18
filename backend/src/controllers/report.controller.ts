import { Request, Response } from "express";
import {
  exportInventoryReport,
  exportLocationsReport,
  getBlockedLocationsReport,
  getDashboardReport,
  getOccupancyReport
} from "../services/report.service.js";

export async function dashboard(_req: Request, res: Response) {
  res.json(await getDashboardReport());
}

export async function occupancy(_req: Request, res: Response) {
  res.json(await getOccupancyReport());
}

export async function blocked(_req: Request, res: Response) {
  res.json(await getBlockedLocationsReport());
}

export async function exportLocations(_req: Request, res: Response) {
  const buffer = await exportLocationsReport();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=locations.xlsx");
  res.send(Buffer.from(buffer));
}

export async function exportInventory(_req: Request, res: Response) {
  const buffer = await exportInventoryReport();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=inventory.xlsx");
  res.send(Buffer.from(buffer));
}

